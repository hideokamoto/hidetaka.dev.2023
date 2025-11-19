import { notFound } from 'next/navigation'
import BlogDetailPageContent from '@/components/containers/pages/BlogDetailPage'
import JsonLd from '@/components/JsonLd'
import type { WPThought } from '@/libs/dataSources/types'
import { getRelatedThoughts, getThoughtBySlug } from '@/libs/dataSources/thoughts'
import { generateBlogBreadcrumbJsonLd, generateBlogPostingJsonLd } from '@/libs/jsonLd'
import { generateBlogPostMetadata } from '@/libs/metadata'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const thought = await getThoughtBySlug(slug, 'en')

  if (!thought) {
    return {
      title: 'Blog Post',
    }
  }

  return generateBlogPostMetadata(thought)
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const thought = await getThoughtBySlug(slug, 'en')

  if (!thought) {
    notFound()
  }

  // notFound()の後なので、thoughtは確実にWPThought型
  const validThought = thought as WPThought

  // 関連記事を取得
  const relatedArticles = await getRelatedThoughts(validThought, 4, 'en')

  const blogPostingJsonLd = generateBlogPostingJsonLd(validThought, 'en', '/blog')
  const breadcrumbJsonLd = generateBlogBreadcrumbJsonLd(validThought, 'en', '/blog')

  return (
    <>
      <JsonLd data={blogPostingJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <BlogDetailPageContent
        thought={validThought}
        lang="en"
        basePath="/blog"
        relatedArticles={relatedArticles}
      />
    </>
  )
}
