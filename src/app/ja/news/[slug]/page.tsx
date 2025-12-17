import { notFound } from 'next/navigation'
import NewsDetailPageContent from '@/components/containers/pages/NewsDetailPage'
import JsonLd from '@/components/JsonLd'
import {
  getAdjacentProducts,
  getProductBySlug,
  getRelatedProducts,
  loadAllProducts,
} from '@/libs/dataSources/products'
import { generateBlogBreadcrumbJsonLd, generateBlogPostingJsonLd } from '@/libs/jsonLd'
import { generateBlogPostMetadata } from '@/libs/metadata'

export async function generateStaticParams() {
  const products = await loadAllProducts()
  return products.map((product) => ({
    slug: product.slug,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug, 'ja')

  if (!product) {
    return {
      title: '製品ニュース',
    }
  }

  // WPProductをWPThought形式に変換してメタデータを生成
  const thoughtLike = {
    id: product.id,
    title: product.title,
    date: product.date,
    modified: product.modified,
    excerpt: product.excerpt || { rendered: '' },
    content: product.content,
    slug: product.slug,
  }

  return generateBlogPostMetadata(thoughtLike as any)
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug, 'ja')

  if (!product) {
    notFound()
  }

  // JSON-LDを生成
  const thoughtLike = {
    id: product.id,
    title: product.title,
    date: product.date,
    modified: product.modified,
    excerpt: product.excerpt || { rendered: '' },
    content: product.content,
    slug: product.slug,
  }
  const blogPostingJsonLd = generateBlogPostingJsonLd(thoughtLike as any, 'ja', '/ja/news')
  const breadcrumbJsonLd = generateBlogBreadcrumbJsonLd(thoughtLike as any, 'ja', '/ja/news')

  // 前後の記事と関連記事を取得
  const [adjacentProducts, relatedArticles] = await Promise.all([
    getAdjacentProducts(product),
    getRelatedProducts(product, 4, 'ja'),
  ])

  return (
    <>
      <JsonLd data={blogPostingJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <NewsDetailPageContent
        product={product}
        lang="ja"
        basePath="/ja/news"
        previousProduct={adjacentProducts.previous}
        nextProduct={adjacentProducts.next}
        relatedArticles={relatedArticles}
      />
    </>
  )
}
