import BlogPageContent from '@/components/containers/pages/BlogPage'
import { loadThoughts, loadAllCategories } from '@/libs/dataSources/thoughts'
import { notFound } from 'next/navigation'

export const metadata = {
  title: 'ブログ',
}

export default async function BlogPage() {
  const [result, categories] = await Promise.all([
    loadThoughts(1, 20, 'ja'),
    loadAllCategories('ja'),
  ])

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
      categories={categories}
    />
  )
}

