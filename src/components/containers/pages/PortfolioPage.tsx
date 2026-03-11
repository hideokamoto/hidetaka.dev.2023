'use client'

import { useCallback, useMemo, useState } from 'react'
import Container from '@/components/tailwindui/Container'
import { GitHubIcon, LinkedInIcon, TwitterIcon } from '@/components/tailwindui/SocialLink'
import BackgroundDecoration from '@/components/ui/BackgroundDecoration'
import FilterItem from '@/components/ui/FilterItem'
import MobileFilterButton from '@/components/ui/MobileFilterButton'
import MobileFilterDrawer, { type FilterGroup } from '@/components/ui/MobileFilterDrawer'
import PageHeader from '@/components/ui/PageHeader'
import SearchBar from '@/components/ui/SearchBar'
import SidebarLayout from '@/components/ui/SidebarLayout'
import { SITE_CONFIG } from '@/config'
import type { MicroCMSProjectsRecord } from '@/libs/microCMS/types'

type FilterCategory = 'all' | 'oss-contribution' | 'community' | 'guest-posts'

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

function StatsBar({
  ossCount,
  communityCount,
  guestPostCount,
  lang,
}: {
  ossCount: number
  communityCount: number
  guestPostCount: number
  lang: string
}) {
  const stats = [
    {
      id: 'oss-contribution',
      value: ossCount,
      label: lang === 'ja' ? 'OSS貢献' : 'OSS Contributions',
    },
    {
      id: 'community',
      value: communityCount,
      label: lang === 'ja' ? 'コミュニティ活動' : 'Community Activities',
    },
    {
      id: 'guest-posts',
      value: guestPostCount,
      label: lang === 'ja' ? 'ゲスト投稿' : 'Guest Posts',
    },
  ]

  return (
    <div className="mb-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.id}
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

function PortfolioCTA({ lang }: { lang: string }) {
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
    'oss-contribution': number
    community: number
    'guest-posts': number
  }
  lang: string
}) {
  const searchPlaceholder = lang === 'ja' ? '検索...' : 'Search...'
  const filterTitle = lang === 'ja' ? 'カテゴリ' : 'Category'
  const allText = lang === 'ja' ? 'すべて' : 'All'
  const ossContributionText = lang === 'ja' ? 'OSS貢献' : 'OSS Contributions'
  const communityText = lang === 'ja' ? 'コミュニティ活動' : 'Community Activities'
  const guestPostText = lang === 'ja' ? 'ゲスト投稿' : 'Guest Posts'

  return (
    <div className="hidden lg:block space-y-6">
      <div>
        <SearchBar value={searchQuery} onChange={onSearchChange} placeholder={searchPlaceholder} />
      </div>

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
            active={filterCategory === 'oss-contribution'}
            onClick={() => onFilterChange('oss-contribution')}
            count={counts['oss-contribution']}
          >
            {ossContributionText}
          </FilterItem>
          <FilterItem
            active={filterCategory === 'community'}
            onClick={() => onFilterChange('community')}
            count={counts.community}
          >
            {communityText}
          </FilterItem>
          <FilterItem
            active={filterCategory === 'guest-posts'}
            onClick={() => onFilterChange('guest-posts')}
            count={counts['guest-posts']}
          >
            {guestPostText}
          </FilterItem>
        </nav>
      </div>
    </div>
  )
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Component requires complex state management and filtering logic
export default function PortfolioPageContent({
  lang,
  projects,
}: {
  lang: string
  projects: MicroCMSProjectsRecord[]
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all')
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  // Extract categorized projects
  const ossContributionProjects = useMemo(
    () => projects.filter((p) => p.project_type?.includes('oss_contribution')),
    [projects],
  )
  const communityProjects = useMemo(
    () => projects.filter((p) => p.project_type?.includes('community_activities')),
    [projects],
  )
  const guestPostProjects = useMemo(
    () => projects.filter((p) => p.project_type?.includes('guest_posts')),
    [projects],
  )

  const matchesSearch = useCallback(
    (text: string): boolean => {
      if (!searchQuery.trim()) return true
      const query = searchQuery.toLowerCase()
      return text.toLowerCase().includes(query)
    },
    [searchQuery],
  )

  // Helper to filter and sort projects
  const getFilteredAndSorted = useCallback(
    (items: MicroCMSProjectsRecord[], category: FilterCategory, targetCategory: FilterCategory) => {
      if (category !== 'all' && category !== targetCategory) return []
      const filtered = items.filter(
        (p) =>
          matchesSearch(p.title) ||
          (p.about && matchesSearch(p.about.replace(/<[^>]*>/g, ''))) ||
          p.tags?.some((tag) => matchesSearch(tag)),
      )
      return filtered.sort((a, b) => {
        const dateA = a.published_at || ''
        const dateB = b.published_at || ''
        return new Date(dateB).getTime() - new Date(dateA).getTime()
      })
    },
    [matchesSearch],
  )

  const filteredOSSContributions = useMemo(
    () => getFilteredAndSorted(ossContributionProjects, filterCategory, 'oss-contribution'),
    [getFilteredAndSorted, ossContributionProjects, filterCategory],
  )
  const filteredCommunity = useMemo(
    () => getFilteredAndSorted(communityProjects, filterCategory, 'community'),
    [getFilteredAndSorted, communityProjects, filterCategory],
  )
  const filteredGuestPosts = useMemo(
    () => getFilteredAndSorted(guestPostProjects, filterCategory, 'guest-posts'),
    [getFilteredAndSorted, guestPostProjects, filterCategory],
  )

  const counts = useMemo(
    () => ({
      all: ossContributionProjects.length + communityProjects.length + guestPostProjects.length,
      'oss-contribution': ossContributionProjects.length,
      community: communityProjects.length,
      'guest-posts': guestPostProjects.length,
    }),
    [ossContributionProjects.length, communityProjects.length, guestPostProjects.length],
  )

  const title = lang === 'ja' ? 'ポートフォリオ' : 'Portfolio'
  const description =
    lang === 'ja'
      ? 'OSS貢献、コミュニティ活動、ゲスト投稿などのポートフォリオを紹介しています。'
      : 'OSS contributions, community activities, and guest posts portfolio.'
  const filterButtonText = lang === 'ja' ? 'フィルター' : 'Filter'
  const activeFilterCount = filterCategory !== 'all' ? 1 : 0

  const filterGroups = useMemo<FilterGroup[]>(() => {
    const filterTitle = lang === 'ja' ? 'カテゴリ' : 'Category'
    const allText = lang === 'ja' ? 'すべて' : 'All'
    const ossContributionText = lang === 'ja' ? 'OSS貢献' : 'OSS Contributions'
    const communityText = lang === 'ja' ? 'コミュニティ活動' : 'Community Activities'
    const guestPostText = lang === 'ja' ? 'ゲスト投稿' : 'Guest Posts'

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
            id: 'oss-contribution',
            label: ossContributionText,
            active: filterCategory === 'oss-contribution',
            count: counts['oss-contribution'],
            onClick: () => setFilterCategory('oss-contribution'),
          },
          {
            id: 'community',
            label: communityText,
            active: filterCategory === 'community',
            count: counts.community,
            onClick: () => setFilterCategory('community'),
          },
          {
            id: 'guest-posts',
            label: guestPostText,
            active: filterCategory === 'guest-posts',
            count: counts['guest-posts'],
            onClick: () => setFilterCategory('guest-posts'),
          },
        ],
      },
    ]
  }, [lang, filterCategory, counts])

  return (
    <>
      <MobileFilterDrawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={lang === 'ja' ? '検索...' : 'Search...'}
        filterGroups={filterGroups}
        title={filterButtonText}
      />

      <section className="relative pt-12 sm:pt-16 pb-8 sm:pb-12 bg-white dark:bg-zinc-900">
        <BackgroundDecoration variant="section" />

        <Container className="relative">
          <PageHeader title={title} description={description} />

          <StatsBar
            ossCount={ossContributionProjects.length}
            communityCount={communityProjects.length}
            guestPostCount={guestPostProjects.length}
            lang={lang}
          />

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
            {(filterCategory === 'all' || filterCategory === 'oss-contribution') &&
              filteredOSSContributions.length > 0 && (
                <div className="mb-12">
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

            {(filterCategory === 'all' || filterCategory === 'community') &&
              filteredCommunity.length > 0 && (
                <div className="mb-12">
                  <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
                    {lang === 'ja' ? 'コミュニティ活動' : 'Community Activities'}
                  </h2>
                  <div className="space-y-3">
                    {filteredCommunity.map((project) => (
                      <OSSContributionLink key={project.id} project={project} />
                    ))}
                  </div>
                </div>
              )}

            {(filterCategory === 'all' || filterCategory === 'guest-posts') &&
              filteredGuestPosts.length > 0 && (
                <div className="mb-12">
                  <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
                    {lang === 'ja' ? 'ゲスト投稿' : 'Guest Posts'}
                  </h2>
                  <div className="space-y-3">
                    {filteredGuestPosts.map((project) => (
                      <OSSContributionLink key={project.id} project={project} />
                    ))}
                  </div>
                </div>
              )}

            {filteredOSSContributions.length === 0 &&
              filteredCommunity.length === 0 &&
              filteredGuestPosts.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-slate-600 dark:text-slate-400">
                    {lang === 'ja' ? '該当する項目が見つかりませんでした。' : 'No items found.'}
                  </p>
                </div>
              )}
          </SidebarLayout>
        </Container>
      </section>

      <PortfolioCTA lang={lang} />
    </>
  )
}
