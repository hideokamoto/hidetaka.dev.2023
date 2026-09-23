import { fetchGold } from './client'
import type { SlidesGold } from './types'

/** slides.json の再検証間隔。/speaking/slides ページの ISR（1時間）に揃える。 */
export const SLIDES_REVALIDATE_SECONDS = 3600

const isRecord = (data: unknown): data is Record<string, unknown> =>
  typeof data === 'object' && data !== null

const isString = (value: unknown): value is string => typeof value === 'string'

const isSlideItem = (data: unknown): boolean =>
  isRecord(data) &&
  isString(data.id) &&
  isString(data.title) &&
  isString(data.url) &&
  isString(data.publishedAt) &&
  isString(data.source) &&
  isString(data.type) &&
  (data.excerpt === undefined || isString(data.excerpt))

/** slides.json（Docswell スライド一覧）の構造ガード。 */
export function isSlidesGold(data: unknown): data is SlidesGold {
  if (!isRecord(data)) return false
  if (!Array.isArray(data.items) || !data.items.every(isSlideItem)) return false
  return true
}

/** slides.json を読む。取得失敗・スキーマ不一致は null。 */
export async function loadSlidesGold(): Promise<SlidesGold | null> {
  return fetchGold('slides.json', {
    revalidate: SLIDES_REVALIDATE_SECONDS,
    validate: isSlidesGold,
  })
}
