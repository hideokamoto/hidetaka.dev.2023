import type { BlogItem } from './types'

export type WPProduct = {
  id: number
  title: {
    rendered: string
  }
  date: string
  date_gmt: string
  modified: string
  modified_gmt: string
  excerpt?: {
    rendered: string
  }
  content: {
    rendered: string
  }
  link: string
  slug: string
  featured_media?: number
}

export type ProductsResult = {
  items: BlogItem[]
  totalPages: number
  totalItems: number
  currentPage: number
}

/**
 * WordPress API から products カスタム投稿タイプを取得
 * @param page ページ番号（デフォルト: 1）
 * @param perPage 1ページあたりの件数（デフォルト: 100）
 * @param lang 言語 ('en' | 'ja')
 * @returns ProductsResult
 */
export const loadProducts = async (
  page: number = 1,
  perPage: number = 100,
  lang: 'en' | 'ja' = 'en',
): Promise<ProductsResult> => {
  try {
    const response = await fetch(
      `https://wp-api.wp-kyoto.net/wp-json/wp/v2/products?page=${page}&per_page=${perPage}&orderby=date&order=desc&_fields=id,title,date,date_gmt,modified,modified_gmt,excerpt,content,slug,link,featured_media`,
      {
        next: { revalidate: 1800 }, // 30分ごとに再検証
      },
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`)
    }

    const products: WPProduct[] = await response.json()

    // WordPress APIのレスポンスヘッダーから総件数と総ページ数を取得
    const totalItems = Number.parseInt(response.headers.get('X-WP-Total') || '0', 10)
    const totalPages = Number.parseInt(response.headers.get('X-WP-TotalPages') || '0', 10)

    // BlogItem型に変換
    const basePath = lang === 'ja' ? '/ja/news' : '/news'
    const items: BlogItem[] = products.map((product: WPProduct): BlogItem => {
      const excerptText = product.excerpt?.rendered
        ? product.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 150)
        : ''
      return {
        id: product.id.toString(),
        title: product.title.rendered,
        description: excerptText,
        datetime: product.date,
        href: `${basePath}/${product.slug}`,
      }
    })

    return {
      items,
      totalPages,
      totalItems,
      currentPage: page,
    }
  } catch (error) {
    console.error('Error loading products:', error)
    return {
      items: [],
      totalPages: 0,
      totalItems: 0,
      currentPage: page,
    }
  }
}

/**
 * スラッグから製品ニュース記事を1件取得
 * @param slug 記事のスラッグ
 * @param lang 言語 ('en' | 'ja')
 * @returns WPProduct | null
 */
export const getProductBySlug = async (
  slug: string,
  lang: 'en' | 'ja' = 'en',
): Promise<WPProduct | null> => {
  try {
    const response = await fetch(
      `https://wp-api.wp-kyoto.net/wp-json/wp/v2/products?slug=${slug}&_fields=id,title,date,date_gmt,modified,modified_gmt,excerpt,content,slug,link,featured_media`,
      {
        next: { revalidate: 1800 }, // 30分ごとに再検証
      },
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.status}`)
    }

    const products: WPProduct[] = await response.json()

    if (products.length === 0) {
      return null
    }

    return products[0]
  } catch (error) {
    console.error('Error loading product by slug:', error)
    return null
  }
}

/**
 * サイトマップ生成用：全製品ニュースを取得
 * @returns WPProduct[]
 */
export const loadAllProducts = async (): Promise<WPProduct[]> => {
  try {
    const allProducts: WPProduct[] = []
    let currentPage = 1
    let totalPages = 1

    // 最初のページを取得して総ページ数を確認
    const firstResponse = await fetch(
      `https://wp-api.wp-kyoto.net/wp-json/wp/v2/products?page=${currentPage}&per_page=100&orderby=date&order=desc&_fields=id,title,date,modified,slug`,
      {
        next: { revalidate: 3600 }, // 1時間ごとに再検証
      },
    )

    if (!firstResponse.ok) {
      throw new Error(`Failed to fetch all products: ${firstResponse.status}`)
    }

    const firstPageProducts: WPProduct[] = await firstResponse.json()
    allProducts.push(...firstPageProducts)

    // レスポンスヘッダーから総ページ数を取得
    totalPages = Number.parseInt(firstResponse.headers.get('X-WP-TotalPages') || '1', 10)

    // 残りのページを取得
    while (currentPage < totalPages) {
      currentPage++
      const response = await fetch(
        `https://wp-api.wp-kyoto.net/wp-json/wp/v2/products?page=${currentPage}&per_page=100&orderby=date&order=desc&_fields=id,title,date,modified,slug`,
        {
          next: { revalidate: 3600 }, // 1時間ごとに再検証
        },
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch all products: ${response.status}`)
      }

      const products: WPProduct[] = await response.json()
      allProducts.push(...products)
    }

    return allProducts
  } catch (error) {
    console.error('Error loading all products:', error)
    return []
  }
}
