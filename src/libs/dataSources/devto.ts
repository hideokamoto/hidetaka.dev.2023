import type { FeedDataSource, FeedItem } from './types'

export const loadDevToPosts = async (): Promise<{ items: FeedItem[]; hasMore: boolean }> => {
  const dataSource: FeedDataSource = {
    href: 'https://dev.to',
    name: 'Dev.to',
    color: 'bg-green-100 text-gren-800',
  }
  const personal = await fetch('https://dev.to/api/articles?username=hideokamoto').then((data) => {
    if (data.ok) return data.json()
    return []
  })
  const stripe = await fetch('https://dev.to/api/articles?username=hideokamoto_stripe').then(
    (data) => {
      if (data.ok) return data.json()
      return []
    },
  )
  const allItems = [...personal, ...stripe]
  const hasMore = allItems.length > 20
  const items = allItems.slice(0, 20).map((data): FeedItem => {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      image: data.social_image,
      datetime: data.published_at,
      href: data.url,
      dataSource: {
        ...dataSource,
        href: `https://dev.to/${data.user.username}`,
      },
    }
  })
  return { items, hasMore }
}
