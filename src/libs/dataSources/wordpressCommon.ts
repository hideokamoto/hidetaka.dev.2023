import type { BlogItem, Category, WPDevNote, WPThought } from './types'

// WPThoughtとWPDevNoteの共通型
type WPPost = WPThought | WPDevNote

export type PostsResult = {
  items: BlogItem[]
  totalPages: number
  totalItems: number
  currentPage: number
}

// カテゴリ情報を抽出するヘルパー関数
const extractCategories = (post: WPPost): Category[] => {
  if (!post._embedded?.['wp:term']) {
    return []
  }

  const categories: Category[] = []
  for (const termArray of post._embedded['wp:term']) {
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
 * WordPress APIから投稿を取得する汎用関数
 */
export const loadWordPressPosts = async (
  postType: 'thoughs' | 'dev-notes',
  page: number = 1,
  perPage: number = 20,
  lang: 'en' | 'ja' = 'en',
  basePath: string,
): Promise<PostsResult> => {
  if (lang === 'en') {
    return {
      items: [],
      totalPages: 0,
      totalItems: 0,
      currentPage: page,
    }
  }

  try {
    const response = await fetch(
      `https://wp-api.wp-kyoto.net/wp-json/wp/v2/${postType}?page=${page}&per_page=${perPage}&_embed=wp:term&_fields=_links.wp:term,_embedded,id,title,date,date_gmt,excerpt,slug,link,categories`,
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch ${postType}: ${response.status}`)
    }

    const posts: WPPost[] = await response.json()
    const totalItems = parseInt(response.headers.get('X-WP-Total') || '0', 10)
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '0', 10)

    const items: BlogItem[] = posts.map((post: WPPost): BlogItem => {
      const href = `${basePath}/${post.slug}`

      return {
        id: post.id.toString(),
        title: post.title.rendered,
        description: post.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 150),
        datetime: post.date,
        href,
        categories: extractCategories(post),
      }
    })

    return {
      items,
      totalPages,
      totalItems,
      currentPage: page,
    }
  } catch (error) {
    console.error(`Error loading ${postType}:`, error)
    return {
      items: [],
      totalPages: 0,
      totalItems: 0,
      currentPage: page,
    }
  }
}

/**
 * スラグから投稿を取得する汎用関数
 */
export const getWordPressPostBySlug = async <T extends WPPost>(
  postType: 'thoughs' | 'dev-notes',
  slug: string,
  lang: 'en' | 'ja' = 'en',
): Promise<T | null> => {
  if (lang === 'en') {
    return null
  }

  try {
    const response = await fetch(
      `https://wp-api.wp-kyoto.net/wp-json/wp/v2/${postType}?slug=${encodeURIComponent(slug)}&_embed=wp:term&_fields=_links.wp:term,_embedded,id,title,date,date_gmt,excerpt,content,slug,link,categories`,
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch ${postType} by slug: ${response.status}`)
    }

    const posts: T[] = await response.json()

    if (posts.length === 0) {
      return null
    }

    return posts[0]
  } catch (error) {
    console.error(`Error loading ${postType} by slug:`, error)
    return null
  }
}

/**
 * WordPress APIから投稿を取得するヘルパー関数
 */
const fetchWordPressPost = async <T extends WPPost>(
  postType: 'thoughs' | 'dev-notes',
  url: string,
): Promise<T | null> => {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      console.error(`Failed to fetch ${postType}: ${response.status}`)
      return null
    }
    const posts: T[] = await response.json()
    return posts.length > 0 ? posts[0] : null
  } catch (error) {
    console.error(`Error fetching ${postType}:`, error)
    return null
  }
}

export type AdjacentPosts<T> = {
  previous: T | null
  next: T | null
}

/**
 * 前後の投稿を取得する汎用関数
 */
export const getAdjacentWordPressPosts = async <T extends WPPost>(
  postType: 'thoughs' | 'dev-notes',
  currentPost: T,
  lang: 'en' | 'ja' = 'en',
): Promise<AdjacentPosts<T>> => {
  if (lang === 'en') {
    return {
      previous: null,
      next: null,
    }
  }

  try {
    const previousUrl = `https://wp-api.wp-kyoto.net/wp-json/wp/v2/${postType}?before=${encodeURIComponent(currentPost.date)}&per_page=1&orderby=date&order=desc&_fields=id,title,slug`
    const nextUrl = `https://wp-api.wp-kyoto.net/wp-json/wp/v2/${postType}?after=${encodeURIComponent(currentPost.date)}&per_page=1&orderby=date&order=asc&_fields=id,title,slug`

    const [previous, next] = await Promise.all([
      fetchWordPressPost<T>(postType, previousUrl),
      fetchWordPressPost<T>(postType, nextUrl),
    ])

    return {
      previous,
      next,
    }
  } catch (error) {
    console.error(`Error loading adjacent ${postType}:`, error)
    return {
      previous: null,
      next: null,
    }
  }
}

/**
 * すべての投稿を取得する汎用関数（sitemap用）
 */
export const loadAllWordPressPosts = async (
  postType: 'thoughs' | 'dev-notes',
  lang: 'en' | 'ja' = 'en',
  basePath: string,
): Promise<BlogItem[]> => {
  if (lang === 'en') {
    return []
  }

  try {
    const allItems: BlogItem[] = []
    let currentPage = 1
    let totalPages = 1

    const firstResult = await loadWordPressPosts(postType, currentPage, 100, lang, basePath)
    allItems.push(...firstResult.items)
    totalPages = firstResult.totalPages

    while (currentPage < totalPages) {
      currentPage++
      const result = await loadWordPressPosts(postType, currentPage, 100, lang, basePath)
      allItems.push(...result.items)
    }

    return allItems
  } catch (error) {
    console.error(`Error loading all ${postType}:`, error)
    return []
  }
}

/**
 * 関連投稿を取得する汎用関数（同じカテゴリの投稿からランダムに選択）
 */
export const getRelatedWordPressPosts = async <T extends WPPost>(
  postType: 'thoughs' | 'dev-notes',
  currentPost: T,
  limit: number = 4,
  lang: 'en' | 'ja' = 'en',
  basePath: string,
): Promise<BlogItem[]> => {
  if (lang !== 'ja') {
    return []
  }

  try {
    const categories = extractCategories(currentPost)

    if (categories.length === 0) {
      return []
    }

    const categoryId = categories[0].id
    const fetchLimit = Math.max(limit * 2.5, 10)
    const response = await fetch(
      `https://wp-api.wp-kyoto.net/wp-json/wp/v2/${postType}?categories=${categoryId}&exclude=${currentPost.id}&per_page=${fetchLimit}&_embed=wp:term&_fields=_links.wp:term,_embedded,id,title,date,date_gmt,excerpt,slug,link,categories`,
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch related ${postType}: ${response.status}`)
    }

    const posts: T[] = await response.json()

    const items: BlogItem[] = posts.map((post: T): BlogItem => {
      const href = `${basePath}/${post.slug}`

      return {
        id: post.id.toString(),
        title: post.title.rendered,
        description: post.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 150),
        datetime: post.date,
        href,
        categories: extractCategories(post),
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
    console.error(`Error loading related ${postType}:`, error)
    return []
  }
}
