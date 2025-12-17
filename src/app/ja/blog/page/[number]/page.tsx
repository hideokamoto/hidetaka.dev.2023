import { notFound } from 'next/navigation'
import BlogPageContent from '@/components/containers/pages/BlogPage'
import JsonLd from '@/components/JsonLd'
import { loadAllCategories, loadThoughts } from '@/libs/dataSources/thoughts'
import { generateBlogListJsonLd } from '@/libs/jsonLd'

// See REVALIDATION_PERIOD.ARCHIVE in @/consts
export const revalidate = 10800

export const metadata = {
  title: 'ブログ',
}

export default async function BlogPageNumber({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params
  const pageNumber = parseInt(number, 10)

  if (Number.isNaN(pageNumber) || pageNumber < 1) {
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
    result.totalPages,
  )

  return (
    <>
      <JsonLd data={jsonLd} />
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
