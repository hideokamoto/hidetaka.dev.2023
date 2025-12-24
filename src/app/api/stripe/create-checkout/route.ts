import { auth, currentUser } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import { createCheckoutSession } from '@/libs/stripe/subscription'
import { stripe } from '@/libs/stripe/client'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const priceId = process.env.STRIPE_PRICE_ID

    if (!priceId) {
      return NextResponse.json({ error: 'Stripe price ID not configured' }, { status: 500 })
    }

    if (!stripe) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 })
    }

    // ClerkのメタデータからStripe Customer IDを取得
    let customerId = user.publicMetadata?.stripeCustomerId as string | undefined

    // Stripe Customerを作成または取得
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.emailAddresses[0]?.emailAddress || undefined,
        metadata: {
          clerkUserId: userId,
        },
      })
      customerId = customer.id

      // ClerkのメタデータにStripe Customer IDを保存
      const client = await clerkClient()
      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          stripeCustomerId: customerId,
        },
      })
    }

    const checkoutUrl = await createCheckoutSession(customerId, priceId)

    return NextResponse.json({ url: checkoutUrl })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 },
    )
  }
}
