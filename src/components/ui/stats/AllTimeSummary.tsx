import StatCardGrid, { type StatCardItem } from '@/components/ui/stats/StatCardGrid'
import YearlyActivityTable from '@/components/ui/stats/YearlyActivityTable'
import type { SourceCoverage, WritingAllTime } from '@/libs/stats/writingActivity'

type Props = {
  allTime: WritingAllTime
  lang: string
}

const formatDate = (iso: string, locale: string): string =>
  new Date(iso).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })

/**
 * 「この累計に何が含まれ、いつからか」を明示するための定義文。
 * `bySource` に無いソースはそもそも累計に混ざっていない（npm 等は producer 側で
 * 記事以外を除外しているうえ、消費側でも防御的に除外している）ので、ここでは
 * 実際に集計対象になっている媒体だけを列挙する。
 */
function buildScopeNote(
  bySource: SourceCoverage[],
  firstPublishedAt: string | null,
  isJa: boolean,
): string {
  const labels = bySource.map((row) => row.label).join(isJa ? '・' : ', ')
  if (isJa) {
    return firstPublishedAt
      ? `${labels}の記事のみを対象に、Content Lake が保持している全期間を集計しています。`
      : `${labels}の記事のみを対象に集計しています。`
  }
  return firstPublishedAt
    ? `Counts articles from ${labels} only, across everything Content Lake has retained.`
    : `Counts articles from ${labels} only.`
}

/**
 * 他媒体より保持開始年が遅い媒体について脚注を組み立てる。
 * `coverage` は「Lake が保持する最古の年」でしかなく、それより前に記事が存在したかは
 * このデータからは分からない。そのため「欠損している」とは断定しない。
 */
function buildCoverageCaveat(bySource: SourceCoverage[], isJa: boolean): string | null {
  const partial = bySource.filter((row) => row.isPartialCoverage && row.sinceYear !== null)
  if (partial.length === 0) return null

  if (isJa) {
    const notes = partial.map((row) => `${row.label}は${row.sinceYear}年以降`)
    return `注: Content Lake が保持している記事は、${notes.join('、')}です。これより前に公開された記事がある場合、累計・年別には含まれません。`
  }
  const notes = partial.map((row) => `${row.label} posts only from ${row.sinceYear}`)
  return `Note: Content Lake holds ${notes.join(', ')}. Any posts published earlier on these sources are not included in the totals or the yearly breakdown.`
}

/**
 * /writing の「全期間」統計。直近12ヶ月のチャートとは別枠で、
 * 累計・媒体別内訳・年別推移を表示する。何を数えているか（対象媒体・期間）と、
 * カバレッジの欠けを常に明示する（「累計N本」だけを見せて欠測を隠さない）。
 */
export default function AllTimeSummary({ allTime, lang }: Props) {
  if (allTime.totalArticles === 0 || allTime.bySource.length === 0) return null

  const isJa = lang === 'ja'
  const locale = isJa ? 'ja-JP' : 'en-US'

  const totalCard: StatCardItem = {
    label: isJa ? '累計記事数' : 'Total articles',
    value: isJa
      ? `${allTime.totalArticles.toLocaleString(locale)}本`
      : allTime.totalArticles.toLocaleString(locale),
    hint: allTime.firstPublishedAt
      ? isJa
        ? `${formatDate(allTime.firstPublishedAt, locale)}〜${
            allTime.lastPublishedAt ? formatDate(allTime.lastPublishedAt, locale) : ''
          }`
        : `${formatDate(allTime.firstPublishedAt, locale)} – ${
            allTime.lastPublishedAt ? formatDate(allTime.lastPublishedAt, locale) : ''
          }`
      : undefined,
  }

  const scopeNote = buildScopeNote(allTime.bySource, allTime.firstPublishedAt, isJa)
  const coverageCaveat = buildCoverageCaveat(allTime.bySource, isJa)

  return (
    <div
      className="rounded-2xl p-6"
      style={{ border: '1px solid var(--rvt-border)', background: 'var(--rvt-bg2)' }}
    >
      <h3
        className="mb-1 text-sm font-semibold uppercase tracking-wider"
        style={{ color: 'var(--rvt-fg)' }}
      >
        {isJa ? '全期間の実績' : 'All-time totals'}
      </h3>
      <p className="mb-4 text-xs leading-relaxed" style={{ color: 'var(--rvt-fg3)' }}>
        {scopeNote}
      </p>

      <div className="space-y-6">
        <StatCardGrid items={[totalCard]} columns={1} />

        <div>
          <h4
            className="mb-3 text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--rvt-fg2)' }}
          >
            {isJa ? '媒体別の累計' : 'By source'}
          </h4>
          <ul className="space-y-2">
            {allTime.bySource.map((row) => (
              <li
                key={row.key}
                className="flex items-baseline justify-between gap-4 border-b pb-2 text-sm"
                style={{ borderColor: 'var(--rvt-border)' }}
              >
                <span style={{ color: 'var(--rvt-fg)' }}>
                  {row.label}
                  {row.isPartialCoverage && row.sinceYear !== null && (
                    <span className="ml-2 text-xs" style={{ color: 'var(--rvt-fg3)' }}>
                      {isJa ? `（${row.sinceYear}年以降）` : `(from ${row.sinceYear})`}
                    </span>
                  )}
                </span>
                <span className="tabular-nums font-semibold" style={{ color: 'var(--rvt-fg)' }}>
                  {isJa
                    ? `${row.count.toLocaleString(locale)}本`
                    : row.count.toLocaleString(locale)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {allTime.yearly.length > 0 && (
          <div>
            <h4
              className="mb-3 text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--rvt-fg2)' }}
            >
              {isJa ? '年別の推移' : 'By year'}
            </h4>
            <YearlyActivityTable
              series={allTime.yearly}
              lang={lang}
              note={coverageCaveat ?? undefined}
            />
          </div>
        )}

        {!allTime.yearly.length && coverageCaveat && (
          <p className="text-xs leading-relaxed" style={{ color: 'var(--rvt-fg3)' }}>
            {coverageCaveat}
          </p>
        )}
      </div>
    </div>
  )
}
