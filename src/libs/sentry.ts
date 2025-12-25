/**
 * Sentry関連のユーティリティ関数
 */

import * as Sentry from '@sentry/nextjs'

/**
 * サムネイル画像生成APIのエラーをSentryに報告する
 * @param error - エラーオブジェクト
 * @param contentType - コンテンツタイプ（'events' | 'thoughts' | 'dev-notes'）
 * @param postId - 投稿ID
 */
export function captureThumbnailError(
  error: unknown,
  contentType: 'events' | 'thoughts' | 'dev-notes',
  postId: string,
): void {
  if (error instanceof Error) {
    Sentry.captureException(error, {
      tags: {
        route: 'thumbnail',
        contentType,
      },
      extra: {
        postId,
      },
    })
  }
}
