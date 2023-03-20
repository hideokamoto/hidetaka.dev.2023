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
      return {
        title: data.title,
        description: data.content,
        datetime: data.isoDate,
        href: data.link,
        dataSource,
      }
    })
  }