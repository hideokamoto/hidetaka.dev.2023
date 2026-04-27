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
    <nav className="ds-pagination" aria-label="Pagination">
      <div>
        {prevPage ? (
          <Link href={prevHref} className="ds-btn ds-btn--ghost ds-btn--sm">
            ← {prevText}
          </Link>
        ) : (
          <span className="ds-btn ds-btn--ghost ds-btn--sm" style={{ opacity: 0.4 }}>
            ← {prevText}
          </span>
        )}
      </div>

      <span>
        {currentPage} / {totalPages} {pageText}
      </span>

      <div>
        {nextPage ? (
          <Link href={nextHref} className="ds-btn ds-btn--ghost ds-btn--sm">
            {nextText} →
          </Link>
        ) : (
          <span className="ds-btn ds-btn--ghost ds-btn--sm" style={{ opacity: 0.4 }}>
            {nextText} →
          </span>
        )}
      </div>
    </nav>
  )
}
