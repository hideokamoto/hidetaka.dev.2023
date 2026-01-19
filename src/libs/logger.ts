/**
 * ロギングユーティリティ
 * 環境に応じた適切なロギングを提供
 * 本番環境ではSentryにエラーと警告を送信
 */

const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'

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
   * エラー情報は常に記録し、本番環境ではSentryに送信
   *
   * @param message - エラーメッセージ
   * @param context - エラーの追加コンテキスト情報
   *
   * @example
   * logger.error('API request failed', { endpoint: '/api/posts', statusCode: 500 })
   *
   * 動作:
   * - すべての環境: コンソールにエラーを出力
   * - 本番環境のみ: Sentryにエラーを送信（設定されている場合）
   */
  error: (message: string, context?: Record<string, unknown>) => {
    console.error('[ERROR]', message, context)

    // 本番環境でSentryにエラーを送信（ブラウザのみ）
    if (isProduction && typeof window !== 'undefined') {
      // ブラウザ環境のみ：client SDKをインポート
      import('@/libs/sentry/client')
        .then(({ captureException }) => {
          const error = new Error(message)
          const enrichedContext = {
            ...context,
            source: 'logger',
          }
          captureException(error, enrichedContext)
        })
        .catch((sentryError) => {
          console.warn('[Logger] Failed to send error to Sentry:', sentryError)
        })
    }
  },

  /**
   * 警告ログを出力（本番環境でも記録）
   * 潜在的な問題や非推奨の使用に使用
   *
   * @param message - 警告メッセージ
   * @param context - 警告の追加コンテキスト情報
   *
   * @example
   * logger.warn('Deprecated API usage', { api: 'oldMethod', replacement: 'newMethod' })
   *
   * 動作:
   * - すべての環境: コンソールに警告を出力
   * - 本番環境のみ: Sentryに警告メッセージを送信（設定されている場合）
   */
  warn: (message: string, context?: Record<string, unknown>) => {
    console.warn('[WARN]', message, context)

    // 本番環境でSentryに警告を送信（ブラウザのみ）
    if (isProduction && typeof window !== 'undefined') {
      // ブラウザ環境のみ：client SDKをインポート
      import('@/libs/sentry/client')
        .then(({ captureMessage }) => {
          const enrichedContext = {
            ...context,
            source: 'logger',
          }
          captureMessage(message, 'warning', enrichedContext)
        })
        .catch((sentryError) => {
          console.warn('[Logger] Failed to send warning to Sentry:', sentryError)
        })
    }
  },
}
