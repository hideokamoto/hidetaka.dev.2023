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

// Qiita APIから全記事を取得（ページネーション対応）
const fetchAllQiitaItems = async (userId: string): Promise<QiitaItem[]> => {
  const allItems: QiitaItem[] = []
  let page = 1
  const perPage = 100 // Qiita APIの最大値
  
  while (true) {
    const response = await fetch(
      `https://qiita.com/api/v2/users/${userId}/items?page=${page}&per_page=${perPage}`
    )
    
    if (!response.ok) {
      console.error(`Failed to fetch Qiita items for ${userId}: ${response.status}`)
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
    
    page++
  }
  
  return allItems
}

export const loadQiitaPosts = async (): Promise<{ items: FeedItem[], hasMore: boolean }> => {
  const dataSource: FeedDataSource = {
    href: 'https://qiita.com/hideokamoto',
    name: 'Qiita',
    color: 'bg-indigo-300 text-indigo-600',
  }
  
  try {
    // 2つのユーザーの記事を並列取得
    const [personalItems, stripeItems] = await Promise.all([
      fetchAllQiitaItems('motchi0214'),
      fetchAllQiitaItems('hideokamoto'),
    ])
    
    // ソートして、21件取得（20件以上あるかどうかを判定するため）
    const sortedItems = [...personalItems, ...stripeItems]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    
    const hasMore = sortedItems.length > 20
    const items = sortedItems.slice(0, 20).map((item): FeedItem => {
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
    console.error('Error loading Qiita posts:', error)
    return { items: [], hasMore: false }
  }
}