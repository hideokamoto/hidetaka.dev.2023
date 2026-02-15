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
 * @returns React element
 *
 * **Validates: Requirements 1.1, 1.5, 2.1, 2.2, 3.2, 3.3, 3.5, 5.1, 5.2, 5.3, 5.4, 5.5, 7.1, 7.2, 7.3, 7.4, 7.5**
 */
export default function ArticleCTA({
  articleType,
  lang,
  ctaData,
  className = '',
}: ArticleCTAProps) {
  // 記事タイプの正規化（無効な値は'general'にフォールバック）
  const normalizedArticleType = normalizeArticleType(articleType)

  // 言語の正規化（無効な値は'en'にフォールバック）
  const normalizedLang = normalizeLang(lang)

  // カスタムCTAデータの検証(一度だけ実行)
  const isCustomDataValid = ctaData && isValidCTAData(ctaData)

  // CTAデータの選択: カスタムデータが有効な場合は優先、そうでなければパターンから選択
  const selectedCTAData: CTAData = isCustomDataValid
    ? ctaData
    : CTA_PATTERNS[normalizedArticleType][normalizedLang]

  // 無効なカスタムデータが提供された場合は警告をログ
  if (ctaData && !isCustomDataValid) {
    console.warn('[ArticleCTA] Invalid ctaData provided, falling back to pattern:', {
      articleType: normalizedArticleType,
      lang: normalizedLang,
    })
  }

  return (
    <section
      className={`my-8 rounded-lg border border-gray-200 bg-gray-50 p-6 shadow-sm transition-shadow hover:shadow-md sm:my-10 sm:p-8 md:my-12 lg:p-10 dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/30 ${className}`}
      aria-label="Call to action"
      role="complementary"
    >
      <h2 className="mb-3 text-xl font-bold leading-tight text-gray-900 sm:mb-4 sm:text-2xl md:text-3xl dark:text-gray-100">
        {selectedCTAData.heading}
      </h2>
      <p className="mb-5 text-base leading-relaxed text-gray-700 sm:mb-6 sm:text-lg md:text-xl dark:text-gray-300">
        {selectedCTAData.description}
      </p>
      <nav
        className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4"
        aria-label="CTA actions"
      >
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
