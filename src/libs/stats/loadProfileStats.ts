import { listMyNPMPackages } from '@/libs/dataSources/npmjs'
import { wpClient } from '@/libs/dataSources/wpClient'
import { listMyWordPressPlugins } from '@/libs/dataSources/wporg'
import { logger } from '@/libs/logger'
import { activeYearSpan, buildYearlySeries, firstYear, type YearCount } from './yearly'

// プロフィール実績は日単位でしか動かないため、1日ごとの再検証で十分。
const REVALIDATE_SECONDS = 86400

// 年次推移の対象は wp-kyoto.net の記事のみ。Qiita/Zenn/dev.to は
// 全期間の取得手段が無い（RSS が直近数十件に限られる）ため、
// 「累計」を名乗る数字に混ぜない。
export const WRITING_SOURCE_LABEL = 'wp-kyoto.net'

type DatedEntity = {
  date: string
}

export type WritingStats = {
  /** 累計記事数（日本語 + 英語） */
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
 * 指定した投稿タイプの全記事の公開日を取得する。
 * `_fields=date` で日付だけに絞ることで、1,000件超でも転送量を抑える。
 */
const fetchPublishedDates = async (
  restBase: string,
  lang?: 'ja' | 'en',
): Promise<string[] | null> => {
  try {
    const items = await wpClient.postType<DatedEntity>(restBase).listAll(
      {
        per_page: 100,
        _fields: ['date'],
        orderby: 'date',
        order: 'desc',
        ...(lang ? { 'filter[lang]': lang } : {}),
      },
      {
        next: { revalidate: REVALIDATE_SECONDS },
      },
    )
    return items.map((item) => item.date).filter((date): date is string => Boolean(date))
  } catch (error) {
    logger.error('Failed to load published dates for profile stats', { error, restBase, lang })
    return null
  }
}

const loadWritingStats = async (now: Date): Promise<WritingStats | null> => {
  const [ja, en] = await Promise.all([
    fetchPublishedDates('posts', 'ja'),
    fetchPublishedDates('posts', 'en'),
  ])

  // 片方でも取得できていれば表示する。両方失敗したときだけ非表示にする。
  if (ja === null && en === null) return null

  const dates = [...(ja ?? []), ...(en ?? [])]
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
      { per_page: 1, _fields: ['date'] },
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

  const activeInstalls = wpPlugins.reduce((sum, plugin) => sum + (plugin.active_installs ?? 0), 0)
  const downloads = wpPlugins.reduce((sum, plugin) => sum + (plugin.downloaded ?? 0), 0)

  // 両方とも空（＝取得失敗またはデータ無し）なら、0 を並べるより非表示にする
  if (npmPackages.length === 0 && wpPlugins.length === 0) return null

  return {
    npmPackages: npmPackages.length,
    wpPlugins: wpPlugins.length,
    activeInstalls,
    downloads,
  }
}

/**
 * /about で表示するプロフィール実績を集約して返す。
 *
 * 各指標は独立して失敗しうる（外部APIが落ちてもページは壊さない）ため、
 * 取得できなかったものは null にして呼び出し側で非表示にする。
 */
export async function loadProfileStats(now: Date = new Date()): Promise<ProfileStats> {
  const [writing, speakingReports, oss] = await Promise.all([
    loadWritingStats(now),
    loadSpeakingReportCount(),
    loadOssStats(),
  ])

  return { writing, speakingReports, oss }
}
