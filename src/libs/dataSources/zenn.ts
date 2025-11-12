import type { FeedDataSource, FeedItem, ZennFeed } from './types'
import { loadFeedPosts } from './feed.utils'


export const loadZennPosts = async (): Promise<FeedItem[]> => {
    const dataSource: FeedDataSource = {
      href: 'https://zenn.dev',
      name: 'Zenn',
      color: 'bg-indigo-300 text-indigo-600',
    }
    const personal = await loadFeedPosts<ZennFeed>('https://zenn.dev/hideokamoto/feed')
    const stripe = await loadFeedPosts<ZennFeed>('https://zenn.dev/stripe/feed')
    return [...personal.items, ...stripe.items].map((data): FeedItem => {
      // Ensure datetime is properly formatted
      // Zenn RSS feeds use RFC 822 format (e.g., "Mon, 10 Nov 2025 10:14:00 GMT")
      // which should be parseable by new Date(), but we'll ensure it's valid
      let datetime = data.isoDate
      if (datetime) {
        const parsedDate = new Date(datetime)
        if (isNaN(parsedDate.getTime())) {
          console.warn('Invalid date from Zenn feed:', datetime, 'for article:', data.title)
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
  }