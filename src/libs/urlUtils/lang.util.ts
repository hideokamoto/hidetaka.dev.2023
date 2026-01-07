export function getLanguageFromURL(pathname: string) {
  if (pathname.startsWith('/ja/') || pathname === '/ja') {
    return 'ja'
  }
  return 'en'
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

export const changeLanguageURL = (pathname: string, targetLang: 'en' | 'ja' = 'en'): string => {
  const lang = getLanguageFromURL(pathname)
  if (lang === targetLang) return pathname

  if (targetLang === 'en') {
    return pathname.replace(/^\/ja/, '') || '/'
  } else {
    return `/ja${pathname}`
  }
}
export const getPathnameWithLangType = (targetPath: string, lang: string): string => {
  if (/en/.test(lang)) return `/${targetPath}`
  if (/ja/.test(lang)) return `/ja/${targetPath}`
  return `/${lang}/${targetPath}`
}
