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

