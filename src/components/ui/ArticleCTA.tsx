/**
 * ArticleCTA コンポーネント
 *
 * 記事タイプに基づいて適切なCTAパターンを表示します。
 * サーバーコンポーネントとして実装され、パフォーマンスを最適化します。
 */

import { CTA_PATTERNS } from '@/libs/ctaPatterns'
import type { ArticleType, CTAData } from '@/libs/ctaTypes'
import { isValidCTAData, normalizeArticleType, normalizeLang } from '@/libs/ctaValidation'
import CTAButton from './CTAButton'

export interface ArticleCTAProps {
  /** 記事のタイプ（デフォルト: 'general'） */
  articleType?: ArticleType
  /** 表示言語（'ja' または 'en'） */
  lang: 'ja' | 'en'
  /** カスタムCTAデータ（将来のCMS統合用） */
  ctaData?: CTAData
  /** 追加のCSSクラス */
  className?: string
}

/**
 * ArticleCTA コンポーネント
 *
 * 記事コンテンツの後に表示されるコールトゥアクションセクション。
 * 記事タイプと言語に基づいて適切なCTAパターンを選択します。
 *
 * @param props - ArticleCTAProps
 * @returns JSX.Element
 *
 * **Validates: Requirements 1.1, 1.5, 2.1, 2.2, 3.2, 3.5**
 */
export default function ArticleCTA({
  articleType,
  lang,
  ctaData,
  className = '',
}: ArticleCTAProps): JSX.Element {
  // 記事タイプの正規化（無効な値は'general'にフォールバック）
  const normalizedArticleType = normalizeArticleType(articleType)

  // 言語の正規化（無効な値は'en'にフォールバック）
  const normalizedLang = normalizeLang(lang)

  // CTAデータの選択: カスタムデータが有効な場合は優先、そうでなければパターンから選択
  let selectedCTAData: CTAData

  if (ctaData && isValidCTAData(ctaData)) {
    // カスタムCTAデータを使用
    selectedCTAData = ctaData
  } else {
    // ハードコードされたパターンから選択
    const pattern = CTA_PATTERNS[normalizedArticleType]
    selectedCTAData = pattern[normalizedLang]

    // 無効なカスタムデータが提供された場合は警告をログ
    if (ctaData && !isValidCTAData(ctaData)) {
      console.warn('[ArticleCTA] Invalid ctaData provided, falling back to pattern:', {
        articleType: normalizedArticleType,
        lang: normalizedLang,
      })
    }
  }

  return (
    <section
      className={`my-12 rounded-lg border border-gray-200 bg-gray-50 p-8 dark:border-gray-700 dark:bg-gray-800 ${className}`}
      aria-label="Call to action"
    >
      <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
        {selectedCTAData.heading}
      </h2>
      <p className="mb-6 text-gray-700 dark:text-gray-300">{selectedCTAData.description}</p>
      <nav className="flex flex-wrap gap-4" aria-label="CTA actions">
        {selectedCTAData.buttons.map((button) => (
          <CTAButton
            key={`${button.href}-${button.text}`}
            href={button.href}
            variant={button.variant}
          >
            {button.text}
          </CTAButton>
        ))}
      </nav>
    </section>
  )
}
