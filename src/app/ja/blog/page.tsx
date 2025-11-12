import BlogPageContent from '@/components/containers/pages/BlogPage'
import { loadThoughts } from '@/libs/dataSources/thoughts'
import { notFound } from 'next/navigation'

export const metadata = {
  title: 'ブログ',
}

export default async function BlogPage() {
  const result = await loadThoughts(1, 20)

  if (result.items.length === 0 && result.currentPage > 1) {
    notFound()
  }

  return (
    <BlogPageContent
      lang="ja"
      thoughts={result.items}
      currentPage={result.currentPage}
      totalPages={result.totalPages}
      basePath="/ja/blog"
    />
  )
}

