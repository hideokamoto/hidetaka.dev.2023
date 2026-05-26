import type { FeedDataSource, FeedItem } from './types'

export const loadDevToPosts = async (
  limit = 20,
): Promise<{ items: FeedItem[]; hasMore: boolean }> => {
  const dataSource: FeedDataSource = {
    href: 'https://dev.to',
    name: 'Dev.to',
    color: 'bg-green-100 text-gren-800',
  }
  const perPage = Math.max(limit, 30)
  const personalResponse = await fetch(
    `https://dev.to/api/articles?username=hideokamoto&per_page=${perPage}`,
  )
  const personal = personalResponse.ok ? await personalResponse.json() : []
  const stripeResponse = await fetch(
    `https://dev.to/api/articles?username=hideokamoto_stripe&per_page=${perPage}`,
  )
  const stripe = stripeResponse.ok ? await stripeResponse.json() : []
  const allItems = [...personal, ...stripe]
  const hasMore = allItems.length > limit
  const items = allItems.slice(0, limit).map((data): FeedItem => {
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
