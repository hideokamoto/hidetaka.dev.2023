'use client'

import { useEffect, useState } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { OssReachTrend, OssReachTrendId } from '@/libs/stats/ossReach'

// トレンドごとの塗り色。折衷パレットの data-viz 拡張（--chart-*）を優先し、
// ほぼ平坦な npm パッケージ数はミュート色に倒す。
const TREND_COLORS: Record<OssReachTrendId, string> = {
  'github-stars': 'var(--chart-1)',
  'github-repos': 'var(--chart-4)',
  'qiita-lgtm': 'var(--chart-3)',
  'qiita-followers': 'var(--chart-2)',
  'wporg-installs': 'var(--chart-5)',
  'wporg-downloads': 'var(--chart-6)',
  'npm-packages': 'var(--rvt-fg3)',
}

type Copy = {
  labels: Record<OssReachTrendId, string>
  deltaSince: (delta: string, date: string) => string
}

const JA_COPY: Copy = {
  labels: {
    'github-stars': 'GitHub スター',
    'github-repos': 'GitHub リポジトリ',
    'qiita-lgtm': 'Qiita LGTM',
    'qiita-followers': 'Qiita フォロワー',
    'wporg-installs': 'WordPress.org 稼働サイト',
    'wporg-downloads': 'WordPress.org 累計DL',
    'npm-packages': 'npm パッケージ',
  },
  deltaSince: (delta, date) => `${date} から ${delta}`,
}

const EN_COPY: Copy = {
  labels: {
    'github-stars': 'GitHub stars',
    'github-repos': 'GitHub repositories',
    'qiita-lgtm': 'Qiita LGTM',
    'qiita-followers': 'Qiita followers',
    'wporg-installs': 'WordPress.org active installs',
    'wporg-downloads': 'WordPress.org downloads',
    'npm-packages': 'npm packages',
  },
  deltaSince: (delta, date) => `${delta} since ${date}`,
}

const formatShortDate = (isoDate: string, isJa: boolean): string => {
  const [, month, day] = isoDate.split('-')
  if (!month || !day) return isoDate
  return isJa ? `${Number(month)}月${Number(day)}日` : `${Number(month)}/${Number(day)}`
}

const formatDelta = (delta: number, num: (v: number) => string): string =>
  delta > 0 ? `+${num(delta)}` : num(delta)

type TooltipEntry = { payload?: { date?: string }; value?: number }

function ReachTooltip({
  active,
  payload,
  isJa,
  num,
}: {
  active?: boolean
  payload?: { payload?: { date?: string; value?: number }; value?: number }[]
  isJa: boolean
  num: (v: number) => string
}) {
  if (!active || !payload || payload.length === 0) return null
  const entry: TooltipEntry | undefined = payload[0]
  const date = entry?.payload?.date
  const value = entry?.value
  if (typeof value !== 'number') return null
  return (
    <div
      className="rounded-lg px-3 py-1.5 text-xs shadow-lg"
      style={{ border: '1px solid var(--rvt-border)', background: 'var(--rvt-bg2)' }}
    >
      <span style={{ color: 'var(--rvt-fg2)' }}>
        {date ? `${formatShortDate(date, isJa)}: ` : ''}
      </span>
      <span className="font-semibold" style={{ color: 'var(--rvt-fg)' }}>
        {num(value)}
      </span>
    </div>
  )
}

function TrendCard({
  trend,
  isJa,
  copy,
  num,
  isMounted,
}: {
  trend: OssReachTrend
  isJa: boolean
  copy: Copy
  num: (v: number) => string
  isMounted: boolean
}) {
  const color = TREND_COLORS[trend.id]
  const firstDate = trend.series[0]?.date

  return (
    <div
      className="rounded-xl p-5"
      style={{ border: '1px solid var(--rvt-border)', background: 'var(--rvt-bg)' }}
    >
      <p className="text-sm font-medium" style={{ color: 'var(--rvt-fg2)' }}>
        {copy.labels[trend.id]}
      </p>
      <p className="mt-1 text-3xl font-extrabold tracking-tight" style={{ color: 'var(--rvt-fg)' }}>
        {num(trend.latest)}
      </p>
      {firstDate && (
        <p className="mt-1 text-xs" style={{ color: 'var(--rvt-fg3)' }}>
          {copy.deltaSince(formatDelta(trend.delta, num), formatShortDate(firstDate, isJa))}
        </p>
      )}
      <div className="mt-3 h-16 w-full">
        {isMounted && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend.series} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
              <XAxis dataKey="date" hide />
              <YAxis domain={['dataMin', 'dataMax']} hide />
              <Tooltip
                cursor={{ stroke: 'currentColor', strokeOpacity: 0.2 }}
                content={<ReachTooltip isJa={isJa} num={num} />}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                fill={color}
                fillOpacity={0.15}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

type Props = {
  trends: OssReachTrend[]
  lang: string
}

/**
 * summary.json の ossReach を小 multiples のスパークラインで描く。
 * 日次スナップショットの短期時系列なので、軸は省略して最新値と変化量を主役にする。
 */
export default function OssReachChart({ trends, lang }: Props) {
  const isJa = lang === 'ja'
  const copy = isJa ? JA_COPY : EN_COPY
  const num = (v: number) => v.toLocaleString(isJa ? 'ja-JP' : 'en-US')

  // ResponsiveContainer は DOM 計測に依存するため SSR/初回はプレースホルダ。
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (trends.length === 0) return null

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {trends.map((trend) => (
        <TrendCard
          key={trend.id}
          trend={trend}
          isJa={isJa}
          copy={copy}
          num={num}
          isMounted={isMounted}
        />
      ))}
    </div>
  )
}
