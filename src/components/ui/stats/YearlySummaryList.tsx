type Props = {
  data: Array<{ year: number; count: number }>
  lang: string
}

export default function YearlySummaryList({ data, lang }: Props) {
  const isJa = lang === 'ja'
  if (data.length === 0) return null

  const max = Math.max(...data.map((d) => d.count), 1)

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
        {isJa ? '年別' : 'By year'}
      </h3>
      <ul className="space-y-3">
        {data.map(({ year, count }) => (
          <li key={year} className="flex items-center gap-3">
            <span className="w-14 shrink-0 text-sm font-medium text-slate-600 dark:text-slate-400">
              {isJa ? `${year}年` : year}
            </span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-indigo-500 dark:bg-indigo-400"
                style={{ width: `${Math.max((count / max) * 100, 2)}%` }}
              />
            </div>
            <span className="w-12 shrink-0 text-right text-sm font-semibold text-slate-900 dark:text-white">
              {isJa ? `${count}本` : count}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
