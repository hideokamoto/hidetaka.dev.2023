import { auth, currentUser } from '@clerk/nextjs/server'
import { checkSubscriptionStatus } from '@/libs/stripe/subscription'

export async function isPremiumUser(): Promise<boolean> {
  const { userId } = await auth()

  if (!userId) {
    return false
  }

  const user = await currentUser()

  if (!user) {
    return false
  }

  // ClerkのメタデータからStripe Customer IDを取得
  const stripeCustomerId = user.publicMetadata?.stripeCustomerId as string | undefined

  if (!stripeCustomerId) {
    return false
  }

  // Stripeでサブスクリプション状態を確認
  const subscriptionStatus = await checkSubscriptionStatus(stripeCustomerId)
  return subscriptionStatus.isActive
}

export async function getCurrentUser() {
  return await currentUser()
}

export async function getStripeCustomerId(): Promise<string | null> {
  const user = await currentUser()
  if (!user) {
    return null
  }

  return (user.publicMetadata?.stripeCustomerId as string | undefined) || null
}
