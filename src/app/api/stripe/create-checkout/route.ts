import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { stripe } from '@/libs/stripe/client'
import { createCheckoutSession } from '@/libs/stripe/subscription'

export async function POST() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const priceId = process.env.STRIPE_PRICE_ID

    if (!priceId) {
      return NextResponse.json({ error: 'Stripe price ID not configured' }, { status: 500 })
    }

    if (!stripe) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 })
    }

    // Stripe Customerを作成または取得
    let customerId = session.user.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email || undefined,
        metadata: {
          userId: session.user.id,
        },
      })
      customerId = customer.id
    }

    const checkoutUrl = await createCheckoutSession(customerId, priceId)

    return NextResponse.json({ url: checkoutUrl })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
