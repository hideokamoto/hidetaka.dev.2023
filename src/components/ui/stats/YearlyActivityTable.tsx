import { peakCount, type YearCount } from '@/libs/stats/yearly'

type Props = {
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
            <tr style={{ borderBottom: '1px solid var(--rvt-border)' }}>
              <th
                scope="col"
                className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider"
                style={{ fontFamily: 'var(--rvt-font-mono)', color: 'var(--rvt-fg2)' }}
              >
                {headers.year}
              </th>
              <th
                scope="col"
                className="py-3 pr-4 text-right text-xs font-semibold uppercase tracking-wider"
                style={{ fontFamily: 'var(--rvt-font-mono)', color: 'var(--rvt-fg2)' }}
              >
                {headers.count}
              </th>
              <th scope="col" className="w-1/2 py-3 pr-4">
                <span className="sr-only">{isJa ? '件数の比較' : 'Relative volume'}</span>
              </th>
              <th
                scope="col"
                className="py-3 text-right text-xs font-semibold uppercase tracking-wider"
                style={{ fontFamily: 'var(--rvt-font-mono)', color: 'var(--rvt-fg2)' }}
              >
                {headers.cumulative}
              </th>
            </tr>
          </thead>
          <tbody>
            {series.map((row) => (
              <tr key={row.year} style={{ borderBottom: '1px solid var(--rvt-border)' }}>
                <th
                  scope="row"
                  className="py-3 pr-4 text-left font-medium"
                  style={{ color: 'var(--rvt-fg)' }}
                >
                  {row.year}
                </th>
                <td
                  className="py-3 pr-4 text-right tabular-nums"
                  style={{ color: 'var(--rvt-fg)' }}
                >
                  {row.count.toLocaleString(locale)}
                </td>
                <td className="py-3 pr-4">
                  <div
                    className="h-2 w-full overflow-hidden rounded-full"
                    style={{ background: 'var(--rvt-bg3)' }}
                    aria-hidden="true"
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: peak > 0 ? `${(row.count / peak) * 100}%` : '0%',
                        background: 'var(--rvt-accent)',
                      }}
                    />
                  </div>
                </td>
                <td className="py-3 text-right tabular-nums" style={{ color: 'var(--rvt-fg2)' }}>
                  {row.cumulative.toLocaleString(locale)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {note && (
        <p className="mt-4 text-xs leading-relaxed" style={{ color: 'var(--rvt-fg3)' }}>
          {note}
        </p>
      )}
    </div>
  )
}
