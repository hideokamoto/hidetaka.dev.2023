import type { BlogItem, WPThought } from './types'

export type ThoughtsResult = {
  items: BlogItem[]
  totalPages: number
  totalItems: number
  currentPage: number
}

export const loadThoughts = async (
  page: number = 1,
  perPage: number = 20,
  lang: 'en' | 'ja' = 'en'
): Promise<ThoughtsResult> => {
  try {
    const response = await fetch(
      `https://wp-api.wp-kyoto.net/wp-json/wp/v2/thoughs?page=${page}&per_page=${perPage}`
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch thoughts: ${response.status}`)
    }

    // 総記事数と総ページ数をヘッダーから取得
    const totalItems = parseInt(response.headers.get('X-WP-Total') || '0', 10)
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '0', 10)

    const thoughts: WPThought[] = await response.json()

    // BlogItem型に変換（このサイトの記事として扱う）
    const items: BlogItem[] = thoughts.map((thought: WPThought): BlogItem => {
      // slugを使用してこのサイトのパスに変換
      const basePath = lang === 'ja' ? '/ja/blog' : '/blog'
      const href = `${basePath}/${thought.slug}`

      return {
        id: thought.id.toString(),
        title: thought.title.rendered,
        description: thought.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 150),
        datetime: thought.date,
        href,
      }
    })

    return {
      items,
      totalPages,
      totalItems,
      currentPage: page,
    }
  } catch (error) {
    console.error('Error loading thoughts:', error)
    return {
      items: [],
      totalPages: 0,
      totalItems: 0,
      currentPage: page,
    }
  }
}

export const getThoughtBySlug = async (slug: string): Promise<WPThought | null> => {
  try {
    const response = await fetch(
      `https://wp-api.wp-kyoto.net/wp-json/wp/v2/thoughs?slug=${encodeURIComponent(slug)}`
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch thought by slug: ${response.status}`)
    }

    const thoughts: WPThought[] = await response.json()

    if (thoughts.length === 0) {
      return null
    }

    return thoughts[0]
  } catch (error) {
    console.error('Error loading thought by slug:', error)
    return null
  }
}

