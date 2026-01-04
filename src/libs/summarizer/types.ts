/**
 * Summarizer API の利用可能状態
 * - 'available': すぐに利用可能
 * - 'downloadable': ダウンロード後に利用可能
 * - 'downloading': ダウンロード中
 * - 'unavailable': 利用不可
 */
export type AvailabilityResult = 'available' | 'downloadable' | 'downloading' | 'unavailable'

/**
 * 要約オプション
 */
export type SummarizeOptions = {
  locale: string
  maxLength?: number
  signal?: AbortSignal
}

/**
 * デフォルトの最大文字数
 */
export const DEFAULT_MAX_LENGTH = 10000
