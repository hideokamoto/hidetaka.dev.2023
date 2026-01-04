'use client'

import { useEffect, useState } from 'react'
import type { AvailabilityResult } from '@/libs/summarizer'
import { checkSummarizerAvailability, summarizeTextStream } from '@/libs/summarizer'

type ArticleSummaryProps = {
  content: string
  locale: string
  className?: string
}

export default function ArticleSummary({ content, locale, className = '' }: ArticleSummaryProps) {
  const [availability, setAvailability] = useState<AvailabilityResult>('unavailable')
  const [isLoading, setIsLoading] = useState(false)
  const [summary, setSummary] = useState('')
  const [error, setError] = useState('')
  const [abortController, setAbortController] = useState<AbortController | null>(null)

  const isJapanese = locale.startsWith('ja')

  // 機能の利用可能性をチェック
  useEffect(() => {
    checkSummarizerAvailability(locale).then(setAvailability)
  }, [locale])

  // 利用できない場合は何も表示しない
  if (availability === 'unavailable') {
    return null
  }

  const handleSummarize = async () => {
    setIsLoading(true)
    setError('')
    setSummary('')

    const controller = new AbortController()
    setAbortController(controller)

    try {
      // HTMLタグを削除してテキストのみ抽出
      const div = document.createElement('div')
      div.innerHTML = content
      const textContent = div.textContent || div.innerText || ''

      await summarizeTextStream(textContent, { locale, signal: controller.signal }, (chunk) => {
        setSummary(chunk)
      })
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(
          isJapanese
            ? '要約の生成中にエラーが発生しました。'
            : 'An error occurred while generating the summary.',
        )
        console.error('Summarization error:', err)
      }
    } finally {
      setIsLoading(false)
      setAbortController(null)
    }
  }

  const handleCancel = () => {
    if (abortController) {
      abortController.abort()
      setIsLoading(false)
      setAbortController(null)
    }
  }

  const buttonText = isJapanese ? '記事を要約' : 'Summarize Article'
  const cancelText = isJapanese ? 'キャンセル' : 'Cancel'
  const loadingText = isJapanese ? '要約を生成中...' : 'Generating summary...'
  const downloadingText = isJapanese
    ? 'AIモデルをダウンロード中です。初回のみ時間がかかります。'
    : 'Downloading AI model. This may take a while on first use.'

  return (
    <div className={`mb-6 ${className}`}>
      {/* 要約ボタン */}
      <div className="flex items-center gap-3 mb-4">
        {!summary && !isLoading && (
          <button
            type="button"
            onClick={handleSummarize}
            disabled={availability === 'downloadable' || availability === 'downloading'}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-zinc-900"
          >
            <svg
              className="size-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            {buttonText}
          </button>
        )}

        {isLoading && (
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-zinc-900"
          >
            {cancelText}
          </button>
        )}
      </div>

      {/* ダウンロード中の警告 */}
      {(availability === 'downloadable' || availability === 'downloading') && (
        <p className="text-sm text-amber-600 dark:text-amber-400 mb-4">⚠️ {downloadingText}</p>
      )}

      {/* ローディング状態 */}
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
          <svg className="animate-spin size-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {loadingText}
        </div>
      )}

      {/* エラーメッセージ */}
      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {/* 要約結果 */}
      {summary && (
        <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
          <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-3">
            {isJapanese ? '📝 要約' : '📝 Summary'}
          </h3>
          <div className="prose prose-sm dark:prose-invert max-w-none text-indigo-900 dark:text-indigo-100">
            <div className="whitespace-pre-wrap">{summary}</div>
          </div>
        </div>
      )}
    </div>
  )
}
