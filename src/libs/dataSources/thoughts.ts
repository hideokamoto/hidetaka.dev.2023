import type { BlogItem, Category, WPThought } from './types'

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
    // _embedと_fieldsを組み合わせてカテゴリ情報を取得
    const response = await fetch(
      `https://wp-api.wp-kyoto.net/wp-json/wp/v2/thoughs?page=${page}&per_page=${fetchPerPage}&_embed=wp:term&_fields=_links.wp:term,_embedded,id,title,date,date_gmt,excerpt,slug,link,categories`
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
        categories: extractCategories(thought),
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

export const loadThoughtsByCategory = async (
  categorySlug: string,
  page: number = 1,
  perPage: number = 20,
  lang: 'en' | 'ja' = 'en'
): Promise<ThoughtsResult> => {
  try {
    // categorySlugを正規化（デコード済みの形式に統一）
    let normalizedCategorySlug = categorySlug
    try {
      if (categorySlug.includes('%')) {
        normalizedCategorySlug = decodeURIComponent(categorySlug)
      }
    } catch (e) {
      // デコードに失敗した場合はそのまま
    }
    
    // カテゴリフィルタリングはクライアント側で行うため、
    // 複数ページから十分なデータを取得する必要がある
    // ページ1から順に取得して、フィルタリング後のデータが十分になるまで続ける
    const fetchPerPage = 100
    let allFilteredThoughts: WPThought[] = []
    let currentPage = 1
    const maxPages = 10 // 最大10ページまで取得
    
    // カテゴリ情報を抽出するヘルパー関数
    const extractCategories = (thought: WPThought): Category[] => {
      if (!thought._embedded?.['wp:term']) {
        return []
      }
      
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

    while (allFilteredThoughts.length < page * perPage && currentPage <= maxPages) {
      const response = await fetch(
        `https://wp-api.wp-kyoto.net/wp-json/wp/v2/thoughs?page=${currentPage}&per_page=${fetchPerPage}&_embed=wp:term&_fields=_links.wp:term,_embedded,id,title,date,date_gmt,excerpt,slug,link,categories`
      )

      // 400や404エラーの場合（存在しないページ）、ループを終了
      if (response.status === 400 || response.status === 404) {
        break
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch thoughts: ${response.status}`)
      }

      const thoughts: WPThought[] = await response.json()

      // WordPress APIから空の配列が返ってきた場合（次のページがない場合）、ループを終了
      if (thoughts.length === 0) {
        break
      }

      // 言語とカテゴリでフィルタリング
      const filteredThoughts = thoughts.filter((thought: WPThought) => {
        const title = thought.title.rendered
        const isJa = isJapanese(title)
        const matchesLang = lang === 'ja' ? isJa : !isJa
        
        if (!matchesLang) {
          return false
        }

        // カテゴリでフィルタリング
        // WordPress APIから返ってくるslugは通常デコード済みの形式（「ざっき」など）
        // URLパラメータとして渡されるcategorySlugはエンコードされている可能性がある
        const categories = extractCategories(thought)
        return categories.some(cat => {
          const catSlug = cat.slug
          
          // 両方のslugを正規化（デコード済みの形式に統一）
          let normalizedCatSlug = catSlug
          try {
            if (catSlug.includes('%')) {
              normalizedCatSlug = decodeURIComponent(catSlug)
            }
          } catch (e) {
            // デコードに失敗した場合はそのまま
          }
          
          // 正規化されたslug同士で比較（これが最も確実）
          if (normalizedCatSlug === normalizedCategorySlug) {
            return true
          }
          
          // 元のslug同士で比較
          if (catSlug === categorySlug || catSlug === normalizedCategorySlug) {
            return true
          }
          
          // エンコードされた形式同士で比較
          try {
            const encodedCatSlug = encodeURIComponent(normalizedCatSlug)
            const encodedCategorySlug = encodeURIComponent(normalizedCategorySlug)
            if (encodedCatSlug === encodedCategorySlug || 
                encodedCatSlug === categorySlug ||
                catSlug === encodedCategorySlug) {
              return true
            }
          } catch (e) {
            // エンコードに失敗した場合は無視
          }
          
          return false
        })
      })

      // フィルタリングされた記事をallFilteredThoughtsに追加
      allFilteredThoughts = [...allFilteredThoughts, ...filteredThoughts]
      currentPage++
    }

    // ページネーション
    const startIndex = (page - 1) * perPage
    const endIndex = startIndex + perPage
    const paginatedThoughts = allFilteredThoughts.slice(startIndex, endIndex)

    // BlogItem型に変換
    const items: BlogItem[] = paginatedThoughts.map((thought: WPThought): BlogItem => {
      const basePath = lang === 'ja' ? '/ja/blog' : '/blog'
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

    // 総記事数と総ページ数を計算
    const totalFilteredItems = allFilteredThoughts.length
    const totalPages = Math.ceil(totalFilteredItems / perPage)
    const totalItems = totalFilteredItems

    return {
      items,
      totalPages,
      totalItems,
      currentPage: page,
    }
  } catch (error) {
    console.error('Error loading thoughts by category:', error)
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
  try {
    // 十分な数の記事を取得してカテゴリを抽出
    const fetchPerPage = 100
    const response = await fetch(
      `https://wp-api.wp-kyoto.net/wp-json/wp/v2/thoughs?per_page=${fetchPerPage}&_embed=wp:term&_fields=_links.wp:term,_embedded,id,title,date,date_gmt,excerpt,slug,link,categories`
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch thoughts: ${response.status}`)
    }

    const thoughts: WPThought[] = await response.json()

    // カテゴリ情報を抽出するヘルパー関数
    const extractCategories = (thought: WPThought): Category[] => {
      if (!thought._embedded?.['wp:term']) {
        return []
      }
      
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

    // 言語でフィルタリング
    const filteredThoughts = thoughts.filter((thought: WPThought) => {
      const title = thought.title.rendered
      const isJa = isJapanese(title)
      return lang === 'ja' ? isJa : !isJa
    })

    // カテゴリを集計
    const categoryMap = new Map<string, CategoryWithCount>()
    
    for (const thought of filteredThoughts) {
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
    console.error('Error loading categories:', error)
    return []
  }
}

export const getThoughtBySlug = async (slug: string, lang: 'en' | 'ja' = 'en'): Promise<WPThought | null> => {
  try {
    // _embedと_fieldsを組み合わせてカテゴリ情報を取得
    const response = await fetch(
      `https://wp-api.wp-kyoto.net/wp-json/wp/v2/thoughs?slug=${encodeURIComponent(slug)}&_embed=wp:term&_fields=_links.wp:term,_embedded,id,title,date,date_gmt,excerpt,content,slug,link,categories`
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

