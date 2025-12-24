import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import PremiumPageContent from '@/components/containers/pages/PremiumPage'
import { MicroCMSAPI } from '@/libs/microCMS/apis'
import { createMicroCMSClient } from '@/libs/microCMS/client'
import { checkSubscriptionStatus } from '@/libs/stripe/subscription'

export const metadata: Metadata = {
  title: 'Premium | Hidetaka.dev',
  description: 'プレミアムコンテンツと限定記事',
}

export default async function PremiumPage() {
  const session = await auth()
  const lang = 'Japanese'

  if (!session?.user) {
    redirect('/ja/auth/signin')
  }

  // サブスクリプション状態を確認
  let isPremium = false
  if (session.user.stripeCustomerId) {
    const subscriptionStatus = await checkSubscriptionStatus(session.user.stripeCustomerId)
    isPremium = subscriptionStatus.isActive
  }

  // Premiumコンテンツを取得
  const microCMSClient = createMicroCMSClient()
  const microCMSAPI = new MicroCMSAPI(microCMSClient)
  const premiumPosts = isPremium ? await microCMSAPI.listPremiumPosts(lang) : []

  return (
    <PremiumPageContent
      user={session.user}
      isPremium={isPremium}
      premiumPosts={premiumPosts}
      lang={lang}
    />
  )
}
