import { clerkClient } from '@clerk/nextjs/server'
import { stripe } from '@/libs/stripe/client'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  if (!stripe) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // サブスクリプション関連のイベントを処理
  if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = subscription.customer as string

    // Stripe CustomerからClerk User IDを取得
    const customer = await stripe.customers.retrieve(customerId)
    if (customer && !customer.deleted && 'metadata' in customer) {
      const clerkUserId = customer.metadata?.clerkUserId

      if (clerkUserId) {
        // Clerkのメタデータにサブスクリプション情報を保存
        const client = await clerkClient()
        await client.users.updateUserMetadata(clerkUserId, {
          publicMetadata: {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscription.id,
            subscriptionStatus: subscription.status,
          },
        })
      }
    }

    console.log('Subscription updated:', {
      customerId,
      subscriptionId: subscription.id,
      status: subscription.status,
    })
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = subscription.customer as string

    // Stripe CustomerからClerk User IDを取得
    const customer = await stripe.customers.retrieve(customerId)
    if (customer && !customer.deleted && 'metadata' in customer) {
      const clerkUserId = customer.metadata?.clerkUserId

      if (clerkUserId) {
        // Clerkのメタデータからサブスクリプション情報を削除
        const client = await clerkClient()
        await client.users.updateUserMetadata(clerkUserId, {
          publicMetadata: {
            stripeCustomerId: customerId,
            stripeSubscriptionId: null,
            subscriptionStatus: 'canceled',
          },
        })
      }
    }

    console.log('Subscription canceled:', {
      customerId,
      subscriptionId: subscription.id,
    })
  }

  return NextResponse.json({ received: true })
}
