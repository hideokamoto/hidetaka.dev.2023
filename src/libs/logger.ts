/**
 * ロギングユーティリティ
 * 環境に応じた適切なロギングを提供
 */

import * as Sentry from '@sentry/nextjs'

const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = {
  /**
   * 開発環境でのみログを出力
   * デバッグ情報や詳細な処理ログに使用
   */
  log: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log('[LOG]', ...args)
    }
  },

  /**
   * エラーログを出力（本番環境でも記録）
   * エラー情報は常に記録し、Sentryに自動的に送信
   */
  error: (message: string, context?: Record<string, unknown>) => {
    console.error('[ERROR]', message, context)

    // Sentryにエラーを送信
    if (context?.error instanceof Error) {
      const { error, ...restContext } = context
      Sentry.captureException(error, {
        extra: {
          message,
          ...restContext,
        },
      })
    } else if (context?.error) {
      // Errorインスタンスでない場合はErrorオブジェクトに変換
      const { error: originalError, ...restContext } = context
      const error = new Error(message)
      Sentry.captureException(error, {
        extra: {
          originalError,
          ...restContext,
        },
      })
    } else {
      // エラーオブジェクトがない場合はメッセージのみを送信
      Sentry.captureMessage(message, {
        level: 'error',
        extra: context,
      })
    }
  },

  /**
   * 警告ログを出力（開発環境でのみ）
   * 潜在的な問題や非推奨の使用に使用
   */
  warn: (...args: unknown[]) => {
    if (isDevelopment) {
      console.warn('[WARN]', ...args)
    }
  },
}
