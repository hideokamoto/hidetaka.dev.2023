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
  excerpt: {
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
  totalItems: number
}

/**
 * WordPress API から products カスタム投稿タイプを取得
 * @param lang 言語 ('en' | 'ja')
 * @returns ProductsResult
 */
export const loadProducts = async (lang: 'en' | 'ja' = 'en'): Promise<ProductsResult> => {
  try {
    // WordPress API から products を取得（全件取得、per_page=100）
    const response = await fetch(
      `https://wp-api.wp-kyoto.net/wp-json/wp/v2/products?per_page=100&orderby=date&order=desc&_fields=id,title,date,date_gmt,modified,modified_gmt,excerpt,content,slug,link,featured_media`,
      {
        next: { revalidate: 1800 }, // 30分ごとに再検証
      },
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`)
    }

    const products: WPProduct[] = await response.json()

    // WordPress APIのレスポンスヘッダーから総件数を取得
    const totalItems = Number.parseInt(response.headers.get('X-WP-Total') || '0', 10)

    // BlogItem型に変換
    const basePath = lang === 'ja' ? '/ja/news' : '/news'
    const items: BlogItem[] = products.map((product: WPProduct): BlogItem => {
      return {
        id: product.id.toString(),
        title: product.title.rendered,
        description: product.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 150),
        datetime: product.date,
        href: `${basePath}/${product.slug}`,
      }
    })

    return {
      items,
      totalItems,
    }
  } catch (error) {
    console.error('Error loading products:', error)
    return {
      items: [],
      totalItems: 0,
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
    const response = await fetch(
      'https://wp-api.wp-kyoto.net/wp-json/wp/v2/products?per_page=100&orderby=date&order=desc&_fields=id,title,date,modified,slug',
      {
        next: { revalidate: 3600 }, // 1時間ごとに再検証
      },
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch all products: ${response.status}`)
    }

    const products: WPProduct[] = await response.json()
    return products
  } catch (error) {
    console.error('Error loading all products:', error)
    return []
  }
}
