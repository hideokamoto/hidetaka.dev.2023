import Link from 'next/link'
import type { BlogItem } from '@/libs/dataSources/types'
import DateDisplay from './DateDisplay'

type RelatedArticlesProps = {
  articles: BlogItem[]
  lang: string
  title?: string
  className?: string
}

export default function RelatedArticles({
  articles,
  lang,
  title,
  className = '',
}: RelatedArticlesProps) {
  // 記事がない場合は何も表示しない
  if (articles.length === 0) {
    return null
  }

  const defaultTitle = lang === 'ja' ? '関連記事' : 'Related Articles'
  const displayTitle = title || defaultTitle

  return (
    <section className={['mt-12', className].filter(Boolean).join(' ')}>
      <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--rvt-fg)' }}>
        {displayTitle}
      </h2>
      <div className="grid gap-6 sm:grid-cols-2">
        {articles.map((article) => {
          const date = new Date(article.datetime)
          return (
            <Link
              key={article.id || article.href}
              href={article.href}
              className="group flex flex-col p-4 rounded-lg hover:bg-zinc-50 transition-colors"
              style={{ border: '1px solid var(--rvt-border)' }}
            >
              <h3
                className="text-base font-semibold group-hover:text-indigo-600 transition-colors line-clamp-2 mb-2"
                style={{ color: 'var(--rvt-fg)' }}
              >
                {article.title}
              </h3>
              {article.description && (
                <p className="text-sm line-clamp-2 mb-3" style={{ color: 'var(--rvt-fg2)' }}>
                  {article.description}
                </p>
              )}
              <DateDisplay
                date={date}
                lang={lang}
                format="short"
                className="text-xs mt-auto [color:var(--rvt-fg2)]"
              />
            </Link>
          )
        })}
      </div>
    </section>
  )
}
