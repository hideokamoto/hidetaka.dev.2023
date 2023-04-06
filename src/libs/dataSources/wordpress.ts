import type { FeedDataSource, FeedItem, WPPost } from './types'

export const loadWPPosts = async (locale: 'en' | 'ja'): Promise<FeedItem[]> => {
    const dataSource: FeedDataSource = {
      href: 'https://wp-kyoto.net',
      name: 'WP Kyoto Blog',
      color: 'bg-indigo-100 text-indigo-800',
    }
    const wp = await fetch(`https://wp-api.wp-kyoto.net/wp-json/wp/v2/posts?filter[lang]=${locale}`)
      .then((data) => data.json())
      .then((posts) => {
        return posts.map(
          (post: WPPost): FeedItem => ({
            title: post.title.rendered,
            description: post.excerpt.rendered,
            href: post.link.replace(/wp-api./, ''),
            datetime: post.date,
            dataSource,
            id: post.id,
          }),
        )
      })
  
    return wp
  }
  