// 年次アクティビティの集計ユーティリティ。
// `aggregate.ts` が「直近Nヶ月の勢い」を扱うのに対し、こちらは「全期間の積み上げ」を扱う。
// すべて純粋関数で、UTC 基準で計算するため実行環境のタイムゾーンに依存しない。

export type YearCount = {
  year: number
  /** その年の件数 */
  count: number
  /** その年までの累計件数（古い年から積み上げた値） */
  cumulative: number
}

const parseYear = (date: string): number | null => {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return null
  return d.getUTCFullYear()
}

/** 有効な日付だけを年に変換して返す。 */
const toYears = (dates: readonly string[]): number[] =>
  dates.map(parseYear).filter((year): year is number => year !== null)

/** 最も古い年。有効な日付が無ければ null。 */
export function firstYear(dates: readonly string[]): number | null {
  const years = toYears(dates)
  return years.length === 0 ? null : Math.min(...years)
}

/**
 * 発信歴の年数（最初の年と現在年を両端とも含む）。
 * 2013年に開始して現在が2026年なら 14 を返す。有効な日付が無ければ 0。
 */
export function activeYearSpan(dates: readonly string[], now: Date = new Date()): number {
  const first = firstYear(dates)
  if (first === null) return 0
  return Math.max(1, now.getUTCFullYear() - first + 1)
}

/**
 * 年別の件数と累計を、最初の投稿年から現在年まで（投稿の無い年も0で補完して）返す。
 * 表示順は新しい年が先頭。
 */
export function buildYearlySeries(dates: readonly string[], now: Date = new Date()): YearCount[] {
  const years = toYears(dates)
  if (years.length === 0) return []

  const counts = new Map<number, number>()
  for (const year of years) {
    counts.set(year, (counts.get(year) ?? 0) + 1)
  }

  const start = Math.min(...years)
  // 未来日付の投稿があっても取りこぼさないよう、現在年と最大年の大きい方まで並べる
  const end = Math.max(now.getUTCFullYear(), ...years)

  const ascending: YearCount[] = []
  let cumulative = 0
  for (let year = start; year <= end; year++) {
    const count = counts.get(year) ?? 0
    cumulative += count
    ascending.push({ year, count, cumulative })
  }

  return ascending.reverse()
}

/** 系列中の最大件数。棒グラフの正規化に使う（0件しか無い場合は 0）。 */
export function peakCount(series: readonly YearCount[]): number {
  return series.reduce((max, row) => (row.count > max ? row.count : max), 0)
}
