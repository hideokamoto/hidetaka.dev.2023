/**
 * URL検出モジュール
 * 
 * WordPress記事本文HTML内の独立したURLを検出します。
 * 独立したURLとは、<p>タグ内に直接記述されたURLのことです。
 * 
 * 除外条件:
 * - リンクタグ(<a href="...">)内のURL
 * - 画像URL(.jpg, .png, .gif, .webp, .svg)
 * - 自サイトURL(hidetaka.dev)
 */

/**
 * HTML文字列から独立したURLを検出する
 * 
 * @param html - 検索対象のHTML文字列
 * @returns 検出されたURLの配列（重複なし）
 * 
 * @example
 * const html = '<p>https://example.com</p><p>https://test.com</p>'
 * const urls = detectIndependentUrls(html)
 * // => ['https://example.com', 'https://test.com']
 */
export function detectIndependentUrls(html: string): string[] {
  // 空文字列の場合は空配列を返す
  if (!html || html.trim() === '') {
    return []
  }

  // <p>タグ内のURLを検出する正規表現
  // <p>タグの開始、URL、<p>タグの終了を検出
  const urlPattern = /<p[^>]*>(https?:\/\/[^\s<]+)<\/p>/gi
  
  // 除外するURLを収集
  const excludedUrls = new Set<string>()
  
  // 1. リンクタグ内のURLを除外
  const linkPattern = /<a[^>]*href=["']([^"']+)["'][^>]*>/gi
  let linkMatch
  while ((linkMatch = linkPattern.exec(html)) !== null) {
    excludedUrls.add(linkMatch[1])
  }
  
  // 2. 画像拡張子を持つURLを除外するパターン
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i
  
  // 3. 自サイトURLを除外するパターン
  const ownSitePattern = /hidetaka\.dev/i
  
  // URLを検出
  const detectedUrls: string[] = []
  let match
  
  while ((match = urlPattern.exec(html)) !== null) {
    const url = match[1]
    
    // 除外条件をチェック
    if (excludedUrls.has(url)) {
      continue // リンクタグ内のURLは除外
    }
    
    if (imageExtensions.test(url)) {
      continue // 画像URLは除外
    }
    
    if (ownSitePattern.test(url)) {
      continue // 自サイトURLは除外
    }
    
    detectedUrls.push(url)
  }
  
  // 重複を除去して返す（reduce + Mapパターン）
  const uniqueUrls = Array.from(
    detectedUrls.reduce((map, url) => {
      map.set(url, url) // 最後の結果で上書き
      return map
    }, new Map<string, string>()).values()
  )
  
  return uniqueUrls
}
