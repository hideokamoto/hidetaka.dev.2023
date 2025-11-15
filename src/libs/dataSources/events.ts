import type { WPEvent } from './types'

export const loadWPEvents = async (): Promise<WPEvent[]> => {
  try {
    const response = await fetch(
      `https://wp-api.wp-kyoto.net/wp-json/wp/v2/events?per_page=100&orderby=date&order=desc`
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.status}`)
    }

    const events: WPEvent[] = await response.json()
    return events
  } catch (error) {
    console.error('Error loading WordPress events:', error)
    return []
  }
}

export const getWPEventBySlug = async (slug: string): Promise<WPEvent | null> => {
  try {
    const response = await fetch(
      `https://wp-api.wp-kyoto.net/wp-json/wp/v2/events?slug=${encodeURIComponent(slug)}&_fields=id,title,date,date_gmt,modified,modified_gmt,excerpt,content,link,slug,status,type,guid,featured_media`
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
    console.error('Error loading WordPress event by slug:', error)
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
    console.error('Error fetching event:', error)
    return null
  }
}

export const getAdjacentEvents = async (
  currentEvent: WPEvent
): Promise<AdjacentEvents> => {
  try {
    // 前の記事を取得（現在の記事より前の日付で最も新しいもの）
    const previousUrl = `https://wp-api.wp-kyoto.net/wp-json/wp/v2/events?before=${encodeURIComponent(currentEvent.date)}&per_page=1&orderby=date&order=desc&_fields=id,title,slug`

    // 次の記事を取得（現在の記事より後の日付で最も古いもの）
    const nextUrl = `https://wp-api.wp-kyoto.net/wp-json/wp/v2/events?after=${encodeURIComponent(currentEvent.date)}&per_page=1&orderby=date&order=asc&_fields=id,title,slug`

    // 並列で実行
    const [previous, next] = await Promise.all([
      fetchEvent(previousUrl),
      fetchEvent(nextUrl),
    ])

    return {
      previous,
      next,
    }
  } catch (error) {
    console.error('Error loading adjacent events:', error)
    return {
      previous: null,
      next: null,
    }
  }
}

