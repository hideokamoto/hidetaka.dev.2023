import { notFound } from 'next/navigation'
import BlogPageContent from '@/components/containers/pages/BlogPage'
import JsonLd from '@/components/JsonLd'
import { loadAllCategories, loadThoughts } from '@/libs/dataSources/thoughts'
import { generateBlogListJsonLd } from '@/libs/jsonLd'

export const metadata = {
  title: 'Blog',
}

// ISR: Revalidate page every 30 minutes (1-2 articles updated daily from WordPress)
export const revalidate = 1800

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
    result.totalPages,
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
