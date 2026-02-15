/**
 * TransformedBlogContent コンポーネント
 *
 * WordPress記事本文内の独立したURLをOGPブログカードに変換するサーバーコンポーネント
 *
 * 機能:
 * - urlDetectorで独立したURLを検出
 * - blogCardTransformerでURLをiframeタグに変換
 * - エラーハンドリング（try-catch）
 * - ログ記録
 *
 * 要件: 3.1, 3.2, 3.3, 3.4, 3.5, 6.1, 6.2, 6.3, 6.5
 */

import type { WPThought } from '@/libs/blogCard'
import { detectIndependentUrls, transformUrlsToBlogCards } from '@/libs/blogCard'

interface TransformedBlogContentProps {
  thought: WPThought
  className?: string
}

/**
 * 変換後のブログコンテンツをレンダリングするサーバーコンポーネント
 *
 * @param thought - WordPress記事オブジェクト
 * @param className - CSSクラス名（オプション）
 * @returns 変換後のHTML本文を含むJSX要素
 */
export default function TransformedBlogContent({
  thought,
  className,
}: TransformedBlogContentProps) {
  let transformedHtml = thought.content.rendered

  try {
    // 1. 独立したURLを検出
    const detectedUrls = detectIndependentUrls(thought.content.rendered)

    // 2. 検出されたURLをブログカードに変換
    if (detectedUrls.length > 0) {
      transformedHtml = transformUrlsToBlogCards(thought.content.rendered, detectedUrls)

      // 変換成功をログに記録
      console.log(
        `[TransformedBlogContent] Successfully transformed ${detectedUrls.length} URL(s) to blog cards`,
        {
          thoughtId: thought.id,
          thoughtSlug: thought.slug,
          detectedUrls,
        },
      )
    }
  } catch (error) {
    // エラーが発生した場合は元のHTMLを使用
    console.error('[TransformedBlogContent] Failed to transform URLs to blog cards', {
      thoughtId: thought.id,
      thoughtSlug: thought.slug,
      error:
        error instanceof Error
          ? {
              message: error.message,
              stack: error.stack,
            }
          : error,
    })

    // 元のHTMLを使用（フォールバック）
    transformedHtml = thought.content.rendered
  }

  return <div className={className} dangerouslySetInnerHTML={{ __html: transformedHtml }} />
}
