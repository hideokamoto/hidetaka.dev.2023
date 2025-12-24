import { logger } from '@/libs/logger'
import { loadFeedPosts } from './feed.utils'
import type { FeedDataSource, FeedItem, ZennFeed } from './types'

export const loadZennPosts = async (): Promise<{ items: FeedItem[]; hasMore: boolean }> => {
  const dataSource: FeedDataSource = {
    href: 'https://zenn.dev/hideokamoto',
    name: 'Zenn',
    color: 'bg-indigo-300 text-indigo-600',
  }
  const personal = await loadFeedPosts<ZennFeed>('https://zenn.dev/hideokamoto/feed')
  const stripe = await loadFeedPosts<ZennFeed>('https://zenn.dev/stripe/feed')
  // ソートして、21件取得（20件以上あるかどうかを判定するため）
  const sortedItems = [...personal.items, ...stripe.items].sort(
    (a, b) => new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime(),
  )

  const hasMore = sortedItems.length > 20
  const items = sortedItems.slice(0, 20).map((data): FeedItem => {
    // Ensure datetime is properly formatted
    // Zenn RSS feeds use RFC 822 format (e.g., "Mon, 10 Nov 2025 10:14:00 GMT")
    // which should be parseable by new Date(), but we'll ensure it's valid
    let datetime = data.isoDate
    if (datetime) {
      const parsedDate = new Date(datetime)
      if (Number.isNaN(parsedDate.getTime())) {
        logger.warn('Invalid date from Zenn feed', {
          datetime,
          articleTitle: data.title,
        })
        // Fallback: use current date if parsing fails
        datetime = new Date().toISOString()
      } else {
        // Normalize to ISO 8601 format for consistency
        datetime = parsedDate.toISOString()
      }
    }

    return {
      title: data.title,
      description: data.content,
      datetime,
      href: data.link,
      dataSource,
    }
  })

  return { items, hasMore }
}
