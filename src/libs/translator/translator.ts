import type { AvailabilityResult, TranslatorTranslateOptions } from './types'

/**
 * Translator API が利用可能かチェックする
 * @returns true if available, false otherwise
 */
export function isTranslatorAvailable(): boolean {
  return typeof window !== 'undefined' && 'Translator' in window
}

/**
 * Translator APIの利用可能状態を確認する
 * @param sourceLanguage 翻訳元の言語 (BCP-47)
 * @param targetLanguage 翻訳先の言語 (BCP-47)
 * @returns 'available' | 'downloadable' | 'downloading' | 'unavailable'
 */
export async function checkTranslatorAvailability(
  sourceLanguage: string,
  targetLanguage: string,
): Promise<AvailabilityResult> {
  // Feature Detection: Translator APIが存在するか
  if (!isTranslatorAvailable()) {
    return 'unavailable'
  }

  try {
    const availability = await window.Translator.availability({
      sourceLanguage,
      targetLanguage,
    })

    return availability as AvailabilityResult
  } catch (error) {
    console.error('Translator availability check failed:', error)
    return 'unavailable'
  }
}

/**
 * Translator を作成する
 * @param sourceLanguage 翻訳元の言語 (BCP-47)
 * @param targetLanguage 翻訳先の言語 (BCP-47)
 * @param signal オプションのAbortSignal
 * @returns Translator インスタンス
 * @throws NotAllowedError - パーミッションが拒否された場合
 * @throws QuotaExceededError - 翻訳クォータを超過した場合
 */
export async function createTranslator(
  sourceLanguage: string,
  targetLanguage: string,
  signal?: AbortSignal,
): Promise<Translator> {
  if (!isTranslatorAvailable()) {
    throw new Error('Translator API is not available')
  }

  const options: TranslatorCreateOptions = {
    sourceLanguage,
    targetLanguage,
  }

  if (signal) {
    options.signal = signal
  }

  try {
    return await window.Translator.create(options)
  } catch (error) {
    // エラーハンドリング
    if (error instanceof Error) {
      if (error.name === 'NotAllowedError') {
        throw new Error('Translation permission denied. Check Permissions-Policy header.')
      }
      if (error.name === 'QuotaExceededError') {
        throw new Error('Translation quota exceeded. Please try again later.')
      }
      if (error.name === 'AbortError') {
        throw error // AbortErrorはそのまま再スロー
      }
    }
    throw error
  }
}

/**
 * テキストを翻訳する
 * @param translator Translator インスタンス
 * @param text 翻訳対象のテキスト
 * @param options 翻訳オプション (signal)
 * @returns 翻訳されたテキスト
 * @throws AbortError - 翻訳がキャンセルされた場合
 * @throws Error - その他のエラー
 */
export async function translate(
  translator: Translator,
  text: string,
  options?: TranslatorTranslateOptions,
): Promise<string> {
  if (!text.trim()) {
    return ''
  }

  // Re-throw the error. The caller is expected to handle it.
  // `AbortError` is handled in the UI component.
  const result = await translator.translate(text, options)
  return result
}
