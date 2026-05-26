type Props = {
  total: number
  currentWeeks: number
  longestWeeks: number
  lang: string
}

type Highlight = {
  label: string
  value: string
  hint?: string
}

export default function StatHighlights({ total, currentWeeks, longestWeeks, lang }: Props) {
  const isJa = lang === 'ja'

  const weeksUnit = (n: number): string => (isJa ? `${n}週` : `${n} ${n === 1 ? 'week' : 'weeks'}`)

  const highlights: Highlight[] = [
    {
      label: isJa ? '直近12ヶ月の投稿数' : 'Posts (last 12 months)',
      value: isJa ? `${total.toLocaleString()}本` : total.toLocaleString(),
    },
    {
      label: isJa ? '現在の週連続投稿' : 'Current weekly streak',
      value: weeksUnit(currentWeeks),
    },
    {
      label: isJa ? '最長の週連続記録' : 'Longest weekly streak',
      value: weeksUnit(longestWeeks),
    },
  ]

  return (
    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {highlights.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900"
        >
          <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">{item.label}</dt>
          <dd className="mt-2 text-4xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
