'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useMemo, useState } from 'react'
import Container from '@/components/tailwindui/Container'
import { GitHubIcon, LinkedInIcon, TwitterIcon } from '@/components/tailwindui/SocialLink'
import BackgroundDecoration from '@/components/ui/BackgroundDecoration'
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

type FilterCategory = 'all' | 'applications' | 'books' | 'owned-oss'

type ProductItem =
  | { type: 'project'; data: MicroCMSProjectsRecord }
  | { type: 'npm'; data: NPMRegistrySearchResult }
  | { type: 'wordpress'; data: WordPressPluginDetail }

function filterProductItem(item: ProductItem, matchesSearch: (text: string) => boolean): boolean {
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

function getProductItemDate(item: ProductItem): string {
  if (item.type === 'project') {
    return item.data.published_at || ''
  }
  if (item.type === 'npm') {
    return item.data.package.date
  }
  return item.data.added
}

function ProductCard({ product, lang }: { product: MicroCMSProjectsRecord; lang: string }) {
  const href = lang === 'ja' ? `/ja/products/${product.id}` : `/products/${product.id}`
  const date = product.published_at ? new Date(product.published_at) : null

  return (
    <Link href={href} className="group block">
      <article className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:border-indigo-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700">
        {product.image && (
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <Image
              src={product.image.url}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        )}

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
              {product.title}
            </h3>

            {product.about && (
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-2">
                {product.about.replace(/<[^>]*>/g, '').substring(0, 120)}
                {product.about.replace(/<[^>]*>/g, '').length > 120 ? '...' : ''}
              </p>
            )}

            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.slice(0, 3).map((tag) => (
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

function ProductOSSCard({
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

function StatsBar({
  appCount,
  bookCount,
  ossCount,
  lang,
}: {
  appCount: number
  bookCount: number
  ossCount: number
  lang: string
}) {
  const stats = [
    {
      id: 'applications',
      value: appCount,
      label: lang === 'ja' ? 'アプリケーション' : 'Applications',
    },
    {
      id: 'books',
      value: bookCount,
      label: lang === 'ja' ? '書籍' : 'Books',
    },
    {
      id: 'oss',
      value: ossCount,
      label: lang === 'ja' ? 'OSS' : 'Open Source',
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

function ProductsCTA({ lang }: { lang: string }) {
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
    applications: number
    books: number
    'owned-oss': number
  }
  lang: string
}) {
  const searchPlaceholder = lang === 'ja' ? '検索...' : 'Search...'
  const filterTitle = lang === 'ja' ? 'カテゴリ' : 'Category'
  const allText = lang === 'ja' ? 'すべて' : 'All'
  const applicationsText = lang === 'ja' ? 'アプリケーション' : 'Applications'
  const booksText = lang === 'ja' ? '書籍' : 'Books'
  const ossText = lang === 'ja' ? 'OSS' : 'Open Source'

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
            active={filterCategory === 'applications'}
            onClick={() => onFilterChange('applications')}
            count={counts.applications}
          >
            {applicationsText}
          </FilterItem>
          <FilterItem
            active={filterCategory === 'books'}
            onClick={() => onFilterChange('books')}
            count={counts.books}
          >
            {booksText}
          </FilterItem>
          <FilterItem
            active={filterCategory === 'owned-oss'}
            onClick={() => onFilterChange('owned-oss')}
            count={counts['owned-oss']}
          >
            {ossText}
          </FilterItem>
        </nav>
      </div>
    </div>
  )
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Component requires complex state management and filtering logic
export default function ProductsPageContent({
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

  // Extract categorized projects
  const appProjects = useMemo(
    () => projects.filter((p) => p.project_type?.includes('applications')),
    [projects],
  )
  const bookProjects = useMemo(
    () => projects.filter((p) => p.project_type?.includes('books')),
    [projects],
  )
  const ossProjects = useMemo(
    () => projects.filter((p) => p.project_type?.includes('owned_oss')),
    [projects],
  )

  const allOSSItems = useMemo(
    () => [
      ...ossProjects.map((p) => ({ type: 'project' as const, data: p })),
      ...npmPackages.map((p) => ({ type: 'npm' as const, data: p })),
      ...wpPlugins.map((p) => ({ type: 'wordpress' as const, data: p })),
    ],
    [ossProjects, npmPackages, wpPlugins],
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

  const filteredApps = useMemo(
    () => getFilteredAndSorted(appProjects, filterCategory, 'applications'),
    [getFilteredAndSorted, appProjects, filterCategory],
  )
  const filteredBooks = useMemo(
    () => getFilteredAndSorted(bookProjects, filterCategory, 'books'),
    [getFilteredAndSorted, bookProjects, filterCategory],
  )

  const filteredOSS = useMemo(() => {
    if (filterCategory !== 'all' && filterCategory !== 'owned-oss') return []
    return allOSSItems
      .filter((item) => filterProductItem(item, matchesSearch))
      .sort((a, b) => {
        const dateA = getProductItemDate(a)
        const dateB = getProductItemDate(b)
        return new Date(dateB).getTime() - new Date(dateA).getTime()
      })
  }, [filterCategory, allOSSItems, matchesSearch])

  const counts = useMemo(
    () => ({
      all: appProjects.length + bookProjects.length + allOSSItems.length,
      applications: appProjects.length,
      books: bookProjects.length,
      'owned-oss': allOSSItems.length,
    }),
    [appProjects.length, bookProjects.length, allOSSItems.length],
  )

  const title = lang === 'ja' ? 'プロダクト' : 'Products'
  const description =
    lang === 'ja'
      ? '開発した自社プロダクト、書籍、オープンソースプロジェクトを紹介しています。'
      : 'Products, books, and open source projects I have developed.'
  const filterButtonText = lang === 'ja' ? 'フィルター' : 'Filter'
  const activeFilterCount = filterCategory !== 'all' ? 1 : 0

  const filterGroups = useMemo<FilterGroup[]>(() => {
    const filterTitle = lang === 'ja' ? 'カテゴリ' : 'Category'
    const allText = lang === 'ja' ? 'すべて' : 'All'
    const applicationsText = lang === 'ja' ? 'アプリケーション' : 'Applications'
    const booksText = lang === 'ja' ? '書籍' : 'Books'
    const ossText = lang === 'ja' ? 'OSS' : 'Open Source'

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
            id: 'applications',
            label: applicationsText,
            active: filterCategory === 'applications',
            count: counts.applications,
            onClick: () => setFilterCategory('applications'),
          },
          {
            id: 'books',
            label: booksText,
            active: filterCategory === 'books',
            count: counts.books,
            onClick: () => setFilterCategory('books'),
          },
          {
            id: 'owned-oss',
            label: ossText,
            active: filterCategory === 'owned-oss',
            count: counts['owned-oss'],
            onClick: () => setFilterCategory('owned-oss'),
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
            appCount={appProjects.length}
            bookCount={bookProjects.length}
            ossCount={allOSSItems.length}
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
            {(filterCategory === 'all' || filterCategory === 'applications') &&
              filteredApps.length > 0 && (
                <div className="mb-12">
                  <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
                    {lang === 'ja' ? 'アプリケーション' : 'Applications'}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    {filteredApps.map((product) => (
                      <ProductCard key={product.id} product={product} lang={lang} />
                    ))}
                  </div>
                </div>
              )}

            {(filterCategory === 'all' || filterCategory === 'books') &&
              filteredBooks.length > 0 && (
                <div className="mb-12">
                  <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
                    {lang === 'ja' ? '書籍' : 'Books'}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    {filteredBooks.map((product) => (
                      <ProductCard key={product.id} product={product} lang={lang} />
                    ))}
                  </div>
                </div>
              )}

            {(filterCategory === 'all' || filterCategory === 'owned-oss') &&
              filteredOSS.length > 0 && (
                <div className="mb-12">
                  <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
                    {lang === 'ja' ? 'オープンソース' : 'Open Source'}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    {filteredOSS.map((item) => {
                      if (item.type === 'project') {
                        return (
                          <ProductCard
                            key={item.data.id}
                            product={item.data as MicroCMSProjectsRecord}
                            lang={lang}
                          />
                        )
                      } else if (item.type === 'npm') {
                        return (
                          <ProductOSSCard
                            key={`npm-${(item.data as NPMRegistrySearchResult).package.name}`}
                            item={{ type: 'npm', data: item.data as NPMRegistrySearchResult }}
                            lang={lang}
                          />
                        )
                      } else {
                        return (
                          <ProductOSSCard
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

            {filteredApps.length === 0 &&
              filteredBooks.length === 0 &&
              filteredOSS.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-slate-600 dark:text-slate-400">
                    {lang === 'ja' ? '該当する項目が見つかりませんでした。' : 'No items found.'}
                  </p>
                </div>
              )}
          </SidebarLayout>
        </Container>
      </section>

      <ProductsCTA lang={lang} />
    </>
  )
}
