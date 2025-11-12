import Link from 'next/link'
import Container from '@/components/tailwindui/Container'
import DateDisplay from '@/components/ui/DateDisplay'
import Tag from '@/components/ui/Tag'
import type { WPThought } from '@/libs/dataSources/types'

type BlogDetailPageProps = {
  thought: WPThought
  lang: string
  basePath: string
}

export default function BlogDetailPage({
  thought,
  lang,
  basePath,
}: BlogDetailPageProps) {
  const date = new Date(thought.date)
  const blogLabel = lang === 'ja' ? 'ブログ' : 'Blog'

  return (
    <Container className="mt-16 sm:mt-32">
      <article className="max-w-3xl mx-auto">
        {/* パンくずリスト */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol role="list" className="flex items-center space-x-2">
            <li>
              <div className="flex items-center text-sm">
                <Link
                  href={basePath}
                  className="font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
                >
                  {blogLabel}
                </Link>
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                  className="ml-2 size-5 shrink-0 text-slate-300 dark:text-slate-600"
                >
                  <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                </svg>
              </div>
            </li>
            <li>
              <div className="flex items-center text-sm">
                <span className="font-medium text-slate-900 dark:text-slate-100 line-clamp-1">
                  {thought.title.rendered}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* タイトル */}
        <header className="mb-6">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
            {thought.title.rendered}
          </h1>
        </header>

        {/* 日付とカテゴリ */}
        <div className="mb-10 flex flex-col gap-4">
          <DateDisplay
            date={date}
            lang={lang}
            format="long"
            className="text-sm font-medium text-slate-600 dark:text-slate-400"
          />
          {thought._embedded?.['wp:term'] && (
            <div className="flex flex-wrap gap-2">
              {thought._embedded['wp:term']
                .flat()
                .filter((term) => term.taxonomy === 'category')
                .map((category) => (
                  <Tag key={category.id} variant="indigo" size="sm">
                    {category.name}
                  </Tag>
                ))}
            </div>
          )}
        </div>

        {/* コンテンツ */}
        <div
          className="blog-content text-zinc-700 dark:text-zinc-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: thought.content.rendered }}
        />
      </article>
    </Container>
  )
}

