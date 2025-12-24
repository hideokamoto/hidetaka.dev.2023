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
  const lang = getLanguageFromURL(pathname)
  if (lang === targetLang) return pathname
  if (lang === 'en-US') {
    return `/${targetLang}${pathname}`
  }
  const replaceTarget = targetLang === 'en-US' ? '' : `/${targetLang}`
  return pathname.replace(/^\/(\w{2})-([\w-]{2,})/, replaceTarget)
}
export const getPathnameWithLangType = (targetPath: string, lang: string): string => {
  if (/en/.test(lang)) return `/${targetPath}`
  if (/ja/.test(lang)) return `/ja-JP/${targetPath}`
  return `/${lang}/${targetPath}`
}
