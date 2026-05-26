import { logger } from '@/libs/logger'
import type { FeedDataSource, FeedItem } from './types'

type QiitaItem = {
  id: string
  title: string
  body: string
  created_at: string
  updated_at: string
  url: string
  user: {
    id: string
    name: string
  }
}

// Qiita APIから記事を取得（ページネーション対応）。
// since を渡すと、その日時より古い記事が現れた時点でページ取得を打ち切り、リクエスト数を抑える
// （Qiita はデフォルトで作成日時の降順を返す）。
const fetchAllQiitaItems = async (userId: string, since?: Date): Promise<QiitaItem[]> => {
  const allItems: QiitaItem[] = []
  let page = 1
  const perPage = 100 // Qiita APIの最大値

  while (true) {
    const response = await fetch(
      `https://qiita.com/api/v2/users/${userId}/items?page=${page}&per_page=${perPage}`,
      {
        next: { revalidate: 7200 }, // 2時間ごとに再検証（週一更新）
      },
    )

    if (!response.ok) {
      logger.error('Failed to fetch Qiita items', {
        userId,
        status: response.status,
        page,
      })
      break
    }

    const items: QiitaItem[] = await response.json()

    if (items.length === 0) {
      break
    }

    allItems.push(...items)

    // 100件未満なら最後のページ
    if (items.length < perPage) {
      break
    }

    // since 指定時、このページに既に古い記事が含まれていれば以降は不要
    if (since && items.some((item) => new Date(item.created_at).getTime() < since.getTime())) {
      break
    }

    page++
  }

  return since
    ? allItems.filter((item) => new Date(item.created_at).getTime() >= since.getTime())
    : allItems
}

export const loadQiitaPosts = async (
  limit = 20,
  since?: Date,
): Promise<{ items: FeedItem[]; hasMore: boolean }> => {
  const dataSource: FeedDataSource = {
    href: 'https://qiita.com/hideokamoto',
    name: 'Qiita',
    color: 'bg-indigo-300 text-indigo-600',
  }

  try {
    // 2つのユーザーの記事を並列取得
    const [personalItems, stripeItems] = await Promise.all([
      fetchAllQiitaItems('motchi0214', since),
      fetchAllQiitaItems('hideokamoto', since),
    ])

    // ソートして、21件取得（20件以上あるかどうかを判定するため）
    const sortedItems = [...personalItems, ...stripeItems].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )

    const hasMore = sortedItems.length > limit
    const items = sortedItems.slice(0, limit).map((item): FeedItem => {
      // HTMLタグを除去してdescriptionを作成
      const description = item.body
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .substring(0, 200)

      return {
        id: item.id,
        title: item.title,
        description,
        datetime: item.created_at,
        href: item.url,
        dataSource,
      }
    })

    return { items, hasMore }
  } catch (error) {
    logger.error('Failed to load Qiita posts', {
      error,
    })
    return { items: [], hasMore: false }
  }
}
