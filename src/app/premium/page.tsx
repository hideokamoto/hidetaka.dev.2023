import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth, currentUser } from '@clerk/nextjs/server'
import PremiumPageContent from '@/components/containers/pages/PremiumPage'
import { MicroCMSAPI } from '@/libs/microCMS/apis'
import { createMicroCMSClient } from '@/libs/microCMS/client'
import { checkSubscriptionStatus } from '@/libs/stripe/subscription'

export const metadata: Metadata = {
  title: 'Premium | Hidetaka.dev',
  description: 'Premium content and exclusive articles',
}

export default async function PremiumPage() {
  const { userId } = await auth()
  const lang = 'en' // デフォルトは英語、後で多言語対応

  if (!userId) {
    redirect('/sign-in')
  }

  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  // ClerkのメタデータからStripe Customer IDを取得
  const stripeCustomerId = user.publicMetadata?.stripeCustomerId as string | undefined

  // サブスクリプション状態を確認
  let isPremium = false
  if (stripeCustomerId) {
    const subscriptionStatus = await checkSubscriptionStatus(stripeCustomerId)
    isPremium = subscriptionStatus.isActive
  }

  // Premiumコンテンツを取得
  const microCMSClient = createMicroCMSClient()
  const microCMSAPI = new MicroCMSAPI(microCMSClient)
  const premiumPosts = isPremium ? await microCMSAPI.listPremiumPosts(lang) : []

  return (
    <PremiumPageContent
      user={{
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || null,
        name: user.fullName || user.firstName || null,
        stripeCustomerId: stripeCustomerId || null,
        isPremium,
      }}
      isPremium={isPremium}
      premiumPosts={premiumPosts}
      lang={lang}
    />
  )
}
