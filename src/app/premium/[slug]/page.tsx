import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import PremiumPostDetailPageContent from '@/components/containers/pages/PremiumPostDetailPage'
import { MicroCMSAPI } from '@/libs/microCMS/apis'
import { createMicroCMSClient } from '@/libs/microCMS/client'
import { checkSubscriptionStatus } from '@/libs/stripe/subscription'

export const metadata: Metadata = {
  title: 'Premium Post | Hidetaka.dev',
  description: 'Premium content',
}

export default async function PremiumPostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await auth()
  const lang = 'en'

  if (!session?.user) {
    redirect('/auth/signin')
  }

  // サブスクリプション状態を確認
  let isPremium = false
  if (session.user.stripeCustomerId) {
    const subscriptionStatus = await checkSubscriptionStatus(session.user.stripeCustomerId)
    isPremium = subscriptionStatus.isActive
  }

  if (!isPremium) {
    redirect('/premium')
  }

  // Premiumコンテンツを取得
  const microCMSClient = createMicroCMSClient()
  const microCMSAPI = new MicroCMSAPI(microCMSClient)
  const post = await microCMSAPI.getPremiumPostBySlug(slug, lang)

  if (!post) {
    notFound()
  }

  return <PremiumPostDetailPageContent post={post} lang={lang} />
}
