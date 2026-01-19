/**
 * 開発専用Sentryテストページ（日本語版）
 *
 * このページはSentryエラートラッキングのテスト用UIを提供します。
 * 開発モードでのみアクセス可能です。
 */

import SentryTestClient from '@/components/sentry/SentryTestClient.ja'

export default async function TestSentryPage() {
  // 開発モードかどうかを確認
  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            本番環境では利用できません
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            このテストページは開発モードでのみ利用可能です。
          </p>
        </div>
      </div>
    )
  }

  return <SentryTestClient />
}
