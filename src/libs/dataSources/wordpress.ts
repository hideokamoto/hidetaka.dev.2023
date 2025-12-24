import type { FeedDataSource, FeedItem, WPPost } from './types'

export const loadWPPosts = async (
  locale: 'en' | 'ja',
): Promise<{ items: FeedItem[]; hasMore: boolean }> => {
  const dataSource: FeedDataSource = {
    href: 'https://wp-kyoto.net',
    name: 'WP Kyoto Blog',
    color: 'bg-indigo-100 text-indigo-800',
  }

  // 全件取得（ページネーション対応）
  const allItems: FeedItem[] = []
  let page = 1
  const perPage = 100 // WordPress APIの最大値

  while (true) {
    const response = await fetch(
      `https://wp-api.wp-kyoto.net/wp-json/wp/v2/posts?filter[lang]=${locale}&per_page=${perPage}&page=${page}`,
      {
        next: { revalidate: 1800 }, // 30分ごとに再検証（毎日1〜2記事更新）
      },
    )

    if (!response.ok) {
      console.error(`Failed to fetch WP posts: ${response.status}`)
      break
    }

    const posts: WPPost[] = await response.json()

    if (posts.length === 0) {
      break
    }

    const items = posts.map(
      (post: WPPost): FeedItem => ({
        title: post.title.rendered,
        description: post.excerpt.rendered,
        href: post.link.replace(/wp-api./, ''),
        datetime: post.date,
        dataSource,
        id: post.id,
      }),
    )

    allItems.push(...items)

    // 100件未満なら最後のページ
    if (posts.length < perPage) {
      break
    }

    page++
  }

  return { items: allItems, hasMore: false }
}
