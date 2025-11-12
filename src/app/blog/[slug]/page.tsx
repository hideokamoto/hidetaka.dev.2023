import BlogDetailPageContent from '@/components/containers/pages/BlogDetailPage'
import { getThoughtBySlug } from '@/libs/dataSources/thoughts'
import { notFound } from 'next/navigation'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const thought = await getThoughtBySlug(slug, 'en')

  if (!thought) {
    return {
      title: 'Blog Post',
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
  const thought = await getThoughtBySlug(slug, 'en')

  if (!thought) {
    notFound()
  }

  return (
    <BlogDetailPageContent
      thought={thought}
      lang="en"
      basePath="/blog"
    />
  )
}

