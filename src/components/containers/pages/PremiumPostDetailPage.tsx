import Link from 'next/link'
import Container from '@/components/tailwindui/Container'
import DateDisplay from '@/components/ui/DateDisplay'
import PageHeader from '@/components/ui/PageHeader'
import type { MicroCMSPremiumPostRecord } from '@/libs/microCMS/types'

type PremiumPostDetailPageProps = {
  post: MicroCMSPremiumPostRecord
  lang: string
}

export default function PremiumPostDetailPageContent({ post, lang }: PremiumPostDetailPageProps) {
  const isJapanese = lang === 'Japanese'
  const date = new Date(post.publishedAt || post.createdAt)
  const basePath = isJapanese ? '/ja/premium' : '/premium'

  return (
    <section className="pt-12 sm:pt-16 pb-8 sm:pb-12 bg-white dark:bg-zinc-900">
      <Container>
        {/* Breadcrumb */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <li>
              <Link
                href={basePath}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {isJapanese ? 'Premium' : 'Premium'}
              </Link>
            </li>
            <li>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </li>
            <li className="text-slate-900 dark:text-white">{post.title}</li>
          </ol>
        </nav>

        {/* Premium Badge */}
        <div className="mb-6">
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            {isJapanese ? 'プレミアム' : 'Premium'}
          </span>
        </div>

        <PageHeader title={post.title} description={post.excerpt} />

        {/* Date */}
        <div className="mb-8">
          <DateDisplay
            date={date}
            lang={isJapanese ? 'ja' : 'en'}
            format="long"
            className="text-sm text-slate-500 dark:text-slate-400"
          />
        </div>

        {/* Featured Image */}
        {post.image && (
          <div className="mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image.url}
              alt={post.title}
              className="w-full rounded-2xl object-cover"
              style={{ maxHeight: '500px' }}
            />
          </div>
        )}

        {/* Content */}
        <article
          className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-slate-900 dark:prose-headings:text-white prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-a:text-indigo-600 dark:prose-a:text-indigo-400"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Back to Premium */}
        <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800">
          <Link
            href={basePath}
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {isJapanese ? 'Premium一覧に戻る' : 'Back to Premium'}
          </Link>
        </div>
      </Container>
    </section>
  )
}
