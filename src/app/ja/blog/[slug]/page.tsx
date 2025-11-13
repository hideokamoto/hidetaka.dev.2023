import BlogDetailPageContent from '@/components/containers/pages/BlogDetailPage'
import { getThoughtBySlug, getAdjacentThoughts } from '@/libs/dataSources/thoughts'
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

  return {
    title: thought.title.rendered,
  }
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

  // 前後の記事を取得
  const adjacentThoughts = await getAdjacentThoughts(thought, 'ja')

  return (
    <BlogDetailPageContent
      thought={thought}
      lang="ja"
      basePath="/ja/blog"
      previousThought={adjacentThoughts.previous}
      nextThought={adjacentThoughts.next}
    />
  )
}

