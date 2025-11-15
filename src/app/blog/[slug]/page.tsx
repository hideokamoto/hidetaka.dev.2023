import { notFound } from 'next/navigation'
import BlogDetailPageContent from '@/components/containers/pages/BlogDetailPage'
import JsonLd from '@/components/JsonLd'
import { getThoughtBySlug } from '@/libs/dataSources/thoughts'
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

  const blogPostingJsonLd = generateBlogPostingJsonLd(thought, 'en', '/blog')
  const breadcrumbJsonLd = generateBlogBreadcrumbJsonLd(thought, 'en', '/blog')

  return (
    <>
      <JsonLd data={blogPostingJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <BlogDetailPageContent thought={thought} lang="en" basePath="/blog" />
    </>
  )
}
