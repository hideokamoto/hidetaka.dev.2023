import MonochromeLink from '@/components/ui/MonochromeLink'
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

const monoStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--text-xs)',
  letterSpacing: 'var(--tracking-wider)',
  textTransform: 'uppercase',
  color: 'var(--color-muted)',
  textDecoration: 'none',
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
      aria-label="Pagination"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 'var(--space-7)',
        borderTop: '1px solid var(--color-line)',
        marginTop: 'var(--space-8)',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        letterSpacing: 'var(--tracking-wider)',
        textTransform: 'uppercase',
        color: 'var(--color-muted)',
      }}
    >
      {prevPage ? (
        <MonochromeLink href={prevHref} style={monoStyle}>
          ← {prevText}
        </MonochromeLink>
      ) : (
        <span style={{ ...monoStyle, opacity: 0.4 }}>← {prevText}</span>
      )}

      <span style={monoStyle}>
        {currentPage} / {totalPages} {pageText}
      </span>

      {nextPage ? (
        <MonochromeLink href={nextHref} style={monoStyle}>
          {nextText} →
        </MonochromeLink>
      ) : (
        <span style={{ ...monoStyle, opacity: 0.4 }}>{nextText} →</span>
      )}
    </nav>
  )
}
