/**
 * Determine the language code indicated by a URL pathname.
 *
 * @param pathname - The URL pathname to inspect (should start with `/`)
 * @returns `'ja'` if `pathname` starts with `/ja/` or is exactly `/ja`, `'en'` otherwise
 */
export function getLanguageFromURL(pathname: string) {
  const lowerPathname = pathname.toLowerCase()
  if (lowerPathname.startsWith('/ja/') || lowerPathname === '/ja') {
    return 'ja'
  }
  return 'en'
}

/**
 * Determine whether a locale represents Japanese.
 *
 * @param locale - Locale string (e.g., "ja", "ja-JP", "en", "en-US"); optional
 * @returns `true` if `locale` starts with `"ja"`, `false` otherwise
 */
export function isJapanese(locale?: string): boolean {
  if (!locale) return false
  return /^ja/.test(locale)
}

export const changeLanguageURL = (pathname: string, targetLang: 'en' | 'ja' = 'en'): string => {
  if (!pathname.startsWith('/')) {
    throw new Error('pathname must start with /')
  }
  const lang = getLanguageFromURL(pathname)
  if (lang === targetLang) return pathname

  if (targetLang === 'en') {
    return pathname.replace(/^\/ja/i, '') || '/'
  } else {
    return `/ja${pathname}`
  }
}
export const getPathnameWithLangType = (targetPath: string, lang: string): string => {
  if (/en/i.test(lang)) return `/${targetPath}`
  if (/ja/i.test(lang)) return `/ja/${targetPath}`
  return `/${lang}/${targetPath}`
}