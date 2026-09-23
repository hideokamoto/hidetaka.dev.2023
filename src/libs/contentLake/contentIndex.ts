import { fetchGold } from './client'
import type { ContentIndexGold } from './types'

/** index.json の再検証間隔。/writing ページの ISR（1時間）に揃える。 */
export const CONTENT_INDEX_REVALIDATE_SECONDS = 3600

const isRecord = (data: unknown): data is Record<string, unknown> =>
  typeof data === 'object' && data !== null

const isString = (value: unknown): value is string => typeof value === 'string'

const isIndexItem = (data: unknown): boolean =>
  isRecord(data) &&
  isString(data.id) &&
  isString(data.title) &&
  isString(data.url) &&
  isString(data.publishedAt) &&
  isString(data.source) &&
  isString(data.type)

/** index.json（Content Index）の構造ガード。 */
export function isContentIndexGold(data: unknown): data is ContentIndexGold {
  if (!isRecord(data)) return false
  if (!Array.isArray(data.items) || !data.items.every(isIndexItem)) return false
  return true
}

/** index.json を読む。取得失敗・スキーマ不一致は null。 */
export async function loadContentIndexGold(): Promise<ContentIndexGold | null> {
  return fetchGold('index.json', {
    revalidate: CONTENT_INDEX_REVALIDATE_SECONDS,
    validate: isContentIndexGold,
  })
}
