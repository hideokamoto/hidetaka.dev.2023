'use client'

import { useEffect } from 'react'
import SearchBar from '@/components/ui/SearchBar'
import FilterItem from '@/components/ui/FilterItem'

export type FilterGroup = {
  title: string
  items: Array<{
    id: string
    label: string
    count?: number
    active: boolean
    onClick: () => void
  }>
}

type MobileFilterDrawerProps = {
  isOpen: boolean
  onClose: () => void
  searchQuery: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  filterGroups: FilterGroup[]
  title?: string
}

export default function MobileFilterDrawer({
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filterGroups,
  title = 'Filter'
}: MobileFilterDrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white/95 backdrop-blur-md shadow-2xl ring-1 ring-zinc-900/5 dark:bg-zinc-900/95 dark:ring-white/10 lg:hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-700 dark:text-slate-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Close filter"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-6">
              {/* 検索バー */}
              <div>
                <SearchBar 
                  value={searchQuery}
                  onChange={onSearchChange}
                  placeholder={searchPlaceholder}
                />
              </div>

              {/* フィルターグループ */}
              {filterGroups.map((group, groupIndex) => (
                <div key={groupIndex}>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
                    {group.title}
                  </h3>
                  <nav className="space-y-1">
                    {group.items.map((item) => (
                      <FilterItem
                        key={item.id}
                        active={item.active}
                        onClick={item.onClick}
                        count={item.count}
                      >
                        {item.label}
                      </FilterItem>
                    ))}
                  </nav>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

