import Link from 'next/link'
import {
  calculateNextPage,
  calculatePrevPage,
  generatePageHref,
  getPaginationText,
  shouldShowPagination,
} from '@/libs/pagination.utils'

type PaginationProps = {
  currentPage: number
  totalPages: number
  basePath: string
  lang: string
}

const btnBase: React.CSSProperties = {
  border: '1px solid var(--rvt-border)',
  background: 'var(--rvt-bg2)',
  color: 'var(--rvt-fg2)',
  borderRadius: 'var(--rvt-radius-sm)',
}

const btnDisabled: React.CSSProperties = {
  ...btnBase,
  color: 'var(--rvt-fg3)',
  cursor: 'not-allowed',
}

export default function Pagination({ currentPage, totalPages, basePath, lang }: PaginationProps) {
  if (!shouldShowPagination(totalPages)) {
    return null
  }

  const prevPage = calculatePrevPage(currentPage)
  const nextPage = calculateNextPage(currentPage, totalPages)

  const prevHref = generatePageHref(basePath, prevPage)
  const nextHref = generatePageHref(basePath, nextPage)

  const prevText = getPaginationText(lang, 'prev')
  const nextText = getPaginationText(lang, 'next')
  const pageText = getPaginationText(lang, 'page')

  return (
    <nav
      className="flex items-center justify-between px-4 py-3 sm:px-6 mt-12"
      style={{ borderTop: '1px solid var(--rvt-border)' }}
      aria-label="Pagination"
    >
      <div className="flex flex-1 justify-between sm:justify-start">
        {prevPage ? (
          <Link
            href={prevHref}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium transition-colors"
            style={btnBase}
          >
            <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {prevText}
          </Link>
        ) : (
          <div
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium"
            style={btnDisabled}
          >
            <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {prevText}
          </div>
        )}
      </div>

      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-center">
        <p className="text-sm" style={{ color: 'var(--rvt-fg2)' }}>
          <span className="font-medium">{currentPage}</span>
          <span className="mx-1">/</span>
          <span className="font-medium">{totalPages}</span>
          <span className="ml-1">{pageText}</span>
        </p>
      </div>

      <div className="flex flex-1 justify-end">
        {nextPage ? (
          <Link
            href={nextHref}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium transition-colors"
            style={btnBase}
          >
            {nextText}
            <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ) : (
          <div
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium"
            style={btnDisabled}
          >
            {nextText}
            <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )}
      </div>
    </nav>
  )
}
