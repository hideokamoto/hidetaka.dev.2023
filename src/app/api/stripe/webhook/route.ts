import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { stripe } from '@/libs/stripe/client'

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
  if (
    event.type === 'customer.subscription.created' ||
    event.type === 'customer.subscription.updated'
  ) {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = subscription.customer as string

    // ここでユーザーのサブスクリプション状態を更新
    // 実際の実装では、データベースに保存する必要があります
    console.log('Subscription updated:', {
      customerId,
      subscriptionId: subscription.id,
      status: subscription.status,
    })
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = subscription.customer as string

    // サブスクリプションがキャンセルされた場合の処理
    console.log('Subscription canceled:', {
      customerId,
      subscriptionId: subscription.id,
    })
  }

  return NextResponse.json({ received: true })
}
