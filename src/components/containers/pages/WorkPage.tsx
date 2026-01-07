'use client'

import Image from 'next/image'
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
import type { NPMRegistrySearchResult } from '@/libs/dataSources/npmjs'
import type { WordPressPluginDetail } from '@/libs/dataSources/wporg'
import type { MicroCMSProjectsRecord } from '@/libs/microCMS/types'

type FilterCategory = 'all' | 'projects' | 'open-source' | 'books' | 'oss-contribution'

type OSSItem =
  | { type: 'project'; data: MicroCMSProjectsRecord }
  | { type: 'npm'; data: NPMRegistrySearchResult }
  | { type: 'wordpress'; data: WordPressPluginDetail }

// OSSアイテムをフィルタリングするヘルパー関数
function filterOSSItem(item: OSSItem, matchesSearch: (text: string) => boolean): boolean {
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
    return matchesSearch(pkg.name) || (pkg.description && matchesSearch(pkg.description))
  }
  const plugin = item.data
  return (
    matchesSearch(plugin.name) ||
    (plugin.short_description && matchesSearch(plugin.short_description))
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
            {date && (
              <DateDisplay
                date={date}
                lang={lang}
                format="short"
                className="text-xs font-semibold text-slate-500 dark:text-slate-400"
              />
            )}

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

    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="group block">
        <article className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:border-indigo-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700">
          {/* Content */}
          <div className="p-5 lg:p-6">
            <div className="flex flex-col gap-3">
              <DateDisplay
                date={date}
                lang={lang}
                format="short"
                className="text-xs font-semibold text-slate-500 dark:text-slate-400"
              />

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

    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="group block">
        <article className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:border-indigo-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700">
          {/* Content */}
          <div className="p-5 lg:p-6">
            <div className="flex flex-col gap-3">
              <DateDisplay
                date={date}
                lang={lang}
                format="short"
                className="text-xs font-semibold text-slate-500 dark:text-slate-400"
              />

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

  // 日付順にソート
  filteredProjects.sort((a, b) => {
    const dateA = a.published_at || ''
    const dateB = b.published_at || ''
    return new Date(dateB).getTime() - new Date(dateA).getTime()
  })

  filteredBooks.sort((a, b) => {
    const dateA = a.published_at || ''
    const dateB = b.published_at || ''
    return new Date(dateB).getTime() - new Date(dateA).getTime()
  })

  filteredOSSContributions.sort((a, b) => {
    const dateA = a.published_at || ''
    const dateB = b.published_at || ''
    return new Date(dateB).getTime() - new Date(dateA).getTime()
  })

  filteredOSS.sort((a, b) => {
    const dateA = getOSSItemDate(a)
    const dateB = getOSSItemDate(b)
    return new Date(dateB).getTime() - new Date(dateA).getTime()
  })

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
      ? 'これまでに開発・制作したプロジェクト、オープンソースプロジェクト、書籍などを紹介しています。'
      : "A collection of projects, open source contributions, books, and other work I've created."
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
                filterCategory={filterCategory}
                onFilterChange={setFilterCategory}
                counts={counts}
                lang={lang}
              />
            }
          >
            {/* プロジェクトセクション */}
            {(filterCategory === 'all' || filterCategory === 'projects') &&
              filteredProjects.length > 0 && (
                <div className="mb-12">
                  <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
                    {lang === 'ja' ? 'プロジェクト' : 'Projects'}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    {filteredProjects.map((project) => (
                      <UnifiedProjectCard key={project.id} project={project} lang={lang} />
                    ))}
                  </div>
                </div>
              )}

            {/* 書籍セクション */}
            {(filterCategory === 'all' || filterCategory === 'books') &&
              filteredBooks.length > 0 && (
                <div className="mb-12">
                  <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
                    {lang === 'ja' ? '書籍' : 'Books'}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    {filteredBooks.map((project) => (
                      <UnifiedProjectCard key={project.id} project={project} lang={lang} />
                    ))}
                  </div>
                </div>
              )}

            {/* オープンソースセクション */}
            {(filterCategory === 'all' || filterCategory === 'open-source') &&
              filteredOSS.length > 0 && (
                <div className="mb-12">
                  <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
                    {lang === 'ja' ? 'オープンソース' : 'Open Source'}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    {filteredOSS.map((item, _index) => {
                      if (item.type === 'project') {
                        return (
                          <UnifiedProjectCard
                            key={item.data.id}
                            project={item.data as MicroCMSProjectsRecord}
                            lang={lang}
                          />
                        )
                      } else if (item.type === 'npm') {
                        return (
                          <UnifiedOSSCard
                            key={`npm-${(item.data as NPMRegistrySearchResult).package.name}`}
                            item={{ type: 'npm', data: item.data as NPMRegistrySearchResult }}
                            lang={lang}
                          />
                        )
                      } else {
                        return (
                          <UnifiedOSSCard
                            key={`wp-${(item.data as WordPressPluginDetail).slug}`}
                            item={{ type: 'wordpress', data: item.data as WordPressPluginDetail }}
                            lang={lang}
                          />
                        )
                      }
                    })}
                  </div>
                </div>
              )}

            {/* OSS Contributionセクション */}
            {(filterCategory === 'all' || filterCategory === 'oss-contribution') &&
              filteredOSSContributions.length > 0 && (
                <div>
                  <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
                    {lang === 'ja' ? 'OSS貢献' : 'OSS Contributions'}
                  </h2>
                  <div className="space-y-3">
                    {filteredOSSContributions.map((project) => (
                      <OSSContributionLink key={project.id} project={project} />
                    ))}
                  </div>
                </div>
              )}

            {/* 結果なし */}
            {filteredProjects.length === 0 &&
              filteredBooks.length === 0 &&
              filteredOSS.length === 0 &&
              filteredOSSContributions.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-slate-600 dark:text-slate-400">
                    {lang === 'ja' ? '該当する項目が見つかりませんでした。' : 'No items found.'}
                  </p>
                </div>
              )}
          </SidebarLayout>
        </Container>
      </section>
    </>
  )
}
