import BlogDetailPageContent from '@/components/containers/pages/BlogDetailPage'
import { getThoughtBySlug } from '@/libs/dataSources/thoughts'
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

  const description = thought.excerpt.rendered
    .replace(/<[^>]*>/g, '')
    .substring(0, 160)

  return {
    title: thought.title.rendered,
    description,
    openGraph: {
      title: thought.title.rendered,
      description,
      type: 'article',
      publishedTime: thought.date,
      url: `https://hidetaka.dev/ja/blog/${slug}`,
      siteName: 'Hidetaka.dev',
    },
    twitter: {
      card: 'summary_large_image',
      title: thought.title.rendered,
      description,
    },
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

  return (
    <BlogDetailPageContent
      thought={thought}
      lang="ja"
      basePath="/ja/blog"
    />
  )
}

