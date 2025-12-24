'use client'

import Link from 'next/link'
import { useCallback, useMemo, useState } from 'react'
import Container from '@/components/tailwindui/Container'
import DateDisplay from '@/components/ui/DateDisplay'
import PageHeader from '@/components/ui/PageHeader'
import Pagination from '@/components/ui/Pagination'
import SearchBar from '@/components/ui/SearchBar'
import SidebarLayout from '@/components/ui/SidebarLayout'
import Tag from '@/components/ui/Tag'
import type { CategoryWithCount } from '@/libs/dataSources/thoughts'
import type { BlogItem } from '@/libs/dataSources/types'

type BlogPageProps = {
  lang: string
  thoughts: BlogItem[]
  currentPage: number
  totalPages: number
  basePath: string
  categoryName?: string
  categories?: CategoryWithCount[]
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
              {item.categories &&
                item.categories.length > 0 &&
                item.categories.map((category) => (
                  <Tag key={category.id} variant="indigo" size="sm">
                    {category.name}
                  </Tag>
                ))}
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
  if (lang === 'ja') {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-600 dark:text-slate-400">記事が見つかりませんでした。</p>
      </div>
    )
  }

  return (
    <div className="py-12 text-center">
      <div className="max-w-2xl mx-auto space-y-4">
        <p className="text-slate-600 dark:text-slate-400">No articles found in English.</p>
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-900/20 p-6">
          <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
            However, we have articles available in Japanese! You can view them using a translation
            tool if needed.
          </p>
          <Link
            href="/ja/blog"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            View Japanese Blog
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}

// サイドバーコンポーネント
function BlogSidebar({
  categories,
  basePath,
  lang,
  currentCategorySlug,
  searchQuery,
  onSearchChange,
}: {
  categories: CategoryWithCount[]
  basePath: string
  lang: string
  currentCategorySlug?: string
  searchQuery: string
  onSearchChange: (value: string) => void
}) {
  const categoryTitle = lang === 'ja' ? 'カテゴリ' : 'Categories'
  const allText = lang === 'ja' ? 'すべて' : 'All'
  const searchPlaceholder = lang === 'ja' ? '検索...' : 'Search...'

  // basePathからカテゴリ部分を除去して、ブログのベースパスを取得
  // basePathが `/ja/blog/category/xxx` の場合は `/ja/blog` に
  // basePathが `/ja/blog` の場合はそのまま
  const blogBasePath = basePath.includes('/category/') ? basePath.split('/category/')[0] : basePath

  return (
    <div className="hidden lg:block space-y-6">
      {/* 検索バー */}
      <div>
        <SearchBar value={searchQuery} onChange={onSearchChange} placeholder={searchPlaceholder} />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
          {categoryTitle}
        </h3>
        <nav className="space-y-1">
          <Link
            href={blogBasePath}
            className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
              !currentCategorySlug
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400'
                : 'text-slate-700 hover:bg-zinc-50 dark:text-slate-300 dark:hover:bg-zinc-800'
            }`}
          >
            <span>{allText}</span>
          </Link>
          {categories.map((category) => {
            // category.slugが既にエンコードされている可能性があるので、一度デコードしてからエンコード
            const normalizedSlug = category.slug.includes('%')
              ? decodeURIComponent(category.slug)
              : category.slug
            const categoryUrl = `${blogBasePath}/category/${encodeURIComponent(normalizedSlug)}`
            const isActive =
              currentCategorySlug === category.slug || currentCategorySlug === normalizedSlug
            return (
              <Link
                key={category.id}
                href={categoryUrl}
                className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400'
                    : 'text-slate-700 hover:bg-zinc-50 dark:text-slate-300 dark:hover:bg-zinc-800'
                }`}
              >
                <span>{category.name}</span>
                <span
                  className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                    isActive
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                      : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400'
                  }`}
                >
                  {category.count > 20 ? '20+' : category.count}
                </span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

// ページタイトルと説明文を取得するヘルパー関数
function getPageContent(lang: string, categoryName?: string) {
  const title = categoryName
    ? lang === 'ja'
      ? `カテゴリ: ${categoryName}`
      : `Category: ${categoryName}`
    : lang === 'ja'
      ? 'ブログ'
      : 'Blog'

  const description = categoryName
    ? lang === 'ja'
      ? `「${categoryName}」カテゴリのブログ記事一覧です。`
      : `Blog posts in the "${categoryName}" category.`
    : lang === 'ja'
      ? '技術的ではないトピックを中心としたブログ記事を掲載しています。'
      : 'A collection of blog posts focusing on non-technical topics.'

  return { title, description }
}

export default function BlogPageContent({
  lang,
  thoughts,
  currentPage,
  totalPages,
  basePath,
  categoryName,
  categories = [],
}: BlogPageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const { title, description } = getPageContent(lang, categoryName)

  // 現在のカテゴリslugを取得（URLから）
  const currentCategorySlug = categoryName
    ? categories.find((cat) => cat.name === categoryName)?.slug
    : undefined

  // 検索フィルター関数
  const matchesSearch = useCallback(
    (item: BlogItem): boolean => {
      if (!searchQuery.trim()) return true
      const query = searchQuery.toLowerCase()
      const title = item.title.toLowerCase()
      const description = item.description.toLowerCase()
      const categoryNames = item.categories?.map((cat) => cat.name.toLowerCase()).join(' ') || ''

      return title.includes(query) || description.includes(query) || categoryNames.includes(query)
    },
    [searchQuery],
  )

  // 検索フィルターを適用
  const filteredThoughts = useMemo(() => {
    if (!searchQuery.trim()) {
      return thoughts
    }
    return thoughts.filter(matchesSearch)
  }, [thoughts, matchesSearch])

  const searchPlaceholder = lang === 'ja' ? '検索...' : 'Search...'

  return (
    <section className="pt-12 sm:pt-16 pb-8 sm:pb-12 bg-white dark:bg-zinc-900">
      <Container>
        <PageHeader title={title} description={description} />

        {/* モバイル用検索バー */}
        <div className="lg:hidden mb-6">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={searchPlaceholder}
          />
        </div>

        {/* サイドバーとメインコンテンツ */}
        {categories.length > 0 ? (
          <SidebarLayout
            sidebar={
              <BlogSidebar
                categories={categories}
                basePath={basePath}
                lang={lang}
                currentCategorySlug={currentCategorySlug}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            }
          >
            {/* 記事グリッド */}
            {filteredThoughts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                  {filteredThoughts.map((item) => (
                    <BlogCard key={item.id || item.href} item={item} lang={lang} />
                  ))}
                </div>

                {/* ページネーション（検索時は非表示） */}
                {!searchQuery.trim() && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    basePath={basePath}
                    lang={lang}
                  />
                )}
              </>
            ) : (
              <NoArticlesMessage lang={lang} />
            )}
          </SidebarLayout>
        ) : (
          <>
            {/* 記事グリッド */}
            {filteredThoughts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                  {filteredThoughts.map((item) => (
                    <BlogCard key={item.id || item.href} item={item} lang={lang} />
                  ))}
                </div>

                {/* ページネーション（検索時は非表示） */}
                {!searchQuery.trim() && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    basePath={basePath}
                    lang={lang}
                  />
                )}
              </>
            ) : (
              <NoArticlesMessage lang={lang} />
            )}
          </>
        )}
      </Container>
    </section>
  )
}
