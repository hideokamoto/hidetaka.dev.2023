import BlogDetailPageContent from '@/components/containers/pages/BlogDetailPage'
import { getThoughtBySlug } from '@/libs/dataSources/thoughts'
import { generateBlogPostMetadata } from '@/libs/metadata'
import { notFound } from 'next/navigation'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const thought = await getThoughtBySlug(slug, 'ja')

  if (!thought) {
    return {
      title: 'ブログ記事',
    }
  }

  return generateBlogPostMetadata(thought)
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const thought = await getThoughtBySlug(slug, 'ja')

  if (!thought) {
    notFound()
  }

  return (
    <BlogDetailPageContent
      thought={thought}
      lang="ja"
      basePath="/ja/blog"
    />
  )
}

