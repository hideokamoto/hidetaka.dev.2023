// 年次アクティビティの集計ユーティリティ。
// `aggregate.ts` が「直近Nヶ月の勢い」を扱うのに対し、こちらは「全期間の積み上げ」を扱う。
//
// すべて純粋関数。UTC の年で集計するが、**渡す文字列が UTC として解釈できることが前提**。
// オフセットを持たない文字列（WordPress の `date` / `date_gmt` そのまま）を渡すと
// `new Date()` が実行環境のローカル時刻として解釈し、年の割り当てが TZ 依存になる。
// 呼び出し側（`loadProfileStats`）が `Z` を付けてから渡している。

export type YearCount = {
  year: number
  /** その年の件数 */
  count: number
  /** その年までの累計件数（古い年から積み上げた値） */
  cumulative: number
}

/** 年次系列に含めてよい最も古い年。これより古い年は取得元の壊れた日付とみなす。 */
const EARLIEST_PLAUSIBLE_YEAR = 1990

/** 現在から何年先までを妥当な公開日とみなすか（予約投稿を想定して1年）。 */
const FUTURE_YEAR_TOLERANCE = 1

const parseYear = (date: string, nowYear: number): number | null => {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return null

  const year = d.getUTCFullYear()
  // 壊れた日付1件で系列が数千行に膨れるのを防ぐ。範囲外はパース不能と同じ扱い。
  if (year < EARLIEST_PLAUSIBLE_YEAR) return null
  if (year > nowYear + FUTURE_YEAR_TOLERANCE) return null

  return year
}

/** 有効かつ妥当な範囲の日付だけを年に変換して返す。 */
const toYears = (dates: readonly string[], nowYear: number): number[] =>
  dates.map((date) => parseYear(date, nowYear)).filter((year): year is number => year !== null)

/** 最も古い年。有効な日付が無ければ null。 */
export function firstYear(dates: readonly string[], now: Date = new Date()): number | null {
  const years = toYears(dates, now.getUTCFullYear())
  return years.length === 0 ? null : Math.min(...years)
}

/**
 * 発信歴の年数（最初の年と現在年を両端とも含む）。
 * 2013年に開始して現在が2026年なら 14 を返す。有効な日付が無ければ 0。
 */
export function activeYearSpan(dates: readonly string[], now: Date = new Date()): number {
  const first = firstYear(dates, now)
  if (first === null) return 0
  return Math.max(1, now.getUTCFullYear() - first + 1)
}

/**
 * 年別の件数と累計を、最初の投稿年から現在年まで（投稿の無い年も0で補完して）返す。
 * 表示順は新しい年が先頭。
 */
export function buildYearlySeries(dates: readonly string[], now: Date = new Date()): YearCount[] {
  const years = toYears(dates, now.getUTCFullYear())
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
