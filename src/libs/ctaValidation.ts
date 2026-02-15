/**
 * CTA (Call-to-Action) データのバリデーション関数
 *
 * カスタムCTAデータの検証と、無効な値のフォールバック処理を提供します。
 */

import type { ArticleType, CTAData } from './ctaTypes'

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
        (btn.variant === undefined ||
          btn.variant === null ||
          btn.variant === 'primary' ||
          btn.variant === 'secondary' ||
          btn.variant === 'outline'),
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
  const validTypes: ArticleType[] = ['tutorial', 'essay', 'tool_announcement', 'general']

  if (typeof articleType === 'string' && validTypes.includes(articleType as ArticleType)) {
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
