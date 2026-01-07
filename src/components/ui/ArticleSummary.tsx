'use client'

import { useEffect, useState } from 'react'
import { getActionButtonStyles } from '@/libs/componentStyles.utils'
import type { AvailabilityResult } from '@/libs/summarizer'
import { checkSummarizerAvailability, summarizeTextStream } from '@/libs/summarizer'
import { cn } from '@/libs/utils/cn'

type ArticleSummaryProps = {
  content: string
  locale: string
  className?: string
}

// i18n対応のUIテキスト
const UI_TEXT = {
  ja: {
    button: '記事を要約（Chromeのみ）',
    cancel: 'キャンセル',
    loading: '要約を生成中...',
    downloading: 'AIモデルをダウンロード中です。初回のみ時間がかかります。',
    unavailable: 'Chrome（最新版）のBuilt-in AIが必要です。',
    error: '要約の生成中にエラーが発生しました。',
    summaryTitle: '📝 要約',
  },
  en: {
    button: 'Summarize (Chrome only)',
    cancel: 'Cancel',
    loading: 'Generating summary...',
    downloading: 'Downloading AI model. This may take a while on first use.',
    unavailable: 'Requires Chrome (latest) built-in AI.',
    error: 'An error occurred while generating the summary.',
    summaryTitle: '📝 Summary',
  },
}

export default function ArticleSummary({ content, locale, className = '' }: ArticleSummaryProps) {
  const [availability, setAvailability] = useState<AvailabilityResult>('unavailable')
  const [isLoading, setIsLoading] = useState(false)
  const [summary, setSummary] = useState('')
  const [error, setError] = useState('')
  const [abortController, setAbortController] = useState<AbortController | null>(null)

  const isJapanese = locale.startsWith('ja')
  const text = isJapanese ? UI_TEXT.ja : UI_TEXT.en

  // 機能の利用可能性をチェック
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null
    let isMounted = true

    const checkAvailability = async () => {
      const result = await checkSummarizerAvailability(locale)
      if (isMounted) {
        setAvailability(result)
      }

      // downloading または downloadable の場合、定期的に再チェック
      if (result === 'downloading' || result === 'downloadable') {
        if (!intervalId) {
          intervalId = setInterval(async () => {
            const newResult = await checkSummarizerAvailability(locale)
            if (isMounted) {
              setAvailability(newResult)
            }

            // available になったらポーリングを停止
            if (newResult === 'available' || newResult === 'unavailable') {
              if (intervalId) {
                clearInterval(intervalId)
                intervalId = null
              }
            }
          }, 2000) // 2秒ごとにチェック
        }
      }
    }

    checkAvailability()

    return () => {
      isMounted = false
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [locale])

  // 利用できない場合は何も表示しない
  const isExpanded = Boolean(
    availability === 'unavailable' ||
      availability === 'downloading' ||
      isLoading ||
      error ||
      summary,
  )

  const handleSummarize = async () => {
    if (availability === 'unavailable') {
      return
    }

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
        setError(text.error)
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
    }
  }

  return (
    <div className={cn('w-full', !isExpanded && 'sm:w-auto', isExpanded && 'sm:w-full', className)}>
      {/* 要約ボタン */}
      <div className="flex items-center gap-3">
        {!summary && !isLoading && (
          <button
            type="button"
            onClick={handleSummarize}
            disabled={availability === 'downloading' || availability === 'unavailable'}
            aria-label={text.button}
            className={getActionButtonStyles('primary')}
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
            {text.button}
          </button>
        )}

        {isLoading && (
          <button
            type="button"
            onClick={handleCancel}
            aria-label={text.cancel}
            className={getActionButtonStyles('danger')}
          >
            {text.cancel}
          </button>
        )}
      </div>

      {/* 利用できない場合の注記 */}
      {availability === 'unavailable' && (
        <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">{text.unavailable}</p>
      )}

      {/* ダウンロード中の警告 */}
      {availability === 'downloading' && (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">⚠️ {text.downloading}</p>
      )}

      {/* ローディング状態 */}
      {isLoading && (
        <div className="mt-3 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
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
          {text.loading}
        </div>
      )}

      {/* エラーメッセージ */}
      {error && (
        <div className="mt-3 rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* 要約結果 */}
      {summary && (
        <div className="mt-3 rounded-lg border border-indigo-200 bg-indigo-50 p-6 dark:border-indigo-800 dark:bg-indigo-900/20">
          <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-3">
            {text.summaryTitle}
          </h3>
          <div className="prose prose-sm dark:prose-invert max-w-none text-indigo-900 dark:text-indigo-100">
            <div className="whitespace-pre-wrap">{summary}</div>
          </div>
        </div>
      )}
    </div>
  )
}
