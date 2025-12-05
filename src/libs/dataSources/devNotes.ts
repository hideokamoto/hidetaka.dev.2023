import type { BlogItem, Category, WPDevNote } from './types'

export type DevNotesResult = {
  items: BlogItem[]
  totalPages: number
  totalItems: number
  currentPage: number
}

// カテゴリ情報を抽出するヘルパー関数
const extractCategories = (devNote: WPDevNote): Category[] => {
  if (!devNote._embedded?.['wp:term']) {
    return []
  }

  // wp:termは配列の配列で、各配列には異なるタクソノミーのタームが含まれる
  // taxonomyが'category'のものを抽出
  const categories: Category[] = []
  for (const termArray of devNote._embedded['wp:term']) {
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

export const loadDevNotes = async (
  page: number = 1,
  perPage: number = 20,
  lang: 'en' | 'ja' = 'en',
): Promise<DevNotesResult> => {
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
      `https://wp-api.wp-kyoto.net/wp-json/wp/v2/dev-notes?page=${page}&per_page=${perPage}&_embed=wp:term&_fields=_links.wp:term,_embedded,id,title,date,date_gmt,excerpt,slug,link,categories`,
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch dev-notes: ${response.status}`)
    }

    const devNotes: WPDevNote[] = await response.json()

    // WordPress APIのレスポンスヘッダーから総件数と総ページ数を取得
    const totalItems = parseInt(response.headers.get('X-WP-Total') || '0', 10)
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '0', 10)

    // BlogItem型に変換
    const items: BlogItem[] = devNotes.map((devNote: WPDevNote): BlogItem => {
      const basePath = '/ja/dev-notes'
      const href = `${basePath}/${devNote.slug}`

      return {
        id: devNote.id.toString(),
        title: devNote.title.rendered,
        description: devNote.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 150),
        datetime: devNote.date,
        href,
        categories: extractCategories(devNote),
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

export const getDevNoteBySlug = async (
  slug: string,
  lang: 'en' | 'ja' = 'en',
): Promise<WPDevNote | null> => {
  // 英語の記事は存在しないため、英語が指定された場合は即座にnullを返す
  if (lang === 'en') {
    return null
  }

  try {
    // _embedと_fieldsを組み合わせてカテゴリ情報を取得
    const response = await fetch(
      `https://wp-api.wp-kyoto.net/wp-json/wp/v2/dev-notes?slug=${encodeURIComponent(slug)}&_embed=wp:term&_fields=_links.wp:term,_embedded,id,title,date,date_gmt,excerpt,content,slug,link,categories`,
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch dev-note by slug: ${response.status}`)
    }

    const devNotes: WPDevNote[] = await response.json()

    if (devNotes.length === 0) {
      return null
    }

    return devNotes[0]
  } catch (error) {
    console.error('Error loading dev-note by slug:', error)
    return null
  }
}

export type AdjacentDevNotes = {
  previous: WPDevNote | null
  next: WPDevNote | null
}

// WordPress APIから記事を取得するヘルパー関数
const fetchDevNote = async (url: string): Promise<WPDevNote | null> => {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      console.error(`Failed to fetch dev-note: ${response.status}`)
      return null
    }
    const devNotes: WPDevNote[] = await response.json()
    return devNotes.length > 0 ? devNotes[0] : null
  } catch (error) {
    console.error('Error fetching dev-note:', error)
    return null
  }
}

// 前後の記事を取得
export const getAdjacentDevNotes = async (
  currentDevNote: WPDevNote,
  lang: 'en' | 'ja' = 'en',
): Promise<AdjacentDevNotes> => {
  // 英語の記事は存在しないため、英語が指定された場合は即座に空の結果を返す
  if (lang === 'en') {
    return {
      previous: null,
      next: null,
    }
  }

  try {
    // 前の記事を取得（現在の記事より前の日付で最も新しいもの）
    const previousUrl = `https://wp-api.wp-kyoto.net/wp-json/wp/v2/dev-notes?before=${encodeURIComponent(currentDevNote.date)}&per_page=1&orderby=date&order=desc&_fields=id,title,slug`

    // 次の記事を取得（現在の記事より後の日付で最も古いもの）
    const nextUrl = `https://wp-api.wp-kyoto.net/wp-json/wp/v2/dev-notes?after=${encodeURIComponent(currentDevNote.date)}&per_page=1&orderby=date&order=asc&_fields=id,title,slug`

    // 並列で実行
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
 * すべてのdev-notes記事を取得（sitemap用）
 */
export const loadAllDevNotes = async (lang: 'en' | 'ja' = 'en'): Promise<BlogItem[]> => {
  // 英語の記事は存在しないため、英語が指定された場合は即座に空の配列を返す
  if (lang === 'en') {
    return []
  }

  try {
    const allItems: BlogItem[] = []
    let currentPage = 1
    let totalPages = 1

    // 最初のページを取得して総ページ数を確認
    const firstResult = await loadDevNotes(currentPage, 100, lang)
    allItems.push(...firstResult.items)
    totalPages = firstResult.totalPages

    // 残りのページを取得
    while (currentPage < totalPages) {
      currentPage++
      const result = await loadDevNotes(currentPage, 100, lang)
      allItems.push(...result.items)
    }

    return allItems
  } catch (error) {
    console.error('Error loading all dev-notes:', error)
    return []
  }
}

/**
 * 関連記事を取得（同じカテゴリの記事からランダムに選択）
 */
export const getRelatedDevNotes = async (
  currentDevNote: WPDevNote,
  limit: number = 4,
  lang: 'en' | 'ja' = 'en',
): Promise<BlogItem[]> => {
  // 英語の記事は存在しないため、英語が指定された場合は即座に空の配列を返す
  if (lang !== 'ja') {
    return []
  }

  try {
    // カテゴリを抽出
    const categories = extractCategories(currentDevNote)

    // カテゴリが存在しない場合は空の配列を返す
    if (categories.length === 0) {
      return []
    }

    // 最初のカテゴリで関連記事を取得（複数カテゴリがある場合は最初のもの）
    const categoryId = categories[0].id

    // 同じカテゴリの記事を10件取得（現在の記事を除外）
    const fetchLimit = Math.max(limit * 2.5, 10) // 最低10件、limitの2.5倍まで
    const response = await fetch(
      `https://wp-api.wp-kyoto.net/wp-json/wp/v2/dev-notes?categories=${categoryId}&exclude=${currentDevNote.id}&per_page=${fetchLimit}&_embed=wp:term&_fields=_links.wp:term,_embedded,id,title,date,date_gmt,excerpt,slug,link,categories`,
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch related dev-notes: ${response.status}`)
    }

    const devNotes: WPDevNote[] = await response.json()

    // BlogItem型に変換
    const items: BlogItem[] = devNotes.map((devNote: WPDevNote): BlogItem => {
      const basePath = '/ja/dev-notes'
      const href = `${basePath}/${devNote.slug}`

      return {
        id: devNote.id.toString(),
        title: devNote.title.rendered,
        description: devNote.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 150),
        datetime: devNote.date,
        href,
        categories: extractCategories(devNote),
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
    console.error('Error loading related dev-notes:', error)
    return []
  }
}
