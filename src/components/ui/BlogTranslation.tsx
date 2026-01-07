'use client'

import { useEffect, useState } from 'react'
import { getActionButtonStyles } from '@/libs/componentStyles.utils'
import type { AvailabilityResult } from '@/libs/translator'
import { checkTranslatorAvailability, createTranslator, translate } from '@/libs/translator'
import { isJapanese } from '@/libs/urlUtils/lang.util'
import { cn } from '@/libs/utils/cn'

type BlogTranslationProps = {
  locale: string
  contentSelector: string
  translatableElementsSelector?: string
  className?: string
}

// i18n対応のUIテキスト
const UI_TEXT = {
  ja: {
    translateButton: '日本語を英語に翻訳（Chromeのみ）',
    cancelButton: 'キャンセル',
    restoreButton: '元に戻す',
    translating: '翻訳中...',
    downloading: 'AIモデルをダウンロード中です。初回のみ時間がかかります。',
    unavailable: 'Chrome（最新版）のBuilt-in AIが必要です。',
    error: '翻訳中にエラーが発生しました。',
    translationNote: '※ この翻訳はブラウザのAI機能を使用しています',
  },
  en: {
    translateButton: 'Translate (Chrome only)',
    cancelButton: 'Cancel',
    restoreButton: 'Restore Original',
    translating: 'Translating...',
    downloading: 'Downloading AI model. This may take a while on first use.',
    unavailable: 'Requires Chrome (latest) built-in AI.',
    error: 'An error occurred during translation.',
    translationNote: '※ This translation is powered by built-in browser AI',
  },
}

export default function BlogTranslation({
  locale,
  contentSelector,
  translatableElementsSelector = 'h1, h2, h3, h4, p, li',
  className = '',
}: BlogTranslationProps) {
  const [availability, setAvailability] = useState<AvailabilityResult>('unavailable')
  const [isTranslating, setIsTranslating] = useState(false)
  const [isTranslated, setIsTranslated] = useState(false)
  const [error, setError] = useState('')
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const [originalTextNodes, setOriginalTextNodes] = useState<Map<Node, string>>(new Map())

  const isJa = isJapanese(locale)
  const text = isJa ? UI_TEXT.ja : UI_TEXT.en

  // 翻訳の方向を決定（日本語ページなら ja→en、英語ページなら en→ja）
  const sourceLanguage = isJa ? 'ja' : 'en'
  const targetLanguage = isJa ? 'en' : 'ja'

  // 機能の利用可能性をチェック
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null
    let cancelled = false

    const checkAvailability = async () => {
      const result = await checkTranslatorAvailability(sourceLanguage, targetLanguage)
      if (cancelled) return

      setAvailability(result)

      // downloading または downloadable の場合、定期的に再チェック
      if (result === 'downloading' || result === 'downloadable') {
        if (!intervalId) {
          intervalId = setInterval(async () => {
            const newResult = await checkTranslatorAvailability(sourceLanguage, targetLanguage)
            if (cancelled) {
              if (intervalId) {
                clearInterval(intervalId)
                intervalId = null
              }
              return
            }

            setAvailability(newResult)

            // available になったらポーリングを停止
            if (newResult === 'available' || newResult === 'unavailable') {
              if (intervalId) {
                clearInterval(intervalId)
                intervalId = null
              }
            }
          }, 2000) // 2秒ごとにチェック（ArticleSummaryと統一）
        }
      }
    }

    checkAvailability()

    return () => {
      cancelled = true
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [sourceLanguage, targetLanguage])

  // メモリリーク対策: コンポーネントのアンマウント時にMapをクリア
  useEffect(() => {
    return () => {
      setOriginalTextNodes(new Map())
    }
  }, [])

  // 開発環境ではデバッグ情報を表示
  if (process.env.NODE_ENV === 'development' && availability === 'unavailable') {
    return (
      <div
        className={cn(
          'mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg',
          className,
        )}
      >
        <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
          ⚠️ Translator API Debug Info
        </p>
        <details className="text-xs text-yellow-700 dark:text-yellow-300">
          <summary className="cursor-pointer mb-2">Debug details</summary>
          <pre className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded overflow-auto">
            {JSON.stringify(
              {
                availability,
                sourceLanguage,
                targetLanguage,
                locale,
                translatorInWindow: typeof window !== 'undefined' && 'Translator' in window,
                userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A',
              },
              null,
              2,
            )}
          </pre>
        </details>
      </div>
    )
  }

  const isExpanded = Boolean(
    availability === 'unavailable' ||
      availability === 'downloading' ||
      isTranslating ||
      isTranslated ||
      error,
  )

  const handleTranslate = async () => {
    if (availability === 'unavailable') {
      return
    }

    setIsTranslating(true)
    setError('')

    const controller = new AbortController()
    setAbortController(controller)

    try {
      // 翻訳対象の要素を取得
      const container = document.querySelector(contentSelector)
      if (!container) {
        throw new Error('Content container not found')
      }

      // 翻訳対象の要素を選択
      const elements = container.querySelectorAll(translatableElementsSelector)

      // 元のテキストノードの内容を保存
      const textNodesMap = new Map<Node, string>()

      // 各要素内のテキストノードを収集
      for (const element of elements) {
        // TreeWalkerを使用してテキストノードのみを取得
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
          acceptNode: (node) => {
            // 空白のみのノードはスキップ
            if (!node.textContent?.trim()) {
              return NodeFilter.FILTER_REJECT
            }
            return NodeFilter.FILTER_ACCEPT
          },
        })

        let node = walker.nextNode()
        while (node) {
          if (node.textContent) {
            textNodesMap.set(node, node.textContent)
          }
          node = walker.nextNode()
        }
      }

      setOriginalTextNodes(textNodesMap)

      // Translator を作成
      const translator = await createTranslator(sourceLanguage, targetLanguage, controller.signal)

      try {
        // 各テキストノードを翻訳
        for (const [node, originalText] of textNodesMap.entries()) {
          if (controller.signal.aborted) {
            break
          }

          const translatedText = await translate(translator, originalText, {
            signal: controller.signal,
          })

          // テキストノードの内容を翻訳結果で置き換え
          node.textContent = translatedText
        }

        setIsTranslated(true)
      } finally {
        translator.destroy()
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          // キャンセルされた場合は元に戻す
          handleRestore()
        } else {
          // 開発環境では詳細なエラーを表示
          const errorMessage =
            process.env.NODE_ENV === 'development' ? `${text.error}: ${err.message}` : text.error
          setError(errorMessage)
          console.error('Translation error:', err)
        }
      } else {
        setError(text.error)
        console.error('Translation error:', err)
      }
    } finally {
      setIsTranslating(false)
      setAbortController(null)
    }
  }

  const handleCancel = () => {
    if (abortController) {
      abortController.abort()
    }
  }

  const handleRestore = () => {
    // 元のテキストノードの内容に戻す
    for (const [node, originalText] of originalTextNodes.entries()) {
      // DOMがまだ接続されているか確認
      if (node.isConnected) {
        node.textContent = originalText
      }
    }
    setIsTranslated(false)
    setError('')
    setOriginalTextNodes(new Map())
  }

  return (
    <div className={cn('w-full', !isExpanded && 'sm:w-auto', isExpanded && 'sm:w-full', className)}>
      {/* 翻訳ボタン */}
      <div className="flex items-center gap-3">
        {!isTranslated && !isTranslating && (
          <button
            type="button"
            onClick={handleTranslate}
            disabled={availability === 'downloading' || availability === 'unavailable'}
            aria-label={text.translateButton}
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
                d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
              />
            </svg>
            {text.translateButton}
          </button>
        )}

        {isTranslating && (
          <button
            type="button"
            onClick={handleCancel}
            aria-label={text.cancelButton}
            className={getActionButtonStyles('danger')}
          >
            {text.cancelButton}
          </button>
        )}

        {isTranslated && (
          <button
            type="button"
            onClick={handleRestore}
            aria-label={text.restoreButton}
            className={getActionButtonStyles('neutral')}
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
                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
              />
            </svg>
            {text.restoreButton}
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
      {isTranslating && (
        <output
          aria-live="polite"
          className="mt-3 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"
        >
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
          {text.translating}
        </output>
      )}

      {/* 翻訳完了メッセージ */}
      {isTranslated && (
        <div className="mt-3 rounded-lg bg-indigo-50 p-4 text-sm text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300">
          {text.translationNote}
        </div>
      )}

      {/* エラーメッセージ */}
      {error && (
        <div className="mt-3 rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  )
}
