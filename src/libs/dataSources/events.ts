import { logger } from '@/libs/logger'
import type { BlogItem, WPEvent } from './types'

export const loadWPEvents = async (): Promise<WPEvent[]> => {
  try {
    const response = await fetch(
      `https://wp-api.wp-kyoto.net/wp-json/wp/v2/events?per_page=100&orderby=date&order=desc`,
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.status}`)
    }

    const events: WPEvent[] = await response.json()
    return events
  } catch (error) {
    logger.error('Failed to load WordPress events', {
      error: error instanceof Error ? error.message : String(error),
    })
    return []
  }
}

export const getWPEventBySlug = async (slug: string): Promise<WPEvent | null> => {
  try {
    const response = await fetch(
      `https://wp-api.wp-kyoto.net/wp-json/wp/v2/events?slug=${encodeURIComponent(slug)}&_fields=id,title,date,date_gmt,modified,modified_gmt,excerpt,content,link,slug,status,type,guid,featured_media`,
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch event by slug: ${response.status}`)
    }

    const events: WPEvent[] = await response.json()

    if (events.length === 0) {
      return null
    }

    return events[0]
  } catch (error) {
    logger.error('Failed to load WordPress event by slug', {
      error: error instanceof Error ? error.message : String(error),
      slug,
    })
    return null
  }
}

export type AdjacentEvents = {
  previous: WPEvent | null
  next: WPEvent | null
}

// WordPress APIから記事を取得するヘルパー関数
const fetchEvent = async (url: string): Promise<WPEvent | null> => {
  try {
    const response = await fetch(url)

    if (!response.ok) {
      return null
    }

    const events: WPEvent[] = await response.json()

    if (events.length === 0) {
      return null
    }

    return events[0]
  } catch (error) {
    logger.error('Failed to fetch event', {
      error: error instanceof Error ? error.message : String(error),
      url,
    })
    return null
  }
}

export const getAdjacentEvents = async (currentEvent: WPEvent): Promise<AdjacentEvents> => {
  try {
    // 前の記事を取得（現在の記事より前の日付で最も新しいもの）
    const previousUrl = `https://wp-api.wp-kyoto.net/wp-json/wp/v2/events?before=${encodeURIComponent(currentEvent.date)}&per_page=1&orderby=date&order=desc&_fields=id,title,slug`

    // 次の記事を取得（現在の記事より後の日付で最も古いもの）
    const nextUrl = `https://wp-api.wp-kyoto.net/wp-json/wp/v2/events?after=${encodeURIComponent(currentEvent.date)}&per_page=1&orderby=date&order=asc&_fields=id,title,slug`

    // 並列で実行
    const [previous, next] = await Promise.all([fetchEvent(previousUrl), fetchEvent(nextUrl)])

    return {
      previous,
      next,
    }
  } catch (error) {
    logger.error('Failed to load adjacent events', {
      error: error instanceof Error ? error.message : String(error),
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
): Promise<BlogItem[]> => {
  try {
    // 現在の記事を除外して最新のイベント記事を取得
    const response = await fetch(
      `https://wp-api.wp-kyoto.net/wp-json/wp/v2/events?exclude=${currentEvent.id}&per_page=${limit}&orderby=date&order=desc&_fields=id,title,date,date_gmt,excerpt,slug`,
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch related events: ${response.status}`)
    }

    const events: WPEvent[] = await response.json()

    // BlogItem型に変換
    const basePath = lang === 'ja' ? '/ja/event-reports' : '/event-reports'
    const items: BlogItem[] = events.map((event) => ({
      id: event.id.toString(),
      title: event.title.rendered,
      description: event.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 150),
      datetime: event.date,
      href: `${basePath}/${event.slug}`,
    }))

    return items
  } catch (error) {
    logger.error('Failed to load related events', {
      error: error instanceof Error ? error.message : String(error),
      eventId: currentEvent.id,
      limit,
    })
    return []
  }
}
