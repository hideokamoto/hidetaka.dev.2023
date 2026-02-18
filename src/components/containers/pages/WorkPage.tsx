'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Fragment, useCallback, useMemo, useState } from 'react'
import Container from '@/components/tailwindui/Container'
import { GitHubIcon, LinkedInIcon, TwitterIcon } from '@/components/tailwindui/SocialLink'
import BackgroundDecoration from '@/components/ui/BackgroundDecoration'
import Badge from '@/components/ui/Badge'
import DateDisplay from '@/components/ui/DateDisplay'
import FilterItem from '@/components/ui/FilterItem'
import MobileFilterButton from '@/components/ui/MobileFilterButton'
import MobileFilterDrawer, { type FilterGroup } from '@/components/ui/MobileFilterDrawer'
import PageHeader from '@/components/ui/PageHeader'
import SearchBar from '@/components/ui/SearchBar'
import SidebarLayout from '@/components/ui/SidebarLayout'
import Tag from '@/components/ui/Tag'
import { SITE_CONFIG } from '@/config'
import type { NPMRegistrySearchResult } from '@/libs/dataSources/npmjs'
import type { WordPressPluginDetail } from '@/libs/dataSources/wporg'
import type { MicroCMSProjectsRecord } from '@/libs/microCMS/types'
import {
  getMicroCMSProjectStatus,
  getStatusFromLastUpdate,
  isActiveStatus,
  type UnifiedProjectStatus,
} from '@/libs/projectStatus.utils'

type FilterCategory = 'all' | 'projects' | 'open-source' | 'books' | 'oss-contribution'

type OSSItem =
  | { type: 'project'; data: MicroCMSProjectsRecord }
  | { type: 'npm'; data: NPMRegistrySearchResult }
  | { type: 'wordpress'; data: WordPressPluginDetail }

// Helper to generate stable keys for OSS items
function getOSSItemKey(item: OSSItem): string {
  if (item.type === 'project') {
    return item.data.id
  }
  if (item.type === 'npm') {
    return `npm-${(item.data as NPMRegistrySearchResult).package.name}`
  }
  return `wp-${(item.data as WordPressPluginDetail).slug}`
}

// Helper to sort items by date in descending order
function sortByDateDesc<T>(items: T[], getDate: (item: T) => string): T[] {
  return items.slice().sort((a, b) => {
    const dateA = getDate(a)
    const dateB = getDate(b)
    return new Date(dateB).getTime() - new Date(dateA).getTime()
  })
}

// Map project status to badge variant
function getStatusBadgeVariant(status: UnifiedProjectStatus): 'green' | 'gray' {
  return status === 'active' ? 'green' : 'gray'
}

// Get status label for display
function getStatusLabel(status: UnifiedProjectStatus, lang: string): string {
  // Ensure status is a string for safety
  if (!status || typeof status !== 'string') {
    return lang === 'ja' ? 'アクティブ' : 'Active'
  }

  if (lang === 'ja') {
    switch (status) {
      case 'active':
        return 'アクティブ'
      case 'deprecated':
        return '非推奨'
      case 'archived':
        return 'アーカイブ'
      case 'completed':
        return '完了'
      default:
        // Fallback to English label for unknown status
        break
    }
  }
  return status.charAt(0).toUpperCase() + status.slice(1)
}

// OSSアイテムをフィルタリングするヘルパー関数
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

// OSSアイテムの日付を取得するヘルパー関数
function getOSSItemDate(item: OSSItem): string {
  if (item.type === 'project') {
    return item.data.published_at || ''
  }
  if (item.type === 'npm') {
    return item.data.package.date
  }
  return item.data.added
}

// 統一されたWorkカードコンポーネント（プロジェクト用）
function UnifiedProjectCard({ project, lang }: { project: MicroCMSProjectsRecord; lang: string }) {
  const href = lang === 'ja' ? `/ja/work/${project.id}` : `/work/${project.id}`
  const date = project.published_at ? new Date(project.published_at) : null
  const status = getMicroCMSProjectStatus(project.status)
  const statusVariant = getStatusBadgeVariant(status)
  const statusLabel = getStatusLabel(status, lang)

  return (
    <Link href={href} className="group block">
      <article className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:border-indigo-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700">
        {/* Image - Top */}
        {project.image && (
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <Image
              src={project.image.url}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        )}

        {/* Content - Bottom */}
        <div className="p-5 lg:p-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              {date && (
                <DateDisplay
                  date={date}
                  lang={lang}
                  format="short"
                  className="text-xs font-semibold text-slate-500 dark:text-slate-400"
                />
              )}
              {project.status && <Badge label={statusLabel} variant={statusVariant} />}
            </div>

            <h3 className="text-lg font-bold leading-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {project.title}
            </h3>

            {project.about && (
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-2">
                {project.about.replace(/<[^>]*>/g, '').substring(0, 120)}
                {project.about.replace(/<[^>]*>/g, '').length > 120 ? '...' : ''}
              </p>
            )}

            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {project.tags.slice(0, 3).map((tag) => (
                  <Tag key={tag} variant="indigo" size="sm">
                    {tag}
                  </Tag>
                ))}
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}

// 統一されたOSSカードコンポーネント
function UnifiedOSSCard({
  item,
  lang,
}: {
  item: { type: 'npm' | 'wordpress'; data: NPMRegistrySearchResult | WordPressPluginDetail }
  lang: string
}) {
  if (item.type === 'npm') {
    const pkg = (item.data as NPMRegistrySearchResult).package
    const date = new Date(pkg.date)
    const href = pkg.links.npm
    const status = getStatusFromLastUpdate(pkg.date)
    const statusVariant = getStatusBadgeVariant(status)
    const statusLabel = getStatusLabel(status, lang)

    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="group block">
        <article className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:border-indigo-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700">
          {/* Content */}
          <div className="p-5 lg:p-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <DateDisplay
                  date={date}
                  lang={lang}
                  format="short"
                  className="text-xs font-semibold text-slate-500 dark:text-slate-400"
                />
                <Badge label={statusLabel} variant={statusVariant} />
              </div>

              <h3 className="text-lg font-bold leading-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {pkg.name}
              </h3>

              {pkg.description && (
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-2">
                  {pkg.description}
                </p>
              )}

              <Tag variant="indigo" size="sm">
                npm
              </Tag>
            </div>
          </div>
        </article>
      </a>
    )
  } else {
    const plugin = item.data as WordPressPluginDetail
    const date = new Date(plugin.added)
    const href = `https://wordpress.org/plugins/${plugin.slug}`
    const status = getStatusFromLastUpdate(plugin.last_updated)
    const statusVariant = getStatusBadgeVariant(status)
    const statusLabel = getStatusLabel(status, lang)

    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="group block">
        <article className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:border-indigo-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700">
          {/* Content */}
          <div className="p-5 lg:p-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <DateDisplay
                  date={date}
                  lang={lang}
                  format="short"
                  className="text-xs font-semibold text-slate-500 dark:text-slate-400"
                />
                <Badge label={statusLabel} variant={statusVariant} />
              </div>

              <h3 className="text-lg font-bold leading-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {plugin.name}
              </h3>

              {plugin.short_description && (
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-2">
                  {plugin.short_description}
                </p>
              )}

              <Tag variant="indigo" size="sm">
                WordPress
              </Tag>
            </div>
          </div>
        </article>
      </a>
    )
  }
}

// OSS Contributionリンク（GitHubリンクのみ）
function OSSContributionLink({ project }: { project: MicroCMSProjectsRecord }) {
  return (
    <a
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3 transition-all hover:border-indigo-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700"
    >
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {project.title}
        </span>
        {project.about && (
          <span className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
            {project.about.replace(/<[^>]*>/g, '').substring(0, 80)}
            {project.about.replace(/<[^>]*>/g, '').length > 80 ? '...' : ''}
          </span>
        )}
      </div>
      <svg
        className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-indigo-600 dark:text-slate-500 dark:group-hover:text-indigo-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </a>
  )
}

// Render OSS item based on type (keys are applied at map call site)
function renderOSSItem(item: OSSItem, lang: string): React.ReactNode {
  if (item.type === 'project') {
    return <UnifiedProjectCard project={item.data as MicroCMSProjectsRecord} lang={lang} />
  }
  if (item.type === 'npm') {
    return (
      <UnifiedOSSCard
        item={{ type: 'npm', data: item.data as NPMRegistrySearchResult }}
        lang={lang}
      />
    )
  }
  // wordpress
  return (
    <UnifiedOSSCard
      item={{
        type: 'wordpress',
        data: item.data as WordPressPluginDetail,
      }}
      lang={lang}
    />
  )
}

// Helper functions to categorize items by status

/**
 * Check if a microCMS project is active
 */
function isProjectActive(project: MicroCMSProjectsRecord): boolean {
  const status = getMicroCMSProjectStatus(project.status)
  return isActiveStatus(status)
}

/**
 * Check if an OSS item (npm/wordpress) is active
 */
function isOSSItemActive(item: OSSItem): boolean {
  if (item.type === 'project') {
    return isProjectActive(item.data)
  }
  if (item.type === 'npm') {
    const status = getStatusFromLastUpdate(item.data.package.date)
    return isActiveStatus(status)
  }
  // wordpress
  const status = getStatusFromLastUpdate(item.data.last_updated)
  return isActiveStatus(status)
}

/**
 * Split projects into active and archived
 */
function categorizeProjects(projects: MicroCMSProjectsRecord[]) {
  const active: MicroCMSProjectsRecord[] = []
  const archived: MicroCMSProjectsRecord[] = []

  for (const project of projects) {
    if (isProjectActive(project)) {
      active.push(project)
    } else {
      archived.push(project)
    }
  }

  return { active, archived }
}

/**
 * Split OSS items into active and archived
 */
function categorizeOSSItems(items: OSSItem[]) {
  const active: OSSItem[] = []
  const archived: OSSItem[] = []

  for (const item of items) {
    if (isOSSItemActive(item)) {
      active.push(item)
    } else {
      archived.push(item)
    }
  }

  return { active, archived }
}

// 統計バーコンポーネント
function StatsBar({
  projectCount,
  ossCount,
  bookCount,
  npmCount,
  lang,
}: {
  projectCount: number
  ossCount: number
  bookCount: number
  npmCount: number
  lang: string
}) {
  const stats = [
    {
      value: projectCount,
      label: lang === 'ja' ? 'プロジェクト' : 'Projects',
    },
    {
      value: ossCount,
      label: lang === 'ja' ? 'OSS' : 'Open Source',
    },
    {
      value: bookCount,
      label: lang === 'ja' ? '書籍' : 'Books',
    },
    {
      value: npmCount,
      label: lang === 'ja' ? 'npm' : 'npm Packages',
    },
  ]

  return (
    <div className="mb-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 text-center transition-all hover:border-indigo-300 hover:shadow-md dark:hover:border-indigo-700"
        >
          <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            {stat.value}
          </div>
          <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}

// CTAコンポーネント
function WorkCTA({ lang }: { lang: string }) {
  const title =
    lang === 'ja' ? '一緒にプロジェクトを始めませんか？' : 'Interested in working together?'
  const subtitle = lang === 'ja' ? 'お気軽にご連絡ください。' : 'Feel free to reach out'

  return (
    <section className="py-12 sm:py-16 bg-slate-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-700">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            {title}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">{subtitle}</p>

          {/* ソーシャルリンク */}
          <div className="flex justify-center gap-4">
            <a
              href={SITE_CONFIG.social.twitter.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={SITE_CONFIG.social.twitter.ariaLabel}
              className="group flex items-center justify-center h-12 w-12 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 transition hover:border-indigo-300 hover:bg-indigo-50 dark:hover:border-indigo-700 dark:hover:bg-zinc-800"
            >
              <TwitterIcon className="h-5 w-5 fill-slate-500 transition group-hover:fill-indigo-600 dark:fill-slate-400 dark:group-hover:fill-indigo-400" />
            </a>
            <a
              href={SITE_CONFIG.social.github.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={SITE_CONFIG.social.github.ariaLabel}
              className="group flex items-center justify-center h-12 w-12 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 transition hover:border-indigo-300 hover:bg-indigo-50 dark:hover:border-indigo-700 dark:hover:bg-zinc-800"
            >
              <GitHubIcon className="h-5 w-5 fill-slate-500 transition group-hover:fill-indigo-600 dark:fill-slate-400 dark:group-hover:fill-indigo-400" />
            </a>
            <a
              href={SITE_CONFIG.social.linkedin.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={SITE_CONFIG.social.linkedin.ariaLabel}
              className="group flex items-center justify-center h-12 w-12 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 transition hover:border-indigo-300 hover:bg-indigo-50 dark:hover:border-indigo-700 dark:hover:bg-zinc-800"
            >
              <LinkedInIcon className="h-5 w-5 fill-slate-500 transition group-hover:fill-indigo-600 dark:fill-slate-400 dark:group-hover:fill-indigo-400" />
            </a>
          </div>
        </div>
      </Container>
    </section>
  )
}

// サイドバーコンポーネント
function Sidebar({
  searchQuery,
  onSearchChange,
  filterCategory,
  onFilterChange,
  counts,
  lang,
}: {
  searchQuery: string
  onSearchChange: (value: string) => void
  filterCategory: FilterCategory
  onFilterChange: (category: FilterCategory) => void
  counts: {
    all: number
    projects: number
    'open-source': number
    books: number
    'oss-contribution': number
  }
  lang: string
}) {
  const searchPlaceholder = lang === 'ja' ? '検索...' : 'Search...'
  const filterTitle = lang === 'ja' ? 'カテゴリ' : 'Category'
  const allText = lang === 'ja' ? 'すべて' : 'All'
  const projectsText = lang === 'ja' ? 'プロジェクト' : 'Projects'
  const openSourceText = lang === 'ja' ? 'オープンソース' : 'Open Source'
  const booksText = lang === 'ja' ? '書籍' : 'Books'
  const ossContributionText = lang === 'ja' ? 'OSS貢献' : 'OSS Contributions'

  return (
    <div className="hidden lg:block space-y-6">
      {/* 検索バー */}
      <div>
        <SearchBar value={searchQuery} onChange={onSearchChange} placeholder={searchPlaceholder} />
      </div>

      {/* フィルター */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
          {filterTitle}
        </h3>
        <nav className="space-y-1">
          <FilterItem
            active={filterCategory === 'all'}
            onClick={() => onFilterChange('all')}
            count={counts.all}
          >
            {allText}
          </FilterItem>
          <FilterItem
            active={filterCategory === 'projects'}
            onClick={() => onFilterChange('projects')}
            count={counts.projects}
          >
            {projectsText}
          </FilterItem>
          <FilterItem
            active={filterCategory === 'open-source'}
            onClick={() => onFilterChange('open-source')}
            count={counts['open-source']}
          >
            {openSourceText}
          </FilterItem>
          <FilterItem
            active={filterCategory === 'books'}
            onClick={() => onFilterChange('books')}
            count={counts.books}
          >
            {booksText}
          </FilterItem>
          <FilterItem
            active={filterCategory === 'oss-contribution'}
            onClick={() => onFilterChange('oss-contribution')}
            count={counts['oss-contribution']}
          >
            {ossContributionText}
          </FilterItem>
        </nav>
      </div>
    </div>
  )
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
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  // プロジェクトをタイプ別に分類
  const booksProjects = projects.filter((p) => p.project_type?.includes('books'))
  const ownedOSSProjects = projects.filter((p) => p.project_type?.includes('owned_oss'))
  const ossContributionProjects = projects.filter((p) =>
    p.project_type?.includes('oss_contribution'),
  )

  // プロジェクト（books, owned_oss, oss_contribution以外のすべて）
  // applications, guest_posts, community_activitiesなど
  const mainProjects = projects.filter((p) => {
    const types = p.project_type || []
    return (
      !types.includes('books') &&
      !types.includes('owned_oss') &&
      !types.includes('oss_contribution')
    )
  })

  // オープンソース（owned_oss + NPM + WordPress）
  const allOSSItems = useMemo(
    () => [
      ...ownedOSSProjects.map((p) => ({ type: 'project' as const, data: p })),
      ...npmPackages.map((p) => ({ type: 'npm' as const, data: p })),
      ...wpPlugins.map((p) => ({ type: 'wordpress' as const, data: p })),
    ],
    [ownedOSSProjects, npmPackages, wpPlugins],
  )

  // 検索フィルター関数
  const matchesSearch = useCallback(
    (text: string): boolean => {
      if (!searchQuery.trim()) return true
      const query = searchQuery.toLowerCase()
      return text.toLowerCase().includes(query)
    },
    [searchQuery],
  )

  // フィルターと検索を適用
  const filteredProjects = useMemo(() => {
    let items: MicroCMSProjectsRecord[] = []

    if (filterCategory === 'all' || filterCategory === 'projects') {
      items = [...mainProjects]
    } else if (filterCategory === 'oss-contribution') {
      items = [...ossContributionProjects]
    }

    return items.filter(
      (p) =>
        matchesSearch(p.title) ||
        (p.about && matchesSearch(p.about.replace(/<[^>]*>/g, ''))) ||
        p.tags?.some((tag) => matchesSearch(tag)),
    )
  }, [filterCategory, mainProjects, ossContributionProjects, matchesSearch])

  const filteredBooks = useMemo(() => {
    if (filterCategory !== 'all' && filterCategory !== 'books') return []

    return booksProjects.filter(
      (p) =>
        matchesSearch(p.title) ||
        (p.about && matchesSearch(p.about.replace(/<[^>]*>/g, ''))) ||
        p.tags?.some((tag) => matchesSearch(tag)),
    )
  }, [filterCategory, booksProjects, matchesSearch])

  const filteredOSS = useMemo(() => {
    if (filterCategory !== 'all' && filterCategory !== 'open-source') return []

    return allOSSItems.filter((item) => filterOSSItem(item, matchesSearch))
  }, [filterCategory, allOSSItems, matchesSearch])

  const filteredOSSContributions = useMemo(() => {
    if (filterCategory !== 'all' && filterCategory !== 'oss-contribution') return []

    return ossContributionProjects.filter(
      (p) => matchesSearch(p.title) || (p.about && matchesSearch(p.about.replace(/<[^>]*>/g, ''))),
    )
  }, [filterCategory, ossContributionProjects, matchesSearch])

  // Categorize filtered items into active and archived, with sorting
  const categorizedProjects = useMemo(() => {
    const categorized = categorizeProjects(filteredProjects)
    return {
      active: sortByDateDesc(categorized.active, (p) => p.published_at || ''),
      archived: sortByDateDesc(categorized.archived, (p) => p.published_at || ''),
    }
  }, [filteredProjects])

  const categorizedBooks = useMemo(() => {
    const categorized = categorizeProjects(filteredBooks)
    return {
      active: sortByDateDesc(categorized.active, (p) => p.published_at || ''),
      archived: sortByDateDesc(categorized.archived, (p) => p.published_at || ''),
    }
  }, [filteredBooks])

  const categorizedOSSContributions = useMemo(() => {
    const categorized = categorizeProjects(filteredOSSContributions)
    return {
      active: sortByDateDesc(categorized.active, (p) => p.published_at || ''),
      archived: sortByDateDesc(categorized.archived, (p) => p.published_at || ''),
    }
  }, [filteredOSSContributions])

  const categorizedOSS = useMemo(() => {
    const categorized = categorizeOSSItems(filteredOSS)
    return {
      active: sortByDateDesc(categorized.active, getOSSItemDate),
      archived: sortByDateDesc(categorized.archived, getOSSItemDate),
    }
  }, [filteredOSS])

  // カウント計算
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

  // テキスト
  const title = lang === 'ja' ? '制作物' : 'Work'
  const description =
    lang === 'ja'
      ? '開発者・BizDevとして10年以上のキャリアから生まれたプロダクト、OSSプロジェクト、書籍を紹介しています。'
      : 'Products, open source projects, and books born from over 10 years as a developer and BizDev professional.'
  const filterButtonText = lang === 'ja' ? 'フィルター' : 'Filter'

  // アクティブなフィルターの数を計算
  const activeFilterCount = useMemo(() => {
    return filterCategory !== 'all' ? 1 : 0
  }, [filterCategory])

  // フィルターグループを構築
  const filterGroups = useMemo<FilterGroup[]>(() => {
    const filterTitle = lang === 'ja' ? 'カテゴリ' : 'Category'
    const allText = lang === 'ja' ? 'すべて' : 'All'
    const projectsText = lang === 'ja' ? 'プロジェクト' : 'Projects'
    const openSourceText = lang === 'ja' ? 'オープンソース' : 'Open Source'
    const booksText = lang === 'ja' ? '書籍' : 'Books'
    const ossContributionText = lang === 'ja' ? 'OSS貢献' : 'OSS Contributions'

    return [
      {
        title: filterTitle,
        items: [
          {
            id: 'all',
            label: allText,
            active: filterCategory === 'all',
            count: counts.all,
            onClick: () => setFilterCategory('all'),
          },
          {
            id: 'projects',
            label: projectsText,
            active: filterCategory === 'projects',
            count: counts.projects,
            onClick: () => setFilterCategory('projects'),
          },
          {
            id: 'open-source',
            label: openSourceText,
            active: filterCategory === 'open-source',
            count: counts['open-source'],
            onClick: () => setFilterCategory('open-source'),
          },
          {
            id: 'books',
            label: booksText,
            active: filterCategory === 'books',
            count: counts.books,
            onClick: () => setFilterCategory('books'),
          },
          {
            id: 'oss-contribution',
            label: ossContributionText,
            active: filterCategory === 'oss-contribution',
            count: counts['oss-contribution'],
            onClick: () => setFilterCategory('oss-contribution'),
          },
        ],
      },
    ]
  }, [lang, filterCategory, counts])

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
      <section className="relative pt-12 sm:pt-16 pb-8 sm:pb-12 bg-white dark:bg-zinc-900">
        <BackgroundDecoration variant="section" />

        <Container className="relative">
          <PageHeader title={title} description={description} />

          {/* 統計バー */}
          <StatsBar
            projectCount={mainProjects.length}
            ossCount={allOSSItems.length}
            bookCount={booksProjects.length}
            npmCount={npmPackages.length}
            lang={lang}
          />

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
                filterCategory={filterCategory}
                onFilterChange={setFilterCategory}
                counts={counts}
                lang={lang}
              />
            }
          >
            {/* Active Products Section */}
            {(categorizedProjects.active.length > 0 ||
              categorizedBooks.active.length > 0 ||
              categorizedOSS.active.length > 0 ||
              categorizedOSSContributions.active.length > 0) && (
              <div className="mb-16">
                <h2 className="mb-8 text-3xl font-bold text-slate-900 dark:text-white">
                  {lang === 'ja' ? 'アクティブな製品' : 'Active Products'}
                </h2>

                {/* プロジェクトセクション（Active） */}
                {(filterCategory === 'all' || filterCategory === 'projects') &&
                  categorizedProjects.active.length > 0 && (
                    <div className="mb-12">
                      <h3 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
                        {lang === 'ja' ? 'プロジェクト' : 'Projects'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                        {categorizedProjects.active.map((project) => (
                          <UnifiedProjectCard key={project.id} project={project} lang={lang} />
                        ))}
                      </div>
                    </div>
                  )}

                {/* 書籍セクション（Active） */}
                {(filterCategory === 'all' || filterCategory === 'books') &&
                  categorizedBooks.active.length > 0 && (
                    <div className="mb-12">
                      <h3 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
                        {lang === 'ja' ? '書籍' : 'Books'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                        {categorizedBooks.active.map((project) => (
                          <UnifiedProjectCard key={project.id} project={project} lang={lang} />
                        ))}
                      </div>
                    </div>
                  )}

                {/* オープンソースセクション（Active） */}
                {(filterCategory === 'all' || filterCategory === 'open-source') &&
                  categorizedOSS.active.length > 0 && (
                    <div className="mb-12">
                      <h3 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
                        {lang === 'ja' ? 'オープンソース' : 'Open Source'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                        {categorizedOSS.active.map((item) => (
                          <Fragment key={getOSSItemKey(item)}>{renderOSSItem(item, lang)}</Fragment>
                        ))}
                      </div>
                    </div>
                  )}

                {/* OSS Contributionセクション（Active） */}
                {(filterCategory === 'all' || filterCategory === 'oss-contribution') &&
                  categorizedOSSContributions.active.length > 0 && (
                    <div className="mb-12">
                      <h3 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
                        {lang === 'ja' ? 'OSS貢献' : 'OSS Contributions'}
                      </h3>
                      <div className="space-y-3">
                        {categorizedOSSContributions.active.map((project) => (
                          <OSSContributionLink key={project.id} project={project} />
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}

            {/* Archive Section */}
            {(categorizedProjects.archived.length > 0 ||
              categorizedBooks.archived.length > 0 ||
              categorizedOSS.archived.length > 0 ||
              categorizedOSSContributions.archived.length > 0) && (
              <div className="mb-12">
                <h2 className="mb-8 text-3xl font-bold text-slate-900 dark:text-white">
                  {lang === 'ja' ? 'アーカイブ' : 'Archive'}
                </h2>

                {/* プロジェクトセクション（Archived） */}
                {(filterCategory === 'all' || filterCategory === 'projects') &&
                  categorizedProjects.archived.length > 0 && (
                    <div className="mb-12">
                      <h3 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
                        {lang === 'ja' ? 'プロジェクト' : 'Projects'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                        {categorizedProjects.archived.map((project) => (
                          <UnifiedProjectCard key={project.id} project={project} lang={lang} />
                        ))}
                      </div>
                    </div>
                  )}

                {/* 書籍セクション（Archived） */}
                {(filterCategory === 'all' || filterCategory === 'books') &&
                  categorizedBooks.archived.length > 0 && (
                    <div className="mb-12">
                      <h3 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
                        {lang === 'ja' ? '書籍' : 'Books'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                        {categorizedBooks.archived.map((project) => (
                          <UnifiedProjectCard key={project.id} project={project} lang={lang} />
                        ))}
                      </div>
                    </div>
                  )}

                {/* オープンソースセクション（Archived） */}
                {(filterCategory === 'all' || filterCategory === 'open-source') &&
                  categorizedOSS.archived.length > 0 && (
                    <div className="mb-12">
                      <h3 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
                        {lang === 'ja' ? 'オープンソース' : 'Open Source'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                        {categorizedOSS.archived.map((item) => (
                          <Fragment key={getOSSItemKey(item)}>{renderOSSItem(item, lang)}</Fragment>
                        ))}
                      </div>
                    </div>
                  )}

                {/* OSS Contributionセクション（Archived） */}
                {(filterCategory === 'all' || filterCategory === 'oss-contribution') &&
                  categorizedOSSContributions.archived.length > 0 && (
                    <div className="mb-12">
                      <h3 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
                        {lang === 'ja' ? 'OSS貢献' : 'OSS Contributions'}
                      </h3>
                      <div className="space-y-3">
                        {categorizedOSSContributions.archived.map((project) => (
                          <OSSContributionLink key={project.id} project={project} />
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}

            {/* 結果なし */}
            {categorizedProjects.active.length === 0 &&
              categorizedProjects.archived.length === 0 &&
              categorizedBooks.active.length === 0 &&
              categorizedBooks.archived.length === 0 &&
              categorizedOSS.active.length === 0 &&
              categorizedOSS.archived.length === 0 &&
              categorizedOSSContributions.active.length === 0 &&
              categorizedOSSContributions.archived.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-slate-600 dark:text-slate-400">
                    {lang === 'ja' ? '該当する項目が見つかりませんでした。' : 'No items found.'}
                  </p>
                </div>
              )}
          </SidebarLayout>
        </Container>
      </section>

      {/* CTA セクション */}
      <WorkCTA lang={lang} />
    </>
  )
}
