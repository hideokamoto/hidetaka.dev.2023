import { notFound } from 'next/navigation'
import BlogDetailPageContent from '@/components/containers/pages/BlogDetailPage'
import JsonLd from '@/components/JsonLd'
import { getAdjacentThoughts, getThoughtBySlug } from '@/libs/dataSources/thoughts'
import { generateBlogBreadcrumbJsonLd, generateBlogPostingJsonLd } from '@/libs/jsonLd'
import { generateBlogPostMetadata } from '@/libs/metadata'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const thought = await getThoughtBySlug(slug, 'ja')

  if (!thought) {
    return {
      title: 'ブログ記事',
    }
  }

  return generateBlogPostMetadata(thought)
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const thought = await getThoughtBySlug(slug, 'ja')

  if (!thought) {
    notFound()
  }

  // JSON-LDを生成
  const blogPostingJsonLd = generateBlogPostingJsonLd(thought, 'ja', '/ja/blog')
  const breadcrumbJsonLd = generateBlogBreadcrumbJsonLd(thought, 'ja', '/ja/blog')

  // 前後の記事を取得
  const adjacentThoughts = await getAdjacentThoughts(thought, 'ja')

  return (
    <>
      <JsonLd data={blogPostingJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <BlogDetailPageContent
        thought={thought}
        lang="ja"
        basePath="/ja/blog"
        previousThought={adjacentThoughts.previous}
        nextThought={adjacentThoughts.next}
      />
    </>
  )
}
