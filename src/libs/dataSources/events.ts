import { createWPClient } from 'node-wp-api-client'
import { logger } from '@/libs/logger'
import type { BlogItem, WPEvent } from './types'

const wp = createWPClient({ baseUrl: 'https://wp-api.wp-kyoto.net' })
const eventsApi = wp.postType<WPEvent>('events')

export const loadWPEvents = async (): Promise<WPEvent[]> => {
  try {
    // 全ページを取得して結合（総ページ数はX-WP-TotalPagesヘッダーから判定される）
    const allEvents = await eventsApi.listAll({
      per_page: 100,
      orderby: 'date',
      order: 'desc',
    })

    return allEvents
  } catch (error) {
    logger.error('Failed to load WordPress events', {
      error,
    })
    return []
  }
}

export const getWPEventBySlug = async (slug: string): Promise<WPEvent | null> => {
  try {
    const event = await eventsApi.getBySlug(slug, {
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

    return event
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

// WordPress APIから前後いずれかの記事を取得するヘルパー関数
const fetchAdjacentEvent = async (
  query: { before: string; order: 'desc' } | { after: string; order: 'asc' },
): Promise<WPEvent | null> => {
  try {
    const { items: events } = await eventsApi.list({
      ...query,
      per_page: 1,
      orderby: 'date',
      _fields: ['id', 'title', 'slug'],
    })

    return events.length > 0 ? (events[0] as WPEvent) : null
  } catch (error) {
    logger.error('Failed to fetch event', {
      error,
      query,
    })
    return null
  }
}

export const getAdjacentEvents = async (currentEvent: WPEvent): Promise<AdjacentEvents> => {
  try {
    // 前の記事（現在の記事より前の日付で最も新しいもの）と
    // 次の記事（現在の記事より後の日付で最も古いもの）を並列で取得
    const [previous, next] = await Promise.all([
      fetchAdjacentEvent({ before: currentEvent.date, order: 'desc' }),
      fetchAdjacentEvent({ after: currentEvent.date, order: 'asc' }),
    ])

    return {
      previous,
      next,
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
    const { items: events } = await eventsApi.list({
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
