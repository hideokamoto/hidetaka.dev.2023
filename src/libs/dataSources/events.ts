import { logger } from '@/libs/logger'
import type { BlogItem, WPEvent } from './types'
import { wpClient } from './wpClient'

const eventsCollection = () => wpClient.postType<WPEvent>('events')

export const loadWPEvents = async (): Promise<WPEvent[]> => {
  try {
    return await eventsCollection().listAll(
      {
        per_page: 100,
        orderby: 'date',
        order: 'desc',
      },
      {
        next: { revalidate: 3600 },
      },
    )
  } catch (error) {
    logger.error('Failed to load WordPress events', {
      error,
    })
    return []
  }
}

export const getWPEventBySlug = async (slug: string): Promise<WPEvent | null> => {
  try {
    return await eventsCollection().getBySlug(slug, {
      _fields: [
        'id',
        'title',
        'date',
        'date_gmt',
        'modified',
        'modified_gmt',
        'excerpt',
        'content',
        'link',
        'slug',
        'status',
        'type',
        'guid',
        'featured_media',
      ],
    })
  } catch (error) {
    logger.error('Failed to load WordPress event by slug', {
      error,
      slug,
    })
    return null
  }
}

export type AdjacentEvents = {
  previous: WPEvent | null
  next: WPEvent | null
}

export const getAdjacentEvents = async (currentEvent: WPEvent): Promise<AdjacentEvents> => {
  try {
    // 前の記事を取得（現在の記事より前の日付で最も新しいもの）
    const previousPromise = eventsCollection().list({
      before: currentEvent.date,
      per_page: 1,
      orderby: 'date',
      order: 'desc',
      _fields: ['id', 'title', 'slug'],
    })

    // 次の記事を取得（現在の記事より後の日付で最も古いもの）
    const nextPromise = eventsCollection().list({
      after: currentEvent.date,
      per_page: 1,
      orderby: 'date',
      order: 'asc',
      _fields: ['id', 'title', 'slug'],
    })

    // 並列で実行
    const [previousResult, nextResult] = await Promise.all([previousPromise, nextPromise])

    // _fields で id/title/slug のみ取得しているため、WPEvent として返すためにキャスト
    return {
      previous: (previousResult.items[0] as WPEvent | undefined) ?? null,
      next: (nextResult.items[0] as WPEvent | undefined) ?? null,
    }
  } catch (error) {
    logger.error('Failed to load adjacent events', {
      error,
      eventId: currentEvent.id,
    })
    return {
      previous: null,
      next: null,
    }
  }
}

/**
 * 関連イベント記事を取得（同じ投稿タイプの最新記事）
 * BlogItem型で返すため、RelatedArticlesコンポーネントで表示可能
 */
export const getRelatedEvents = async (
  currentEvent: WPEvent,
  limit: number = 4,
  lang: 'en' | 'ja' = 'en',
  basePath?: string,
): Promise<BlogItem[]> => {
  try {
    // 現在の記事を除外して最新のイベント記事を取得
    const { items: events } = await eventsCollection().list({
      exclude: [currentEvent.id],
      per_page: limit,
      orderby: 'date',
      order: 'desc',
      _fields: ['id', 'title', 'date', 'date_gmt', 'excerpt', 'slug'],
    })

    // BlogItem型に変換
    const eventBasePath = basePath || (lang === 'ja' ? '/ja/event-reports' : '/event-reports')
    const items: BlogItem[] = events.map((event) => ({
      id: event.id.toString(),
      title: event.title.rendered,
      description: event.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 150),
      datetime: event.date,
      href: `${eventBasePath}/${event.slug}`,
    }))

    return items
  } catch (error) {
    logger.error('Failed to load related events', {
      error,
      eventId: currentEvent.id,
      limit,
    })
    return []
  }
}
