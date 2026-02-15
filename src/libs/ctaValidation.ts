/**
 * CTA (Call-to-Action) データのバリデーション関数
 *
 * カスタムCTAデータの検証と、無効な値のフォールバック処理を提供します。
 */

import type { ArticleType, CTAData } from './ctaTypes'

/**
 * 有効なCTAボタンのバリアント
 */
const VALID_VARIANTS = ['primary', 'secondary', 'outline'] as const

/**
 * 有効な記事タイプ
 */
const VALID_ARTICLE_TYPES: ArticleType[] = ['tutorial', 'essay', 'tool_announcement', 'general']

/**
 * 安全なURLプロトコルの正規表現
 * - http:// または https:// で始まる絶対URL
 * - / で始まる相対パス
 */
const SAFE_URL_PATTERN = /^(https?:\/\/|\/)/

/**
 * CTADataの型ガード関数
 *
 * カスタムCTAデータが有効な構造を持つかを検証します。
 *
 * @param data - 検証対象のデータ
 * @returns データが有効なCTADataの場合true
 *
 * **Validates: Requirements 6.2**
 */
export function isValidCTAData(data: unknown): data is CTAData {
  if (!data || typeof data !== 'object') return false

  const d = data as Partial<CTAData>

  return (
    typeof d.heading === 'string' &&
    d.heading.trim().length > 0 &&
    typeof d.description === 'string' &&
    d.description.trim().length > 0 &&
    Array.isArray(d.buttons) &&
    d.buttons.length > 0 &&
    d.buttons.length <= 3 &&
    d.buttons.every(
      (btn) =>
        btn &&
        typeof btn === 'object' &&
        typeof btn.text === 'string' &&
        btn.text.trim().length > 0 &&
        typeof btn.href === 'string' &&
        btn.href.trim().length > 0 &&
        SAFE_URL_PATTERN.test(btn.href.trim()) &&
        (btn.variant == null || VALID_VARIANTS.includes(btn.variant)),
    )
  )
}

/**
 * 記事タイプの正規化関数
 *
 * 無効な記事タイプを'general'にフォールバックします。
 *
 * @param articleType - 検証対象の記事タイプ
 * @returns 有効な記事タイプ、または'general'
 *
 * **Validates: Requirements 1.5**
 */
export function normalizeArticleType(articleType: unknown): ArticleType {
  if (typeof articleType === 'string' && VALID_ARTICLE_TYPES.includes(articleType as ArticleType)) {
    return articleType as ArticleType
  }

  return 'general'
}

/**
 * 言語コードの正規化関数
 *
 * 無効な言語コードを'en'にフォールバックします。
 *
 * @param lang - 検証対象の言語コード
 * @returns 'ja'または'en'
 */
export function normalizeLang(lang: unknown): 'ja' | 'en' {
  if (lang === 'ja') return 'ja'
  return 'en'
}
