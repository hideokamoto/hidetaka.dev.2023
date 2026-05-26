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

/** 有効な日付を持つ投稿の件数。 */
export function cumulativeTotal(items: readonly StatsInput[]): number {
  return items.reduce((acc, item) => (parse(item.datetime) ? acc + 1 : acc), 0)
}

const dayKey = (d: Date): string => {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const utcMidnight = (d: Date): Date =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))

export type ActivityLevel = 0 | 1 | 2 | 3 | 4

export type WeekCell = {
  weekStart: string // "YYYY-MM-DD" (Sunday UTC)
  weekEnd: string // "YYYY-MM-DD" (Saturday UTC)
  count: number
  level: ActivityLevel
  isFuture: boolean
}

/** @deprecated Use WeekCell */
export type CalendarCell = WeekCell

/** 最大投稿数に対する比率で GitHub 風の 5 段階レベルを返す。 */
export function activityLevel(count: number, maxCount: number): ActivityLevel {
  if (count <= 0 || maxCount <= 0) return 0
  const ratio = count / maxCount
  if (ratio <= 0.25) return 1
  if (ratio <= 0.5) return 2
  if (ratio <= 0.75) return 3
  return 4
}

const weekStartDate = (d: Date): Date => {
  const date = utcMidnight(d)
  date.setUTCDate(date.getUTCDate() - date.getUTCDay())
  return date
}

const weekStartKey = (d: Date): string => dayKey(weekStartDate(d))

const countPostsByWeek = (items: readonly StatsInput[], today: Date): Map<string, number> => {
  const counts = new Map<string, number>()
  for (const item of items) {
    const d = parse(item.datetime)
    if (!d || utcMidnight(d) > today) continue
    const key = weekStartKey(d)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return counts
}

const maxMapValue = (counts: Map<string, number>): number => {
  let maxCount = 0
  for (const count of counts.values()) {
    if (count > maxCount) maxCount = count
  }
  return maxCount
}

const weekCell = (
  weekStart: Date,
  today: Date,
  counts: Map<string, number>,
  maxCount: number,
): WeekCell => {
  const isFuture = weekStart > today
  const weekEnd = new Date(weekStart)
  weekEnd.setUTCDate(weekStart.getUTCDate() + 6)
  const count = isFuture ? 0 : (counts.get(dayKey(weekStart)) ?? 0)
  return {
    weekStart: dayKey(weekStart),
    weekEnd: dayKey(weekEnd),
    count,
    level: isFuture ? 0 : activityLevel(count, maxCount),
    isFuture,
  }
}

/**
 * GitHub の草風カレンダー用データ。1 マス = 1 週（日曜始まり）の投稿数。
 */
export function buildActivityCalendar(
  items: readonly StatsInput[],
  weeks = 53,
  now: Date = new Date(),
): { weeks: WeekCell[]; maxCount: number } {
  const today = utcMidnight(now)
  const counts = countPostsByWeek(items, today)
  const maxCount = maxMapValue(counts)

  const lastWeekStart = weekStartDate(today)
  const gridStart = new Date(lastWeekStart)
  gridStart.setUTCDate(lastWeekStart.getUTCDate() - (weeks - 1) * 7)

  const result: WeekCell[] = []
  for (let w = 0; w < weeks; w++) {
    const weekStart = new Date(gridStart)
    weekStart.setUTCDate(gridStart.getUTCDate() + w * 7)
    result.push(weekCell(weekStart, today, counts, maxCount))
  }

  return { weeks: result, maxCount }
}

/** 週カレンダーのうち、月ラベルを表示する位置を返す。 */
export function calendarMonthLabels(
  weeks: readonly WeekCell[],
  lang: string,
): { weekIndex: number; label: string }[] {
  const isJa = lang.startsWith('ja')
  const monthFormatter = new Intl.DateTimeFormat(isJa ? 'ja-JP' : 'en-US', {
    month: 'short',
    timeZone: 'UTC',
  })
  const seenMonths = new Set<string>()
  const labels: { weekIndex: number; label: string }[] = []

  for (let w = 0; w < weeks.length; w++) {
    const cell = weeks[w]
    if (cell.isFuture) continue
    const monthId = cell.weekStart.slice(0, 7)
    if (cell.weekStart.endsWith('-01') || !seenMonths.has(monthId)) {
      if (!seenMonths.has(monthId)) {
        seenMonths.add(monthId)
        const label = monthFormatter.format(new Date(`${cell.weekStart}T12:00:00Z`))
        labels.push({ weekIndex: w, label })
      }
    }
  }

  return labels
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

// エポック起点の 7 日バケット。最長記録の算出に使う（now に依存しない）。
const rollingBucket = (d: Date): number => Math.floor(d.getTime() / WEEK_MS)

// `now` から見たローリング 7 日区間。0 = 直近 7 日、1 = 7〜14 日前、…
const rollingPeriodFromNow = (d: Date, now: Date): number => {
  const diffMs = now.getTime() - d.getTime()
  if (diffMs < 0) return -1
  return Math.floor(diffMs / WEEK_MS)
}

/**
 * 週次の連続投稿記録を返す（ローリング 7 日区間ベース）。
 * - currentWeeks: 現在まで継続中の連続週数。直近 7 日が空でも 7〜14 日前に投稿があれば「継続中」とみなす。
 * - longestWeeks: 全期間での最長連続週数（7 日バケットの連続）。
 */
export function weeklyStreak(
  items: readonly StatsInput[],
  now: Date = new Date(),
): { currentWeeks: number; longestWeeks: number } {
  const buckets = new Set<number>()
  const periodsFromNow = new Set<number>()

  for (const item of items) {
    const d = parse(item.datetime)
    if (!d) continue
    buckets.add(rollingBucket(d))
    const period = rollingPeriodFromNow(d, now)
    if (period >= 0) periodsFromNow.add(period)
  }

  if (buckets.size === 0) {
    return { currentWeeks: 0, longestWeeks: 0 }
  }

  // 最長連続週（エポック起点バケットの連続）
  const sortedBuckets = Array.from(buckets).sort((a, b) => a - b)
  let longest = 1
  let run = 1
  for (let i = 1; i < sortedBuckets.length; i++) {
    if (sortedBuckets[i] === sortedBuckets[i - 1] + 1) {
      run++
    } else {
      run = 1
    }
    if (run > longest) longest = run
  }

  // 現在の連続週（直近 7 日、なければ 7〜14 日前を起点に遡る）
  let anchor: number | null = null
  if (periodsFromNow.has(0)) anchor = 0
  else if (periodsFromNow.has(1)) anchor = 1

  let current = 0
  if (anchor !== null) {
    let period = anchor
    while (periodsFromNow.has(period)) {
      current++
      period++
    }
  }

  return { currentWeeks: current, longestWeeks: longest }
}
