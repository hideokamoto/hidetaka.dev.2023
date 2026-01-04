import type { AvailabilityResult, SummarizeOptions } from './types'
import { DEFAULT_MAX_LENGTH } from './types'

/**
 * Summarizer を作成する
 * @param locale 言語（'ja' または 'en'）
 */
export async function createSummarizer(locale: string): Promise<Summarizer> {
  if (typeof window === 'undefined') {
    throw new Error('AI API is not available in non-browser environment')
  }

  if (typeof Summarizer === 'undefined') {
    throw new Error('Summarizer API is not available')
  }

  const outputLanguage = locale === 'en' ? 'en' : 'ja'
  const options: SummarizerCreateOptions = {
    type: 'tldr',
    format: 'markdown',
    length: 'medium',
    sharedContext: outputLanguage,
  }

  return await Summarizer.create(options)
}

/**
 * Summarizer APIの利用可能状態を確認する
 * @param locale 記事の言語（言語別の利用可能状態を確認）
 * @returns 'available' | 'downloadable' | 'downloading' | 'unavailable'
 */
export async function checkSummarizerAvailability(locale?: string): Promise<AvailabilityResult> {
  // Feature Detection: Summarizer APIが存在するか
  if (typeof window === 'undefined') {
    return 'unavailable'
  }

  if (typeof Summarizer === 'undefined') {
    return 'unavailable'
  }

  try {
    const outputLanguage = locale === 'en' ? 'en' : 'ja'
    const availability = await Summarizer.availability({
      type: 'tldr',
      format: 'markdown',
      length: 'medium',
      outputLanguage: outputLanguage,
    })

    return availability
  } catch (error) {
    console.error('Summarizer availability check failed:', error)
    return 'unavailable'
  }
}

/**
 * テキストをストリーミングで要約する
 * @param text 要約対象のテキスト
 * @param options 要約オプション
 * @param onChunk チャンク受信時のコールバック（累積テキストを受け取る）
 */
export async function summarizeTextStream(
  text: string,
  options: SummarizeOptions,
  onChunk: (text: string) => void,
): Promise<void> {
  const { locale, maxLength = DEFAULT_MAX_LENGTH, signal } = options

  if (!text.trim()) {
    throw new Error('Text is empty')
  }

  const truncatedText = text.slice(0, maxLength)
  const summarizer = await createSummarizer(locale)

  try {
    const stream = summarizer.summarizeStreaming(truncatedText)
    const reader = stream.getReader()

    try {
      while (true) {
        // キャンセルされた場合は中断
        if (signal?.aborted) {
          await reader.cancel()
          break
        }

        const { done, value } = await reader.read()
        if (done) break

        onChunk(value)
      }
    } finally {
      reader.releaseLock()
    }
  } finally {
    summarizer.destroy()
  }
}

/**
 * テキストを要約する（非ストリーミング）
 * @param text 要約対象のテキスト
 * @param options 要約オプション
 * @returns 要約されたテキスト
 */
export async function summarizeText(text: string, options: SummarizeOptions): Promise<string> {
  const { locale, maxLength = DEFAULT_MAX_LENGTH } = options

  if (!text.trim()) {
    throw new Error('Text is empty')
  }

  const truncatedText = text.slice(0, maxLength)
  const summarizer = await createSummarizer(locale)

  try {
    return await summarizer.summarize(truncatedText)
  } finally {
    summarizer.destroy()
  }
}
