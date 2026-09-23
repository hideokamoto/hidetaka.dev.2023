import type { SlidesGold } from '@/libs/contentLake/types'

/** Docswell RSS がタイトルに付ける接頭辞。 */
export const SLIDE_TITLE_PREFIX = /^\[スライド\]\s*/

export type SlideEntry = {
  id: string
  title: string
  url: string
  publishedAt: string
  excerpt: string
  sourceName: string
  year: string
}

/** RSS の `[スライド] ` 接頭辞を取り除き、前後の空白を落とす。 */
export function cleanSlideTitle(title: string): string {
  return title.replace(SLIDE_TITLE_PREFIX, '').trim()
}

/**
 * slides.json を表示用エントリに変換する。
 * `type === 'slide'` のみを対象にし、公開日が新しい順に並べる。
 * 日付が壊れている項目は除外する（年グループに置けないため）。
 */
export function toSlideEntries(gold: SlidesGold): SlideEntry[] {
  return gold.items
    .filter((item) => item.type === 'slide')
    .map((item) => {
      const date = new Date(item.publishedAt)
      if (Number.isNaN(date.getTime())) return null
      return {
        id: item.id,
        title: cleanSlideTitle(item.title),
        url: item.url,
        publishedAt: item.publishedAt,
        excerpt: item.excerpt ?? '',
        sourceName: item.dataSource?.name ?? 'Docswell',
        year: String(date.getUTCFullYear()),
      }
    })
    .filter((entry): entry is SlideEntry => entry !== null)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}

/** エントリを年（UTC）ごとにグループ化する。年は新しい順、年内部は新しい順を維持。 */
export function groupSlidesByYear(entries: SlideEntry[]): { year: string; items: SlideEntry[] }[] {
  const groups = new Map<string, SlideEntry[]>()
  for (const entry of entries) {
    const list = groups.get(entry.year)
    if (list) list.push(entry)
    else groups.set(entry.year, [entry])
  }
  return Array.from(groups.entries())
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([year, items]) => ({ year, items }))
}
