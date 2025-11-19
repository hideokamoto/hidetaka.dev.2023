import Link from 'next/link'
import type { BlogItem } from '@/libs/dataSources/types'
import DateDisplay from './DateDisplay'

type RelatedArticlesProps = {
  articles: BlogItem[]
  lang: string
  className?: string
}

export default function RelatedArticles({ articles, lang, className = '' }: RelatedArticlesProps) {
  // 記事がない場合は何も表示しない
  if (articles.length === 0) {
    return null
  }

  const title = lang === 'ja' ? '関連記事' : 'Related Articles'

  return (
    <section className={`mt-12 ${className}`}>
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">{title}</h2>
      <div className="grid gap-6 sm:grid-cols-2">
        {articles.map((article) => {
          const date = new Date(article.datetime)
          return (
            <Link
              key={article.id || article.href}
              href={article.href}
              className="group flex flex-col p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 mb-2">
                {article.title}
              </h3>
              {article.description && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-3">
                  {article.description}
                </p>
              )}
              <DateDisplay
                date={date}
                lang={lang}
                format="short"
                className="text-xs text-zinc-500 dark:text-zinc-500 mt-auto"
              />
            </Link>
          )
        })}
      </div>
    </section>
  )
}
