/**
 * Translator API の利用可能状態
 * - 'available': すぐに利用可能
 * - 'downloadable': ダウンロード後に利用可能
 * - 'downloading': ダウンロード中
 * - 'unavailable': 利用不可
 */
export type AvailabilityResult = 'available' | 'downloadable' | 'downloading' | 'unavailable'

/**
 * Translator作成オプション
 * BCP-47言語コードを使用
 * 例: 'ja' (日本語), 'en' (英語), 'en-US' (アメリカ英語)
 */
export type TranslatorOptions = {
  sourceLanguage: string
  targetLanguage: string
}

/**
 * 翻訳実行オプション
 */
export type TranslatorTranslateOptions = {
  signal?: AbortSignal
}
