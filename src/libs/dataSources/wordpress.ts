import type { FeedDataSource, FeedItem, WPPost } from './types'

export const loadWPPosts = async (
  locale: 'en' | 'ja',
  limit = 20,
): Promise<{ items: FeedItem[]; hasMore: boolean }> => {
  const dataSource: FeedDataSource = {
    href: 'https://wp-kyoto.net',
    name: 'WP Kyoto Blog',
    color: 'bg-indigo-100 text-indigo-800',
  }
  // limit + 1件取得して、さらに記事があるかどうかを判定（WP REST APIのper_page上限は100）
  const perPage = Math.min(limit + 1, 100)
  const wp = await fetch(
    `https://wp-api.wp-kyoto.net/wp-json/wp/v2/posts?filter[lang]=${locale}&per_page=${perPage}`,
    {
      next: { revalidate: 1800 }, // 30分ごとに再検証（毎日1〜2記事更新）
    },
  )
    .then((data) => data.json())
    .then((posts: WPPost[]) => {
      const hasMore = posts.length > limit
      const items = posts.slice(0, limit).map(
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
