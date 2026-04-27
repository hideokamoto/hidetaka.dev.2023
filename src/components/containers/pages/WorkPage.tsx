'use client'

import Link from 'next/link'
import { useCallback, useMemo, useState } from 'react'
import DateDisplay from '@/components/ui/DateDisplay'
import PageHeader from '@/components/ui/PageHeader'
import SectionHeader from '@/components/ui/SectionHeader'
import { SITE_CONFIG } from '@/config'
import type { NPMRegistrySearchResult } from '@/libs/dataSources/npmjs'
import type { WordPressPluginDetail } from '@/libs/dataSources/wporg'
import type { MicroCMSProjectsRecord } from '@/libs/microCMS/types'

type FilterCategory = 'all' | 'projects' | 'open-source' | 'books' | 'oss-contribution'

type OSSItem =
  | { type: 'project'; data: MicroCMSProjectsRecord }
  | { type: 'npm'; data: NPMRegistrySearchResult }
  | { type: 'wordpress'; data: WordPressPluginDetail }

export function filterOSSItem(item: OSSItem, matchesSearch: (text: string) => boolean): boolean {
  if (item.type === 'project') {
    const p = item.data
    return (
      matchesSearch(p.title) ||
      (p.about && matchesSearch(p.about.replace(/<[^>]*>/g, ''))) ||
      p.tags?.some((tag) => matchesSearch(tag))
    )
  }
  if (item.type === 'npm') {
    const pkg = item.data.package
    return (
      matchesSearch(pkg.name) ||
      (typeof pkg.description === 'string' && matchesSearch(pkg.description))
    )
  }
  const plugin = item.data
  return (
    matchesSearch(plugin.name) ||
    (plugin.short_description ? matchesSearch(plugin.short_description) : false)
  )
}

function getOSSItemDate(item: OSSItem): string {
  if (item.type === 'project') return item.data.published_at || ''
  if (item.type === 'npm') return item.data.package.date
  return item.data.added
}

function getOSSItemHref(item: OSSItem, lang: string): string {
  if (item.type === 'project')
    return lang === 'ja' ? `/ja/work/${item.data.id}` : `/work/${item.data.id}`
  if (item.type === 'npm') return (item.data as NPMRegistrySearchResult).package.links.npm
  return `https://wordpress.org/plugins/${(item.data as WordPressPluginDetail).slug}`
}

function getOSSItemTitle(item: OSSItem): string {
  if (item.type === 'project') return (item.data as MicroCMSProjectsRecord).title
  if (item.type === 'npm') return (item.data as NPMRegistrySearchResult).package.name
  return (item.data as WordPressPluginDetail).name
}

function getOSSItemMeta(item: OSSItem): string {
  if (item.type === 'npm') return 'npm'
  if (item.type === 'wordpress') return 'WordPress'
  const p = item.data as MicroCMSProjectsRecord
  return p.tags?.slice(0, 2).join(' · ') ?? ''
}

export default function WorkPageContent({
  lang,
  projects,
  npmPackages,
  wpPlugins,
}: {
  lang: string
  projects: MicroCMSProjectsRecord[]
  npmPackages: NPMRegistrySearchResult[]
  wpPlugins: WordPressPluginDetail[]
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all')

  const booksProjects = projects.filter((p) => p.project_type?.includes('books'))
  const ownedOSSProjects = projects.filter((p) => p.project_type?.includes('owned_oss'))
  const ossContributionProjects = projects.filter((p) =>
    p.project_type?.includes('oss_contribution'),
  )
  const mainProjects = projects.filter((p) => {
    const types = p.project_type || []
    return (
      !types.includes('books') &&
      !types.includes('owned_oss') &&
      !types.includes('oss_contribution')
    )
  })

  const allOSSItems = useMemo(
    () => [
      ...ownedOSSProjects.map((p) => ({ type: 'project' as const, data: p })),
      ...npmPackages.map((p) => ({ type: 'npm' as const, data: p })),
      ...wpPlugins.map((p) => ({ type: 'wordpress' as const, data: p })),
    ],
    [ownedOSSProjects, npmPackages, wpPlugins],
  )

  const matchesSearch = useCallback(
    (text: string): boolean => {
      if (!searchQuery.trim()) return true
      return text.toLowerCase().includes(searchQuery.toLowerCase())
    },
    [searchQuery],
  )

  const filteredProjects = useMemo(() => {
    if (
      filterCategory !== 'all' &&
      filterCategory !== 'projects' &&
      filterCategory !== 'oss-contribution'
    )
      return []
    const items =
      filterCategory === 'oss-contribution'
        ? ossContributionProjects
        : filterCategory === 'all' || filterCategory === 'projects'
          ? mainProjects
          : []
    return items
      .filter(
        (p) =>
          matchesSearch(p.title) ||
          (p.about && matchesSearch(p.about.replace(/<[^>]*>/g, ''))) ||
          p.tags?.some((tag) => matchesSearch(tag)),
      )
      .sort(
        (a, b) =>
          new Date(b.published_at || '').getTime() - new Date(a.published_at || '').getTime(),
      )
  }, [filterCategory, mainProjects, ossContributionProjects, matchesSearch])

  const filteredBooks = useMemo(() => {
    if (filterCategory !== 'all' && filterCategory !== 'books') return []
    return booksProjects
      .filter(
        (p) =>
          matchesSearch(p.title) ||
          (p.about && matchesSearch(p.about.replace(/<[^>]*>/g, ''))) ||
          p.tags?.some((tag) => matchesSearch(tag)),
      )
      .sort(
        (a, b) =>
          new Date(b.published_at || '').getTime() - new Date(a.published_at || '').getTime(),
      )
  }, [filterCategory, booksProjects, matchesSearch])

  const filteredOSS = useMemo(() => {
    if (filterCategory !== 'all' && filterCategory !== 'open-source') return []
    return allOSSItems
      .filter((item) => filterOSSItem(item, matchesSearch))
      .sort((a, b) => new Date(getOSSItemDate(b)).getTime() - new Date(getOSSItemDate(a)).getTime())
  }, [filterCategory, allOSSItems, matchesSearch])

  const filteredOSSContributions = useMemo(() => {
    if (filterCategory !== 'all' && filterCategory !== 'oss-contribution') return []
    return ossContributionProjects
      .filter(
        (p) =>
          matchesSearch(p.title) || (p.about && matchesSearch(p.about.replace(/<[^>]*>/g, ''))),
      )
      .sort(
        (a, b) =>
          new Date(b.published_at || '').getTime() - new Date(a.published_at || '').getTime(),
      )
  }, [filterCategory, ossContributionProjects, matchesSearch])

  const counts = useMemo(
    () => ({
      all:
        mainProjects.length +
        allOSSItems.length +
        ossContributionProjects.length +
        booksProjects.length,
      projects: mainProjects.length,
      'open-source': allOSSItems.length,
      books: booksProjects.length,
      'oss-contribution': ossContributionProjects.length,
    }),
    [mainProjects.length, allOSSItems.length, ossContributionProjects.length, booksProjects.length],
  )

  const isJa = lang === 'ja'
  const title = isJa ? '制作物' : 'Work'
  const description = isJa
    ? '開発者・BizDevとして10年以上のキャリアから生まれたプロダクト、OSSプロジェクト、書籍を紹介しています。'
    : 'Products, open source projects, and books born from over 10 years as a developer and BizDev professional.'

  const filterLabels: Record<FilterCategory, string> = {
    all: isJa ? 'すべて' : 'All',
    projects: isJa ? 'プロジェクト' : 'Projects',
    'open-source': isJa ? 'オープンソース' : 'Open Source',
    books: isJa ? '書籍' : 'Books',
    'oss-contribution': isJa ? 'OSS貢献' : 'OSS Contributions',
  }

  const categories: FilterCategory[] = [
    'all',
    'projects',
    'open-source',
    'books',
    'oss-contribution',
  ]

  const isEmpty =
    filteredProjects.length === 0 &&
    filteredBooks.length === 0 &&
    filteredOSS.length === 0 &&
    filteredOSSContributions.length === 0

  const stats = [
    { value: mainProjects.length, label: isJa ? 'プロジェクト' : 'Projects' },
    { value: allOSSItems.length, label: isJa ? 'OSS' : 'Open Source' },
    { value: booksProjects.length, label: isJa ? '書籍' : 'Books' },
    { value: npmPackages.length, label: isJa ? 'npm' : 'npm Packages' },
  ]

  return (
    <>
      <section className="mx-auto max-w-[1440px] px-8 sm:px-16 pt-12 pb-20">
        <PageHeader eyebrow="WORK" title={title} sub={description} />

        {/* Metrics */}
        <div className="ds-metrics" style={{ marginBottom: '2rem' }}>
          {stats.map((s) => (
            <div key={s.label} className="ds-metric">
              <dt className="ds-metric__label">{s.label}</dt>
              <dd className="ds-metric__value">{s.value}</dd>
            </div>
          ))}
        </div>

        {/* Search + filter bar */}
        <div className="ds-filter-bar">
          <span className="ds-filter-bar__label">{isJa ? 'カテゴリ' : 'Category'}</span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className="ds-tag"
              aria-pressed={filterCategory === cat ? 'true' : 'false'}
              onClick={() => setFilterCategory(cat)}
            >
              {filterLabels[cat]} <small style={{ opacity: 0.6 }}>{counts[cat]}</small>
            </button>
          ))}
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isJa ? '検索...' : 'Search...'}
            style={{
              marginLeft: 'auto',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              background: 'transparent',
              border: '1px solid var(--color-line-strong)',
              color: 'var(--color-ink)',
              padding: '4px 10px',
              outline: 'none',
            }}
          />
        </div>

        {/* Projects */}
        {(filterCategory === 'all' || filterCategory === 'projects') &&
          filteredProjects.length > 0 && (
            <div style={{ marginBottom: '3rem' }}>
              <SectionHeader no="01" title={isJa ? 'プロジェクト' : 'Projects'} />
              {filteredProjects.map((p, i) => {
                const href = isJa ? `/ja/work/${p.id}` : `/work/${p.id}`
                const date = p.published_at ? new Date(p.published_at) : null
                return (
                  <Link key={p.id} href={href} className="ds-entry">
                    <span className="ds-entry__no">{String(i + 1).padStart(3, '0')}</span>
                    <div>
                      <p className="ds-entry__title">{p.title}</p>
                      {p.about && (
                        <p className="ds-entry__meta">
                          {p.about.replace(/<[^>]*>/g, '').substring(0, 100)}
                          {p.about.replace(/<[^>]*>/g, '').length > 100 ? '…' : ''}
                        </p>
                      )}
                      {p.tags && p.tags.length > 0 && (
                        <p className="ds-entry__meta">{p.tags.slice(0, 3).join(' · ')}</p>
                      )}
                    </div>
                    {date && (
                      <DateDisplay
                        date={date}
                        lang={lang}
                        format="short"
                        className="ds-entry__date"
                      />
                    )}
                  </Link>
                )
              })}
            </div>
          )}

        {/* Books */}
        {(filterCategory === 'all' || filterCategory === 'books') && filteredBooks.length > 0 && (
          <div style={{ marginBottom: '3rem' }}>
            <SectionHeader no="02" title={isJa ? '書籍' : 'Books'} />
            {filteredBooks.map((p, i) => {
              const href = isJa ? `/ja/work/${p.id}` : `/work/${p.id}`
              const date = p.published_at ? new Date(p.published_at) : null
              return (
                <Link key={p.id} href={href} className="ds-entry">
                  <span className="ds-entry__no">{String(i + 1).padStart(3, '0')}</span>
                  <div>
                    <p className="ds-entry__title">{p.title}</p>
                    {p.about && (
                      <p className="ds-entry__meta">
                        {p.about.replace(/<[^>]*>/g, '').substring(0, 100)}
                        {p.about.replace(/<[^>]*>/g, '').length > 100 ? '…' : ''}
                      </p>
                    )}
                  </div>
                  {date && (
                    <DateDisplay
                      date={date}
                      lang={lang}
                      format="short"
                      className="ds-entry__date"
                    />
                  )}
                </Link>
              )
            })}
          </div>
        )}

        {/* Open Source */}
        {(filterCategory === 'all' || filterCategory === 'open-source') &&
          filteredOSS.length > 0 && (
            <div style={{ marginBottom: '3rem' }}>
              <SectionHeader no="03" title={isJa ? 'オープンソース' : 'Open Source'} />
              {filteredOSS.map((item, i) => {
                const href = getOSSItemHref(item, lang)
                const title = getOSSItemTitle(item)
                const meta = getOSSItemMeta(item)
                const date = new Date(getOSSItemDate(item))
                const isExternal =
                  item.type !== 'project' || !!(item.data as MicroCMSProjectsRecord).url
                const Comp = isExternal ? 'a' : Link
                const extraProps =
                  item.type !== 'project' ? { target: '_blank', rel: 'noopener noreferrer' } : {}
                return (
                  // biome-ignore lint/a11y/useValidAnchor: dynamic element
                  <Comp key={`${item.type}-${i}`} href={href} {...extraProps} className="ds-entry">
                    <span className="ds-entry__no">{String(i + 1).padStart(3, '0')}</span>
                    <div>
                      <p className="ds-entry__title">{title}</p>
                      {meta && <p className="ds-entry__meta">{meta}</p>}
                    </div>
                    <DateDisplay
                      date={date}
                      lang={lang}
                      format="short"
                      className="ds-entry__date"
                    />
                  </Comp>
                )
              })}
            </div>
          )}

        {/* OSS Contributions */}
        {(filterCategory === 'all' || filterCategory === 'oss-contribution') &&
          filteredOSSContributions.length > 0 && (
            <div style={{ marginBottom: '3rem' }}>
              <SectionHeader no="04" title={isJa ? 'OSS貢献' : 'OSS Contributions'} />
              {filteredOSSContributions.map((p, i) => (
                <a
                  key={p.id}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ds-entry"
                >
                  <span className="ds-entry__no">{String(i + 1).padStart(3, '0')}</span>
                  <div>
                    <p className="ds-entry__title">{p.title}</p>
                    {p.about && (
                      <p className="ds-entry__meta">
                        {p.about.replace(/<[^>]*>/g, '').substring(0, 80)}
                        {p.about.replace(/<[^>]*>/g, '').length > 80 ? '…' : ''}
                      </p>
                    )}
                  </div>
                  <span className="ds-entry__date">GitHub →</span>
                </a>
              ))}
            </div>
          )}

        {isEmpty && (
          <p
            style={{
              color: 'var(--color-muted)',
              padding: '3rem 0',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-sm)',
            }}
          >
            {isJa ? '該当する項目が見つかりませんでした。' : 'No items found.'}
          </p>
        )}
      </section>

      {/* CTA */}
      <div className="mx-auto max-w-[1440px] px-8 sm:px-16">
        <div className="ds-cta-block">
          <span className="ds-cta-block__pre">{isJa ? 'お問い合わせ' : 'Collaboration'}</span>
          <h2 className="ds-cta-block__title">
            {isJa ? (
              <>
                一緒にプロジェクトを
                <br />
                <em>始めませんか？</em>
              </>
            ) : (
              <>
                Interested in working
                <br />
                <em>together?</em>
              </>
            )}
          </h2>
          <div className="ds-cta-block__actions">
            <a href="mailto:hello@hidetaka.dev" className="ds-btn ds-btn--primary ds-btn--lg">
              {isJa ? 'お問い合わせ' : 'Get in touch'}
            </a>
            <Link
              href={SITE_CONFIG.social.twitter.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ds-btn ds-btn--secondary ds-btn--lg"
            >
              Twitter / X
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
