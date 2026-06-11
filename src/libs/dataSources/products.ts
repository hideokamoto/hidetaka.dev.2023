import { logger } from '@/libs/logger'
import type { BlogItem } from './types'
import { wpClient } from './wpClient'

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

const productsCollection = () => wpClient.postType<WPProduct>('products')

const PRODUCT_DETAIL_FIELDS = [
  'id',
  'title',
  'date',
  'date_gmt',
  'modified',
  'modified_gmt',
  'excerpt',
  'content',
  'slug',
  'link',
  'featured_media',
] as const

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
    const {
      items: products,
      total: totalItems,
      totalPages,
    } = await productsCollection().list(
      {
        page,
        per_page: perPage,
        orderby: 'date',
        order: 'desc',
        _fields: PRODUCT_DETAIL_FIELDS,
      },
      {
        next: { revalidate: 1800 }, // 30分ごとに再検証
      },
    )

    // BlogItem型に変換
    const basePath = lang === 'ja' ? '/ja/news' : '/news'
    const items: BlogItem[] = products.map((product): BlogItem => {
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
    logger.error('Failed to load products', {
      error,
      page,
      perPage,
    })
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
  _lang: 'en' | 'ja' = 'en',
): Promise<WPProduct | null> => {
  try {
    return await productsCollection().getBySlug(
      slug,
      {
        _fields: PRODUCT_DETAIL_FIELDS,
      },
      {
        next: { revalidate: 1800 }, // 30分ごとに再検証
      },
    )
  } catch (error) {
    logger.error('Failed to load product by slug', {
      error,
      slug,
    })
    return null
  }
}

export type AdjacentProducts = {
  previous: WPProduct | null
  next: WPProduct | null
}

/**
 * 前後の製品ニュース記事を取得
 * @param currentProduct 現在の記事
 * @returns AdjacentProducts
 */
export const getAdjacentProducts = async (currentProduct: WPProduct): Promise<AdjacentProducts> => {
  try {
    // 前の記事を取得（現在の記事より前の日付で最も新しいもの）
    const previousPromise = productsCollection().list(
      {
        before: currentProduct.date,
        per_page: 1,
        orderby: 'date',
        order: 'desc',
        _fields: PRODUCT_DETAIL_FIELDS,
      },
      {
        next: { revalidate: 1800 }, // 30分ごとに再検証
      },
    )

    // 次の記事を取得（現在の記事より後の日付で最も古いもの）
    const nextPromise = productsCollection().list(
      {
        after: currentProduct.date,
        per_page: 1,
        orderby: 'date',
        order: 'asc',
        _fields: PRODUCT_DETAIL_FIELDS,
      },
      {
        next: { revalidate: 1800 }, // 30分ごとに再検証
      },
    )

    // 並列で実行
    const [previousResult, nextResult] = await Promise.all([previousPromise, nextPromise])

    return {
      previous: previousResult.items[0] ?? null,
      next: nextResult.items[0] ?? null,
    }
  } catch (error) {
    logger.error('Failed to load adjacent products', {
      error,
      productId: currentProduct.id,
    })
    return {
      previous: null,
      next: null,
    }
  }
}

/**
 * 関連製品ニュース記事を取得（最新記事からランダムに選択）
 * @param currentProduct 現在の記事
 * @param limit 取得件数（デフォルト: 4）
 * @param lang 言語 ('en' | 'ja')
 * @returns BlogItem[]
 */
export const getRelatedProducts = async (
  currentProduct: WPProduct,
  limit: number = 4,
  lang: 'en' | 'ja' = 'en',
): Promise<BlogItem[]> => {
  try {
    // 現在の記事を除外して最新記事を取得
    const fetchLimit = Math.max(limit * 2, 10) // 最低10件、limitの2倍まで
    const { items: products } = await productsCollection().list(
      {
        exclude: [currentProduct.id],
        per_page: fetchLimit,
        orderby: 'date',
        order: 'desc',
        _fields: ['id', 'title', 'date', 'date_gmt', 'excerpt', 'slug', 'link'],
      },
      {
        next: { revalidate: 1800 }, // 30分ごとに再検証
      },
    )

    // BlogItem型に変換
    const basePath = lang === 'ja' ? '/ja/news' : '/news'
    const items: BlogItem[] = products.map((product): BlogItem => {
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

    // Fisher-Yatesアルゴリズムでシャッフル
    const shuffled = [...items]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    // limitの数だけ返す
    return shuffled.slice(0, limit)
  } catch (error) {
    logger.error('Failed to load related products', {
      error,
      productId: currentProduct.id,
      limit,
    })
    return []
  }
}

/**
 * サイトマップ生成用：全製品ニュースを取得
 * @returns WPProduct[]
 */
export const loadAllProducts = async (): Promise<WPProduct[]> => {
  try {
    // sitemap 用途のため id/title/date/modified/slug のみ取得し、WPProduct[] としてキャスト
    const products = await productsCollection().listAll(
      {
        per_page: 100,
        orderby: 'date',
        order: 'desc',
        _fields: ['id', 'title', 'date', 'modified', 'slug'],
      },
      {
        next: { revalidate: 3600 }, // 1時間ごとに再検証
      },
    )
    return products as unknown as WPProduct[]
  } catch (error) {
    logger.error('Failed to load all products', {
      error,
    })
    return []
  }
}
