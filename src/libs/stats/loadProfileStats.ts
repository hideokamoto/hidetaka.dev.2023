import { loadAboutGold } from '@/libs/contentLake/about'
import type { AboutGold } from '@/libs/contentLake/types'
import type { YearCount } from '@/libs/stats/yearly'

// プロフィール実績は Content Lake Gold の about.json から読む。
// vibes-wp-content-enrichment が日次で生成・配信する集計済み JSON で、
// WordPress REST / npm / WordPress.org への個別 fetch は不要になった。
//
// WRITING_SOURCE_LABEL は 'WordPress' のまま。Gold の writing は WordPress 由来の
// 記事のみを集計している（Qiita/Zenn/dev.to は全期間の取得手段が無く「累計」に混ぜない）。
export const WRITING_SOURCE_LABEL = 'WordPress'

export type WritingStats = {
  /** 累計記事数 */
  total: number
  /** 最初の記事の年 */
  firstYear: number | null
  /** 発信歴（年数、開始年と現在年を両端とも含む） */
  yearsActive: number
  /** 新しい年が先頭の年次推移 */
  series: YearCount[]
}

export type OssStats = {
  /** npm に公開しているパッケージ数 */
  npmPackages: number
  /** WordPress.org に公開しているプラグイン数 */
  wpPlugins: number
  /** WordPress.org プラグインの稼働サイト数合計 */
  activeInstalls: number
  /** WordPress.org プラグインの累計ダウンロード数合計 */
  downloads: number
}

export type ProfileStats = {
  writing: WritingStats | null
  /** 登壇レポートの記事数 */
  speakingReports: number | null
  oss: OssStats | null
}

/** AboutGold（schemaVersion 1）を ProfileStats に写す純粋関数。 */
export function toProfileStats(about: AboutGold): ProfileStats {
  const writing: WritingStats | null =
    about.writing === null || about.writing.byYear.length === 0
      ? null
      : {
          total: about.writing.total,
          firstYear: about.writing.firstYear,
          yearsActive: about.writing.yearsActive,
          // Gold は年の昇順、画面側の契約は新しい年が先頭
          series: [...about.writing.byYear].sort((a, b) => b.year - a.year),
        }

  // npm と WordPress.org の片方だけの「半端な OSS パネル」を出さない
  const { npm, wordpressOrg } = about.oss
  const oss: OssStats | null =
    npm === null || wordpressOrg === null
      ? null
      : {
          npmPackages: npm.packages.value,
          wpPlugins: wordpressOrg.plugins,
          activeInstalls: wordpressOrg.activeInstalls.value,
          downloads: wordpressOrg.downloads.value,
        }

  return { writing, speakingReports: about.speaking.reports, oss }
}

/**
 * 表示できる指標が1つでもあるか。
 *
 * false のときはページ側でスロットごと渡さない。渡すと ProfileStatsSection が
 * null を返し、見出しと余白だけのセクションが残る。
 */
export function hasAnyProfileStat(stats: ProfileStats): boolean {
  return stats.writing !== null || stats.oss !== null || (stats.speakingReports ?? 0) > 0
}

/**
 * /about で表示するプロフィール実績を返す。
 * about.json が取れなければ全指標 null（ページは壊さず、カードごと非表示）。
 */
export async function loadProfileStats(): Promise<ProfileStats> {
  const about = await loadAboutGold()
  if (!about) return { writing: null, speakingReports: null, oss: null }
  return toProfileStats(about)
}
