'use client'

import { useState, useMemo } from 'react'
import Container from '@/components/tailwindui/Container'
import DateDisplay from '@/components/ui/DateDisplay'
import Tag from '@/components/ui/Tag'
import SearchBar from '@/components/ui/SearchBar'
import FilterItem from '@/components/ui/FilterItem'
import PageHeader from '@/components/ui/PageHeader'
import SidebarLayout from '@/components/ui/SidebarLayout'
import MobileFilterDrawer, { type FilterGroup } from '@/components/ui/MobileFilterDrawer'
import MobileFilterButton from '@/components/ui/MobileFilterButton'
import type { MicroCMSEventsRecord } from '@/libs/microCMS/types'

type FilterPlace = string | null
type FilterYear = string | null

// 統一されたSpeakingカードコンポーネント
function UnifiedSpeakingCard({ event, lang }: { event: MicroCMSEventsRecord; lang: string }) {
  const date = new Date(event.date)
  const year = date.getFullYear().toString()

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
            <Tag variant="purple" size="sm">
              {event.place}
            </Tag>
            <Tag variant="default" size="sm">
              {year}
            </Tag>
          </div>
          
          {/* Title */}
          <h3 className="text-lg font-bold leading-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {event.title}
          </h3>

          {/* Session Title */}
          {event.session_title && (
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {event.session_title}
            </p>
          )}

          {/* Description */}
          {event.description && (
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-3">
              {event.description.substring(0, 150)}
              {event.description.length > 150 ? '...' : ''}
            </p>
          )}

          {/* Links */}
          <div className="flex items-center gap-4 mt-2">
            {event.url && (
              <a
                href={event.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
              >
                {lang === 'ja' ? 'イベントページ' : 'Event Page'}
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
            {event.slide_url && (
              <a
                href={event.slide_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              >
                {lang === 'ja' ? 'スライド' : 'Slides'}
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
            {event.blog_url && (
              <a
                href={event.blog_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              >
                {lang === 'ja' ? 'ブログ' : 'Blog'}
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  )

  return (
    <a href={event.url} target="_blank" rel="noopener noreferrer" className="group block">
      {CardContent}
    </a>
  )
}

// サイドバーコンポーネント（デスクトップ用）
function Sidebar({
  searchQuery,
  onSearchChange,
  filterPlace,
  onFilterPlaceChange,
  filterYear,
  onFilterYearChange,
  availablePlaces,
  availableYears,
  counts,
  lang
}: {
  searchQuery: string
  onSearchChange: (value: string) => void
  filterPlace: FilterPlace
  onFilterPlaceChange: (place: FilterPlace) => void
  filterYear: FilterYear
  onFilterYearChange: (year: FilterYear) => void
  availablePlaces: string[]
  availableYears: string[]
  counts: {
    all: number
    byPlace: Record<string, number>
    byYear: Record<string, number>
  }
  lang: string
}) {
  const searchPlaceholder = lang === 'ja' ? '検索...' : 'Search...'
  const placeTitle = lang === 'ja' ? '場所' : 'Place'
  const yearTitle = lang === 'ja' ? '年' : 'Year'
  const allText = lang === 'ja' ? 'すべて' : 'All'

  return (
    <div className="hidden lg:block space-y-6">
      {/* 検索バー */}
      <div>
        <SearchBar 
          value={searchQuery}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
        />
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

export default function SpeakingPageContent({ 
  lang,
  events
}: { 
  lang: string
  events: MicroCMSEventsRecord[]
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPlace, setFilterPlace] = useState<FilterPlace>(null)
  const [filterYear, setFilterYear] = useState<FilterYear>(null)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  // 利用可能な場所と年を抽出
  const availablePlaces = useMemo(() => {
    const placeSet = new Set<string>()
    events.forEach(event => {
      if (event.place) {
        placeSet.add(event.place)
      }
    })
    return Array.from(placeSet).sort()
  }, [events])

  const availableYears = useMemo(() => {
    const yearSet = new Set<string>()
    events.forEach(event => {
      const date = new Date(event.date)
      if (!isNaN(date.getTime())) {
        yearSet.add(date.getFullYear().toString())
      }
    })
    return Array.from(yearSet).sort((a, b) => parseInt(b) - parseInt(a)) // 新しい年から
  }, [events])

  // 検索フィルター関数
  const matchesSearch = (event: MicroCMSEventsRecord): boolean => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    const title = event.title.toLowerCase()
    const description = (event.description || '').toLowerCase()
    const sessionTitle = (event.session_title || '').toLowerCase()
    const place = (event.place || '').toLowerCase()
    
    return title.includes(query) || description.includes(query) || sessionTitle.includes(query) || place.includes(query)
  }

  // フィルターと検索を適用
  const filteredEvents = useMemo(() => {
    let items = events.filter(event => {
      // 場所フィルター
      if (filterPlace !== null && event.place !== filterPlace) return false

      // 年フィルター
      if (filterYear !== null) {
        const date = new Date(event.date)
        if (isNaN(date.getTime()) || date.getFullYear().toString() !== filterYear) return false
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
  }, [events, filterPlace, filterYear, searchQuery])

  // カウント計算
  const counts = useMemo(() => {
    const byPlace: Record<string, number> = {}
    const byYear: Record<string, number> = {}

    // 場所別カウント
    availablePlaces.forEach(place => {
      byPlace[place] = events.filter(event => event.place === place).length
    })

    // 年別カウント
    availableYears.forEach(year => {
      byYear[year] = events.filter(event => {
        const date = new Date(event.date)
        return !isNaN(date.getTime()) && date.getFullYear().toString() === year
      }).length
    })

    return {
      all: events.length,
      byPlace,
      byYear,
    }
  }, [events, availablePlaces, availableYears])

  // テキスト
  const title = lang === 'ja' ? '登壇・講演' : 'Speaking'
  const description = lang === 'ja' 
    ? 'これまでに登壇・講演したイベントやカンファレンスを紹介しています。'
    : 'A collection of events and conferences where I\'ve given talks and presentations.'
  const filterButtonText = lang === 'ja' ? 'フィルター' : 'Filter'

  // アクティブなフィルターの数を計算
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filterPlace !== null) count++
    if (filterYear !== null) count++
    return count
  }, [filterPlace, filterYear])

  // フィルターグループを構築
  const filterGroups = useMemo<FilterGroup[]>(() => {
    const placeTitle = lang === 'ja' ? '場所' : 'Place'
    const yearTitle = lang === 'ja' ? '年' : 'Year'
    const allText = lang === 'ja' ? 'すべて' : 'All'

    const groups: FilterGroup[] = []

    // 場所フィルター
    if (availablePlaces.length > 0) {
      groups.push({
        title: placeTitle,
        items: [
          {
            id: 'place-all',
            label: allText,
            active: filterPlace === null,
            count: counts.all,
            onClick: () => setFilterPlace(null)
          },
          ...availablePlaces.map(place => ({
            id: `place-${place}`,
            label: place,
            active: filterPlace === place,
            count: counts.byPlace[place] || 0,
            onClick: () => setFilterPlace(place)
          }))
        ]
      })
    }

    // 年フィルター
    if (availableYears.length > 0) {
      groups.push({
        title: yearTitle,
        items: [
          {
            id: 'year-all',
            label: allText,
            active: filterYear === null,
            count: counts.all,
            onClick: () => setFilterYear(null)
          },
          ...availableYears.map(year => ({
            id: `year-${year}`,
            label: year,
            active: filterYear === year,
            count: counts.byYear[year] || 0,
            onClick: () => setFilterYear(year)
          }))
        ]
      })
    }

    return groups
  }, [lang, filterPlace, filterYear, availablePlaces, availableYears, counts])

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
                  <UnifiedSpeakingCard key={event.id} event={event} lang={lang} />
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
