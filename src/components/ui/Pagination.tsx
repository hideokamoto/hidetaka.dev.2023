import Link from 'next/link'

type PaginationProps = {
  currentPage: number
  totalPages: number
  basePath: string
  lang: string
}

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
  lang,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const prevPage = currentPage > 1 ? currentPage - 1 : null
  const nextPage = currentPage < totalPages ? currentPage + 1 : null

  const prevHref = prevPage === 1 ? basePath : `${basePath}/page/${prevPage}`
  const nextHref = `${basePath}/page/${nextPage}`

  const prevText = lang === 'ja' ? '前へ' : 'Previous'
  const nextText = lang === 'ja' ? '次へ' : 'Next'
  const pageText = lang === 'ja' ? 'ページ' : 'Page'

  return (
    <nav
      className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 px-4 py-3 sm:px-6 mt-12"
      aria-label="Pagination"
    >
      <div className="flex flex-1 justify-between sm:justify-start">
        {prevPage ? (
          <Link
            href={prevHref}
            className="relative inline-flex items-center rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <svg
              className="mr-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
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
          <div className="relative inline-flex items-center rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-400 dark:text-zinc-600 cursor-not-allowed">
            <svg
              className="mr-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
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
        <div>
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            <span className="font-medium">{currentPage}</span>
            <span className="mx-1">/</span>
            <span className="font-medium">{totalPages}</span>
            <span className="ml-1">{pageText}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-1 justify-end">
        {nextPage ? (
          <Link
            href={nextHref}
            className="relative inline-flex items-center rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            {nextText}
            <svg
              className="ml-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        ) : (
          <div className="relative inline-flex items-center rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-400 dark:text-zinc-600 cursor-not-allowed">
            {nextText}
            <svg
              className="ml-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        )}
      </div>
    </nav>
  )
}

