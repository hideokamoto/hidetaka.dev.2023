/**
 * ロギングユーティリティ
 * 環境に応じた適切なロギングを提供
 */

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
   * エラー情報は常に記録し、将来的には外部ロギングサービスに送信可能
   */
  error: (message: string, context?: Record<string, unknown>) => {
    if (context) {
      console.error('[ERROR]', message, context)
    } else {
      console.error('[ERROR]', message)
    }
    // TODO: 将来的には外部ロギングサービス（Sentry等）に送信
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
