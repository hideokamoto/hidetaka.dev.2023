import BlogPageContent from '@/components/containers/pages/BlogPage'
import { loadThoughts } from '@/libs/dataSources/thoughts'
import { notFound } from 'next/navigation'

export const metadata = {
  title: 'Blog',
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

  const result = await loadThoughts(pageNumber, 20)

  if (result.items.length === 0 && result.currentPage > result.totalPages) {
    notFound()
  }

  return (
    <BlogPageContent
      lang="en"
      thoughts={result.items}
      currentPage={result.currentPage}
      totalPages={result.totalPages}
      basePath="/blog"
    />
  )
}

