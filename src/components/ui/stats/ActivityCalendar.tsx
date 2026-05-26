import {
  type ActivityLevel,
  buildActivityCalendar,
  calendarMonthLabels,
  type WeekCell,
} from '@/libs/stats/aggregate'

const LEVEL_CLASSES: Record<ActivityLevel, string> = {
  0: 'bg-zinc-100 dark:bg-zinc-800',
  1: 'bg-indigo-200 dark:bg-indigo-950',
  2: 'bg-indigo-400 dark:bg-indigo-800',
  3: 'bg-indigo-600 dark:bg-indigo-600',
  4: 'bg-indigo-800 dark:bg-indigo-400',
}

const CELL_SIZE = 'h-3.5 w-3.5'
const WEEKS_PER_ROW = 13

type Props = {
  items: { datetime: string }[]
  lang: string
  weeks?: number
}

function formatWeekLabel(week: WeekCell, isJa: boolean): string {
  const start = new Date(`${week.weekStart}T12:00:00Z`)
  const end = new Date(`${week.weekEnd}T12:00:00Z`)
  const rangeFormatter = new Intl.DateTimeFormat(isJa ? 'ja-JP' : 'en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
  const range = `${rangeFormatter.format(start)} – ${rangeFormatter.format(end)}`
  if (isJa) {
    return week.count > 0 ? `${range}: ${week.count}本` : `${range}: 投稿なし`
  }
  return week.count > 0
    ? `${range}: ${week.count} post${week.count === 1 ? '' : 's'}`
    : `${range}: No posts`
}

function CalendarGrid({
  weeks,
  lang,
  monthLabels,
}: {
  weeks: WeekCell[]
  lang: string
  monthLabels: { weekIndex: number; label: string }[]
}) {
  const isJa = lang.startsWith('ja')
  const rowCount = Math.ceil(weeks.length / WEEKS_PER_ROW)
  const labelByWeek = new Map(monthLabels.map((m) => [m.weekIndex, m.label]))

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full space-y-1">
        {Array.from({ length: rowCount }, (_, rowIndex) => {
          const rowWeeks = weeks.slice(
            rowIndex * WEEKS_PER_ROW,
            rowIndex * WEEKS_PER_ROW + WEEKS_PER_ROW,
          )
          const rowStartIndex = rowIndex * WEEKS_PER_ROW

          return (
            <div key={`row-${rowWeeks[0]?.weekStart ?? rowIndex}`}>
              <div
                className="mb-1 grid text-[10px] text-slate-500 dark:text-slate-400"
                style={{
                  gridTemplateColumns: `repeat(${rowWeeks.length}, 17px)`,
                  gap: '3px',
                }}
              >
                {rowWeeks.map((week, columnIndex) => {
                  const weekIndex = rowStartIndex + columnIndex
                  return (
                    <span key={`month-${week.weekStart}`} className="truncate leading-none">
                      {labelByWeek.get(weekIndex) ?? ''}
                    </span>
                  )
                })}
              </div>

              <div
                className="grid gap-[3px]"
                style={{
                  gridTemplateColumns: `repeat(${rowWeeks.length}, 14px)`,
                }}
                role="img"
                aria-label={
                  isJa
                    ? '直近の執筆アクティビティを週別に示すカレンダー'
                    : 'Calendar showing weekly writing activity over the recent period'
                }
              >
                {rowWeeks.map((week) => (
                  <span
                    key={week.weekStart}
                    className={`${CELL_SIZE} rounded-sm ${week.isFuture ? 'bg-transparent' : LEVEL_CLASSES[week.level]}`}
                    title={week.isFuture ? undefined : formatWeekLabel(week, isJa)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CalendarLegend({ lang }: { lang: string }) {
  const isJa = lang.startsWith('ja')
  const levels: ActivityLevel[] = [0, 1, 2, 3, 4]

  return (
    <div className="mt-3 flex items-center justify-end gap-1 text-[10px] text-slate-500 dark:text-slate-400">
      <span>{isJa ? '少' : 'Less'}</span>
      {levels.map((level) => (
        <span
          key={level}
          className={`${CELL_SIZE} rounded-sm ${LEVEL_CLASSES[level]}`}
          aria-hidden="true"
        />
      ))}
      <span>{isJa ? '多' : 'More'}</span>
    </div>
  )
}

export default function ActivityCalendar({ items, lang, weeks = 53 }: Props) {
  const { weeks: weekCells } = buildActivityCalendar(items, weeks)
  const monthLabels = calendarMonthLabels(weekCells, lang)
  const isJa = lang.startsWith('ja')

  return (
    <div>
      <CalendarGrid weeks={weekCells} lang={lang} monthLabels={monthLabels} />
      <CalendarLegend lang={lang} />
      <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
        {isJa
          ? '各マスは日曜始まりの 1 週間の投稿数を表します。色が濃いほどその週の投稿が多いです。'
          : 'Each square is one week (Sunday–Saturday, UTC). Darker colors mean more posts that week.'}
      </p>
    </div>
  )
}
