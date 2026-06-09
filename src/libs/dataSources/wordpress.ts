import { createWPClient } from 'node-wp-api-client'
import type { FeedDataSource, FeedItem, WPPost } from './types'

const wp = createWPClient({ baseUrl: 'https://wp-api.wp-kyoto.net' })
const postsApi = wp.postType<WPPost>('posts')

export const loadWPPosts = async (
  locale: 'en' | 'ja',
  limit = 20,
  after?: string,
): Promise<{ items: FeedItem[]; hasMore: boolean }> => {
  const dataSource: FeedDataSource = {
    href: 'https://wp-kyoto.net',
    name: 'WP Kyoto Blog',
    color: 'bg-indigo-100 text-indigo-800',
  }
  // limit + 1件取得して、さらに記事があるかどうかを判定（WP REST APIのper_page上限は100）
  // after を渡すとその日時以降の記事のみ取得し、過剰なデータ取得を避ける
  const perPage = Math.min(limit + 1, 100)
  const { items: posts, totalPages } = await postsApi.list(
    {
      'filter[lang]': locale,
      per_page: perPage,
      after,
    },
    {
      next: { revalidate: 1800 }, // 30分ごとに再検証（毎日1〜2記事更新）
    },
  )
  const hasMore = totalPages > 1
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
}
