/**
 * ブログカード変換モジュール
 *
 * 検出されたURLをiframeベースのブログカードに変換します。
 * OGP Serviceを使用してブログカードを表示します。
 *
 * 変換仕様:
 * - URLをencodeURIComponentでエスケープ
 * - loading="lazy"属性で遅延読み込みを有効化
 * - OGP Serviceのエンドポイント: https://ogp-metadata-service-production.wp-kyoto.workers.dev/card?url={encodedUrl}
 */

/**
 * OGP Serviceのベースエンドポイント
 */
const OGP_SERVICE_ENDPOINT = 'https://ogp-metadata-service-production.wp-kyoto.workers.dev/card'

/**
 * HTML文字列内のURLをブログカードiframeに変換する
 *
 * @param html - 変換対象のHTML文字列
 * @param urls - 変換するURLの配列
 * @returns 変換後のHTML文字列
 *
 * @example
 * const html = '<p>https://example.com</p>'
 * const urls = ['https://example.com']
 * const transformed = transformUrlsToBlogCards(html, urls)
 * // => '<iframe src="https://ogp-metadata-service-production.wp-kyoto.workers.dev/card?url=https%3A%2F%2Fexample.com" ...></iframe>'
 */
export function transformUrlsToBlogCards(html: string, urls: string[]): string {
  // 空文字列または空配列の場合は元のHTMLを返す
  if (!html || urls.length === 0) {
    return html
  }

  let transformedHtml = html

  // 各URLをiframeタグに変換
  for (const url of urls) {
    try {
      // URLの妥当性を検証
      if (!isValidUrl(url)) {
        console.warn(`Skipping invalid URL: ${url}`)
        continue
      }

      // URLをエスケープ（encodeURIComponent）
      const encodedUrl = encodeURIComponent(url)

      // OGP Serviceのエンドポイントを構築
      const iframeSrc = `${OGP_SERVICE_ENDPOINT}?url=${encodedUrl}`

      // iframeタグを生成
      const iframeTag = `<iframe src="${iframeSrc}" width="100%" height="155" frameborder="0" loading="lazy" style="border: 1px solid #e5e7eb; border-radius: 0.5rem; margin: 1rem 0;"></iframe>`

      // 元のURL文字列を含む<p>タグをiframeタグに置換
      // <p>タグの属性も考慮した正規表現パターン
      const urlPattern = new RegExp(`<p[^>]*>${escapeRegExp(url)}</p>`, 'gi')
      transformedHtml = transformedHtml.replace(urlPattern, iframeTag)
    } catch (error) {
      // エラーが発生した場合はそのURLをスキップ
      console.warn(`Failed to transform URL: ${url}`, error)
    }
  }

  return transformedHtml
}

/**
 * 正規表現の特殊文字をエスケープする
 *
 * @param str - エスケープする文字列
 * @returns エスケープされた文字列
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * URLの妥当性を検証する
 *
 * @param url - 検証するURL文字列
 * @returns URLが有効な場合はtrue、無効な場合はfalse
 */
function isValidUrl(url: string): boolean {
  // 空文字列または空白のみの場合は無効
  if (!url || url.trim() === '') {
    return false
  }

  // http:// または https:// で始まることを確認
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return false
  }

  // 空白文字（スペース、タブ、改行など）が含まれている場合は無効
  if (/\s/.test(url)) {
    return false
  }

  // 制御文字（改行、タブなど）が含まれている場合は無効
  if (/[\n\r\t\0]/.test(url)) {
    return false
  }

  // URL構文の基本的な検証
  try {
    const urlObj = new URL(url)
    // ホスト名が存在することを確認
    if (!urlObj.hostname || urlObj.hostname.trim() === '') {
      return false
    }
    return true
  } catch {
    // URL構文が不正な場合は無効
    return false
  }
}
