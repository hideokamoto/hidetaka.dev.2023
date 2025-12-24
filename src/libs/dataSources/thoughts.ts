import { logger } from '@/libs/logger'
import type { BlogItem, Category, WPThought } from './types'

export type ThoughtsResult = {
  items: BlogItem[]
  totalPages: number
  totalItems: number
  currentPage: number
}

// カテゴリ情報を抽出するヘルパー関数
const extractCategories = (thought: WPThought): Category[] => {
  if (!thought._embedded?.['wp:term']) {
    return []
  }

  // wp:termは配列の配列で、各配列には異なるタクソノミーのタームが含まれる
  // taxonomyが'category'のものを抽出
  const categories: Category[] = []
  for (const termArray of thought._embedded['wp:term']) {
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

export const loadThoughts = async (
  page: number = 1,
  perPage: number = 20,
  lang: 'en' | 'ja' = 'en',
): Promise<ThoughtsResult> => {
  // 英語の記事は存在しないため、英語が指定された場合は即座に空の結果を返す
  if (lang === 'en') {
    return {
      items: [],
      totalPages: 0,
      totalItems: 0,
      currentPage: page,
    }
  }

  try {
    // _embedと_fieldsを組み合わせてカテゴリ情報を取得
    const response = await fetch(
      `https://wp-api.wp-kyoto.net/wp-json/wp/v2/thoughs?page=${page}&per_page=${perPage}&_embed=wp:term&_fields=_links.wp:term,_embedded,id,title,date,date_gmt,excerpt,slug,link,categories`,
      {
        next: { revalidate: 1800 }, // 30分ごとに再検証（毎日1〜2記事更新）
      },
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch thoughts: ${response.status}`)
    }

    const thoughts: WPThought[] = await response.json()

    // WordPress APIのレスポンスヘッダーから総件数と総ページ数を取得
    const totalItems = parseInt(response.headers.get('X-WP-Total') || '0', 10)
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '0', 10)

    // BlogItem型に変換
    const items: BlogItem[] = thoughts.map((thought: WPThought): BlogItem => {
      const basePath = '/ja/blog'
      const href = `${basePath}/${thought.slug}`

      return {
        id: thought.id.toString(),
        title: thought.title.rendered,
        description: thought.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 150),
        datetime: thought.date,
        href,
        categories: extractCategories(thought),
      }
    })

    return {
      items,
      totalPages,
      totalItems,
      currentPage: page,
    }
  } catch (error) {
    logger.error('Failed to load thoughts', {
      error: error instanceof Error ? error.message : String(error),
      page,
      perPage,
      lang,
    })
    return {
      items: [],
      totalPages: 0,
      totalItems: 0,
      currentPage: page,
    }
  }
}

export const loadThoughtsByCategory = async (
  categorySlug: string,
  page: number = 1,
  perPage: number = 20,
  lang: 'en' | 'ja' = 'en',
): Promise<ThoughtsResult> => {
  // 英語の記事は存在しないため、英語が指定された場合は即座に空の結果を返す
  if (lang === 'en') {
    return {
      items: [],
      totalPages: 0,
      totalItems: 0,
      currentPage: page,
    }
  }

  try {
    // categorySlugを正規化（デコード済みの形式に統一）
    let normalizedCategorySlug = categorySlug
    try {
      if (categorySlug.includes('%')) {
        normalizedCategorySlug = decodeURIComponent(categorySlug)
      }
    } catch (_e) {
      // デコードに失敗した場合はそのまま
    }

    // WordPress APIのcategoriesエンドポイントでslugからIDを取得
    const categoryResponse = await fetch(
      `https://wp-api.wp-kyoto.net/wp-json/wp/v2/categories?slug=${encodeURIComponent(normalizedCategorySlug)}`,
      {
        next: { revalidate: 1800 }, // 30分ごとに再検証
      },
    )

    if (!categoryResponse.ok) {
      throw new Error(`Failed to fetch category: ${categoryResponse.status}`)
    }

    const categories = await categoryResponse.json()

    if (categories.length === 0) {
      // カテゴリが見つからない場合は空の結果を返す
      return {
        items: [],
        totalPages: 0,
        totalItems: 0,
        currentPage: page,
      }
    }

    const categoryId = categories[0].id

    // WordPress APIのcategoriesパラメータでフィルタリング
    const response = await fetch(
      `https://wp-api.wp-kyoto.net/wp-json/wp/v2/thoughs?categories=${categoryId}&page=${page}&per_page=${perPage}&_embed=wp:term&_fields=_links.wp:term,_embedded,id,title,date,date_gmt,excerpt,slug,link,categories`,
      {
        next: { revalidate: 1800 }, // 30分ごとに再検証
      },
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch thoughts: ${response.status}`)
    }

    const thoughts: WPThought[] = await response.json()

    // WordPress APIのレスポンスヘッダーから総件数と総ページ数を取得
    const totalItems = parseInt(response.headers.get('X-WP-Total') || '0', 10)
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '0', 10)

    // BlogItem型に変換
    const items: BlogItem[] = thoughts.map((thought: WPThought): BlogItem => {
      const basePath = '/ja/blog'
      const href = `${basePath}/${thought.slug}`

      return {
        id: thought.id.toString(),
        title: thought.title.rendered,
        description: thought.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 150),
        datetime: thought.date,
        href,
        categories: extractCategories(thought),
      }
    })

    return {
      items,
      totalPages,
      totalItems,
      currentPage: page,
    }
  } catch (error) {
    logger.error('Failed to load thoughts by category', {
      error: error instanceof Error ? error.message : String(error),
      categorySlug,
      page,
      perPage,
      lang,
    })
    return {
      items: [],
      totalPages: 0,
      totalItems: 0,
      currentPage: page,
    }
  }
}

export type CategoryWithCount = Category & {
  count: number
}

export const loadAllCategories = async (lang: 'en' | 'ja' = 'en'): Promise<CategoryWithCount[]> => {
  // 英語の記事は存在しないため、英語が指定された場合は即座に空の配列を返す
  if (lang === 'en') {
    return []
  }

  try {
    // 十分な数の記事を取得してカテゴリを抽出
    const fetchPerPage = 100
    const response = await fetch(
      `https://wp-api.wp-kyoto.net/wp-json/wp/v2/thoughs?per_page=${fetchPerPage}&_embed=wp:term&_fields=_links.wp:term,_embedded,id,title,date,date_gmt,excerpt,slug,link,categories`,
      {
        next: { revalidate: 1800 }, // 30分ごとに再検証
      },
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch thoughts: ${response.status}`)
    }

    const thoughts: WPThought[] = await response.json()

    // カテゴリを集計
    const categoryMap = new Map<string, CategoryWithCount>()

    for (const thought of thoughts) {
      const categories = extractCategories(thought)
      for (const category of categories) {
        const existing = categoryMap.get(category.slug)
        if (existing) {
          existing.count++
        } else {
          categoryMap.set(category.slug, {
            ...category,
            count: 1,
          })
        }
      }
    }

    // 配列に変換してソート（記事数の多い順）
    const categories = Array.from(categoryMap.values())
    categories.sort((a, b) => b.count - a.count)

    return categories
  } catch (error) {
    logger.error('Failed to load categories', {
      error: error instanceof Error ? error.message : String(error),
      lang,
    })
    return []
  }
}

export const getThoughtBySlug = async (
  slug: string,
  lang: 'en' | 'ja' = 'en',
): Promise<WPThought | null> => {
  // 英語の記事は存在しないため、英語が指定された場合は即座にnullを返す
  if (lang === 'en') {
    return null
  }

  try {
    // _embedと_fieldsを組み合わせてカテゴリ情報を取得
    const response = await fetch(
      `https://wp-api.wp-kyoto.net/wp-json/wp/v2/thoughs?slug=${encodeURIComponent(slug)}&_embed=wp:term&_fields=_links.wp:term,_embedded,id,title,date,date_gmt,excerpt,content,slug,link,categories`,
      {
        next: { revalidate: 1800 }, // 30分ごとに再検証
      },
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
    logger.error('Failed to load thought by slug', {
      error: error instanceof Error ? error.message : String(error),
      slug,
      lang,
    })
    return null
  }
}

export type AdjacentThoughts = {
  previous: WPThought | null
  next: WPThought | null
}

// WordPress APIから記事を取得するヘルパー関数
const fetchThought = async (url: string): Promise<WPThought | null> => {
  try {
    const response = await fetch(url, {
      next: { revalidate: 1800 }, // 30分ごとに再検証
    })
    if (!response.ok) {
      logger.error('Failed to fetch thought', {
        status: response.status,
        url,
      })
      return null
    }
    const thoughts: WPThought[] = await response.json()
    return thoughts.length > 0 ? thoughts[0] : null
  } catch (error) {
    logger.error('Failed to fetch thought', {
      error: error instanceof Error ? error.message : String(error),
      url,
    })
    return null
  }
}

// 前後の記事を取得
export const getAdjacentThoughts = async (
  currentThought: WPThought,
  lang: 'en' | 'ja' = 'en',
): Promise<AdjacentThoughts> => {
  // 英語の記事は存在しないため、英語が指定された場合は即座に空の結果を返す
  if (lang === 'en') {
    return {
      previous: null,
      next: null,
    }
  }

  try {
    // 前の記事を取得（現在の記事より前の日付で最も新しいもの）
    const previousUrl = `https://wp-api.wp-kyoto.net/wp-json/wp/v2/thoughs?before=${encodeURIComponent(currentThought.date)}&per_page=1&orderby=date&order=desc&_fields=id,title,slug`

    // 次の記事を取得（現在の記事より後の日付で最も古いもの）
    const nextUrl = `https://wp-api.wp-kyoto.net/wp-json/wp/v2/thoughs?after=${encodeURIComponent(currentThought.date)}&per_page=1&orderby=date&order=asc&_fields=id,title,slug`

    // 並列で実行
    const [previous, next] = await Promise.all([fetchThought(previousUrl), fetchThought(nextUrl)])

    return {
      previous,
      next,
    }
  } catch (error) {
    logger.error('Failed to load adjacent thoughts', {
      error: error instanceof Error ? error.message : String(error),
      thoughtId: currentThought.id,
      lang,
    })
    return {
      previous: null,
      next: null,
    }
  }
}

/**
 * すべてのブログ記事を取得（sitemap用）
 */
export const loadAllThoughts = async (lang: 'en' | 'ja' = 'en'): Promise<BlogItem[]> => {
  // 英語の記事は存在しないため、英語が指定された場合は即座に空の配列を返す
  if (lang === 'en') {
    return []
  }

  try {
    const allItems: BlogItem[] = []
    let currentPage = 1
    let totalPages = 1

    // 最初のページを取得して総ページ数を確認
    const firstResult = await loadThoughts(currentPage, 100, lang)
    allItems.push(...firstResult.items)
    totalPages = firstResult.totalPages

    // 残りのページを取得
    while (currentPage < totalPages) {
      currentPage++
      const result = await loadThoughts(currentPage, 100, lang)
      allItems.push(...result.items)
    }

    return allItems
  } catch (error) {
    logger.error('Failed to load all thoughts', {
      error: error instanceof Error ? error.message : String(error),
    })
    return []
  }
}

/**
 * 関連記事を取得（同じカテゴリの記事からランダムに選択）
 */
export const getRelatedThoughts = async (
  currentThought: WPThought,
  limit: number = 4,
  lang: 'en' | 'ja' = 'en',
): Promise<BlogItem[]> => {
  // 英語の記事は存在しないため、英語が指定された場合は即座に空の配列を返す
  if (lang !== 'ja') {
    return []
  }

  try {
    // カテゴリを抽出
    const categories = extractCategories(currentThought)

    // カテゴリが存在しない場合は空の配列を返す
    if (categories.length === 0) {
      return []
    }

    // 最初のカテゴリで関連記事を取得（複数カテゴリがある場合は最初のもの）
    const categoryId = categories[0].id

    // 同じカテゴリの記事を10件取得（現在の記事を除外）
    const fetchLimit = Math.max(limit * 2.5, 10) // 最低10件、limitの2.5倍まで
    const response = await fetch(
      `https://wp-api.wp-kyoto.net/wp-json/wp/v2/thoughs?categories=${categoryId}&exclude=${currentThought.id}&per_page=${fetchLimit}&_embed=wp:term&_fields=_links.wp:term,_embedded,id,title,date,date_gmt,excerpt,slug,link,categories`,
      {
        next: { revalidate: 1800 }, // 30分ごとに再検証
      },
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch related thoughts: ${response.status}`)
    }

    const thoughts: WPThought[] = await response.json()

    // BlogItem型に変換
    const items: BlogItem[] = thoughts.map((thought: WPThought): BlogItem => {
      const basePath = '/ja/blog'
      const href = `${basePath}/${thought.slug}`

      return {
        id: thought.id.toString(),
        title: thought.title.rendered,
        description: thought.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 150),
        datetime: thought.date,
        href,
        categories: extractCategories(thought),
      }
    })

    // Fisher-Yatesアルゴリズムでシャッフル
    const shuffled = [...items]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    // limitの数だけ返す
    return shuffled.slice(0, limit)
  } catch (error) {
    logger.error('Failed to load related thoughts', {
      error: error instanceof Error ? error.message : String(error),
      thoughtId: currentThought.id,
      limit,
      lang,
    })
    return []
  }
}
