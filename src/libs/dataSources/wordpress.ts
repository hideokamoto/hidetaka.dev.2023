import type { FeedDataSource, FeedItem, WPPost } from './types'

export const loadWPPosts = async (locale: 'en' | 'ja'): Promise<{ items: FeedItem[], hasMore: boolean }> => {
    const dataSource: FeedDataSource = {
      href: 'https://wp-kyoto.net',
      name: 'WP Kyoto Blog',
      color: 'bg-indigo-100 text-indigo-800',
    }
    // 21件取得して、20件以上あるかどうかを判定
    const wp = await fetch(`https://wp-api.wp-kyoto.net/wp-json/wp/v2/posts?filter[lang]=${locale}&per_page=21`)
      .then((data) => data.json())
      .then((posts: WPPost[]) => {
        const hasMore = posts.length > 20
        const items = posts.slice(0, 20).map(
          (post: WPPost): FeedItem => ({
            title: post.title.rendered,
            description: post.excerpt.rendered,
            href: post.link.replace(/wp-api./, ''),
            datetime: post.date,
            dataSource,
            id: post.id,
          }),
        )
        return { items, hasMore }
      })
  
    return wp
  }
  