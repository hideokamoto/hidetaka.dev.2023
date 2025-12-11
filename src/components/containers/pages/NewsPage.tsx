import Link from 'next/link'
import Container from '@/components/tailwindui/Container'
import DateDisplay from '@/components/ui/DateDisplay'
import PageHeader from '@/components/ui/PageHeader'
import type { BlogItem } from '@/libs/dataSources/types'

type NewsPageProps = {
  lang: string
  products: BlogItem[]
}

// 製品ニュースカードコンポーネント
function NewsCard({ item, lang }: { item: BlogItem; lang: string }) {
  const date = new Date(item.datetime)

  return (
    <Link href={item.href} className="group block">
      <article className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:border-indigo-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700">
        <div className="p-5 lg:p-6">
          <div className="flex flex-col gap-3">
            {/* Date */}
            <div className="flex items-center gap-3 flex-wrap">
              <DateDisplay
                date={date}
                lang={lang}
                format="short"
                className="text-xs font-semibold text-slate-500 dark:text-slate-400"
              />
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold leading-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {item.title}
            </h3>

            {/* Description */}
            {item.description && (
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-3">
                {item.description}
                {item.description.length >= 150 ? '...' : ''}
              </p>
            )}

            {/* Read more indicator */}
            <div className="flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 mt-1">
              {lang === 'ja' ? '続きを読む' : 'Read more'}
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

// 記事が見つからない場合のメッセージコンポーネント
function NoArticlesMessage({ lang }: { lang: string }) {
  return (
    <div className="py-12 text-center">
      <p className="text-slate-600 dark:text-slate-400">
        {lang === 'ja' ? '製品ニュースが見つかりませんでした。' : 'No product news found.'}
      </p>
    </div>
  )
}

export default function NewsPageContent({ lang, products }: NewsPageProps) {
  const title = lang === 'ja' ? 'News' : 'News'
  const description =
    lang === 'ja'
      ? 'プロジェクトや製品のリリース情報、アップデートなどのお知らせを掲載しています。'
      : 'Product releases, updates, and announcements for my projects and libraries.'

  return (
    <section className="pt-12 sm:pt-16 pb-8 sm:pb-12 bg-white dark:bg-zinc-900">
      <Container>
        <PageHeader title={title} description={description} />

        {/* 記事グリッド */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {products.map((item) => (
              <NewsCard key={item.id || item.href} item={item} lang={lang} />
            ))}
          </div>
        ) : (
          <NoArticlesMessage lang={lang} />
        )}
      </Container>
    </section>
  )
}
