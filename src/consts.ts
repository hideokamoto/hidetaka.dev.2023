// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = 'Hidetaka Okamoto | Developer Experience Engineer'
export const SITE_DESCRIPTION = 'Developer Experience Engineer passionate about creating tools and systems that empower developers. Portfolio, blog, and open-source contributions.'
export const SITE_TITLE_JA = '岡本 秀高 | Developer Experience Engineer'
export const SITE_DESCRIPTION_JA = 'デベロッパーエクスペリエンスを専門とするエンジニア。開発者向けツール・システム、ポートフォリオ、ブログ、オープンソースプロジェクト。'

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
