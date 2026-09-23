import { fetchGold } from './client'
import type { WritingGold } from './types'

/** writing.json の再検証間隔。/writing ページの ISR（1時間）に揃える。 */
export const WRITING_REVALIDATE_SECONDS = 3600

const isRecord = (data: unknown): data is Record<string, unknown> =>
  typeof data === 'object' && data !== null

const isNumber = (value: unknown): value is number => typeof value === 'number'

const isMonthlyEntry = (data: unknown): boolean =>
  isRecord(data) &&
  isNumber(data.year) &&
  isNumber(data.month) &&
  isNumber(data.total) &&
  isRecord(data.bySource)

/** writing.json（schemaVersion 1）の構造ガード。 */
export function isWritingGold(data: unknown): data is WritingGold {
  if (!isRecord(data)) return false
  if (data.schemaVersion !== 1) return false
  if (!Array.isArray(data.monthly) || !data.monthly.every(isMonthlyEntry)) return false
  if (!isRecord(data.totals) || !isNumber(data.totals.articleCount)) return false
  return true
}

/** writing.json を読む。取得失敗・スキーマ不一致は null。 */
export async function loadWritingGold(): Promise<WritingGold | null> {
  return fetchGold('writing.json', {
    revalidate: WRITING_REVALIDATE_SECONDS,
    validate: isWritingGold,
  })
}
