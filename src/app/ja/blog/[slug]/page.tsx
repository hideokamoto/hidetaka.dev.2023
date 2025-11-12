import BlogDetailPageContent from '@/components/containers/pages/BlogDetailPage'
import { getThoughtBySlug } from '@/libs/dataSources/thoughts'
import { notFound } from 'next/navigation'
import { generateBlogPostingJsonLd, generateBlogBreadcrumbJsonLd } from '@/libs/jsonLd'

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

  const blogPostingJsonLd = generateBlogPostingJsonLd(thought, 'ja', '/ja/blog')
  const breadcrumbJsonLd = generateBlogBreadcrumbJsonLd(thought, 'ja', '/ja/blog')

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <BlogDetailPageContent
        thought={thought}
        lang="ja"
        basePath="/ja/blog"
      />
    </>
  )
}

