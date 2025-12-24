import { notFound } from 'next/navigation'
import BlogDetailPageContent from '@/components/containers/pages/BlogDetailPage'
import JsonLd from '@/components/JsonLd'
import { getRelatedThoughts, getThoughtBySlug } from '@/libs/dataSources/thoughts'
import { generateBlogBreadcrumbJsonLd, generateBlogPostingJsonLd } from '@/libs/jsonLd'
import { generateBlogPostMetadata } from '@/libs/metadata'

// See REVALIDATION_PERIOD.ARTICLE in @/consts
export const revalidate = 86400

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

  // Get related articles
  const relatedArticles = await getRelatedThoughts(thought, 4, 'en')

  const blogPostingJsonLd = generateBlogPostingJsonLd(thought, 'en', '/blog')
  const breadcrumbJsonLd = generateBlogBreadcrumbJsonLd(thought, 'en', '/blog')

  return (
    <>
      <JsonLd data={blogPostingJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <BlogDetailPageContent
        thought={thought}
        lang="en"
        basePath="/blog"
        relatedArticles={relatedArticles}
      />
    </>
  )
}
