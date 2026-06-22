'use client'

import { useEffect } from 'react'
import FilterItem from '@/components/ui/FilterItem'
import SearchBar from '@/components/ui/SearchBar'
import { useDialogA11y } from '@/libs/hooks/useDialogA11y'

export type FilterGroup = {
  title: string
  items: Array<{
    id: string
    label: string
    count?: number
    active: boolean
    onClick: () => void
    externalLink?: string
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
  lang?: string
}

export default function MobileFilterDrawer({
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filterGroups,
  title = 'Filter',
  lang = 'ja',
}: MobileFilterDrawerProps) {
  const dialogRef = useDialogA11y<HTMLDivElement>(isOpen, onClose)

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
      <button
        type="button"
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
        aria-label="Close filter drawer"
      />

      {/* Drawer Panel */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="fixed inset-y-0 right-0 z-50 w-full max-w-sm backdrop-blur-md shadow-2xl ring-1 ring-zinc-900/5 lg:hidden"
        style={{ background: 'var(--rvt-bg2)' }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4 border-b"
            style={{ borderColor: 'var(--rvt-border)' }}
          >
            <h2 className="text-lg font-bold" style={{ color: 'var(--rvt-fg)' }}>
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 hover:bg-zinc-100 transition-colors"
              style={{ color: 'var(--rvt-fg2)' }}
              aria-label="Close filter"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
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
              {filterGroups.map((group) => (
                <div key={group.title}>
                  <h3
                    className="mb-3 text-sm font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--rvt-fg)' }}
                  >
                    {group.title}
                  </h3>
                  <nav className="space-y-1">
                    {group.items.map((item) => (
                      <div key={item.id} className="space-y-1">
                        <FilterItem active={item.active} onClick={item.onClick} count={item.count}>
                          {item.label}
                        </FilterItem>
                        {item.active && item.externalLink && (
                          <a
                            href={item.externalLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-4 text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {lang === 'ja' ? '元のサイトで見る' : 'View on original site'}
                            <svg
                              className="h-3 w-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </a>
                        )}
                      </div>
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
