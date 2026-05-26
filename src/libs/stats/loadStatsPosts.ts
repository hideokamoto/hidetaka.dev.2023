import { sourceDevNotes, stripeDotDevPosts } from '@/libs/dataSources/blogs'
import { loadDevNotes } from '@/libs/dataSources/devnotes'
import { loadDevToPosts } from '@/libs/dataSources/devto'
import { loadQiitaPosts } from '@/libs/dataSources/qiita'
import type { FeedItem } from '@/libs/dataSources/types'
import { loadWPPosts } from '@/libs/dataSources/wordpress'
import { loadZennPosts } from '@/libs/dataSources/zenn'

// 統計の表示窓（直近Nヶ月）。取得・集計ともにこの窓に揃える。
export const STATS_WINDOW_MONTHS = 12

// 窓内に収まらないほど多く投稿する媒体向けの安全上限。日付フィルタが主、これは保険。
const STATS_LIMIT = 100

// 直近 STATS_WINDOW_MONTHS ヶ月の開始日（窓の最初の月の1日, UTC）を返す。
const windowStart = (now: Date): Date =>
  new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (STATS_WINDOW_MONTHS - 1), 1))

/**
 * 執筆統計用に全媒体の記事を「直近 STATS_WINDOW_MONTHS ヶ月」に絞って集約して返す。
 *
 * カード一覧用の `loadBlogPosts` がロケール毎にソースを出し分けるのに対し、
 * こちらは「執筆活動全体」を表現するため言語を問わず全ソースを取得する。
 * `lang` は将来的な出し分けのために受け取るが、現状は集計対象に影響しない。
 *
 * 取得段階で窓を絞る（WP/dev-notes は `after`、Qiita は古い記事到達で打ち切り）ことで、
 * 過剰なリクエストとデータ量を抑える。Zenn は RSS の制約により直近約20件のみ。
 */
export async function loadStatsPosts(
  _lang: 'ja' | 'en' = 'ja',
  now: Date = new Date(),
): Promise<FeedItem[]> {
  const start = windowStart(now)
  const afterIso = start.toISOString()
  const empty = { items: [] as FeedItem[], hasMore: false }

  const [wpJa, wpEn, devto, zenn, qiita, devNotesResult] = await Promise.all([
    loadWPPosts('ja', STATS_LIMIT, afterIso).catch(() => empty),
    loadWPPosts('en', STATS_LIMIT, afterIso).catch(() => empty),
    loadDevToPosts(STATS_LIMIT).catch(() => empty),
    loadZennPosts(STATS_LIMIT).catch(() => empty),
    loadQiitaPosts(STATS_LIMIT, start).catch(() => empty),
    loadDevNotes(1, STATS_LIMIT, 'ja', afterIso).catch(() => ({
      items: [],
      totalPages: 0,
      totalItems: 0,
      currentPage: 1,
    })),
  ])

  const devNotesPosts: FeedItem[] = devNotesResult.items.map((item) => ({
    id: item.id,
    title: item.title,
    href: item.href,
    description: item.description,
    datetime: item.datetime,
    dataSource: sourceDevNotes,
  }))

  const allPosts: FeedItem[] = [
    ...wpJa.items,
    ...wpEn.items,
    ...devto.items,
    ...zenn.items,
    ...qiita.items,
    ...stripeDotDevPosts,
    ...devNotesPosts,
  ]

  // 取得段階で絞れない媒体（Dev.to/Zenn/Stripe）も含め、窓外を最終的に除外
  const startMs = start.getTime()
  const inWindow = allPosts.filter((item) => {
    const t = new Date(item.datetime).getTime()
    return !Number.isNaN(t) && t >= startMs
  })

  // href で重複排除（言語間の同一記事や取得元の重なりを防ぐ）
  const seen = new Set<string>()
  const deduped = inWindow.filter((item) => {
    if (seen.has(item.href)) return false
    seen.add(item.href)
    return true
  })

  deduped.sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())

  return deduped
}
