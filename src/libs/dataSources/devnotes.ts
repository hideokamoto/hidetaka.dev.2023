import type { BlogItem, Category, WPThought } from './types'

export type DevNotesResult = {
  items: BlogItem[]
  totalPages: number
  totalItems: number
  currentPage: number
}

// カテゴリ情報を抽出するヘルパー関数
const extractCategories = (note: WPThought): Category[] => {
  if (!note._embedded?.['wp:term']) {
    return []
  }

  const categories: Category[] = []
  for (const termArray of note._embedded['wp:term']) {
    for (const term of termArray) {
      if (term.taxonomy === 'category') {
        categories.push({
          id: term.id,
          name: term.name,
          slug: term.slug,
          taxonomy: term.taxonomy,
        })
      }
    }
  }
  return categories
}

/**
 * dev-notes投稿タイプの記事を取得
 */
export const loadDevNotes = async (
  page: number = 1,
  perPage: number = 20,
): Promise<DevNotesResult> => {
  try {
    const response = await fetch(
      `https://wp-api.wp-kyoto.net/wp-json/wp/v2/dev-notes?page=${page}&per_page=${perPage}&_embed=wp:term&_fields=_links.wp:term,_embedded,id,title,date,date_gmt,excerpt,slug,link,categories`,
      {
        next: { revalidate: 1800 }, // 30分ごとに再検証（WordPress記事）
      },
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch dev-notes: ${response.status}`)
    }

    const notes: WPThought[] = await response.json()

    const totalItems = Number.parseInt(response.headers.get('X-WP-Total') || '0', 10)
    const totalPages = Number.parseInt(response.headers.get('X-WP-TotalPages') || '0', 10)

    const items: BlogItem[] = notes.map((note: WPThought): BlogItem => {
      const basePath = '/ja/writing/dev-notes'
      const href = `${basePath}/${note.slug}`

      return {
        id: note.id.toString(),
        title: note.title.rendered,
        description: note.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 150),
        datetime: note.date,
        href,
        categories: extractCategories(note),
      }
    })

    return {
      items,
      totalPages,
      totalItems,
      currentPage: page,
    }
  } catch (error) {
    console.error('Error loading dev-notes:', error)
    return {
      items: [],
      totalPages: 0,
      totalItems: 0,
      currentPage: page,
    }
  }
}

/**
 * slugでdev-notes記事を取得
 */
export const getDevNoteBySlug = async (slug: string): Promise<WPThought | null> => {
  try {
    const response = await fetch(
      `https://wp-api.wp-kyoto.net/wp-json/wp/v2/dev-notes?slug=${encodeURIComponent(slug)}&_embed=wp:term&_fields=_links.wp:term,_embedded,id,title,date,date_gmt,excerpt,content,slug,link,categories`,
      {
        next: { revalidate: 1800 }, // 30分ごとに再検証
      },
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch dev-note by slug: ${response.status}`)
    }

    const notes: WPThought[] = await response.json()

    if (notes.length === 0) {
      return null
    }

    return notes[0]
  } catch (error) {
    console.error('Error loading dev-note by slug:', error)
    return null
  }
}

export type AdjacentDevNotes = {
  previous: WPThought | null
  next: WPThought | null
}

// WordPress APIから記事を取得するヘルパー関数
const fetchDevNote = async (url: string): Promise<WPThought | null> => {
  try {
    const response = await fetch(url, {
      next: { revalidate: 1800 }, // 30分ごとに再検証
    })
    if (!response.ok) {
      console.error(`Failed to fetch dev-note: ${response.status}`)
      return null
    }
    const notes: WPThought[] = await response.json()
    return notes.length > 0 ? notes[0] : null
  } catch (error) {
    console.error('Error fetching dev-note:', error)
    return null
  }
}

/**
 * 前後の記事を取得
 */
export const getAdjacentDevNotes = async (currentNote: WPThought): Promise<AdjacentDevNotes> => {
  try {
    const previousUrl = `https://wp-api.wp-kyoto.net/wp-json/wp/v2/dev-notes?before=${encodeURIComponent(currentNote.date)}&per_page=1&orderby=date&order=desc&_fields=id,title,slug`
    const nextUrl = `https://wp-api.wp-kyoto.net/wp-json/wp/v2/dev-notes?after=${encodeURIComponent(currentNote.date)}&per_page=1&orderby=date&order=asc&_fields=id,title,slug`

    const [previous, next] = await Promise.all([fetchDevNote(previousUrl), fetchDevNote(nextUrl)])

    return {
      previous,
      next,
    }
  } catch (error) {
    console.error('Error loading adjacent dev-notes:', error)
    return {
      previous: null,
      next: null,
    }
  }
}

/**
 * 関連記事を取得（同じカテゴリの記事からランダムに選択）
 */
export const getRelatedDevNotes = async (
  currentNote: WPThought,
  limit: number = 4,
): Promise<BlogItem[]> => {
  try {
    const categories = extractCategories(currentNote)

    if (categories.length === 0) {
      return []
    }

    const categoryId = categories[0].id
    const fetchLimit = 20

    const response = await fetch(
      `https://wp-api.wp-kyoto.net/wp-json/wp/v2/dev-notes?categories=${categoryId}&exclude=${currentNote.id}&per_page=${fetchLimit}&_embed=wp:term&_fields=_links.wp:term,_embedded,id,title,date,date_gmt,excerpt,slug,link,categories`,
      {
        next: { revalidate: 1800 }, // 30分ごとに再検証
      },
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch related dev-notes: ${response.status}`)
    }

    const notes: WPThought[] = await response.json()

    const items: BlogItem[] = notes.map((note: WPThought): BlogItem => {
      const basePath = '/ja/writing/dev-notes'
      const href = `${basePath}/${note.slug}`

      return {
        id: note.id.toString(),
        title: note.title.rendered,
        description: note.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 150),
        datetime: note.date,
        href,
        categories: extractCategories(note),
      }
    })

    // Fisher-Yatesアルゴリズムでシャッフル
    const shuffled = [...items]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    return shuffled.slice(0, limit)
  } catch (error) {
    console.error('Error loading related dev-notes:', error)
    return []
  }
}

/**
 * すべてのdev-notes記事を取得（sitemap用）
 */
export const loadAllDevNotes = async (): Promise<BlogItem[]> => {
  try {
    const allItems: BlogItem[] = []
    let currentPage = 1
    let totalPages = 1

    const firstResult = await loadDevNotes(currentPage, 100)
    allItems.push(...firstResult.items)
    totalPages = firstResult.totalPages

    while (currentPage < totalPages) {
      currentPage++
      const result = await loadDevNotes(currentPage, 100)
      allItems.push(...result.items)
    }

    return allItems
  } catch (error) {
    console.error('Error loading all dev-notes:', error)
    return []
  }
}
