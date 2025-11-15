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

