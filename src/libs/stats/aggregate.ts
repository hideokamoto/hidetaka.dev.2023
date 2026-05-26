// 執筆統計の集計ユーティリティ。
// すべて純粋関数で、UTC 基準で計算するため実行環境のタイムゾーンに依存しない。

export type StatsInput = {
  datetime: string
  dataSource?: { name: string }
}

export type MonthlyBucket = {
  yearMonth: string // "2025-04"
  total: number
  bySource: Record<string, number>
}

const monthKey = (d: Date): string => {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

const parse = (datetime: string): Date | null => {
  const d = new Date(datetime)
  return Number.isNaN(d.getTime()) ? null : d
}

/**
 * 直近 `months` ヶ月（`now` を含む月で終わる）の月別投稿数を返す。
 * 投稿のない月も 0 で埋め、古い→新しいの時系列順で返す（チャート用）。
 */
export function groupByMonth(
  items: readonly StatsInput[],
  months = 36,
  now: Date = new Date(),
): MonthlyBucket[] {
  const buckets = new Map<string, MonthlyBucket>()
  const order: string[] = []

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1))
    const key = monthKey(d)
    order.push(key)
    buckets.set(key, { yearMonth: key, total: 0, bySource: {} })
  }

  for (const item of items) {
    const d = parse(item.datetime)
    if (!d) continue
    const bucket = buckets.get(monthKey(d))
    if (!bucket) continue // ウィンドウ外
    bucket.total++
    const name = item.dataSource?.name ?? 'Unknown'
    bucket.bySource[name] = (bucket.bySource[name] ?? 0) + 1
  }

  return order.map((key) => buckets.get(key) as MonthlyBucket)
}

/** 年別の投稿数を降順（新しい年が先頭）で返す。 */
export function yearlySummary(
  items: readonly StatsInput[],
): Array<{ year: number; count: number }> {
  const counts = new Map<number, number>()
  for (const item of items) {
    const d = parse(item.datetime)
    if (!d) continue
    const y = d.getUTCFullYear()
    counts.set(y, (counts.get(y) ?? 0) + 1)
  }
  return Array.from(counts.entries())
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => b.year - a.year)
}

/** 有効な日付を持つ投稿の累計件数。 */
export function cumulativeTotal(items: readonly StatsInput[]): number {
  return items.reduce((acc, item) => (parse(item.datetime) ? acc + 1 : acc), 0)
}

/** 最も古い投稿日時を返す。投稿がなければ null。 */
export function earliestDate(items: readonly StatsInput[]): Date | null {
  let min: number | null = null
  for (const item of items) {
    const d = parse(item.datetime)
    if (!d) continue
    const t = d.getTime()
    if (min === null || t < min) min = t
  }
  return min === null ? null : new Date(min)
}

// ISO 週（月曜始まり）の連番インデックス。連続する週はちょうど 1 違いになる。
const isoWeekIndex = (d: Date): number => {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
  const dayNum = (date.getUTCDay() + 6) % 7 // 月=0 ... 日=6
  date.setUTCDate(date.getUTCDate() - dayNum) // その週の月曜へ
  return Math.floor(date.getTime() / (7 * 24 * 60 * 60 * 1000))
}

/**
 * 週次の連続投稿記録を返す。
 * - currentWeeks: 現在まで継続中の連続週数。今週が未投稿でも先週投稿していれば「継続中」とみなす（週の途中の猶予）。
 * - longestWeeks: 全期間での最長連続週数。
 */
export function weeklyStreak(
  items: readonly StatsInput[],
  now: Date = new Date(),
): { currentWeeks: number; longestWeeks: number } {
  const weeks = new Set<number>()
  for (const item of items) {
    const d = parse(item.datetime)
    if (!d) continue
    weeks.add(isoWeekIndex(d))
  }

  if (weeks.size === 0) {
    return { currentWeeks: 0, longestWeeks: 0 }
  }

  // 最長連続週
  const sorted = Array.from(weeks).sort((a, b) => a - b)
  let longest = 1
  let run = 1
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === sorted[i - 1] + 1) {
      run++
    } else {
      run = 1
    }
    if (run > longest) longest = run
  }

  // 現在の連続週（今週、なければ先週を起点に遡る）
  const currentWeek = isoWeekIndex(now)
  let anchor: number | null = null
  if (weeks.has(currentWeek)) anchor = currentWeek
  else if (weeks.has(currentWeek - 1)) anchor = currentWeek - 1

  let current = 0
  if (anchor !== null) {
    let w = anchor
    while (weeks.has(w)) {
      current++
      w--
    }
  }

  return { currentWeeks: current, longestWeeks: longest }
}
