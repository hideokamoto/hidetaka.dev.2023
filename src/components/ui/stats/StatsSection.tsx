import { STATS_WINDOW_MONTHS, type WritingActivity } from '@/libs/stats/writingActivity'
import MonthlyPostsChart from './MonthlyPostsChart'
import StatHighlights from './StatHighlights'

type Props = {
  activity: WritingActivity | null
  lang: string
}

export default function StatsSection({ activity, lang }: Props) {
  if (!activity) return null

  const isJa = lang === 'ja'

  const title = isJa ? '執筆アクティビティ' : 'Writing activity'
  const sourcesText = activity.sources.join(' / ')
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
        <StatHighlights total={activity.total} streak={activity.streak} lang={lang} />

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
          <MonthlyPostsChart data={activity.monthly} lang={lang} />
        </div>
      </div>
    </section>
  )
}
