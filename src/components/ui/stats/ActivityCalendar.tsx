import {
  type ActivityLevel,
  buildActivityCalendar,
  type CalendarCell,
  calendarMonthLabels,
} from '@/libs/stats/aggregate'

const LEVEL_CLASSES: Record<ActivityLevel, string> = {
  0: 'bg-zinc-100 dark:bg-zinc-800',
  1: 'bg-indigo-200 dark:bg-indigo-950',
  2: 'bg-indigo-400 dark:bg-indigo-800',
  3: 'bg-indigo-600 dark:bg-indigo-600',
  4: 'bg-indigo-800 dark:bg-indigo-400',
}

const CELL_SIZE = 'h-[11px] w-[11px]'

type Props = {
  items: { datetime: string }[]
  lang: string
  weeks?: number
}

function formatDayLabel(date: string, count: number, isJa: boolean): string {
  const d = new Date(`${date}T12:00:00Z`)
  const formatted = new Intl.DateTimeFormat(isJa ? 'ja-JP' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(d)
  if (isJa) {
    return count > 0 ? `${formatted}: ${count}本` : `${formatted}: 投稿なし`
  }
  return count > 0
    ? `${formatted}: ${count} post${count === 1 ? '' : 's'}`
    : `${formatted}: No posts`
}

function CalendarGrid({
  columns,
  lang,
  monthLabels,
}: {
  columns: CalendarCell[][]
  lang: string
  monthLabels: { weekIndex: number; label: string }[]
}) {
  const isJa = lang.startsWith('ja')
  const weekCount = columns.length
  const labelByWeek = new Map(monthLabels.map((m) => [m.weekIndex, m.label]))

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        {/* Month labels */}
        <div
          className="mb-1 grid text-[10px] text-slate-500 dark:text-slate-400"
          style={{
            gridTemplateColumns: `16px repeat(${weekCount}, 13px)`,
            gap: '3px',
          }}
        >
          <span aria-hidden="true" />
          {columns.map((week, weekIndex) => (
            <span key={`month-${week[0].date}`} className="truncate leading-none">
              {labelByWeek.get(weekIndex) ?? ''}
            </span>
          ))}
        </div>

        <div className="flex gap-1">
          {/* Weekday labels (Mon / Wed / Fri like GitHub) */}
          <div className="flex w-4 shrink-0 flex-col justify-around py-[2px] text-[9px] leading-none text-slate-400 dark:text-slate-500">
            <span className="invisible h-[11px]">S</span>
            <span className="h-[11px]">{isJa ? '月' : 'Mon'}</span>
            <span className="invisible h-[11px]">T</span>
            <span className="h-[11px]">{isJa ? '水' : 'Wed'}</span>
            <span className="invisible h-[11px]">T</span>
            <span className="h-[11px]">{isJa ? '金' : 'Fri'}</span>
            <span className="invisible h-[11px]">S</span>
          </div>

          {/* Grid: columns = weeks, rows = Sun–Sat */}
          <div
            className="grid gap-[3px]"
            style={{
              gridTemplateRows: 'repeat(7, 11px)',
              gridTemplateColumns: `repeat(${weekCount}, 11px)`,
              gridAutoFlow: 'column',
            }}
            role="img"
            aria-label={
              isJa
                ? '直近の執筆アクティビティを日別に示すカレンダー'
                : 'Calendar showing daily writing activity over the recent period'
            }
          >
            {columns.map((week) =>
              week.map((cell) => (
                <span
                  key={cell.date}
                  className={`${CELL_SIZE} rounded-sm ${cell.isFuture ? 'bg-transparent' : LEVEL_CLASSES[cell.level]}`}
                  title={cell.isFuture ? undefined : formatDayLabel(cell.date, cell.count, isJa)}
                />
              )),
            )}
          </div>
        </div>
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
  const { columns } = buildActivityCalendar(items, weeks)
  const monthLabels = calendarMonthLabels(columns, lang)
  const isJa = lang.startsWith('ja')

  return (
    <div>
      <CalendarGrid columns={columns} lang={lang} monthLabels={monthLabels} />
      <CalendarLegend lang={lang} />
      <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
        {isJa
          ? '各マスは UTC の日付で 1 日分の投稿数を表します。色が濃いほど投稿が多い日です。'
          : 'Each square is one UTC day. Darker colors mean more posts that day.'}
      </p>
    </div>
  )
}
