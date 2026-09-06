import { peakCount, type YearCount } from '@/libs/stats/yearly'

interface Props {
  /** 新しい年が先頭の年次推移 */
  series: YearCount[]
  lang: string
  /** 出典などの補足 */
  note?: string
}

/**
 * 年別の執筆本数と累計を並べた表。
 * 件数のバーは最大値を基準にした相対幅で、数値の読み取りを補助するだけの装飾。
 */
export default function YearlyActivityTable({ series, lang, note }: Props) {
  if (series.length === 0) return null

  const isJa = lang === 'ja'
  const locale = isJa ? 'ja-JP' : 'en-US'
  const peak = peakCount(series)

  const headers = {
    year: isJa ? '年' : 'Year',
    count: isJa ? '記事数' : 'Posts',
    cumulative: isJa ? '累計' : 'Cumulative',
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[28rem] border-collapse text-sm">
          <caption className="sr-only">
            {isJa ? '年別の執筆本数と累計' : 'Posts and cumulative total by year'}
          </caption>
          <thead>
            <tr className="border-b border-b-[color:var(--rvt-border)]">
              <th
                scope="col"
                className="py-3 pr-4 text-left font-[family-name:var(--rvt-font-mono)] text-xs font-semibold uppercase tracking-wider text-[color:var(--rvt-fg2)]"
              >
                {headers.year}
              </th>
              <th
                scope="col"
                className="py-3 pr-4 text-right font-[family-name:var(--rvt-font-mono)] text-xs font-semibold uppercase tracking-wider text-[color:var(--rvt-fg2)]"
              >
                {headers.count}
              </th>
              <th scope="col" className="w-1/2 py-3 pr-4">
                <span className="sr-only">{isJa ? '件数の比較' : 'Relative volume'}</span>
              </th>
              <th
                scope="col"
                className="py-3 text-right font-[family-name:var(--rvt-font-mono)] text-xs font-semibold uppercase tracking-wider text-[color:var(--rvt-fg2)]"
              >
                {headers.cumulative}
              </th>
            </tr>
          </thead>
          <tbody>
            {series.map((row) => (
              <tr key={row.year} className="border-b border-b-[color:var(--rvt-border)]">
                <th
                  scope="row"
                  className="py-3 pr-4 text-left font-medium text-[color:var(--rvt-fg)]"
                >
                  {row.year}
                </th>
                <td className="py-3 pr-4 text-right tabular-nums text-[color:var(--rvt-fg)]">
                  {row.count.toLocaleString(locale)}
                </td>
                <td className="py-3 pr-4">
                  <div
                    className="h-2 w-full overflow-hidden rounded-full bg-[var(--rvt-bg3)]"
                    aria-hidden="true"
                  >
                    <div
                      className="h-full rounded-full bg-[var(--rvt-accent)]"
                      // 幅は件数に応じて変わる実行時の値。静的な utility class にはできない。
                      style={{ width: peak > 0 ? `${(row.count / peak) * 100}%` : '0%' }}
                    />
                  </div>
                </td>
                <td className="py-3 text-right tabular-nums text-[color:var(--rvt-fg2)]">
                  {row.cumulative.toLocaleString(locale)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {note && <p className="mt-4 text-xs leading-relaxed text-[color:var(--rvt-fg3)]">{note}</p>}
    </div>
  )
}
