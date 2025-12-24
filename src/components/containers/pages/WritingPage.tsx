'use client'

import Image from 'next/image'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Container from '@/components/tailwindui/Container'
import DateDisplay from '@/components/ui/DateDisplay'
import FilterItem from '@/components/ui/FilterItem'
import MobileFilterButton from '@/components/ui/MobileFilterButton'
import MobileFilterDrawer, { type FilterGroup } from '@/components/ui/MobileFilterDrawer'
import PageHeader from '@/components/ui/PageHeader'
import SearchBar from '@/components/ui/SearchBar'
import SidebarLayout from '@/components/ui/SidebarLayout'
import Tag from '@/components/ui/Tag'
import type { FeedItem } from '@/libs/dataSources/types'
import { removeHtmlTags } from '@/libs/sanitize'

type WritingItem = FeedItem
type FilterDataSource = string | null

// 統一されたWritingカードコンポーネント
function UnifiedWritingCard({ item, lang }: { item: WritingItem; lang: string }) {
  const href = item.href
  const title = item.title
  const description = item.description
  const datetime = item.datetime
  const date = new Date(datetime)
  const imageUrl = item.image

  const CardContent = (
    <article className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:border-indigo-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700">
      {/* Image - Top (if available) */}
      {imageUrl && (
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      )}

      {/* Content */}
      <div className={`p-5 lg:p-6 ${imageUrl ? '' : 'pt-6'}`}>
        <div className="flex flex-col gap-3">
          {/* Date and DataSource */}
          <div className="flex items-center gap-3 flex-wrap">
            <DateDisplay
              date={date}
              lang={lang}
              format="short"
              className="text-xs font-semibold text-slate-500 dark:text-slate-400"
            />
            {item.dataSource && (
              <Tag variant="purple" size="sm">
                {item.dataSource.name}
              </Tag>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold leading-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {title}
          </h3>

          {/* Description */}
          {description && (
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-3">
              {removeHtmlTags(description)}
              {removeHtmlTags(description).length >= 150 ? '...' : ''}
            </p>
          )}

          {/* Read more indicator */}
          <div className="flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 mt-1">
            {lang === 'ja' ? '記事を読む' : 'Read article'}
            <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </article>
  )

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="group block">
      {CardContent}
    </a>
  )
}

// サイドバーコンポーネント（デスクトップ用）
function Sidebar({
  searchQuery,
  onSearchChange,
  filterDataSource,
  onFilterDataSourceChange,
  availableDataSources,
  dataSourceMap,
  counts,
  lang,
}: {
  searchQuery: string
  onSearchChange: (value: string) => void
  filterDataSource: FilterDataSource
  onFilterDataSourceChange: (source: FilterDataSource) => void
  availableDataSources: string[]
  dataSourceMap: Map<string, string>
  counts: {
    all: number
    external: number
    byDataSource: Record<string, number>
  }
  lang: string
}) {
  const searchPlaceholder = lang === 'ja' ? '検索...' : 'Search...'
  const sourceTitle = lang === 'ja' ? 'データソース' : 'Source'
  const allText = lang === 'ja' ? 'すべて' : 'All'

  return (
    <div className="hidden lg:block space-y-6">
      {/* 検索バー */}
      <div>
        <SearchBar value={searchQuery} onChange={onSearchChange} placeholder={searchPlaceholder} />
      </div>

      {/* データソースフィルター */}
      {availableDataSources.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
            {sourceTitle}
          </h3>
          <nav className="space-y-1">
            <FilterItem
              active={filterDataSource === null}
              onClick={() => onFilterDataSourceChange(null)}
              count={counts.all}
            >
              {allText}
            </FilterItem>
            {availableDataSources.map((source) => {
              const sourceHref = dataSourceMap.get(source) || '#'
              return (
                <div key={source} className="space-y-1">
                  <FilterItem
                    active={filterDataSource === source}
                    onClick={() => onFilterDataSourceChange(source)}
                    count={counts.byDataSource[source] || 0}
                  >
                    {source}
                  </FilterItem>
                  {filterDataSource === source && (
                    <a
                      href={sourceHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1"
                    >
                      {lang === 'ja' ? '元のサイトで見る' : 'View on original site'}
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  )}
                </div>
              )
            })}
          </nav>
        </div>
      )}
    </div>
  )
}

export default function WritingPageContent({
  lang,
  externalArticles,
  hasMoreBySource = {},
}: {
  lang: string
  externalArticles: FeedItem[]
  hasMoreBySource?: Record<string, boolean>
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDataSource, setFilterDataSource] = useState<FilterDataSource>(null)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // 全記事を統合
  const allItems: WritingItem[] = externalArticles

  const availableDataSources = useMemo(() => {
    const sourceSet = new Set<string>()
    externalArticles.forEach((article) => {
      if (article.dataSource) {
        sourceSet.add(article.dataSource.name)
      }
    })
    return Array.from(sourceSet).sort()
  }, [externalArticles])

  // データソースのhref情報を取得
  const dataSourceMap = useMemo(() => {
    const map = new Map<string, string>()
    externalArticles.forEach((article) => {
      if (article.dataSource) {
        map.set(article.dataSource.name, article.dataSource.href)
      }
    })
    return map
  }, [externalArticles])

  // 検索フィルター関数
  const matchesSearch = useCallback(
    (item: WritingItem): boolean => {
      if (!searchQuery.trim()) return true
      const query = searchQuery.toLowerCase()
      const title = item.title.toLowerCase()
      const description = item.description.toLowerCase()

      return title.includes(query) || description.includes(query)
    },
    [searchQuery],
  )

  // フィルターと検索を適用
  const filteredItems = useMemo(() => {
    let items = allItems.filter((item) => {
      // データソースフィルター
      if (filterDataSource !== null) {
        if (!item.dataSource || item.dataSource.name !== filterDataSource) return false
      }

      return true
    })

    // 検索フィルター
    items = items.filter(matchesSearch)

    // 日付順にソート
    items.sort((a, b) => {
      return new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
    })

    return items
  }, [allItems, filterDataSource, matchesSearch])

  // ページネーション計算
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedItems = filteredItems.slice(startIndex, endIndex)

  // フィルターや検索が変更されたらページをリセット
  useEffect(() => {
    setCurrentPage(1)
  }, [filterDataSource, searchQuery])

  // カウント計算
  const counts = useMemo(() => {
    const byDataSource: Record<string, number> = {}

    // データソース別カウント（20件以上ある場合は「20+」として扱う）
    availableDataSources.forEach((source) => {
      const count = externalArticles.filter(
        (article) => article.dataSource && article.dataSource.name === source,
      ).length
      // hasMoreBySourceがある場合は20+として扱う（実際のカウントは20だが、表示は20+）
      byDataSource[source] = hasMoreBySource[source] ? 21 : count
    })

    return {
      all: allItems.length,
      external: externalArticles.length,
      byDataSource,
    }
  }, [allItems, externalArticles, availableDataSources, hasMoreBySource])

  // テキスト
  const title = lang === 'ja' ? 'Writing' : 'Writing'
  const description =
    lang === 'ja'
      ? '技術記事、ブログ投稿、ニュースなどの執筆活動を紹介しています。'
      : "A collection of technical articles, blog posts, news, and other writing I've published."
  const filterButtonText = lang === 'ja' ? 'フィルター' : 'Filter'

  // アクティブなフィルターの数を計算
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filterDataSource !== null) count++
    return count
  }, [filterDataSource])

  // フィルターグループを構築
  const filterGroups = useMemo<FilterGroup[]>(() => {
    const allText = lang === 'ja' ? 'すべて' : 'All'
    const sourceTitle = lang === 'ja' ? 'データソース' : 'Source'

    const groups: FilterGroup[] = []

    // データソースフィルター
    if (availableDataSources.length > 0) {
      groups.push({
        title: sourceTitle,
        items: [
          {
            id: 'source-all',
            label: allText,
            active: filterDataSource === null,
            count: counts.all,
            onClick: () => setFilterDataSource(null),
          },
          ...availableDataSources.map((source) => ({
            id: `source-${source}`,
            label: source,
            active: filterDataSource === source,
            count: counts.byDataSource[source] || 0,
            onClick: () => setFilterDataSource(source),
            externalLink: dataSourceMap.get(source),
          })),
        ],
      })
    }

    return groups
  }, [lang, filterDataSource, availableDataSources, counts, dataSourceMap.get])

  return (
    <>
      {/* モバイル用フィルタードロワー */}
      <MobileFilterDrawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={lang === 'ja' ? '検索...' : 'Search...'}
        filterGroups={filterGroups}
        title={filterButtonText}
        lang={lang}
      />

      {/* Heroセクション + メインコンテンツ */}
      <section className="pt-12 sm:pt-16 pb-8 sm:pb-12 bg-white dark:bg-zinc-900">
        <Container>
          <PageHeader title={title} description={description} />

          {/* モバイル用検索バーとフィルターボタン */}
          <div className="lg:hidden mb-6 space-y-4">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={lang === 'ja' ? '検索...' : 'Search...'}
            />
            <MobileFilterButton
              onClick={() => setIsMobileFilterOpen(true)}
              activeFilterCount={activeFilterCount}
              label={filterButtonText}
            />
          </div>

          <SidebarLayout
            sidebar={
              <Sidebar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                filterDataSource={filterDataSource}
                onFilterDataSourceChange={setFilterDataSource}
                availableDataSources={availableDataSources}
                dataSourceMap={dataSourceMap}
                counts={counts}
                lang={lang}
              />
            }
          >
            {/* 記事グリッド */}
            {filteredItems.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                  {paginatedItems.map((item) => (
                    <UnifiedWritingCard key={item.href} item={item} lang={lang} />
                  ))}
                </div>

                {/* ページネーション */}
                {totalPages > 1 && (
                  <nav
                    className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 px-4 py-3 sm:px-6 mt-12"
                    aria-label="Pagination"
                  >
                    <div className="flex flex-1 justify-between sm:justify-start">
                      {currentPage > 1 ? (
                        <button
                          type="button"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          className="relative inline-flex items-center rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <svg
                            className="mr-2 h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 19l-7-7 7-7"
                            />
                          </svg>
                          {lang === 'ja' ? '前へ' : 'Previous'}
                        </button>
                      ) : (
                        <div className="relative inline-flex items-center rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-400 dark:text-zinc-600 cursor-not-allowed">
                          <svg
                            className="mr-2 h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 19l-7-7 7-7"
                            />
                          </svg>
                          {lang === 'ja' ? '前へ' : 'Previous'}
                        </div>
                      )}
                    </div>

                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-center">
                      <div>
                        <p className="text-sm text-zinc-700 dark:text-zinc-300">
                          <span className="font-medium">{currentPage}</span>
                          <span className="mx-1">/</span>
                          <span className="font-medium">{totalPages}</span>
                          <span className="ml-1">{lang === 'ja' ? 'ページ' : 'Page'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-1 justify-end">
                      {currentPage < totalPages ? (
                        <button
                          type="button"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          className="relative inline-flex items-center rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                          {lang === 'ja' ? '次へ' : 'Next'}
                          <svg
                            className="ml-2 h-5 w-5"
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
                        </button>
                      ) : (
                        <div className="relative inline-flex items-center rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-400 dark:text-zinc-600 cursor-not-allowed">
                          {lang === 'ja' ? '次へ' : 'Next'}
                          <svg
                            className="ml-2 h-5 w-5"
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
                      )}
                    </div>
                  </nav>
                )}

                {/* 外部動線セクション（最初のページのみ表示） */}
                {currentPage === 1 && availableDataSources.length > 0 && (
                  <div className="mt-16 pt-16 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        {lang === 'ja' ? 'もっと記事を見る' : 'View More Articles'}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                        {lang === 'ja'
                          ? 'すべての記事を表示しています。各サイトでも記事を閲覧できます。'
                          : 'Showing all articles. You can also view articles on each site.'}
                      </p>
                      <div className="flex flex-wrap justify-center gap-4">
                        {availableDataSources.map((source) => {
                          const sourceHref = dataSourceMap.get(source) || '#'
                          return (
                            <a
                              key={source}
                              href={sourceHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors"
                            >
                              <span className="font-medium">{source}</span>
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            </a>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="py-12 text-center">
                <p className="text-slate-600 dark:text-slate-400">
                  {lang === 'ja' ? '該当する記事が見つかりませんでした。' : 'No articles found.'}
                </p>
              </div>
            )}
          </SidebarLayout>
        </Container>
      </section>
    </>
  )
}
