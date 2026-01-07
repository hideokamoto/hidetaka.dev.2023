export function getLanguageFromURL(pathname: string) {
  // ja,en,es
  //const langCodeMatch = pathname.match(/\/([a-z]{2}-?[a-z]{0,2})/);
  // ja-JP, en-US
  const langCodeMatch = pathname.match(/^\/(\w{2})-([\w-]{2,})/)
  return langCodeMatch ? langCodeMatch[1] : 'en-US'
}

/**
 * ロケールが日本語かどうかを判定
 * @param locale - ロケール文字列（例: 'ja', 'ja-JP', 'en', 'en-US'）
 * @returns 日本語の場合はtrue、それ以外はfalse
 */
export function isJapanese(locale?: string): boolean {
  if (!locale) return false
  return /^ja/.test(locale)
}

export const changeLanguageURL = (
  pathname: string,
  targetLang: 'en-US' | 'ja-JP' = 'en-US',
): string => {
  // Normalize pathname: trim and ensure it starts with /
  let normalized = pathname.trim()
  if (!normalized) return targetLang === 'en-US' ? '/' : `/${targetLang}/`
  if (!normalized.startsWith('/')) normalized = `/${normalized}`

  const lang = getLanguageFromURL(normalized)
  if (lang === targetLang) return normalized

  if (lang === 'en-US') {
    // Adding language prefix to English URL
    if (normalized === '/') return `/${targetLang}/`
    return `/${targetLang}${normalized}`
  }

  // Removing or replacing existing language prefix
  const replaceTarget = targetLang === 'en-US' ? '' : `/${targetLang}`
  const result = normalized.replace(/^\/(\w{2})-([\w-]{2,})/, replaceTarget)

  // Ensure result always starts with / and handle edge cases
  if (!result || result === '') return '/'
  if (!result.startsWith('/')) return `/${result}`
  return result
}
export const getPathnameWithLangType = (targetPath: string, lang: string): string => {
  if (/en/.test(lang)) return `/${targetPath}`
  if (/ja/.test(lang)) return `/ja-JP/${targetPath}`
  return `/${lang}/${targetPath}`
}
