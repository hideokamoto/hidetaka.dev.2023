import { loadContentIndexGold } from '@/libs/contentLake/contentIndex'
import type { ContentIndexGold, WritingGold, WritingGoldMonthly } from '@/libs/contentLake/types'
import { loadWritingGold } from '@/libs/contentLake/writing'
import { type MonthlyBucket, weeklyStreak } from '@/libs/stats/aggregate'

// 統計の表示窓（直近Nヶ月）。Gold の monthly 全履歴からこの窓だけ切り出す。
export const STATS_WINDOW_MONTHS = 12

/** Gold の bySource キー → 表示名。未知のキーはそのまま表示名として使う。 */
export const GOLD_SOURCE_LABELS: Record<string, string> = {
  wordpress: 'WordPress',
  qiita: 'Qiita',
  zenn: 'Zenn',
  devto: 'Dev.to',
}

export type WritingStreak = { currentWeeks: number; longestWeeks: number }

export type WritingActivity = {
  monthly: MonthlyBucket[]
  total: number
  streak: WritingStreak | null
  sources: string[]
}

const yearMonthKey = (year: number, month: number): string =>
  `${year}-${String(month).padStart(2, '0')}`

const sourceLabel = (key: string): string => GOLD_SOURCE_LABELS[key] ?? key

/**
 * Gold の monthly（昇順の全履歴）から直近 `months` ヶ月を切り出し、
 * 窓内にデータが無い月を 0 で埋めて古い→新しい順に返す（チャート用）。
 * bySource のキーは表示名（GOLD_SOURCE_LABELS）に変換する。
 */
export function toMonthlyBuckets(
  monthly: WritingGoldMonthly[],
  months = STATS_WINDOW_MONTHS,
  now: Date = new Date(),
): MonthlyBucket[] {
  const buckets = new Map<string, MonthlyBucket>()
  const order: string[] = []

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1))
    const key = yearMonthKey(d.getUTCFullYear(), d.getUTCMonth() + 1)
    order.push(key)
    buckets.set(key, { yearMonth: key, total: 0, bySource: {} })
  }

  for (const entry of monthly) {
    const bucket = buckets.get(yearMonthKey(entry.year, entry.month))
    if (!bucket) continue // ウィンドウ外
    bucket.total += entry.total
    for (const [key, count] of Object.entries(entry.bySource)) {
      const name = sourceLabel(key)
      bucket.bySource[name] = (bucket.bySource[name] ?? 0) + count
    }
  }

  return order.map((key) => buckets.get(key) as MonthlyBucket)
}

/**
 * writing.json と index.json（任意）から /writing の統計表示データを組み立てる。
 * index が取れなければ streak だけ null（連続投稿カードを出さない）。
 */
export function toWritingActivity(
  writing: WritingGold,
  index: ContentIndexGold | null,
  now: Date = new Date(),
): WritingActivity {
  const monthly = toMonthlyBuckets(writing.monthly, STATS_WINDOW_MONTHS, now)
  const total = monthly.reduce((sum, bucket) => sum + bucket.total, 0)

  const sources: string[] = []
  for (const bucket of monthly) {
    for (const name of Object.keys(bucket.bySource)) {
      if (!sources.includes(name)) sources.push(name)
    }
  }

  const streak = index
    ? weeklyStreak(
        index.items
          .filter((item) => item.type === 'article')
          .map((item) => ({ datetime: item.publishedAt })),
        now,
      )
    : null

  return { monthly, total, streak, sources }
}

/**
 * /writing の「執筆アクティビティ」を Content Lake Gold から読む。
 * writing.json が取れなければ null（セクションごと非表示）。index.json の失敗は許容する。
 */
export async function loadWritingActivity(now: Date = new Date()): Promise<WritingActivity | null> {
  const [writing, index] = await Promise.all([loadWritingGold(), loadContentIndexGold()])
  if (!writing) return null
  return toWritingActivity(writing, index, now)
}
