import type { FeedItem } from '@/libs/dataSources/types'
import {
  cumulativeTotal,
  earliestDate,
  groupByMonth,
  weeklyStreak,
  yearlySummary,
} from '@/libs/stats/aggregate'
import MonthlyPostsChart from './MonthlyPostsChart'
import StatHighlights from './StatHighlights'
import YearlySummaryList from './YearlySummaryList'

type Props = {
  items: FeedItem[]
  lang: string
}

const formatSince = (date: Date, isJa: boolean): string => {
  const y = date.getUTCFullYear()
  const m = date.getUTCMonth() + 1
  return isJa ? `${y}年${m}月` : `${y}-${String(m).padStart(2, '0')}`
}

export default function StatsSection({ items, lang }: Props) {
  if (items.length === 0) return null

  const isJa = lang === 'ja'

  const monthly = groupByMonth(items, 36)
  // 最初に投稿のある月から表示（先頭の空月を落とす＝「いつ以降のデータか」を正直に出す）
  const firstActive = monthly.findIndex((b) => b.total > 0)
  const visibleMonthly = firstActive > 0 ? monthly.slice(firstActive) : monthly

  const yearly = yearlySummary(items)
  const total = cumulativeTotal(items)
  const streak = weeklyStreak(items)
  const since = earliestDate(items)

  const sources = Array.from(new Set(items.map((i) => i.dataSource?.name).filter(Boolean)))
  const hasZenn = sources.includes('Zenn')

  const title = isJa ? '執筆アクティビティ' : 'Writing activity'
  const sourcesText = sources.join(' / ')
  const sinceText = since ? formatSince(since, isJa) : null
  const subtitle = isJa
    ? `${sourcesText} を横断した集計${sinceText ? `（${sinceText} 以降のデータ）` : ''}。`
    : `Aggregated across ${sourcesText}${sinceText ? `. Data from ${sinceText} onwards` : ''}.`

  return (
    <section className="mt-16 border-t border-zinc-200 pt-16 dark:border-zinc-800">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">{title}</h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
          {subtitle}
        </p>
      </div>

      <div className="space-y-8">
        <StatHighlights
          total={total}
          currentWeeks={streak.currentWeeks}
          longestWeeks={streak.longestWeeks}
          lang={lang}
        />

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
            {isJa ? '月別の投稿本数' : 'Posts per month'}
          </h3>
          <MonthlyPostsChart data={visibleMonthly} lang={lang} />
        </div>

        <YearlySummaryList data={yearly} lang={lang} />

        {hasZenn && (
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {isJa
              ? '注: Zenn は RSS の制約により直近約20本のみを集計しています。'
              : 'Note: Zenn data is limited to the most recent ~20 posts due to RSS constraints.'}
          </p>
        )}
      </div>
    </section>
  )
}
