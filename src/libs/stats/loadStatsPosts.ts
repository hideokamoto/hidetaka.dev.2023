import { sourceDevNotes, stripeDotDevPosts } from '@/libs/dataSources/blogs'
import { loadDevNotes } from '@/libs/dataSources/devnotes'
import { loadDevToPosts } from '@/libs/dataSources/devto'
import { loadQiitaPosts } from '@/libs/dataSources/qiita'
import type { FeedItem } from '@/libs/dataSources/types'
import { loadWPPosts } from '@/libs/dataSources/wordpress'
import { loadZennPosts } from '@/libs/dataSources/zenn'

// 統計用に媒体ごと直近約100件を取得する上限。負荷とAPIレート制限を考慮した値。
const STATS_LIMIT = 100

/**
 * 執筆統計用に全媒体の記事を集約して返す。
 *
 * カード一覧用の `loadBlogPosts` がロケール毎にソースを出し分けるのに対し、
 * こちらは「執筆活動全体」を表現するため言語を問わず全ソースを取得する。
 * `lang` は将来的な出し分けのために受け取るが、現状は集計対象に影響しない。
 *
 * Zenn は RSS の制約により直近約20件しか取得できない点に注意。
 */
export async function loadStatsPosts(_lang: 'ja' | 'en' = 'ja'): Promise<FeedItem[]> {
  const empty = { items: [] as FeedItem[], hasMore: false }

  const [wpJa, wpEn, devto, zenn, qiita, devNotesResult] = await Promise.all([
    loadWPPosts('ja', STATS_LIMIT).catch(() => empty),
    loadWPPosts('en', STATS_LIMIT).catch(() => empty),
    loadDevToPosts(STATS_LIMIT).catch(() => empty),
    loadZennPosts(STATS_LIMIT).catch(() => empty),
    loadQiitaPosts(STATS_LIMIT).catch(() => empty),
    loadDevNotes(1, STATS_LIMIT).catch(() => ({
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

  // href で重複排除（言語間の同一記事や取得元の重なりを防ぐ）
  const seen = new Set<string>()
  const deduped = allPosts.filter((item) => {
    if (seen.has(item.href)) return false
    seen.add(item.href)
    return true
  })

  deduped.sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())

  return deduped
}
