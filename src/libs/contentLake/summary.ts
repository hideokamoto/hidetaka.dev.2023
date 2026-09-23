import { fetchGold } from './client'
import type { SummaryGold } from './types'

/** summary.json は日次生成なので1日ごとの再検証で十分（about.json と同じ）。 */
export const SUMMARY_REVALIDATE_SECONDS = 86400

const isRecord = (data: unknown): data is Record<string, unknown> =>
  typeof data === 'object' && data !== null

const isNumber = (value: unknown): value is number => typeof value === 'number'

const isString = (value: unknown): value is string => typeof value === 'string'

const isMetricPoint = (data: unknown): boolean =>
  isRecord(data) && isString(data.date) && isNumber(data.value)

const isOssReachMetric = (data: unknown): boolean =>
  isRecord(data) &&
  isString(data.metricId) &&
  isMetricPoint(data.latest) &&
  Array.isArray(data.series) &&
  data.series.every(isMetricPoint)

/** summary.json（schemaVersion 2）の構造ガード。消費する ossReach を厳密に検査する。 */
export function isSummaryGold(data: unknown): data is SummaryGold {
  if (!isRecord(data)) return false
  if (data.schemaVersion !== 2) return false
  if (!isRecord(data.articles) || !isNumber(data.articles.total)) return false
  if (!isRecord(data.events) || !isNumber(data.events.total)) return false
  if (!isRecord(data.ossReach)) return false
  return Object.values(data.ossReach).every(isOssReachMetric)
}

/** summary.json を読む。取得失敗・スキーマ不一致は null。 */
export async function loadSummaryGold(): Promise<SummaryGold | null> {
  return fetchGold('summary.json', {
    revalidate: SUMMARY_REVALIDATE_SECONDS,
    validate: isSummaryGold,
  })
}
