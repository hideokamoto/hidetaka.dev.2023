/**
 * Pagination utility functions
 * Pure functions for pagination logic following Kent Beck's unit testing principles
 */

/**
 * Calculate the previous page number
 * @param currentPage - Current page number (1-indexed)
 * @returns Previous page number or null if on first page
 */
export function calculatePrevPage(currentPage: number): number | null {
  return currentPage > 1 ? currentPage - 1 : null
}

/**
 * Calculate the next page number
 * @param currentPage - Current page number (1-indexed)
 * @param totalPages - Total number of pages
 * @returns Next page number or null if on last page
 */
export function calculateNextPage(currentPage: number, totalPages: number): number | null {
  return currentPage < totalPages ? currentPage + 1 : null
}

/**
 * Generate href for a pagination link
 * @param basePath - Base path for pagination (e.g., '/blog')
 * @param pageNumber - Page number to link to (null means no link)
 * @returns Generated href string, or empty string if pageNumber is null
 */
export function generatePageHref(basePath: string, pageNumber: number | null): string {
  if (pageNumber === null) {
    return ''
  }
  return pageNumber === 1 ? basePath : `${basePath}/page/${pageNumber}`
}

/**
 * Get localized pagination text
 * @param lang - Language code ('ja' or 'en')
 * @param key - Text key ('prev', 'next', or 'page')
 * @returns Localized text string
 */
export function getPaginationText(lang: string, key: 'prev' | 'next' | 'page'): string {
  const texts = {
    ja: {
      prev: '前へ',
      next: '次へ',
      page: 'ページ',
    },
    en: {
      prev: 'Previous',
      next: 'Next',
      page: 'Page',
    },
  }

  const isJapanese = lang.startsWith('ja')
  return isJapanese ? texts.ja[key] : texts.en[key]
}

/**
 * Check if pagination should be shown
 * @param totalPages - Total number of pages
 * @returns true if pagination should be shown (totalPages > 1)
 */
export function shouldShowPagination(totalPages: number): boolean {
  return totalPages > 1
}
