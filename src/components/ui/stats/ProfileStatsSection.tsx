import StatCardGrid, { type StatCardItem } from '@/components/ui/stats/StatCardGrid'
import YearlyActivityTable from '@/components/ui/stats/YearlyActivityTable'
import type { OssStats, ProfileStats, WritingStats } from '@/libs/stats/loadProfileStats'
import { WRITING_SOURCE_LABEL } from '@/libs/stats/loadProfileStats'

interface Props {
  stats: ProfileStats
  lang: string
}

// 文言は言語ごとにまとめて持ち、組み立て側では分岐しない。
type StatsCopy = {
  articles: { label: string; value: (total: string) => string; hint: string }
  yearsWriting: { label: string; value: (years: number) => string; hint: (from: number) => string }
  packages: { label: string; hint: (npm: string, wporg: string) => string }
  activeInstalls: { label: string; hint: string }
  downloads: { label: string; hint: string }
  speaking: { label: string; value: (count: string) => string; hint: string }
  tableTitle: string
  tableNote: string
}

const JA_COPY: StatsCopy = {
  articles: {
    label: '累計記事数',
    value: (total) => `${total}本`,
    hint: `${WRITING_SOURCE_LABEL} 配信の全記事（投稿・雑記・Stripe・DevNotes / 日本語 + 英語）`,
  },
  yearsWriting: {
    label: '発信歴',
    value: (years) => `${years}年`,
    hint: (from) => `${from}年から継続`,
  },
  packages: {
    label: '公開パッケージ',
    hint: (npm, wporg) => `npm ${npm} / WordPress.org ${wporg}`,
  },
  activeInstalls: {
    label: '稼働サイト数',
    hint: 'WordPress.org プラグインを利用中のサイト',
  },
  downloads: {
    label: '累計ダウンロード',
    hint: 'WordPress.org プラグイン',
  },
  speaking: {
    label: '登壇レポート',
    value: (count) => `${count}本`,
    hint: 'イベント登壇の記録',
  },
  tableTitle: '年別の執筆本数',
  tableNote: `${WRITING_SOURCE_LABEL} が配信する全記事（投稿・雑記・Stripe・DevNotes）の公開日（UTC）を基準に集計。複数サイトへの配信を含みます。本年は集計途中の数値です。`,
}

const EN_COPY: StatsCopy = {
  articles: {
    label: 'Articles published',
    value: (total) => total,
    hint: `All ${WRITING_SOURCE_LABEL}-published articles (blog, notes, Stripe, dev notes / Japanese + English)`,
  },
  yearsWriting: {
    label: 'Years writing',
    value: (years) => `${years}`,
    hint: (from) => `Continuously since ${from}`,
  },
  packages: {
    label: 'Published packages',
    hint: (npm, wporg) => `${npm} on npm / ${wporg} on WordPress.org`,
  },
  activeInstalls: {
    label: 'Active installations',
    hint: 'Sites running my WordPress.org plugins',
  },
  downloads: {
    label: 'Total downloads',
    hint: 'WordPress.org plugins',
  },
  speaking: {
    label: 'Speaking reports',
    value: (count) => count,
    hint: 'Write-ups from events I spoke at',
  },
  tableTitle: 'Articles per year',
  tableNote: `Based on UTC publication dates of every ${WRITING_SOURCE_LABEL}-published article (blog, notes, Stripe, dev notes), across several sites. The current year is still in progress.`,
}

type NumberFormatter = (value: number) => string

const buildWritingCards = (
  writing: WritingStats,
  copy: StatsCopy,
  num: NumberFormatter,
): StatCardItem[] => {
  const cards: StatCardItem[] = [
    {
      label: copy.articles.label,
      value: copy.articles.value(num(writing.total)),
      hint: copy.articles.hint,
    },
  ]

  if (writing.firstYear !== null) {
    cards.push({
      label: copy.yearsWriting.label,
      value: copy.yearsWriting.value(writing.yearsActive),
      hint: copy.yearsWriting.hint(writing.firstYear),
    })
  }

  return cards
}

const buildOssCards = (oss: OssStats, copy: StatsCopy, num: NumberFormatter): StatCardItem[] => {
  const cards: StatCardItem[] = [
    {
      label: copy.packages.label,
      value: num(oss.npmPackages + oss.wpPlugins),
      hint: copy.packages.hint(num(oss.npmPackages), num(oss.wpPlugins)),
    },
  ]

  if (oss.activeInstalls > 0) {
    cards.push({
      label: copy.activeInstalls.label,
      value: num(oss.activeInstalls),
      hint: copy.activeInstalls.hint,
    })
  }

  if (oss.downloads > 0) {
    cards.push({
      label: copy.downloads.label,
      value: num(oss.downloads),
      hint: copy.downloads.hint,
    })
  }

  return cards
}

/**
 * /about の実績サマリー。
 * 取得できなかった指標（null）はカードごと省き、0 を並べない。
 */
export default function ProfileStatsSection({ stats, lang }: Props) {
  const isJa = lang === 'ja'
  const copy = isJa ? JA_COPY : EN_COPY
  const locale = isJa ? 'ja-JP' : 'en-US'
  const num: NumberFormatter = (value) => value.toLocaleString(locale)

  const { writing, speakingReports, oss } = stats

  const items: StatCardItem[] = [
    ...(writing ? buildWritingCards(writing, copy, num) : []),
    ...(oss ? buildOssCards(oss, copy, num) : []),
    ...(speakingReports
      ? [
          {
            label: copy.speaking.label,
            value: copy.speaking.value(num(speakingReports)),
            hint: copy.speaking.hint,
          },
        ]
      : []),
  ]

  if (items.length === 0) return null

  const series = writing?.series ?? []

  return (
    <div className="space-y-12">
      <StatCardGrid items={items} columns="2/3" />

      {series.length > 0 && (
        <div
          className="rounded-2xl p-6 sm:p-8"
          style={{ border: '1px solid var(--rvt-border)', background: 'var(--rvt-bg2)' }}
        >
          <h3
            className="mb-6 text-sm font-semibold uppercase tracking-wider"
            style={{ fontFamily: 'var(--rvt-font-mono)', color: 'var(--rvt-fg2)' }}
          >
            {copy.tableTitle}
          </h3>
          <YearlyActivityTable series={series} lang={lang} note={copy.tableNote} />
        </div>
      )}
    </div>
  )
}
