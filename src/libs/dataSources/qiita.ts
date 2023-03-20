import type { FeedDataSource, FeedItem, QiitaAtomFeed } from './types'
import { loadFeedPosts } from './feed.utils'

export const loadQiitaPosts = async (): Promise<FeedItem[]> => {
    const dataSource: FeedDataSource = {
      href: 'https://qiita.com',
      name: 'Qiita',
      color: 'bg-indigo-300 text-indigo-600',
    }
    const personal = await loadFeedPosts<QiitaAtomFeed>('https://qiita.com/motchi0214/feed.atom')
    const stripe = await loadFeedPosts<QiitaAtomFeed>('https://qiita.com/hideokamoto/feed.atom')
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