import Link from 'next/link'
import Container from '@/components/tailwindui/Container'
import PageHeader from '@/components/ui/PageHeader'
import DateDisplay from '@/components/ui/DateDisplay'
import Pagination from '@/components/ui/Pagination'
import Tag from '@/components/ui/Tag'
import type { BlogItem } from '@/libs/dataSources/types'

type BlogPageProps = {
  lang: string
  thoughts: BlogItem[]
  currentPage: number
  totalPages: number
  basePath: string
  categoryName?: string
}

// ブログ記事カードコンポーネント
function BlogCard({ item, lang }: { item: BlogItem; lang: string }) {
  const date = new Date(item.datetime)

  return (
    <Link href={item.href} className="group block">
      <article className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:border-indigo-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700">
        <div className="p-5 lg:p-6">
          <div className="flex flex-col gap-3">
            {/* Date and Categories */}
            <div className="flex items-center gap-3 flex-wrap">
              <DateDisplay
                date={date}
                lang={lang}
                format="short"
                className="text-xs font-semibold text-slate-500 dark:text-slate-400"
              />
              {item.categories && item.categories.length > 0 && (
                <>
                  {item.categories.map((category) => (
                    <Tag key={category.id} variant="indigo" size="sm">
                      {category.name}
                    </Tag>
                  ))}
                </>
              )}
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
              <svg
                className="ml-1 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
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

export default function BlogPageContent({
  lang,
  thoughts,
  currentPage,
  totalPages,
  basePath,
  categoryName,
}: BlogPageProps) {
  const title = categoryName 
    ? (lang === 'ja' ? `カテゴリ: ${categoryName}` : `Category: ${categoryName}`)
    : (lang === 'ja' ? 'ブログ' : 'Blog')
  const description = categoryName
    ? (lang === 'ja' 
        ? `「${categoryName}」カテゴリのブログ記事一覧です。`
        : `Blog posts in the "${categoryName}" category.`)
    : (lang === 'ja'
        ? '技術的ではないトピックを中心としたブログ記事を掲載しています。'
        : 'A collection of blog posts focusing on non-technical topics.')

  return (
    <section className="pt-12 sm:pt-16 pb-8 sm:pb-12 bg-white dark:bg-zinc-900">
      <Container>
        <PageHeader title={title} description={description} />

        {/* 記事グリッド */}
        {thoughts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {thoughts.map((item) => (
                <BlogCard key={item.id || item.href} item={item} lang={lang} />
              ))}
            </div>

            {/* ページネーション */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath={basePath}
              lang={lang}
            />
          </>
        ) : (
          <div className="py-12 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              {lang === 'ja' ? '記事が見つかりませんでした。' : 'No articles found.'}
            </p>
          </div>
        )}
      </Container>
    </section>
  )
}

