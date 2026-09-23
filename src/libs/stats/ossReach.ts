import { loadSummaryGold } from '@/libs/contentLake/summary'
import type { OssReachMetric } from '@/libs/contentLake/types'

// summary.json の ossReach（反響メトリクス）を /about 表示用の時系列に写す。
// metricId は `provider:subject:metric` 形式で、subject 単位（GitHub リポジトリ、
// WordPress.org プラグイン、Qiita アカウント）のメトリクスを日付で合算する。

export type OssReachTrendId =
  | 'github-repos'
  | 'github-stars'
  | 'qiita-followers'
  | 'qiita-lgtm'
  | 'wporg-installs'
  | 'wporg-downloads'
  | 'npm-packages'

export type ReachPoint = { date: string; value: number }

export type OssReachTrend = {
  id: OssReachTrendId
  /** 合算後の最新値（series の末尾と同値） */
  latest: number
  /** 最新値の観測日 */
  latestDate: string | null
  /** 窓内の変化量（末尾 - 先頭）。単一点なら 0 */
  delta: number
  /** 日付昇順の合算系列 */
  series: ReachPoint[]
}

/** 表示するトレンドの定義。配列順が表示順。 */
const TREND_DEFS: { id: OssReachTrendId; provider: string; kind: string }[] = [
  { id: 'github-repos', provider: 'github', kind: 'repository-count' },
  { id: 'github-stars', provider: 'github', kind: 'stars' },
  { id: 'qiita-followers', provider: 'qiita', kind: 'followers' },
  { id: 'qiita-lgtm', provider: 'qiita', kind: 'lgtm-total' },
  { id: 'wporg-installs', provider: 'wordpress-org', kind: 'active-installs' },
  { id: 'wporg-downloads', provider: 'wordpress-org', kind: 'cumulative-downloads' },
  { id: 'npm-packages', provider: 'npm', kind: 'package-count' },
]

const parseMetricId = (metricId: string): { provider: string; kind: string } | null => {
  const parts = metricId.split(':')
  if (parts.length < 3) return null
  return { provider: parts[0], kind: parts[parts.length - 1] }
}

/**
 * 昇順 series 上で `date` 時点の値を返す。
 * 観測開始前は最初の観測値で補い（backward-fill）、観測以降は直近値を繰り越す
 * （carry-forward）。メトリクスごとに観測開始日が違うため、単純な完全一致では
 * 合算が欠損する。
 */
const clampedValueAt = (series: ReachPoint[], date: string): number => {
  let value = series[0].value
  for (const point of series) {
    if (point.date > date) break
    value = point.value
  }
  return value
}

/** 複数メトリクスの series を日付の和集合で合算する。 */
const mergeSeries = (metrics: OssReachMetric[]): ReachPoint[] => {
  const sorted = metrics.map((m) => [...m.series].sort((a, b) => a.date.localeCompare(b.date)))
  const dates = new Set<string>()
  for (const series of sorted) {
    for (const point of series) dates.add(point.date)
  }
  return [...dates].sort().map((date) => ({
    date,
    value: sorted.reduce((sum, series) => sum + clampedValueAt(series, date), 0),
  }))
}

/** ossReach の metricId マップを、表示用トレンド（定義順）に集約する。 */
export function toOssReachTrends(ossReach: Record<string, OssReachMetric>): OssReachTrend[] {
  const metrics = Object.values(ossReach)

  const trends: OssReachTrend[] = []
  for (const def of TREND_DEFS) {
    const matched = metrics.filter((m) => {
      if (m.series.length === 0) return false
      const parsed = parseMetricId(m.metricId)
      return parsed !== null && parsed.provider === def.provider && parsed.kind === def.kind
    })
    if (matched.length === 0) continue

    const series = mergeSeries(matched)
    const first = series[0]
    const last = series[series.length - 1]
    trends.push({
      id: def.id,
      latest: last.value,
      latestDate: last.date,
      delta: last.value - first.value,
      series,
    })
  }
  return trends
}

/**
 * /about の OSS 反響トレンドを summary.json から読む。
 * 取得失敗・既知メトリクスなしは null（パネルごと非表示）。
 */
export async function loadOssReach(): Promise<OssReachTrend[] | null> {
  const summary = await loadSummaryGold()
  if (!summary) return null
  const trends = toOssReachTrends(summary.ossReach)
  return trends.length > 0 ? trends : null
}
