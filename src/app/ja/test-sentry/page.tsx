/**
 * 開発専用Sentryテストページ（日本語版）
 *
 * このページはSentryエラートラッキングのテスト用UIを提供します。
 * 開発モードでのみアクセス可能です。
 */

import type { Metadata } from 'next'
import SentryTestClient from '@/components/sentry/SentryTestClient.ja'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function TestSentryPage() {
  // 開発モードかどうかを確認
  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--rvt-fg)' }}>
            本番環境では利用できません
          </h1>
          <p style={{ color: 'var(--rvt-fg2)' }}>
            このテストページは開発モードでのみ利用可能です。
          </p>
        </div>
      </div>
    )
  }

  return <SentryTestClient />
}
