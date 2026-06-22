import Link from 'next/link'
import type { BlogItem } from '@/libs/dataSources/types'
import { cn } from '@/libs/utils/cn'
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
    <section
      className={cn('mt-16 border-t pt-12', className)}
      style={{ borderColor: 'var(--rvt-border)' }}
    >
      <h2
        className="mb-6 text-xl font-bold"
        style={{ fontFamily: 'var(--rvt-font-display)', color: 'var(--rvt-fg)' }}
      >
        {displayTitle}
      </h2>
      <div className="grid gap-5 sm:grid-cols-2">
        {articles.map((article) => {
          const date = new Date(article.datetime)
          return (
            <Link
              key={article.id || article.href}
              href={article.href}
              className="group flex flex-col rounded-2xl p-6 border border-[var(--rvt-border)] transition-colors hover:border-[var(--rvt-border-accent)]"
              style={{ background: 'var(--rvt-bg2)' }}
            >
              <h3
                className="mb-3 text-base font-semibold leading-snug transition-colors line-clamp-2 group-hover:text-[var(--rvt-accent)]"
                style={{ fontFamily: 'var(--rvt-font-display)', color: 'var(--rvt-fg)' }}
              >
                {article.title}
              </h3>
              {article.description && (
                <p className="mb-3 text-sm line-clamp-2" style={{ color: 'var(--rvt-fg2)' }}>
                  {article.description}
                </p>
              )}
              <span className="mt-auto flex items-center gap-1.5">
                <svg
                  className="h-3 w-3 flex-none"
                  style={{ color: 'var(--rvt-fg3)' }}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.6}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                  />
                </svg>
                <DateDisplay
                  date={date}
                  lang={lang}
                  format="short"
                  className="text-xs [color:var(--rvt-fg3)]"
                />
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
