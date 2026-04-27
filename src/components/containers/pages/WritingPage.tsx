'use client'

import Link from 'next/link'
import { useCallback, useMemo, useState } from 'react'
import Container from '@/components/tailwindui/Container'
import PageHeader from '@/components/ui/PageHeader'
import type { FeedItem } from '@/libs/dataSources/types'
import { removeHtmlTags } from '@/libs/sanitize'

type WritingItem = FeedItem
type FilterDataSource = string | null

function WritingEntryRow({ item, index }: { item: WritingItem; index: number }) {
  const href = item.href
  const date = new Date(item.datetime)
  const dateStr = `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
  const source = item.dataSource?.name ?? ''
  const isExternal = !href.startsWith('/')

  const content = (
    <div className="ds-entry">
      <span className="ds-entry__no">{String(index + 1).padStart(3, '0')}</span>
      <div>
        <p className="ds-entry__title">{item.title}</p>
        {source && <div className="ds-entry__meta">{source.toUpperCase()}</div>}
      </div>
      <span className="ds-entry__date">{dateStr}</span>
    </div>
  )

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}
      >
        {content}
      </a>
    )
  }
  return (
    <Link href={href} style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}>
      {content}
    </Link>
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
      const description = removeHtmlTags(item.description || '').toLowerCase()

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
      byDataSource,
    }
  }, [allItems, externalArticles, availableDataSources, hasMoreBySource])

  // テキスト
  const title = lang === 'ja' ? 'Writing' : 'Writing'
  const description =
    lang === 'ja'
      ? '技術記事、ブログ投稿、ニュースなどの執筆活動を紹介しています。'
      : "A collection of technical articles, blog posts, news, and other writing I've published."

  const allText = lang === 'ja' ? 'すべて' : 'All'

  return (
    <Container>
      <PageHeader
        title={title}
        eyebrow={lang === 'ja' ? '§ Writing / 執筆' : '§ Writing / Articles'}
        description={description}
      />

      {/* Filter bar */}
      <div className="ds-filter-bar">
        <span className="ds-filter-bar__label">{lang === 'ja' ? 'ソース' : 'Source'}</span>
        <button
          type="button"
          className="ds-tag"
          aria-pressed={filterDataSource === null}
          onClick={() => setFilterDataSource(null)}
        >
          {allText} ({counts.all})
        </button>
        {availableDataSources.map((source) => (
          <button
            key={source}
            type="button"
            className="ds-tag"
            aria-pressed={filterDataSource === source}
            onClick={() => setFilterDataSource(filterDataSource === source ? null : source)}
          >
            {source} ({counts.byDataSource[source] || 0}
            {hasMoreBySource[source] ? '+' : ''})
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

      {/* Article list */}
      {filteredItems.length > 0 ? (
        <>
          <div>
            {filteredItems.map((item, index) => (
              <WritingEntryRow key={item.href} item={item} index={index} />
            ))}
          </div>

          {/* External links section */}
          {availableDataSources.length > 0 && (
            <div
              style={{
                marginTop: 'var(--space-10)',
                paddingTop: 'var(--space-9)',
                borderTop: '1px solid var(--color-line-strong)',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  letterSpacing: 'var(--tracking-widest)',
                  textTransform: 'uppercase',
                  color: 'var(--color-muted)',
                  marginBottom: 'var(--space-5)',
                }}
              >
                {lang === 'ja' ? 'もっと見る — 各サイト' : 'View More — External Sources'}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                {availableDataSources.map((source) => {
                  const sourceHref = dataSourceMap.get(source) || '#'
                  return (
                    <a
                      key={source}
                      href={sourceHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ds-btn ds-btn--ghost ds-btn--sm"
                    >
                      {source}
                    </a>
                  )
                })}
              </div>
            </div>
          )}
        </>
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
          {lang === 'ja' ? '該当する記事が見つかりませんでした。' : 'No articles found.'}
        </div>
      )}
    </Container>
  )
}
