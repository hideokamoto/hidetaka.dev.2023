import StatCardGrid, { type StatCardItem } from './StatCardGrid'

type Props = {
  total: number
  currentWeeks: number
  longestWeeks: number
  lang: string
}

export default function StatHighlights({ total, currentWeeks, longestWeeks, lang }: Props) {
  const isJa = lang === 'ja'

  const weeksUnit = (n: number): string => (isJa ? `${n}週` : `${n} ${n === 1 ? 'week' : 'weeks'}`)

  const highlights: StatCardItem[] = [
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

  return <StatCardGrid items={highlights} columns={3} />
}
