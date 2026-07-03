'use client'

import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { MonthlyBucket } from '@/libs/stats/aggregate'

// 媒体名 → チャートの塗り色。外部サービスは各ブランド色、
// 自前コンテンツは折衷パレット（藍青・松葉緑）。未知はフォールバック。
const SOURCE_COLORS: Record<string, string> = {
  'WP Kyoto Blog': '#2f5375', // 藍青
  Qiita: '#55c500',
  Zenn: '#3ea8ff',
  'Dev.to': '#0a0a0a',
  'Dev Notes': '#3e7a55', // 松葉緑
  'Stripe.dev': '#635bff',
}
const FALLBACK_COLOR = '#7b7e82' // 和紙ミュート

type Props = {
  data: MonthlyBucket[]
  lang: string
}

const formatMonthTick = (yearMonth: string): string => {
  const [year, month] = yearMonth.split('-')
  return `${year.slice(2)}/${month}`
}

// ツールチップ見出し用に "2025-03" を "2025/03"（en）/ "2025年3月"（ja）へ整形。
const formatMonthLabel = (yearMonth: string, isJa: boolean): string => {
  const [year, month] = yearMonth.split('-')
  if (!year || !month) return yearMonth
  return isJa ? `${year}年${Number.parseInt(month, 10)}月` : `${year}/${month}`
}

export default function MonthlyPostsChart({ data, lang }: Props) {
  const isJa = lang === 'ja'

  // Recharts の ResponsiveContainer は DOM 計測に依存するため、
  // SSR/初回レンダーではプレースホルダを返してハイドレーション不一致を避ける。
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // 全期間で出現する媒体を、合計件数の多い順に並べて積み上げ順を決める。
  const totalsBySource = new Map<string, number>()
  for (const bucket of data) {
    for (const [name, count] of Object.entries(bucket.bySource)) {
      totalsBySource.set(name, (totalsBySource.get(name) ?? 0) + count)
    }
  }
  const sources = Array.from(totalsBySource.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name)

  const chartData = data.map((bucket) => ({
    yearMonth: bucket.yearMonth,
    ...bucket.bySource,
  }))

  if (!isMounted) {
    return <div className="h-72 w-full" />
  }

  return (
    <div className="h-72 w-full" style={{ color: 'var(--rvt-fg2)' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.15} />
          <XAxis
            dataKey="yearMonth"
            tickFormatter={formatMonthTick}
            tick={{ fill: 'currentColor', fontSize: 11 }}
            interval="preserveStartEnd"
            minTickGap={16}
            axisLine={{ stroke: 'currentColor', strokeOpacity: 0.2 }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: 'currentColor', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            cursor={{ fill: 'currentColor', fillOpacity: 0.08 }}
            content={<StatsTooltip isJa={isJa} />}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {sources.map((name) => (
            <Bar
              key={name}
              dataKey={name}
              stackId="posts"
              fill={SOURCE_COLORS[name] ?? FALLBACK_COLOR}
              radius={[0, 0, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

type TooltipEntry = {
  dataKey?: string | number
  value?: number
  color?: string
}

function StatsTooltip({
  active,
  payload,
  label,
  isJa,
}: {
  active?: boolean
  payload?: TooltipEntry[]
  label?: string
  isJa: boolean
}) {
  if (!active || !payload || payload.length === 0) return null

  const entries = payload.filter((p) => typeof p.value === 'number' && p.value > 0)
  const total = entries.reduce((sum, p) => sum + (p.value ?? 0), 0)

  return (
    <div
      className="rounded-lg px-3 py-2 text-xs shadow-lg"
      style={{ border: '1px solid var(--rvt-border)', background: 'var(--rvt-bg2)' }}
    >
      <p className="mb-1 font-semibold" style={{ color: 'var(--rvt-fg)' }}>
        {label ? formatMonthLabel(label, isJa) : ''}
      </p>
      {entries.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5" style={{ color: 'var(--rvt-fg2)' }}>
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            {p.dataKey}
          </span>
          <span className="font-medium" style={{ color: 'var(--rvt-fg)' }}>
            {p.value}
          </span>
        </div>
      ))}
      <div
        className="mt-1 flex items-center justify-between gap-3 border-t pt-1"
        style={{ borderColor: 'var(--rvt-border)' }}
      >
        <span style={{ color: 'var(--rvt-fg2)' }}>{isJa ? '合計' : 'Total'}</span>
        <span className="font-semibold" style={{ color: 'var(--rvt-fg)' }}>
          {total}
          {isJa ? '本' : ''}
        </span>
      </div>
    </div>
  )
}
