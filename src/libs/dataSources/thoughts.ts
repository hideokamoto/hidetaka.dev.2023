import type { BlogItem, WPThought } from './types'

export type ThoughtsResult = {
  items: BlogItem[]
  totalPages: number
  totalItems: number
  currentPage: number
}

// タイトルから日本語かどうかを判定する関数
const isJapanese = (text: string): boolean => {
  if (!text) return false
  // ひらがな、カタカナ、漢字が含まれているかチェック
  return /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text)
}

export const loadThoughts = async (
  page: number = 1,
  perPage: number = 20,
  lang: 'en' | 'ja' = 'en'
): Promise<ThoughtsResult> => {
  try {
    // thoughsエンドポイントはfilter[lang]をサポートしていないため、
    // より多くの記事を取得してクライアント側でフィルタリングする
    const fetchPerPage = Math.max(perPage * 3, 60) // 言語フィルタリングのため多めに取得
    const response = await fetch(
      `https://wp-api.wp-kyoto.net/wp-json/wp/v2/thoughs?page=${page}&per_page=${fetchPerPage}`
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch thoughts: ${response.status}`)
    }

    const thoughts: WPThought[] = await response.json()

    // タイトルから言語を判定してフィルタリング
    const filteredThoughts = thoughts.filter((thought: WPThought) => {
      const title = thought.title.rendered
      const isJa = isJapanese(title)
      return lang === 'ja' ? isJa : !isJa
    })

    // 指定された件数に制限
    const paginatedThoughts = filteredThoughts.slice(0, perPage)

    // BlogItem型に変換（このサイトの記事として扱う）
    const items: BlogItem[] = paginatedThoughts.map((thought: WPThought): BlogItem => {
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

    // 総記事数と総ページ数を計算
    // 全ページを取得して正確な数を計算する必要があるが、簡易的に処理
    const totalFilteredItems = filteredThoughts.length
    const totalPages = Math.ceil(totalFilteredItems / perPage)
    const totalItems = totalFilteredItems

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

export const getThoughtBySlug = async (slug: string, lang: 'en' | 'ja' = 'en'): Promise<WPThought | null> => {
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

    // 言語フィルタリング
    const thought = thoughts[0]
    const title = thought.title.rendered
    const isJa = isJapanese(title)
    const matchesLang = lang === 'ja' ? isJa : !isJa

    if (!matchesLang) {
      return null
    }

    return thought
  } catch (error) {
    console.error('Error loading thought by slug:', error)
    return null
  }
}

