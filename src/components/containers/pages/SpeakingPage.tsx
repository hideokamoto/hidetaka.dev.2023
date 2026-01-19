'use client'

import Link from 'next/link'
import { useCallback, useMemo, useState } from 'react'
import Container from '@/components/tailwindui/Container'
import DateDisplay from '@/components/ui/DateDisplay'
import FilterItem from '@/components/ui/FilterItem'
import MobileFilterButton from '@/components/ui/MobileFilterButton'
import MobileFilterDrawer, { type FilterGroup } from '@/components/ui/MobileFilterDrawer'
import PageHeader from '@/components/ui/PageHeader'
import SearchBar from '@/components/ui/SearchBar'
import SidebarLayout from '@/components/ui/SidebarLayout'
import Tag from '@/components/ui/Tag'
import type { WPEvent } from '@/libs/dataSources/types'

type FilterYear = string | null

// 外部リンクアイコンコンポーネント
function ExternalLinkIcon({ className = 'ml-1 h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  )
}

// イベントリンクコンポーネント
function EventLinks({ lang, link }: { lang: string; link: string }) {
  return (
    <Link
      href={link}
      className="flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
      onClick={(e) => e.stopPropagation()}
    >
      {lang === 'ja' ? '記事を読む' : 'Read Article'}
      <ExternalLinkIcon />
    </Link>
  )
}

// イベントデータを取得するヘルパー関数
function getEventData(event: WPEvent, basePath: string) {
  const date = new Date(event.date)
  const year = date.getFullYear().toString()
  const title = event.title.rendered
  const description = event.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 150)
  const link = `${basePath}/${event.slug}`

  return {
    date,
    year,
    title,
    description,
    link,
  }
}

// Speakingカードコンポーネント
function SpeakingCard({
  event,
  lang,
  basePath,
}: {
  event: WPEvent
  lang: string
  basePath: string
}) {
  const { date, year, title, description, link } = getEventData(event, basePath)

  return (
    <Link href={link} className="group block">
      <article className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:border-indigo-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700">
        {/* Content */}
        <div className="p-5 lg:p-6">
          <div className="flex flex-col gap-3">
            {/* Date and Year */}
            <div className="flex items-center gap-3 flex-wrap">
              <DateDisplay
                date={date}
                lang={lang}
                format="short"
                className="text-xs font-semibold text-slate-500 dark:text-slate-400"
              />
              <Tag variant="default" size="sm">
                {year}
              </Tag>
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold leading-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {title}
            </h3>

            {/* Description */}
            {description && (
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-3">
                {description}
                {description.length > 150 ? '...' : ''}
              </p>
            )}

            {/* Links */}
            <div className="flex items-center gap-4 mt-2">
              <EventLinks lang={lang} link={link} />
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}

// サイドバーコンポーネント（デスクトップ用）
function Sidebar({
  searchQuery,
  onSearchChange,
  filterYear,
  onFilterYearChange,
  availableYears,
  counts,
  lang,
}: {
  searchQuery: string
  onSearchChange: (value: string) => void
  filterYear: FilterYear
  onFilterYearChange: (year: FilterYear) => void
  availableYears: string[]
  counts: {
    all: number
    byYear: Record<string, number>
  }
  lang: string
}) {
  const searchPlaceholder = lang === 'ja' ? '検索...' : 'Search...'
  const yearTitle = lang === 'ja' ? '年' : 'Year'
  const allText = lang === 'ja' ? 'すべて' : 'All'

  return (
    <div className="hidden lg:block space-y-6">
      {/* 検索バー */}
      <div>
        <SearchBar value={searchQuery} onChange={onSearchChange} placeholder={searchPlaceholder} />
      </div>

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
  byYear: Record<string, number>
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
  events: WPEvent[]
  basePath: string
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterYear, setFilterYear] = useState<FilterYear>(null)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  // 利用可能な年を抽出
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
    (event: WPEvent): boolean => {
      if (!searchQuery.trim()) return true
      const query = searchQuery.toLowerCase()
      const title = event.title.rendered.toLowerCase()
      const description = (event.excerpt.rendered || '').toLowerCase()

      return title.includes(query) || description.includes(query)
    },
    [searchQuery],
  )

  // フィルター適用のヘルパー関数
  const matchesFilters = useCallback(
    (event: WPEvent): boolean => {
      if (filterYear !== null) {
        const date = new Date(event.date)
        if (Number.isNaN(date.getTime()) || date.getFullYear().toString() !== filterYear)
          return false
      }
      return true
    },
    [filterYear],
  )

  // フィルターと検索を適用
  const filteredEvents = useMemo(() => {
    const items = events.filter((event) => matchesFilters(event) && matchesSearch(event))

    // 日付順にソート（新しい順）
    items.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return dateB - dateA
    })

    return items
  }, [events, matchesFilters, matchesSearch])

  // カウント計算
  const counts = useMemo(() => {
    const byYear: Record<string, number> = {}

    // 年別カウント
    availableYears.forEach((year) => {
      byYear[year] = events.filter((event) => {
        const date = new Date(event.date)
        return !Number.isNaN(date.getTime()) && date.getFullYear().toString() === year
      }).length
    })

    return {
      all: events.length,
      byYear,
    }
  }, [events, availableYears])

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
    if (filterYear !== null) count++
    return count
  }, [filterYear])

  // フィルターグループを構築
  const filterGroups = useMemo<FilterGroup[]>(() => {
    const groups: FilterGroup[] = []

    // 年フィルター
    if (availableYears.length > 0) {
      groups.push(createYearFilterGroup(lang, filterYear, availableYears, counts, setFilterYear))
    }

    return groups
  }, [lang, filterYear, availableYears, counts])

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
                filterYear={filterYear}
                onFilterYearChange={setFilterYear}
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
                  <SpeakingCard key={event.id} event={event} lang={lang} basePath={basePath} />
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
