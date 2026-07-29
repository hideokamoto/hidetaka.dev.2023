/**
 * Sentry テストクライアントコンポーネント（日本語版）
 *
 * Sentryエラートラッキングの対話型テストUIを提供するクライアントコンポーネントです。
 * test-sentryページの日本語版で使用されます。
 */

'use client'

import { useState } from 'react'

export default function SentryTestClient() {
  const [lastResult, setLastResult] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const testBrowserError = () => {
    setLastResult('ブラウザエラーをトリガー中...')
    throw new Error('Sentry検証ページからのテストブラウザエラー')
  }

  const testBrowserLogger = () => {
    setLastResult('ロガー経由でブラウザエラーをログ中...')
    import('@/libs/logger')
      .then(({ logger }) => {
        logger.error('ロガー経由のテストブラウザエラー', {
          testType: 'browser-logger-error',
          page: '/ja/test-sentry',
          timestamp: new Date().toISOString(),
        })
        setLastResult(
          'ブラウザエラーが正常にログされました！コンソールとSentryを確認してください。',
        )
      })
      .catch((error) => {
        setLastResult(`ブラウザエラーのログに失敗しました: ${error.message}`)
      })
  }

  const testBrowserWarning = () => {
    setLastResult('ロガー経由でブラウザ警告をログ中...')
    import('@/libs/logger')
      .then(({ logger }) => {
        logger.warn('ロガー経由のテストブラウザ警告', {
          testType: 'browser-logger-warning',
          page: '/ja/test-sentry',
          timestamp: new Date().toISOString(),
        })
        setLastResult('ブラウザ警告が正常にログされました！コンソールとSentryを確認してください。')
      })
      .catch((error) => {
        setLastResult(`ブラウザ警告のログに失敗しました: ${error.message}`)
      })
  }

  const testServerError = async () => {
    setIsLoading(true)
    setLastResult('サーバーエラーリクエストを送信中...')

    try {
      const response = await fetch('/api/test-sentry?type=error')
      const data = await response.json()
      setLastResult(`サーバーレスポンス: ${data.message}`)
    } catch (error) {
      setLastResult(
        `リクエストが失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`,
      )
    } finally {
      setIsLoading(false)
    }
  }

  const testServerWarning = async () => {
    setIsLoading(true)
    setLastResult('サーバー警告リクエストを送信中...')

    try {
      const response = await fetch('/api/test-sentry?type=warning')
      const data = await response.json()
      setLastResult(`サーバーレスポンス: ${data.message}`)
    } catch (error) {
      setLastResult(
        `リクエストが失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`,
      )
    } finally {
      setIsLoading(false)
    }
  }

  const testServerException = async () => {
    setIsLoading(true)
    setLastResult('サーバー例外をトリガー中...')

    try {
      await fetch('/api/test-sentry?type=exception')
      setLastResult('サーバー例外がトリガーされました')
    } catch (error) {
      setLastResult(
        `サーバー例外がキャプチャされました: ${error instanceof Error ? error.message : '不明なエラー'}`,
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-dvh py-12 px-4" style={{ background: 'var(--rvt-bg)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="rounded-lg shadow-lg p-8" style={{ background: 'var(--rvt-bg2)' }}>
          <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--rvt-fg)' }}>
            Sentryエラートラッキングテスト
          </h1>

          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>開発モード専用:</strong>{' '}
              このページはSentry統合のテスト用です。下のボタンをクリックしてテストエラーをトリガーし、Sentryダッシュボードに表示されることを確認してください。
            </p>
          </div>

          <div className="space-y-8">
            {/* ブラウザエラーテスト */}
            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--rvt-fg)' }}>
                ブラウザエラーテスト
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={testBrowserError}
                  className="px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
                >
                  ブラウザエラーをスロー
                </button>
                <button
                  type="button"
                  onClick={testBrowserLogger}
                  className="px-4 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors shadow-md hover:shadow-lg"
                >
                  ブラウザエラーをログ
                </button>
                <button
                  type="button"
                  onClick={testBrowserWarning}
                  className="px-4 py-3 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 transition-colors shadow-md hover:shadow-lg"
                >
                  ブラウザ警告をログ
                </button>
              </div>
            </section>

            {/* サーバーエラーテスト */}
            <section>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--rvt-fg)' }}>
                サーバーエラーテスト
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={testServerError}
                  disabled={isLoading}
                  className="px-4 py-3 bg-yamabuki-600 text-white font-semibold rounded-lg hover:bg-yamabuki-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? '読み込み中...' : 'サーバーエラーをログ'}
                </button>
                <button
                  type="button"
                  onClick={testServerWarning}
                  disabled={isLoading}
                  className="px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? '読み込み中...' : 'サーバー警告をログ'}
                </button>
                <button
                  type="button"
                  onClick={testServerException}
                  disabled={isLoading}
                  className="px-4 py-3 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? '読み込み中...' : 'サーバー例外をスロー'}
                </button>
              </div>
            </section>

            {/* 結果表示 */}
            {lastResult && (
              <section>
                <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--rvt-fg)' }}>
                  最後の結果
                </h2>
                <div className="p-4 rounded-lg" style={{ background: 'var(--rvt-bg3)' }}>
                  <p className="font-mono text-sm" style={{ color: 'var(--rvt-fg)' }}>
                    {lastResult}
                  </p>
                </div>
              </section>
            )}

            {/* 検証手順 */}
            <section className="border-t pt-6" style={{ borderColor: 'var(--rvt-border)' }}>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--rvt-fg)' }}>
                検証手順
              </h2>
              <ol
                className="list-decimal list-inside space-y-2"
                style={{ color: 'var(--rvt-fg2)' }}
              >
                <li>.env.localファイルにNEXT_PUBLIC_SENTRY_DSNを設定してください</li>
                <li>開発モードで実行していることを確認してください（npm run dev）</li>
                <li>上記のテストボタンをクリックしてください</li>
                <li>
                  ブラウザコンソールでエラーログを確認してください（開発モードではすべてのモードでコンソールログが表示されます）
                </li>
                <li>
                  本番モードでは、キャプチャされたエラーがSentryダッシュボードに表示されることを確認してください（
                  <a
                    href="https://sentry.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline"
                    style={{ color: 'var(--rvt-accent)' }}
                  >
                    sentry.io
                  </a>
                  ）
                </li>
                <li>
                  エラーコンテキストにsource:
                  'logger'タグとカスタムコンテキストデータが含まれていることを確認してください
                </li>
              </ol>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
