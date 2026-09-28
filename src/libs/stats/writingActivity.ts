import { loadContentIndexGold } from '@/libs/contentLake/contentIndex'
import type { ContentIndexGold, WritingGold, WritingGoldMonthly } from '@/libs/contentLake/types'
import { loadWritingGold } from '@/libs/contentLake/writing'
import { type MonthlyBucket, weeklyStreak } from '@/libs/stats/aggregate'
import { buildYearlySeriesFromMonthly, type YearCount } from '@/libs/stats/yearly'

// 統計の表示窓（直近Nヶ月）。Gold の monthly 全履歴からこの窓だけ切り出す。
export const STATS_WINDOW_MONTHS = 12

/** Gold の bySource キー → 表示名。未知のキーはそのまま表示名として使う。 */
export const GOLD_SOURCE_LABELS: Record<string, string> = {
  wordpress: 'WordPress',
  qiita: 'Qiita',
  zenn: 'Zenn',
  devto: 'Dev.to',
}

/**
 * 全期間の集計から除外する Gold の `source` キー。
 *
 * `writing.json` の `totals.bySource` / `monthly[].bySource` は producer 側
 * （vibes-wp-content-enrichment `WritingBuilder.buildWriting`）で `type: 'article'`
 * のみを対象に作られており、npm パッケージ（`type: 'package'`）は構造的に混ざらない。
 * ただし `ContentSource` 型は `bySource` のキーとして 'npm' を許容しており、
 * 消費側の型 (`Partial<Record<ContentSource, number>>`) だけでは混在を防げないため、
 * 「記事数の累計に npm を混ぜない」という契約を消費側でも防御的に強制する。
 */
const EXCLUDED_ALL_TIME_SOURCES = new Set<string>(['npm'])

export type WritingStreak = { currentWeeks: number; longestWeeks: number }

/** 媒体別の累計件数と、Content Lake がその媒体について保持しているカバレッジ。 */
export type SourceCoverage = {
  /** Gold の source キー（例: 'wordpress'） */
  key: string
  /** 表示名 */
  label: string
  /** 全期間の記事数 */
  count: number
  /**
   * Content Lake がこの媒体について保持している最古の年。
   * その媒体で発信を始めた年ではない（例: Zenn は RSS が直近約20件しか返さないため、
   * 取り込み開始日より前の記事は Lake に存在しない。coverage.zenn より前の年は
   * 「書いていない」ではなく「Lake に無い」）。データが無ければ null。
   */
  sinceYear: number | null
  /**
   * 他の媒体より観測開始年が遅く、より古い記事を欠いている可能性がある媒体か。
   * true の媒体は、累計・年別グラフの早い年で過少に見える可能性がある。
   */
  isPartialCoverage: boolean
}

export type WritingAllTime = {
  /** 全期間の記事数（`writing.json` の `totals.articleCount`） */
  totalArticles: number
  /** 全期間で最古の記事の公開日時。記事が無ければ null */
  firstPublishedAt: string | null
  /** 全期間で最新の記事の公開日時。記事が無ければ null */
  lastPublishedAt: string | null
  /** 記事数の多い順の媒体別内訳 + カバレッジ */
  bySource: SourceCoverage[]
  /** 新しい年が先頭の年別推移（累計・件数） */
  yearly: YearCount[]
}

export type WritingActivity = {
  monthly: MonthlyBucket[]
  total: number
  streak: WritingStreak | null
  sources: string[]
  allTime: WritingAllTime
}

const yearMonthKey = (year: number, month: number): string =>
  `${year}-${String(month).padStart(2, '0')}`

const sourceLabel = (key: string): string => GOLD_SOURCE_LABELS[key] ?? key

/**
 * `bySource`（累計件数）と `coverage`（媒体ごとの最古年）を合成し、
 * 記事数の多い順に並べる。npm は防御的に除外する（EXCLUDED_ALL_TIME_SOURCES 参照）。
 */
export function toSourceCoverage(
  bySource: Record<string, number>,
  coverage: Record<string, number>,
): SourceCoverage[] {
  const years = Object.values(coverage).filter((year): year is number => typeof year === 'number')
  const earliestYear = years.length > 0 ? Math.min(...years) : null

  const keys = Object.keys(bySource)

  const rows: SourceCoverage[] = []
  for (const key of keys) {
    if (EXCLUDED_ALL_TIME_SOURCES.has(key)) continue
    const sinceYear = coverage[key] ?? null
    rows.push({
      key,
      label: sourceLabel(key),
      count: bySource[key] ?? 0,
      sinceYear,
      isPartialCoverage: earliestYear !== null && sinceYear !== null && sinceYear > earliestYear,
    })
  }

  return rows.sort((a, b) => b.count - a.count)
}

/**
 * `writing.json` から全期間統計を組み立てる。
 * `monthly` は producer 側で「記事のない月も 0 で補完した連続系列」であることが
 * 前提（`WritingBuilder.buildMonthly`）。年別合算はその前提の上で `total` を足すだけ。
 */
export function toAllTimeStats(writing: WritingGold): WritingAllTime {
  return {
    totalArticles: writing.totals.articleCount,
    firstPublishedAt: writing.firstPublishedAt,
    lastPublishedAt: writing.lastPublishedAt,
    bySource: toSourceCoverage(writing.totals.bySource, writing.coverage),
    yearly: buildYearlySeriesFromMonthly(writing.monthly),
  }
}

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

  return { monthly, total, streak, sources, allTime: toAllTimeStats(writing) }
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
