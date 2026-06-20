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
      <article
        className="relative overflow-hidden rounded-2xl transition-all hover:border-indigo-300 hover:shadow-xl"
        style={{ border: '1px solid var(--rvt-border)', background: 'var(--rvt-bg2)' }}
      >
        <div className="p-5 lg:p-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <DateDisplay
                date={date}
                lang={lang}
                format="short"
                className="text-xs font-semibold [color:var(--rvt-fg2)]"
              />
            </div>

            <h3
              className="text-lg font-bold leading-tight transition-colors group-hover:text-indigo-600"
              style={{ fontFamily: 'var(--rvt-font-display)', color: 'var(--rvt-fg)' }}
            >
              {item.title}
            </h3>

            {item.description && (
              <p
                className="text-sm leading-relaxed line-clamp-3"
                style={{ color: 'var(--rvt-fg2)' }}
              >
                {item.description}
                {item.description.length >= 150 ? '...' : ''}
              </p>
            )}

            <div
              className="flex items-center text-sm font-medium mt-1"
              style={{ color: 'var(--rvt-accent)' }}
            >
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
      <p style={{ color: 'var(--rvt-fg2)' }}>
        {lang === 'ja' ? '製品ニュースが見つかりませんでした。' : 'No product news found.'}
      </p>
    </div>
  )
}

export default function NewsPageContent({ lang, products }: NewsPageProps) {
  const title = lang === 'ja' ? 'ニュース' : 'News'
  const description =
    lang === 'ja'
      ? 'プロジェクトや製品のリリース情報、アップデートなどのお知らせを掲載しています。'
      : 'Product releases, updates, and announcements for my projects and libraries.'

  return (
    <section className="pt-12 sm:pt-16 pb-8 sm:pb-12" style={{ background: 'var(--rvt-bg)' }}>
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
