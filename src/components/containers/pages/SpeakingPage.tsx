'use client'

import Link from 'next/link'
import { useCallback, useMemo, useState } from 'react'
import Container from '@/components/tailwindui/Container'
import PageHeader from '@/components/ui/PageHeader'
import type { WPEvent } from '@/libs/dataSources/types'

type FilterYear = string | null

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

function SpeakingEntryRow({
  event,
  lang,
  basePath,
}: {
  event: WPEvent
  lang: string
  basePath: string
}) {
  const { date, title, description, link } = getEventData(event, basePath)
  const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`

  return (
    <Link href={link} style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}>
      <div className="ds-speak-item">
        <div className="ds-speak-item__date">{dateStr}</div>
        <div>
          <div className="ds-speak-item__title">{title}</div>
          {description && (
            <div className="ds-speak-item__event">
              {description}
              {description.length >= 150 ? '...' : ''}
            </div>
          )}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-accent)',
            whiteSpace: 'nowrap',
            paddingTop: '4px',
          }}
        >
          {lang === 'ja' ? '記事を読む →' : 'Read →'}
        </div>
      </div>
    </Link>
  )
}

type FilterGroupCounts = {
  all: number
  byYear: Record<string, number>
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
  const counts: FilterGroupCounts = useMemo(() => {
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

  return (
    <Container>
      <PageHeader
        title={title}
        eyebrow={lang === 'ja' ? '§ Speaking / 登壇' : '§ Speaking / Talks'}
        description={description}
        meta={[`${counts.all} ${lang === 'ja' ? '件' : 'sessions'}`]}
      />

      {/* Filter bar */}
      <div className="ds-filter-bar">
        <span className="ds-filter-bar__label">{lang === 'ja' ? '年' : 'Year'}</span>
        <button
          type="button"
          className="ds-tag"
          aria-pressed={filterYear === null}
          onClick={() => setFilterYear(null)}
        >
          {lang === 'ja' ? 'すべて' : 'All'} ({counts.all})
        </button>
        {availableYears.map((year) => (
          <button
            key={year}
            type="button"
            className="ds-tag"
            aria-pressed={filterYear === year}
            onClick={() => setFilterYear(filterYear === year ? null : year)}
          >
            {year} ({counts.byYear[year] || 0})
          </button>
        ))}
        {/* Search */}
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={lang === 'ja' ? '検索...' : 'Search...'}
          style={{
            marginLeft: 'auto',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            letterSpacing: 'var(--tracking-wide)',
            background: 'transparent',
            border: '1px solid var(--color-line-strong)',
            color: 'var(--color-ink)',
            padding: 'var(--space-2) var(--space-4)',
            outline: 'none',
            width: '200px',
          }}
        />
      </div>

      {/* Events list */}
      {filteredEvents.length > 0 ? (
        <div>
          {filteredEvents.map((event) => (
            <SpeakingEntryRow key={event.id} event={event} lang={lang} basePath={basePath} />
          ))}
        </div>
      ) : (
        <div
          style={{
            padding: 'var(--space-12) 0',
            textAlign: 'center',
            color: 'var(--color-muted)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
          }}
        >
          {lang === 'ja' ? '該当するイベントが見つかりませんでした。' : 'No events found.'}
        </div>
      )}
    </Container>
  )
}
