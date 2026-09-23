import { fetchGold } from './client'
import type { AboutGold } from './types'

/** 集計は日次生成なので1日ごとの再検証で十分。 */
export const ABOUT_REVALIDATE_SECONDS = 86400

const isRecord = (data: unknown): data is Record<string, unknown> =>
  typeof data === 'object' && data !== null

const isNumber = (value: unknown): value is number => typeof value === 'number'

const isDatedValue = (data: unknown): boolean =>
  isRecord(data) && isNumber(data.value) && typeof data.asOf === 'string'

const isWriting = (data: unknown): boolean => {
  if (data === null) return true
  if (!isRecord(data)) return false
  return (
    isNumber(data.total) &&
    isNumber(data.firstYear) &&
    isNumber(data.yearsActive) &&
    Array.isArray(data.byYear)
  )
}

const isOss = (data: unknown): boolean => {
  if (!isRecord(data)) return false

  const { npm, wordpressOrg } = data

  if (npm !== null) {
    if (!isRecord(npm) || !isDatedValue(npm.packages)) return false
  }

  if (wordpressOrg !== null) {
    if (!isRecord(wordpressOrg)) return false
    if (!isNumber(wordpressOrg.plugins)) return false
    if (!isDatedValue(wordpressOrg.activeInstalls)) return false
    if (!isDatedValue(wordpressOrg.downloads)) return false
  }

  return true
}

/** about.json（schemaVersion 1）の構造ガード。 */
export function isAboutGold(data: unknown): data is AboutGold {
  if (!isRecord(data)) return false
  if (data.schemaVersion !== 1) return false
  if (!isWriting(data.writing)) return false
  if (!isRecord(data.speaking) || !isNumber(data.speaking.reports)) return false
  if (!isOss(data.oss)) return false
  return true
}

/** about.json を読む。取得失敗・スキーマ不一致は null。 */
export async function loadAboutGold(): Promise<AboutGold | null> {
  return fetchGold('about.json', {
    revalidate: ABOUT_REVALIDATE_SECONDS,
    validate: isAboutGold,
  })
}
