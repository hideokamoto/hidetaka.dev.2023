import { auth } from '@/auth'
import { checkSubscriptionStatus } from '@/libs/stripe/subscription'

export async function isPremiumUser(): Promise<boolean> {
  const session = await auth()

  if (!session?.user) {
    return false
  }

  // セッションにisPremiumフラグがある場合はそれを使用
  if (session.user.isPremium) {
    return true
  }

  // Stripe Customer IDがある場合はサブスクリプション状態を確認
  if (session.user.stripeCustomerId) {
    const subscriptionStatus = await checkSubscriptionStatus(session.user.stripeCustomerId)
    return subscriptionStatus.isActive
  }

  return false
}

export async function getCurrentUser() {
  return await auth()
}
