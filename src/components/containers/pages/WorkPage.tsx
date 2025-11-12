'use client'

import { useState } from 'react'
import SimpleLayout from '@/components/tailwindui/SimpleLayout'
import ProjectCard from '@/components/projects/ProjectCard'
import type { MicroCMSProjectsRecord } from '@/lib/microCMS/types'
import type { NPMRegistrySearchResult } from '@/libs/dataSources/npmjs'
import type { WordPressPluginDetail } from '@/libs/dataSources/wporg'

type WorkItem = 
  | { type: 'project'; data: MicroCMSProjectsRecord }
  | { type: 'npm'; data: NPMRegistrySearchResult }
  | { type: 'wordpress'; data: WordPressPluginDetail }

function formatDate(dateString: string, lang: string): string {
  return new Date(dateString).toLocaleDateString(lang === 'ja' ? 'ja-JP' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function OSSItemCard({ item, lang }: { item: WorkItem & { type: 'npm' | 'wordpress' }; lang: string }) {
  if (item.type === 'npm') {
    const pkg = item.data.package
    return (
      <article className="md:grid md:grid-cols-4 md:items-baseline">
        <div className="group relative flex flex-col items-start md:col-span-3">
          <h2 className="text-base font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
            <a href={pkg.links.npm} target="_blank" rel="noopener noreferrer">
              {pkg.name}
            </a>
          </h2>
          <time
            dateTime={pkg.date}
            className="relative z-10 order-first mb-3 flex items-center text-sm text-zinc-400 dark:text-zinc-500 md:hidden pl-3.5"
          >
            <span className="absolute inset-y-0 left-0 flex items-center" aria-hidden="true">
              <span className="h-4 w-0.5 rounded-full bg-zinc-200 dark:bg-zinc-500" />
            </span>
            {formatDate(pkg.date, lang)}
          </time>
          <p className="relative z-10 mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {pkg.description}
          </p>
        </div>
        <time
          dateTime={pkg.date}
          className="relative z-10 order-first mb-3 flex items-center text-sm text-zinc-400 dark:text-zinc-500 mt-1 hidden md:block"
        >
          {formatDate(pkg.date, lang)}
        </time>
      </article>
    )
  } else {
    const plugin = item.data
    return (
      <article className="md:grid md:grid-cols-4 md:items-baseline">
        <div className="group relative flex flex-col items-start md:col-span-3">
          <h2 className="text-base font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
            <a href={`https://wordpress.org/plugins/${plugin.slug}`} target="_blank" rel="noopener noreferrer">
              {plugin.name}
            </a>
          </h2>
          <time
            dateTime={plugin.added}
            className="relative z-10 order-first mb-3 flex items-center text-sm text-zinc-400 dark:text-zinc-500 md:hidden pl-3.5"
          >
            <span className="absolute inset-y-0 left-0 flex items-center" aria-hidden="true">
              <span className="h-4 w-0.5 rounded-full bg-zinc-200 dark:bg-zinc-500" />
            </span>
            {formatDate(plugin.added, lang)}
          </time>
          <p className="relative z-10 mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {plugin.short_description}
          </p>
        </div>
        <time
          dateTime={plugin.added}
          className="relative z-10 order-first mb-3 flex items-center text-sm text-zinc-400 dark:text-zinc-500 mt-1 hidden md:block"
        >
          {formatDate(plugin.added, lang)}
        </time>
      </article>
    )
  }
}

function FilterButton({ 
  active, 
  onClick, 
  children 
}: { 
  active: boolean
  onClick: () => void
  children: React.ReactNode 
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition ${
        active
          ? 'bg-teal-500 text-white dark:bg-teal-600'
          : 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700'
      }`}
    >
      {children}
    </button>
  )
}

export default function WorkPageContent({ 
  lang,
  projects,
  npmPackages,
  wpPlugins
}: { 
  lang: string
  projects: MicroCMSProjectsRecord[]
  npmPackages: NPMRegistrySearchResult[]
  wpPlugins: WordPressPluginDetail[]
}) {
  const [filter, setFilter] = useState<'all' | 'applications' | 'open-source' | 'books' | 'guest-posts'>('all')

  // 全アイテムを統合
  const allItems: WorkItem[] = [
    ...projects.map((p) => ({ type: 'project' as const, data: p })),
    ...npmPackages.map((p) => ({ type: 'npm' as const, data: p })),
    ...wpPlugins.map((p) => ({ type: 'wordpress' as const, data: p })),
  ]

  // フィルター適用
  const filteredItems = allItems.filter((item) => {
    if (filter === 'all') return true
    if (filter === 'open-source') {
      return item.type === 'npm' || item.type === 'wordpress'
    }
    if (item.type !== 'project') return false
    const project = item.data
    if (filter === 'applications') {
      return project.project_type?.includes('applications')
    }
    if (filter === 'books') {
      return project.project_type?.includes('books')
    }
    if (filter === 'guest-posts') {
      return project.project_type?.includes('guest_posts')
    }
    return true
  })

  // 日付順にソート
  filteredItems.sort((a, b) => {
    const dateA = a.type === 'project' 
      ? (a.data.published_at || '')
      : a.type === 'npm'
      ? a.data.package.date
      : a.data.added
    const dateB = b.type === 'project'
      ? (b.data.published_at || '')
      : b.type === 'npm'
      ? b.data.package.date
      : b.data.added
    return new Date(dateB).getTime() - new Date(dateA).getTime()
  })

  const title = lang === 'ja' ? 'Work' : 'Work'
  const allText = lang === 'ja' ? 'すべて' : 'All'
  const applicationsText = lang === 'ja' ? 'アプリケーション' : 'Applications'
  const openSourceText = lang === 'ja' ? 'オープンソース' : 'Open Source'
  const booksText = lang === 'ja' ? '書籍' : 'Books'
  const guestPostsText = lang === 'ja' ? 'ゲスト投稿' : 'Guest Posts'

  return (
    <SimpleLayout title={title}>
      {/* フィルターボタン */}
      <div className="mt-8 mb-8 flex flex-wrap gap-4">
        <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
          {allText}
        </FilterButton>
        <FilterButton active={filter === 'applications'} onClick={() => setFilter('applications')}>
          {applicationsText}
        </FilterButton>
        <FilterButton active={filter === 'open-source'} onClick={() => setFilter('open-source')}>
          {openSourceText}
        </FilterButton>
        <FilterButton active={filter === 'books'} onClick={() => setFilter('books')}>
          {booksText}
        </FilterButton>
        <FilterButton active={filter === 'guest-posts'} onClick={() => setFilter('guest-posts')}>
          {guestPostsText}
        </FilterButton>
      </div>

      {/* コンテンツ */}
      <div className="flex flex-col gap-16">
        <div className="md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40">
          <div className="flex max-w-3xl flex-col space-y-16">
            {filteredItems.map((item, index) => {
              if (item.type === 'project') {
                return <ProjectCard key={item.data.id} project={item.data} lang={lang} />
              } else {
                return <OSSItemCard key={`${item.type}-${index}`} item={item} lang={lang} />
              }
            })}
          </div>
        </div>
      </div>
    </SimpleLayout>
  )
}

