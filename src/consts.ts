// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = 'Hidetaka.dev | Hidetaka Okamoto portfolio website'
export const SITE_DESCRIPTION = 'The portfolio website of Hidetaka Okamoto'

/**
 * ISR revalidation periods (in seconds)
 * Note: These values cannot be used directly in page exports due to Next.js
 * static analysis requirements. Use literal values in page files with a
 * comment referencing REVALIDATION_PERIOD.ARCHIVE or REVALIDATION_PERIOD.ARTICLE.
 */
export const REVALIDATION_PERIOD = {
  ARCHIVE: 10800, // 3 hours - for list/archive pages
  ARTICLE: 86400, // 1 day - for individual article pages
} as const
