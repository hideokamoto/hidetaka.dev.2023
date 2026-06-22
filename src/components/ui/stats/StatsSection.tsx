import type { FeedItem } from '@/libs/dataSources/types'
import { cumulativeTotal, groupByMonth, weeklyStreak } from '@/libs/stats/aggregate'
import { STATS_WINDOW_MONTHS } from '@/libs/stats/loadStatsPosts'
import MonthlyPostsChart from './MonthlyPostsChart'
import StatHighlights from './StatHighlights'

type Props = {
  items: FeedItem[]
  lang: string
}

export default function StatsSection({ items, lang }: Props) {
  if (items.length === 0) return null

  const isJa = lang === 'ja'

  const monthly = groupByMonth(items, STATS_WINDOW_MONTHS)
  const total = cumulativeTotal(items)
  const streak = weeklyStreak(items)

  const sources = Array.from(new Set(items.map((i) => i.dataSource?.name).filter(Boolean)))
  const hasZenn = sources.includes('Zenn')

  const title = isJa ? '執筆アクティビティ' : 'Writing activity'
  const sourcesText = sources.join(' / ')
  const subtitle = isJa
    ? `直近${STATS_WINDOW_MONTHS}ヶ月の集計（${sourcesText}）。`
    : `Last ${STATS_WINDOW_MONTHS} months across ${sourcesText}.`

  return (
    <section className="mt-16 border-t pt-16" style={{ borderColor: 'var(--rvt-border)' }}>
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl" style={{ color: 'var(--rvt-fg)' }}>
          {title}
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm" style={{ color: 'var(--rvt-fg2)' }}>
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

        <div
          className="rounded-2xl p-6"
          style={{ border: '1px solid var(--rvt-border)', background: 'var(--rvt-bg2)' }}
        >
          <h3
            className="mb-4 text-sm font-semibold uppercase tracking-wider"
            style={{ color: 'var(--rvt-fg)' }}
          >
            {isJa ? '月別の投稿本数' : 'Posts per month'}
          </h3>
          <MonthlyPostsChart data={monthly} lang={lang} />
        </div>

        {hasZenn && (
          <p className="text-xs" style={{ color: 'var(--rvt-fg3)' }}>
            {isJa
              ? '注: Zenn は RSS の制約により直近約20本のみを集計しています。'
              : 'Note: Zenn data is limited to the most recent ~20 posts due to RSS constraints.'}
          </p>
        )}
      </div>
    </section>
  )
}
