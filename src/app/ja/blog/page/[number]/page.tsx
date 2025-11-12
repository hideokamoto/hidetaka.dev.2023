import BlogPageContent from '@/components/containers/pages/BlogPage'
import { loadThoughts } from '@/libs/dataSources/thoughts'
import { notFound } from 'next/navigation'

export const metadata = {
  title: 'ブログ',
}

export default async function BlogPageNumber({
  params,
}: {
  params: Promise<{ number: string }>
}) {
  const { number } = await params
  const pageNumber = parseInt(number, 10)

  if (isNaN(pageNumber) || pageNumber < 1) {
    notFound()
  }

  const result = await loadThoughts(pageNumber, 20, 'ja')

  if (result.items.length === 0 && result.currentPage > result.totalPages) {
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

