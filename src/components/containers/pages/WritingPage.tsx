'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
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
import type { MicroCMSPostsRecord } from '@/libs/microCMS/types'

type WritingItem = FeedItem | MicroCMSPostsRecord
type FilterType = 'all' | 'external' | 'news'
type FilterTag = string | null
type FilterDataSource = string | null

// 統一されたWritingカードコンポーネント
function UnifiedWritingCard({ item, lang }: { item: WritingItem; lang: string }) {
  const isFeedItem = 'dataSource' in item
  const href = isFeedItem
    ? item.href
    : lang === 'ja'
      ? `/ja/writing/${item.id}`
      : `/writing/${item.id}`
  const title = item.title
  const description = isFeedItem
    ? item.description
    : item.content.replace(/<[^>]*>/g, '').substring(0, 150)
  const datetime = isFeedItem ? item.datetime : item.publishedAt
  const date = new Date(datetime)
  const tags = isFeedItem ? [] : item.tags || []
  const imageUrl = isFeedItem ? item.image : undefined

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
            {isFeedItem && item.dataSource && (
              <Tag variant="purple" size="sm">
                {item.dataSource.name}
              </Tag>
            )}
            {!isFeedItem && (
              <Tag variant="indigo" size="sm">
                {lang === 'ja' ? 'ニュース' : 'News'}
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
              {description}
              {description.length >= 150 ? '...' : ''}
            </p>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 3).map((tag) => (
                <Tag key={tag} variant="default" size="sm">
                  {tag}
                </Tag>
              ))}
            </div>
          )}

          {/* Read more indicator */}
          <div className="flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 mt-1">
            {isFeedItem
              ? lang === 'ja'
                ? '記事を読む'
                : 'Read article'
              : lang === 'ja'
                ? '続きを読む'
                : 'Read more'}
            <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </article>
  )

  if (isFeedItem) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="group block">
        {CardContent}
      </a>
    )
  }

  return (
    <Link href={href} className="group block">
      {CardContent}
    </Link>
  )
}

// サイドバーコンポーネント（デスクトップ用）
function Sidebar({
  searchQuery,
  onSearchChange,
  filterType,
  onFilterTypeChange,
  filterTag,
  onFilterTagChange,
  filterDataSource,
  onFilterDataSourceChange,
  availableTags,
  availableDataSources,
  dataSourceMap,
  counts,
  lang,
}: {
  searchQuery: string
  onSearchChange: (value: string) => void
  filterType: FilterType
  onFilterTypeChange: (type: FilterType) => void
  filterTag: FilterTag
  onFilterTagChange: (tag: FilterTag) => void
  filterDataSource: FilterDataSource
  onFilterDataSourceChange: (source: FilterDataSource) => void
  availableTags: string[]
  availableDataSources: string[]
  dataSourceMap: Map<string, string>
  counts: {
    all: number
    external: number
    news: number
    byTag: Record<string, number>
    byDataSource: Record<string, number>
  }
  lang: string
}) {
  const searchPlaceholder = lang === 'ja' ? '検索...' : 'Search...'
  const typeTitle = lang === 'ja' ? 'タイプ' : 'Type'
  const tagTitle = lang === 'ja' ? 'タグ' : 'Tag'
  const sourceTitle = lang === 'ja' ? 'データソース' : 'Source'
  const allText = lang === 'ja' ? 'すべて' : 'All'
  const externalText = lang === 'ja' ? '外部記事' : 'External Articles'
  const newsText = lang === 'ja' ? 'ニュース' : 'News'

  return (
    <div className="hidden lg:block space-y-6">
      {/* 検索バー */}
      <div>
        <SearchBar value={searchQuery} onChange={onSearchChange} placeholder={searchPlaceholder} />
      </div>

      {/* タイプフィルター */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
          {typeTitle}
        </h3>
        <nav className="space-y-1">
          <FilterItem
            active={filterType === 'all'}
            onClick={() => {
              onFilterTypeChange('all')
              onFilterTagChange(null)
              onFilterDataSourceChange(null)
            }}
            count={counts.all}
          >
            {allText}
          </FilterItem>
          <FilterItem
            active={filterType === 'external'}
            onClick={() => {
              onFilterTypeChange('external')
              onFilterTagChange(null)
              onFilterDataSourceChange(null)
            }}
            count={counts.external}
          >
            {externalText}
          </FilterItem>
          <FilterItem
            active={filterType === 'news'}
            onClick={() => {
              onFilterTypeChange('news')
              onFilterTagChange(null)
              onFilterDataSourceChange(null)
            }}
            count={counts.news}
          >
            {newsText}
          </FilterItem>
        </nav>
      </div>

      {/* タグフィルター */}
      {availableTags.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
            {tagTitle}
          </h3>
          <nav className="space-y-1">
            <FilterItem
              active={filterTag === null}
              onClick={() => onFilterTagChange(null)}
              count={counts.all}
            >
              {allText}
            </FilterItem>
            {availableTags.map((tag) => (
              <FilterItem
                key={tag}
                active={filterTag === tag}
                onClick={() => onFilterTagChange(tag)}
                count={counts.byTag[tag] || 0}
              >
                {tag}
              </FilterItem>
            ))}
          </nav>
        </div>
      )}

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
  newsArticles,
}: {
  lang: string
  externalArticles: FeedItem[]
  hasMoreBySource?: Record<string, boolean>
  newsArticles: MicroCMSPostsRecord[]
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [filterTag, setFilterTag] = useState<FilterTag>(null)
  const [filterDataSource, setFilterDataSource] = useState<FilterDataSource>(null)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  // 全記事を統合
  const allItems: WritingItem[] = [...externalArticles, ...newsArticles]

  // 利用可能なタグとデータソースを抽出
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>()
    newsArticles.forEach((article) => {
      if (article.tags) {
        article.tags.forEach((tag) => {
          tagSet.add(tag)
        })
      }
    })
    return Array.from(tagSet).sort()
  }, [newsArticles])

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
  const matchesSearch = (item: WritingItem): boolean => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    const title = item.title.toLowerCase()
    const description = (
      'dataSource' in item ? item.description : item.content.replace(/<[^>]*>/g, '')
    ).toLowerCase()
    const tags = ('dataSource' in item ? [] : item.tags || []).join(' ').toLowerCase()

    return title.includes(query) || description.includes(query) || tags.includes(query)
  }

  // フィルターと検索を適用
  const filteredItems = useMemo(() => {
    let items = allItems.filter((item) => {
      // タイプフィルター
      if (filterType === 'external' && !('dataSource' in item)) return false
      if (filterType === 'news' && 'dataSource' in item) return false

      // タグフィルター
      if (filterTag !== null) {
        if ('dataSource' in item) return false // 外部記事にはタグがない
        if (!item.tags || !item.tags.includes(filterTag)) return false
      }

      // データソースフィルター
      if (filterDataSource !== null) {
        if (!('dataSource' in item)) return false // ニュースにはデータソースがない
        if (item.dataSource.name !== filterDataSource) return false
      }

      return true
    })

    // 検索フィルター
    items = items.filter(matchesSearch)

    // 日付順にソート
    items.sort((a, b) => {
      const dateA = 'datetime' in a ? a.datetime : a.publishedAt
      const dateB = 'datetime' in b ? b.datetime : b.publishedAt
      return new Date(dateB).getTime() - new Date(dateA).getTime()
    })

    return items
  }, [allItems, filterType, filterTag, filterDataSource, matchesSearch])

  // カウント計算
  const counts = useMemo(() => {
    const byTag: Record<string, number> = {}
    const byDataSource: Record<string, number> = {}

    // タグ別カウント
    availableTags.forEach((tag) => {
      byTag[tag] = newsArticles.filter((article) => article.tags?.includes(tag)).length
    })

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
      news: newsArticles.length,
      byTag,
      byDataSource,
    }
  }, [
    allItems,
    externalArticles,
    newsArticles,
    availableTags,
    availableDataSources,
    hasMoreBySource,
  ])

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
    if (filterType !== 'all') count++
    if (filterTag !== null) count++
    if (filterDataSource !== null) count++
    return count
  }, [filterType, filterTag, filterDataSource])

  // フィルターグループを構築
  const filterGroups = useMemo<FilterGroup[]>(() => {
    const allText = lang === 'ja' ? 'すべて' : 'All'
    const typeTitle = lang === 'ja' ? 'タイプ' : 'Type'
    const tagTitle = lang === 'ja' ? 'タグ' : 'Tag'
    const sourceTitle = lang === 'ja' ? 'データソース' : 'Source'
    const externalText = lang === 'ja' ? '外部記事' : 'External Articles'
    const newsText = lang === 'ja' ? 'ニュース' : 'News'

    const groups: FilterGroup[] = [
      {
        title: typeTitle,
        items: [
          {
            id: 'all',
            label: allText,
            active: filterType === 'all',
            count: counts.all,
            onClick: () => {
              setFilterType('all')
              setFilterTag(null)
              setFilterDataSource(null)
            },
          },
          {
            id: 'external',
            label: externalText,
            active: filterType === 'external',
            count: counts.external,
            onClick: () => {
              setFilterType('external')
              setFilterTag(null)
              setFilterDataSource(null)
            },
          },
          {
            id: 'news',
            label: newsText,
            active: filterType === 'news',
            count: counts.news,
            onClick: () => {
              setFilterType('news')
              setFilterTag(null)
              setFilterDataSource(null)
            },
          },
        ],
      },
    ]

    // タグフィルター
    if (availableTags.length > 0) {
      groups.push({
        title: tagTitle,
        items: [
          {
            id: 'tag-all',
            label: allText,
            active: filterTag === null,
            count: counts.all,
            onClick: () => setFilterTag(null),
          },
          ...availableTags.map((tag) => ({
            id: `tag-${tag}`,
            label: tag,
            active: filterTag === tag,
            count: counts.byTag[tag] || 0,
            onClick: () => setFilterTag(tag),
          })),
        ],
      })
    }

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
  }, [
    lang,
    filterType,
    filterTag,
    filterDataSource,
    availableTags,
    availableDataSources,
    counts,
    dataSourceMap.get,
  ])

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
                filterType={filterType}
                onFilterTypeChange={setFilterType}
                filterTag={filterTag}
                onFilterTagChange={setFilterTag}
                filterDataSource={filterDataSource}
                onFilterDataSourceChange={setFilterDataSource}
                availableTags={availableTags}
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
                  {filteredItems.map((item) => {
                    const key = 'dataSource' in item ? `external-${item.href}` : `news-${item.id}`
                    return <UnifiedWritingCard key={key} item={item} lang={lang} />
                  })}
                </div>

                {/* 外部動線セクション */}
                {availableDataSources.length > 0 && (
                  <div className="mt-16 pt-16 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        {lang === 'ja' ? 'もっと記事を見る' : 'View More Articles'}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                        {lang === 'ja'
                          ? '最新20件を表示しています。それ以前の記事は各サイトでご覧ください。'
                          : 'Showing the latest 20 articles. View older articles on each site.'}
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
