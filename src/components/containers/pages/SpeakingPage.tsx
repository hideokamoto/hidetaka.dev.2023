'use client'

import Link from 'next/link'
import { useCallback, useMemo, useState } from 'react'
import Container from '@/components/tailwindui/Container'
import CTAButton from '@/components/ui/CTAButton'
import DateDisplay from '@/components/ui/DateDisplay'
import FilterItem from '@/components/ui/FilterItem'
import MobileFilterButton from '@/components/ui/MobileFilterButton'
import MobileFilterDrawer, { type FilterGroup } from '@/components/ui/MobileFilterDrawer'
import PageHeader from '@/components/ui/PageHeader'
import SearchBar from '@/components/ui/SearchBar'
import SidebarLayout from '@/components/ui/SidebarLayout'
import Tag from '@/components/ui/Tag'
import type { WPEvent } from '@/libs/dataSources/types'
import type { MicroCMSEventsRecord } from '@/libs/microCMS/types'

type FilterPlace = string | null
type FilterYear = string | null
type FilterType = 'announcement' | 'report' | null

// 統合イベント型
export type UnifiedEvent =
  | (MicroCMSEventsRecord & { type: 'announcement'; source: 'microcms' })
  | (WPEvent & { type: 'report'; source: 'wordpress' })

// 統一されたSpeakingカードコンポーネント
function UnifiedSpeakingCard({
  event,
  lang,
  basePath,
}: {
  event: UnifiedEvent
  lang: string
  basePath: string
}) {
  const isAnnouncement = event.type === 'announcement'
  const isReport = event.type === 'report'

  // 日付の取得
  const date = isAnnouncement ? new Date(event.date) : new Date(event.date)
  const year = date.getFullYear().toString()

  // タイトルの取得
  const title = isAnnouncement ? event.title : event.title.rendered

  // 説明の取得
  const description = isAnnouncement
    ? event.description
    : event.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 150)

  // リンクの取得（レポートの場合は内部リンク、告知の場合は外部リンク）
  const link = isAnnouncement ? event.url : `${basePath}/${event.slug}`
  const isInternalLink = isReport

  // 場所の取得（告知のみ）
  const place = isAnnouncement ? event.place : undefined

  // セッションタイトル（告知のみ）
  const sessionTitle = isAnnouncement ? event.session_title : undefined

  const CardContent = (
    <article className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:border-indigo-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700">
      {/* Content */}
      <div className="p-5 lg:p-6">
        <div className="flex flex-col gap-3">
          {/* Date and Place */}
          <div className="flex items-center gap-3 flex-wrap">
            <DateDisplay
              date={date}
              lang={lang}
              format="short"
              className="text-xs font-semibold text-slate-500 dark:text-slate-400"
            />
            {/* タイプバッジ */}
            <Tag variant={isAnnouncement ? 'indigo' : 'purple'} size="sm">
              {isAnnouncement
                ? lang === 'ja'
                  ? '告知'
                  : 'Announcement'
                : lang === 'ja'
                  ? 'レポート'
                  : 'Report'}
            </Tag>
            {place && (
              <Tag variant="purple" size="sm">
                {place}
              </Tag>
            )}
            <Tag variant="default" size="sm">
              {year}
            </Tag>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold leading-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {title}
          </h3>

          {/* Session Title */}
          {sessionTitle && (
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{sessionTitle}</p>
          )}

          {/* Description */}
          {description && (
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-3">
              {description}
              {description.length > 150 ? '...' : ''}
            </p>
          )}

          {/* Links */}
          <div className="flex items-center gap-4 mt-2">
            {link && isInternalLink ? (
              <Link
                href={link}
                className="flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                onClick={(e) => e.stopPropagation()}
              >
                {lang === 'ja' ? '記事を読む' : 'Read Article'}
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </Link>
            ) : (
              link && (
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                  onClick={(e) => e.stopPropagation()}
                >
                  {isAnnouncement
                    ? lang === 'ja'
                      ? 'イベントページ'
                      : 'Event Page'
                    : lang === 'ja'
                      ? '記事を読む'
                      : 'Read Article'}
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
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              )
            )}
            {isAnnouncement && event.slide_url && (
              <a
                href={event.slide_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              >
                {lang === 'ja' ? 'スライド' : 'Slides'}
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            )}
            {isAnnouncement && event.blog_url && (
              <a
                href={event.blog_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              >
                {lang === 'ja' ? 'ブログ' : 'Blog'}
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        </div>
      </div>
    </article>
  )

  if (isInternalLink) {
    return (
      <Link href={link} className="group block">
        {CardContent}
      </Link>
    )
  }

  return (
    <a href={link} target="_blank" rel="noopener noreferrer" className="group block">
      {CardContent}
    </a>
  )
}

// サイドバーコンポーネント（デスクトップ用）
function Sidebar({
  searchQuery,
  onSearchChange,
  filterType,
  onFilterTypeChange,
  filterPlace,
  onFilterPlaceChange,
  filterYear,
  onFilterYearChange,
  availablePlaces,
  availableYears,
  counts,
  lang,
}: {
  searchQuery: string
  onSearchChange: (value: string) => void
  filterType: FilterType
  onFilterTypeChange: (type: FilterType) => void
  filterPlace: FilterPlace
  onFilterPlaceChange: (place: FilterPlace) => void
  filterYear: FilterYear
  onFilterYearChange: (year: FilterYear) => void
  availablePlaces: string[]
  availableYears: string[]
  counts: {
    all: number
    byType: Record<string, number>
    byPlace: Record<string, number>
    byYear: Record<string, number>
  }
  lang: string
}) {
  const searchPlaceholder = lang === 'ja' ? '検索...' : 'Search...'
  const typeTitle = lang === 'ja' ? 'タイプ' : 'Type'
  const placeTitle = lang === 'ja' ? '場所' : 'Place'
  const yearTitle = lang === 'ja' ? '年' : 'Year'
  const allText = lang === 'ja' ? 'すべて' : 'All'
  const announcementText = lang === 'ja' ? '告知' : 'Announcement'
  const reportText = lang === 'ja' ? 'レポート' : 'Report'

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
            active={filterType === null}
            onClick={() => onFilterTypeChange(null)}
            count={counts.all}
          >
            {allText}
          </FilterItem>
          <FilterItem
            active={filterType === 'announcement'}
            onClick={() => onFilterTypeChange('announcement')}
            count={counts.byType.announcement || 0}
          >
            {announcementText}
          </FilterItem>
          <FilterItem
            active={filterType === 'report'}
            onClick={() => onFilterTypeChange('report')}
            count={counts.byType.report || 0}
          >
            {reportText}
          </FilterItem>
        </nav>
      </div>

      {/* 場所フィルター */}
      {availablePlaces.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
            {placeTitle}
          </h3>
          <nav className="space-y-1">
            <FilterItem
              active={filterPlace === null}
              onClick={() => onFilterPlaceChange(null)}
              count={counts.all}
            >
              {allText}
            </FilterItem>
            {availablePlaces.map((place) => (
              <FilterItem
                key={place}
                active={filterPlace === place}
                onClick={() => onFilterPlaceChange(place)}
                count={counts.byPlace[place] || 0}
              >
                {place}
              </FilterItem>
            ))}
          </nav>
        </div>
      )}

      {/* 年フィルター */}
      {availableYears.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
            {yearTitle}
          </h3>
          <nav className="space-y-1">
            <FilterItem
              active={filterYear === null}
              onClick={() => onFilterYearChange(null)}
              count={counts.all}
            >
              {allText}
            </FilterItem>
            {availableYears.map((year) => (
              <FilterItem
                key={year}
                active={filterYear === year}
                onClick={() => onFilterYearChange(year)}
                count={counts.byYear[year] || 0}
              >
                {year}
              </FilterItem>
            ))}
          </nav>
        </div>
      )}
    </div>
  )
}

// フィルターグループ作成のヘルパー関数
type FilterGroupCounts = {
  all: number
  byType: Record<string, number>
  byPlace: Record<string, number>
  byYear: Record<string, number>
}

function createTypeFilterGroup(
  lang: string,
  filterType: FilterType,
  counts: FilterGroupCounts,
  setFilterType: (type: FilterType) => void,
): FilterGroup {
  const allText = lang === 'ja' ? 'すべて' : 'All'
  const typeTitle = lang === 'ja' ? 'タイプ' : 'Type'
  const announcementText = lang === 'ja' ? '告知' : 'Announcement'
  const reportText = lang === 'ja' ? 'レポート' : 'Report'

  return {
    title: typeTitle,
    items: [
      {
        id: 'type-all',
        label: allText,
        active: filterType === null,
        count: counts.all,
        onClick: () => setFilterType(null),
      },
      {
        id: 'type-announcement',
        label: announcementText,
        active: filterType === 'announcement',
        count: counts.byType.announcement || 0,
        onClick: () => setFilterType('announcement'),
      },
      {
        id: 'type-report',
        label: reportText,
        active: filterType === 'report',
        count: counts.byType.report || 0,
        onClick: () => setFilterType('report'),
      },
    ],
  }
}

function createPlaceFilterGroup(
  lang: string,
  filterPlace: FilterPlace,
  availablePlaces: string[],
  counts: FilterGroupCounts,
  setFilterPlace: (place: FilterPlace) => void,
): FilterGroup {
  const allText = lang === 'ja' ? 'すべて' : 'All'
  const placeTitle = lang === 'ja' ? '場所' : 'Place'

  return {
    title: placeTitle,
    items: [
      {
        id: 'place-all',
        label: allText,
        active: filterPlace === null,
        count: counts.all,
        onClick: () => setFilterPlace(null),
      },
      ...availablePlaces.map((place) => ({
        id: `place-${place}`,
        label: place,
        active: filterPlace === place,
        count: counts.byPlace[place] || 0,
        onClick: () => setFilterPlace(place),
      })),
    ],
  }
}

function createYearFilterGroup(
  lang: string,
  filterYear: FilterYear,
  availableYears: string[],
  counts: FilterGroupCounts,
  setFilterYear: (year: FilterYear) => void,
): FilterGroup {
  const allText = lang === 'ja' ? 'すべて' : 'All'
  const yearTitle = lang === 'ja' ? '年' : 'Year'

  return {
    title: yearTitle,
    items: [
      {
        id: 'year-all',
        label: allText,
        active: filterYear === null,
        count: counts.all,
        onClick: () => setFilterYear(null),
      },
      ...availableYears.map((year) => ({
        id: `year-${year}`,
        label: year,
        active: filterYear === year,
        count: counts.byYear[year] || 0,
        onClick: () => setFilterYear(year),
      })),
    ],
  }
}

export default function SpeakingPageContent({
  lang,
  events,
  basePath,
}: {
  lang: string
  events: UnifiedEvent[]
  basePath: string
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<FilterType>(null)
  const [filterPlace, setFilterPlace] = useState<FilterPlace>(null)
  const [filterYear, setFilterYear] = useState<FilterYear>(null)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  // 利用可能な場所と年を抽出
  const availablePlaces = useMemo(() => {
    const placeSet = new Set<string>()
    events.forEach((event) => {
      if (event.type === 'announcement' && event.place) {
        placeSet.add(event.place)
      }
    })
    return Array.from(placeSet).sort()
  }, [events])

  const availableYears = useMemo(() => {
    const yearSet = new Set<string>()
    events.forEach((event) => {
      const date = new Date(event.date)
      if (!Number.isNaN(date.getTime())) {
        yearSet.add(date.getFullYear().toString())
      }
    })
    return Array.from(yearSet).sort((a, b) => parseInt(b, 10) - parseInt(a, 10)) // 新しい年から
  }, [events])

  // 検索フィルター関数
  const matchesSearch = useCallback(
    (event: UnifiedEvent): boolean => {
      if (!searchQuery.trim()) return true
      const query = searchQuery.toLowerCase()
      const title =
        event.type === 'announcement'
          ? event.title.toLowerCase()
          : event.title.rendered.toLowerCase()
      const description =
        event.type === 'announcement'
          ? (event.description || '').toLowerCase()
          : (event.excerpt.rendered || '').toLowerCase()
      const sessionTitle =
        event.type === 'announcement' ? (event.session_title || '').toLowerCase() : ''
      const place = event.type === 'announcement' ? (event.place || '').toLowerCase() : ''

      return (
        title.includes(query) ||
        description.includes(query) ||
        sessionTitle.includes(query) ||
        place.includes(query)
      )
    },
    [searchQuery],
  )

  // フィルターと検索を適用
  const filteredEvents = useMemo(() => {
    let items = events.filter((event) => {
      // タイプフィルター
      if (filterType !== null && event.type !== filterType) return false

      // 場所フィルター（告知のみ）
      if (filterPlace !== null) {
        if (event.type !== 'announcement' || event.place !== filterPlace) return false
      }

      // 年フィルター
      if (filterYear !== null) {
        const date = new Date(event.date)
        if (Number.isNaN(date.getTime()) || date.getFullYear().toString() !== filterYear)
          return false
      }

      return true
    })

    // 検索フィルター
    items = items.filter(matchesSearch)

    // 日付順にソート（新しい順）
    items.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return dateB - dateA
    })

    return items
  }, [events, filterType, filterPlace, filterYear, matchesSearch])

  // カウント計算
  const counts = useMemo(() => {
    const byType: Record<string, number> = {
      announcement: 0,
      report: 0,
    }
    const byPlace: Record<string, number> = {}
    const byYear: Record<string, number> = {}

    // タイプ別カウント
    events.forEach((event) => {
      byType[event.type] = (byType[event.type] || 0) + 1
    })

    // 場所別カウント（告知のみ）
    availablePlaces.forEach((place) => {
      byPlace[place] = events.filter(
        (event) => event.type === 'announcement' && event.place === place,
      ).length
    })

    // 年別カウント
    availableYears.forEach((year) => {
      byYear[year] = events.filter((event) => {
        const date = new Date(event.date)
        return !Number.isNaN(date.getTime()) && date.getFullYear().toString() === year
      }).length
    })

    return {
      all: events.length,
      byType,
      byPlace,
      byYear,
    }
  }, [events, availablePlaces, availableYears])

  // テキスト
  const title = lang === 'ja' ? '登壇・講演' : 'Speaking'
  const description =
    lang === 'ja'
      ? 'これまでに登壇・講演したイベントやカンファレンスを紹介しています。'
      : "A collection of events and conferences where I've given talks and presentations."
  const filterButtonText = lang === 'ja' ? 'フィルター' : 'Filter'

  // アクティブなフィルターの数を計算
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filterType !== null) count++
    if (filterPlace !== null) count++
    if (filterYear !== null) count++
    return count
  }, [filterType, filterPlace, filterYear])

  // フィルターグループを構築
  const filterGroups = useMemo<FilterGroup[]>(() => {
    const groups: FilterGroup[] = []

    // タイプフィルター
    groups.push(createTypeFilterGroup(lang, filterType, counts, setFilterType))

    // 場所フィルター
    if (availablePlaces.length > 0) {
      groups.push(
        createPlaceFilterGroup(lang, filterPlace, availablePlaces, counts, setFilterPlace),
      )
    }

    // 年フィルター
    if (availableYears.length > 0) {
      groups.push(createYearFilterGroup(lang, filterYear, availableYears, counts, setFilterYear))
    }

    return groups
  }, [lang, filterType, filterPlace, filterYear, availablePlaces, availableYears, counts])

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
      />

      {/* Heroセクション + メインコンテンツ */}
      <section className="pt-12 sm:pt-16 pb-8 sm:pb-12 bg-white dark:bg-zinc-900">
        <Container>
          <PageHeader title={title} description={description} />

          {/* 登壇依頼CTA */}
          <div className="mb-8 flex justify-center">
            <CTAButton href={lang === 'ja' ? '/ja/speaking-request' : '/speaking-request'}>
              {lang === 'ja' ? '登壇依頼はこちら' : 'Request Speaking Engagement'}
            </CTAButton>
          </div>

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
                filterPlace={filterPlace}
                onFilterPlaceChange={setFilterPlace}
                filterYear={filterYear}
                onFilterYearChange={setFilterYear}
                availablePlaces={availablePlaces}
                availableYears={availableYears}
                counts={counts}
                lang={lang}
              />
            }
          >
            {/* イベントグリッド */}
            {filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {filteredEvents.map((event) => (
                  <UnifiedSpeakingCard
                    key={`${event.source}-${event.id}`}
                    event={event}
                    lang={lang}
                    basePath={basePath}
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-slate-600 dark:text-slate-400">
                  {lang === 'ja' ? '該当するイベントが見つかりませんでした。' : 'No events found.'}
                </p>
              </div>
            )}
          </SidebarLayout>
        </Container>
      </section>
    </>
  )
}
