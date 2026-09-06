import { listMyNPMPackages } from '@/libs/dataSources/npmjs'
import { wpClient } from '@/libs/dataSources/wpClient'
import { listMyWordPressPlugins } from '@/libs/dataSources/wporg'
import { logger } from '@/libs/logger'
import { activeYearSpan, buildYearlySeries, firstYear, type YearCount } from './yearly'

// プロフィール実績は日単位でしか動かないため、1日ごとの再検証で十分。
const REVALIDATE_SECONDS = 86400

// 年次推移の対象は WordPress（wp-api.wp-kyoto.net）が配信する記事のみ。
// Qiita/Zenn/dev.to は全期間の取得手段が無い（RSS が直近数十件に限られる）ため、
// 「累計」を名乗る数字に混ぜない。
//
// 単一サイト名を名乗らないのは、同じ WordPress から複数サイトへ配信しているため。
// posts は wp-kyoto.net、thoughs と dev-notes は hidetaka.dev、stripe は
// revtrona.com 側で公開されており、「wp-kyoto.net の記事数」と書くと誤りになる。
export const WRITING_SOURCE_LABEL = 'WordPress'

type DatedEntity = {
  /**
   * UTC の公開日時。WordPress は `date`（サイトのローカル時刻）と
   * `date_gmt`（UTC）の両方を返すが、どちらもオフセット表記を持たない。
   * `date` を `new Date()` に渡すと実行環境のローカル時刻として解釈され、
   * 年の割り当てが TZ 依存になるため、UTC 側だけを使う。
   */
  date_gmt: string
}

/**
 * 執筆記事としてカウントする投稿タイプ。
 *
 * wp-kyoto.net に登録されている投稿タイプの分類（`/wp-json/wp/v2/types`）:
 * - 執筆記事  … posts（投稿）/ thoughs（雑記）/ stripe（Stripe）/ dev-notes（DevNotes）← ここで集計
 * - 登壇      … events ← `loadSpeakingReportCount` で別軸として集計
 * - 記事以外  … products（リリース告知）/ stripe-products（製品データ）/ llms-texts（機械向け）
 * - 対象外    … pages / attachment / wp_block / wp_template(_part) / wp_navigation /
 *                nav_menu_item / wp_font_family / wp_font_face
 * - 取得不可  … developer-deep-dives（REST が 401 を返す非公開タイプ）
 *
 * `langs` は Polylang の言語別取得が必要かどうか。posts のみ言語ごとに
 * 記事が分かれており、他は `filter[lang]` を付けても全件が返るため、
 * 言語別に取得すると二重計上になる。
 */
const WRITING_COLLECTIONS: ReadonlyArray<{
  restBase: string
  langs: ReadonlyArray<'ja' | 'en' | null>
}> = [
  { restBase: 'posts', langs: ['ja', 'en'] },
  { restBase: 'thoughs', langs: [null] },
  { restBase: 'stripe', langs: [null] },
  { restBase: 'dev-notes', langs: [null] },
]

export type WritingStats = {
  /** 累計記事数（WRITING_COLLECTIONS の全投稿タイプ、日本語 + 英語） */
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

/**
 * WordPress の `date_gmt`（オフセット無しの UTC 表記）を UTC として確定させる。
 * 既にオフセットや `Z` を持つ値はそのまま返す。
 */
const toUtcIso = (dateGmt: string): string =>
  /(?:Z|[+-]\d{2}:?\d{2})$/.test(dateGmt) ? dateGmt : `${dateGmt}Z`

/**
 * 指定した投稿タイプの全記事の公開日（UTC）を取得する。
 * `_fields=date_gmt` で日付だけに絞ることで、1,000件超でも転送量を抑える。
 *
 * 返す文字列には `Z` を付ける。`date_gmt` は `2026-09-02T00:03:03` のように
 * オフセットを持たず、そのままでは実行環境のローカル時刻として解釈されるため。
 */
const fetchPublishedDates = async (
  restBase: string,
  lang: 'ja' | 'en' | null,
): Promise<string[] | null> => {
  try {
    const items = await wpClient.postType<DatedEntity>(restBase).listAll(
      {
        per_page: 100,
        _fields: ['date_gmt'],
        orderby: 'date',
        order: 'desc',
        ...(lang ? { 'filter[lang]': lang } : {}),
      },
      {
        next: { revalidate: REVALIDATE_SECONDS },
      },
    )
    return items
      .map((item) => item.date_gmt)
      .filter((date): date is string => Boolean(date))
      .map(toUtcIso)
  } catch (error) {
    logger.error('Failed to load published dates for profile stats', { error, restBase, lang })
    return null
  }
}

const loadWritingStats = async (now: Date): Promise<WritingStats | null> => {
  const results = await Promise.all(
    WRITING_COLLECTIONS.flatMap((collection) =>
      collection.langs.map((lang) => fetchPublishedDates(collection.restBase, lang)),
    ),
  )

  // 1つでも取得に失敗したら、累計記事数を出さない。
  // 部分的な結果で「累計」を名乗ると、実際より大幅に少ない本数を24時間
  // キャッシュしたまま公開してしまう（posts の ja が落ちるだけで1,000本以上減る）。
  // 誤った数字を出すより、カードごと消えるほうが害が小さい。
  if (results.some((result) => result === null)) {
    logger.error('Skipping writing stats: at least one collection failed to load')
    return null
  }

  const dates = results.flat() as string[]
  if (dates.length === 0) return null

  return {
    total: dates.length,
    firstYear: firstYear(dates),
    yearsActive: activeYearSpan(dates, now),
    series: buildYearlySeries(dates, now),
  }
}

const loadSpeakingReportCount = async (): Promise<number | null> => {
  try {
    const { total } = await wpClient.postType<DatedEntity>('events').list(
      { per_page: 1, _fields: ['date_gmt'] },
      {
        next: { revalidate: REVALIDATE_SECONDS },
      },
    )
    return total
  } catch (error) {
    logger.error('Failed to load speaking report count', { error })
    return null
  }
}

const loadOssStats = async (): Promise<OssStats | null> => {
  const [npmPackages, wpPlugins] = await Promise.all([
    listMyNPMPackages(),
    listMyWordPressPlugins(),
  ])

  // `listMyNPMPackages` / `listMyWordPressPlugins` はエラーを内部で握りつぶして
  // 空配列を返すため、「0件」と「取得失敗」を戻り値から区別できない。
  // どちらも実際には非空なので、片方でも空なら取得失敗とみなして OSS 指標を出さない。
  // 片方だけ空のまま表示すると「WordPress.org 0」という誤った実績を公開し、
  // 稼働サイト数・累計DLのカードも黙って消える。
  if (npmPackages.length === 0 || wpPlugins.length === 0) {
    logger.error('Skipping OSS stats: at least one source returned no data', {
      npmPackages: npmPackages.length,
      wpPlugins: wpPlugins.length,
    })
    return null
  }

  return {
    npmPackages: npmPackages.length,
    wpPlugins: wpPlugins.length,
    activeInstalls: wpPlugins.reduce((sum, plugin) => sum + (plugin.active_installs ?? 0), 0),
    downloads: wpPlugins.reduce((sum, plugin) => sum + (plugin.downloaded ?? 0), 0),
  }
}

/**
 * /about で表示するプロフィール実績を集約して返す。
 *
 * 各指標は独立して失敗しうる（外部APIが落ちてもページは壊さない）ため、
 * 取得できなかったものは null にして呼び出し側で非表示にする。
 */
export function hasAnyProfileStat(stats: ProfileStats): boolean {
  return stats.writing !== null || stats.oss !== null || (stats.speakingReports ?? 0) > 0
}

export async function loadProfileStats(now: Date = new Date()): Promise<ProfileStats> {
  const [writing, speakingReports, oss] = await Promise.all([
    loadWritingStats(now),
    loadSpeakingReportCount(),
    loadOssStats(),
  ])

  return { writing, speakingReports, oss }
}
