import { notFound } from 'next/navigation'
import NewsDetailPageContent from '@/components/containers/pages/NewsDetailPage'
import JsonLd from '@/components/JsonLd'
import {
  getAdjacentProducts,
  getProductBySlug,
  getRelatedProducts,
  loadAllProducts,
  type WPProduct,
} from '@/libs/dataSources/products'
import type { WPThought } from '@/libs/dataSources/types'
import { generateBlogBreadcrumbJsonLd, generateBlogPostingJsonLd } from '@/libs/jsonLd'
import { generateBlogPostMetadata } from '@/libs/metadata'

// WPProductをWPThoughtに変換するヘルパー関数
function productToThought(product: WPProduct): WPThought {
  return {
    id: product.id,
    title: product.title,
    date: product.date,
    date_gmt: product.date_gmt,
    modified: product.modified,
    modified_gmt: product.modified_gmt,
    excerpt: product.excerpt || { rendered: '' },
    content: product.content,
    link: product.link,
    slug: product.slug,
    featured_media: product.featured_media,
  }
}

export async function generateStaticParams() {
  const products = await loadAllProducts()
  return products.map((product) => ({
    slug: product.slug,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug, 'en')

  if (!product) {
    return {
      title: 'Product News',
    }
  }

  // WPProductをWPThought形式に変換してメタデータを生成
  const thought = productToThought(product)

  return generateBlogPostMetadata(thought)
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug, 'en')

  if (!product) {
    notFound()
  }

  const lang = 'en'

  // はてなスター機能の有効化判定
  // 環境変数で制御し、かつ日本語ページでのみ表示
  const enableHatenaStar = process.env.NEXT_PUBLIC_ENABLE_HATENA_STAR === 'true' && lang === 'ja'

  // JSON-LDを生成
  const thought = productToThought(product)
  const blogPostingJsonLd = generateBlogPostingJsonLd(thought, lang, '/news')
  const breadcrumbJsonLd = generateBlogBreadcrumbJsonLd(thought, lang, '/news')

  // 前後の記事と関連記事を取得
  const [adjacentProducts, relatedArticles] = await Promise.all([
    getAdjacentProducts(product),
    getRelatedProducts(product, 4),
  ])

  return (
    <>
      <JsonLd data={blogPostingJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <NewsDetailPageContent
        product={product}
        lang={lang}
        basePath="/news"
        previousProduct={adjacentProducts.previous}
        nextProduct={adjacentProducts.next}
        relatedArticles={relatedArticles}
        enableHatenaStar={enableHatenaStar}
      />
    </>
  )
}
