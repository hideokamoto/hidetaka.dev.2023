import BlogPageContent from '@/components/containers/pages/BlogPage'
import { loadThoughts, loadAllCategories } from '@/libs/dataSources/thoughts'
import { notFound } from 'next/navigation'
import { generateBlogListJsonLd } from '@/libs/jsonLd'

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

  const [result, categories] = await Promise.all([
    loadThoughts(pageNumber, 20, 'ja'),
    loadAllCategories('ja'),
  ])

  if (result.items.length === 0 && result.currentPage > result.totalPages) {
    notFound()
  }

  const jsonLd = generateBlogListJsonLd(
    result.items,
    'ja',
    '/ja/blog',
    result.currentPage,
    result.totalPages
  )

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogPageContent
        lang="ja"
        thoughts={result.items}
        currentPage={result.currentPage}
        totalPages={result.totalPages}
        basePath="/ja/blog"
        categories={categories}
      />
    </>
  )
}

