import { stripe } from './client'

export async function checkSubscriptionStatus(customerId: string): Promise<{
  isActive: boolean
  subscriptionId?: string
}> {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    })

    if (subscriptions.data.length > 0) {
      return {
        isActive: true,
        subscriptionId: subscriptions.data[0].id,
      }
    }

    return { isActive: false }
  } catch (error) {
    console.error('Error checking subscription status:', error)
    return { isActive: false }
  }
}

export async function createCheckoutSession(customerId: string, priceId: string): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/premium?success=true`,
    cancel_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/premium?canceled=true`,
  })

  return session.url || ''
}
