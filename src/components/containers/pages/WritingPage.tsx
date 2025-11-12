'use client'

import { useState } from 'react'
import Link from 'next/link'
import SimpleLayout from '@/components/tailwindui/SimpleLayout'
import type { FeedItem } from '@/libs/dataSources/types'
import type { MicroCMSPostsRecord } from '@/lib/microCMS/types'

type WritingItem = FeedItem | MicroCMSPostsRecord

function formatDate(dateString: string, lang: string): string {
  return new Date(dateString).toLocaleDateString(lang === 'ja' ? 'ja-JP' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function WritingCard({ item, lang }: { item: WritingItem; lang: string }) {
  const isFeedItem = 'dataSource' in item
  const href = isFeedItem 
    ? item.href 
    : (lang === 'ja' ? `/ja/writing/${item.id}` : `/writing/${item.id}`)
  const title = isFeedItem ? item.title : item.title
  const description = isFeedItem 
    ? item.description 
    : item.content.replace(/<[^>]*>/g, '').substring(0, 200)
  const datetime = isFeedItem ? item.datetime : item.publishedAt

  return (
    <article className="md:grid md:grid-cols-4 md:items-baseline">
      <div className="group relative flex flex-col items-start md:col-span-3">
        <h2 className="text-base font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
          {isFeedItem ? (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {title}
            </a>
          ) : (
            <Link href={href}>{title}</Link>
          )}
        </h2>
        <time
          dateTime={datetime}
          className="relative z-10 order-first mb-3 flex items-center text-sm text-zinc-400 dark:text-zinc-500 md:hidden pl-3.5"
        >
          <span className="absolute inset-y-0 left-0 flex items-center" aria-hidden="true">
            <span className="h-4 w-0.5 rounded-full bg-zinc-200 dark:bg-zinc-500" />
          </span>
          {formatDate(datetime, lang)}
        </time>
        {isFeedItem && item.dataSource && (
          <div className="relative z-10 order-first mb-3 flex items-center text-sm text-zinc-400 dark:text-zinc-500 pl-3.5">
            <span className="absolute inset-y-0 left-0 flex items-center" aria-hidden="true">
              <span className="h-4 w-0.5 rounded-full bg-zinc-200 dark:bg-zinc-500" />
            </span>
            <a href={item.dataSource.href} target="_blank" rel="noopener noreferrer">
              {item.dataSource.name}
            </a>
          </div>
        )}
        <p className="relative z-10 mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {description}
          {description.length >= 200 ? '...' : ''}
        </p>
        <div
          aria-hidden="true"
          className="relative z-10 mt-4 flex items-center text-sm font-medium text-teal-500"
        >
          {isFeedItem ? 'Read article' : 'Read more'}
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="ml-1 h-4 w-4 stroke-current">
            <path
              d="M6.75 5.75 9.25 8l-2.5 2.25"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      <time
        dateTime={datetime}
        className="relative z-10 order-first mb-3 flex items-center text-sm text-zinc-400 dark:text-zinc-500 mt-1 hidden md:block"
      >
        {formatDate(datetime, lang)}
      </time>
    </article>
  )
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

export default function WritingPageContent({ 
  lang,
  externalArticles,
  newsArticles
}: { 
  lang: string
  externalArticles: FeedItem[]
  newsArticles: MicroCMSPostsRecord[]
}) {
  const [filter, setFilter] = useState<'all' | 'external' | 'news'>('all')

  // 全記事を統合
  const allItems: WritingItem[] = [
    ...externalArticles,
    ...newsArticles,
  ]

  // フィルター適用
  const filteredItems = allItems.filter((item) => {
    if (filter === 'all') return true
    if (filter === 'external') {
      return 'dataSource' in item
    }
    if (filter === 'news') {
      return !('dataSource' in item)
    }
    return true
  })

  // 日付順にソート
  filteredItems.sort((a, b) => {
    const dateA = 'datetime' in a ? a.datetime : a.publishedAt
    const dateB = 'datetime' in b ? b.datetime : b.publishedAt
    return new Date(dateB).getTime() - new Date(dateA).getTime()
  })

  const title = lang === 'ja' ? 'Writing' : 'Writing'
  const allText = lang === 'ja' ? 'すべて' : 'All'
  const externalText = lang === 'ja' ? '外部記事' : 'External Articles'
  const newsText = lang === 'ja' ? 'ニュース' : 'News'

  return (
    <SimpleLayout title={title}>
      {/* フィルターボタン */}
      <div className="mt-8 mb-8 flex flex-wrap gap-4">
        <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
          {allText}
        </FilterButton>
        <FilterButton active={filter === 'external'} onClick={() => setFilter('external')}>
          {externalText}
        </FilterButton>
        <FilterButton active={filter === 'news'} onClick={() => setFilter('news')}>
          {newsText}
        </FilterButton>
      </div>

      {/* コンテンツ */}
      <div className="flex flex-col gap-16">
        <div className="md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40">
          <div className="flex max-w-3xl flex-col space-y-16">
            {filteredItems.map((item, index) => (
              <WritingCard key={index} item={item} lang={lang} />
            ))}
          </div>
        </div>
      </div>
    </SimpleLayout>
  )
}

