import BlogPageContent from '@/components/containers/pages/BlogPage'
import { loadThoughts, loadAllCategories } from '@/libs/dataSources/thoughts'
import { notFound } from 'next/navigation'
import { generateBlogListJsonLd } from '@/libs/jsonLd'
import JsonLd from '@/components/JsonLd'

export const metadata = {
  title: 'Blog',
}

export default async function BlogPage() {
  const [result, categories] = await Promise.all([
    loadThoughts(1, 20, 'en'),
    loadAllCategories('en'),
  ])

  if (result.items.length === 0 && result.currentPage > 1) {
    notFound()
  }

  const jsonLd = generateBlogListJsonLd(
    result.items,
    'en',
    '/blog',
    result.currentPage,
    result.totalPages
  )

  return (
    <>
      <JsonLd data={jsonLd} />
      <BlogPageContent
        lang="en"
        thoughts={result.items}
        currentPage={result.currentPage}
        totalPages={result.totalPages}
        basePath="/blog"
        categories={categories}
      />
    </>
  )
}

