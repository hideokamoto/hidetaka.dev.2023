'use client'

import Link from 'next/link'
import { SignOutButton } from '@clerk/nextjs'
import Container from '@/components/tailwindui/Container'
import DateDisplay from '@/components/ui/DateDisplay'
import PageHeader from '@/components/ui/PageHeader'
import type { MicroCMSPremiumPostRecord } from '@/libs/microCMS/types'

type PremiumPageProps = {
  user: {
    id: string
    name?: string | null
    email?: string | null
    stripeCustomerId?: string | null
    stripeSubscriptionId?: string | null
    isPremium: boolean
  }
  isPremium: boolean
  premiumPosts: MicroCMSPremiumPostRecord[]
  lang: string
}

function PremiumCard({ post, lang }: { post: MicroCMSPremiumPostRecord; lang: string }) {
  const date = new Date(post.publishedAt || post.createdAt)
  const basePath = lang === 'Japanese' ? '/ja/premium' : '/premium'
  const href = `${basePath}/${post.slug}`

  return (
    <Link href={href} className="group block">
      <article className="relative overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white transition-all hover:border-indigo-400 hover:shadow-xl dark:border-indigo-800 dark:from-indigo-900/20 dark:to-zinc-900 dark:hover:border-indigo-600">
        <div className="p-5 lg:p-6">
          <div className="flex flex-col gap-3">
            {/* Premium Badge and Date */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
                {lang === 'Japanese' ? 'プレミアム' : 'Premium'}
              </span>
              <DateDisplay
                date={date}
                lang={lang === 'Japanese' ? 'ja' : 'en'}
                format="short"
                className="text-xs font-semibold text-slate-500 dark:text-slate-400"
              />
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold leading-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {post.title}
            </h3>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-3">
                {post.excerpt}
              </p>
            )}

            {/* Read more indicator */}
            <div className="flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 mt-1">
              {lang === 'Japanese' ? '続きを読む' : 'Read more'}
              <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}

function handleSubscribe() {
  fetch('/api/stripe/create-checkout', {
    method: 'POST',
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }
      return response.json()
    })
    .then((data) => {
      if (data.url) {
        window.location.href = data.url
      }
    })
    .catch((error) => {
      console.error('Error creating checkout session:', error)
      alert('Failed to start checkout. Please try again.')
    })
}

export default function PremiumPageContent({
  user,
  isPremium,
  premiumPosts,
  lang,
}: PremiumPageProps) {
  const isJapanese = lang === 'Japanese'
  const title = isJapanese ? 'Premium' : 'Premium'
  const description = isJapanese
    ? 'プレミアム会員限定のコンテンツと限定記事をご覧いただけます。'
    : 'Access exclusive premium content and articles for members only.'

  return (
    <section className="pt-12 sm:pt-16 pb-8 sm:pb-12 bg-white dark:bg-zinc-900">
      <Container>
        <PageHeader title={title} description={description} />

        {!isPremium ? (
          <div className="max-w-2xl mx-auto mt-8">
            <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-8 dark:border-indigo-800 dark:from-indigo-900/20 dark:to-zinc-900">
              <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/40">
                  <svg
                    className="w-8 h-8 text-indigo-600 dark:text-indigo-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {isJapanese ? 'プレミアム会員になる' : 'Become a Premium Member'}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    {isJapanese
                      ? 'プレミアムコンテンツにアクセスするには、サブスクリプションが必要です。'
                      : 'A subscription is required to access premium content.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSubscribe}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                  {isJapanese ? '今すぐ購読する' : 'Subscribe Now'}
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* User Info */}
            <div className="mb-8 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {isJapanese ? 'ログイン中:' : 'Logged in as:'} {user.email || user.name}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {isJapanese ? 'プレミアム会員' : 'Premium Member'}
                  </p>
                </div>
                <SignOutButton>
                  <button
                    type="button"
                    className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-zinc-200 dark:text-slate-300 dark:hover:bg-zinc-700"
                  >
                    {isJapanese ? 'ログアウト' : 'Sign Out'}
                  </button>
                </SignOutButton>
              </div>
            </div>

            {/* Premium Posts */}
            {premiumPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {premiumPosts.map((post) => (
                  <PremiumCard key={post.id} post={post} lang={lang} />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-slate-600 dark:text-slate-400">
                  {isJapanese
                    ? 'プレミアムコンテンツはまだありません。'
                    : 'No premium content available yet.'}
                </p>
              </div>
            )}
          </>
        )}
      </Container>
    </section>
  )
}
