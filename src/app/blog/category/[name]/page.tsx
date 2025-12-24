import { notFound } from 'next/navigation'
import BlogPageContent from '@/components/containers/pages/BlogPage'
import JsonLd from '@/components/JsonLd'
import { loadAllCategories, loadThoughtsByCategory } from '@/libs/dataSources/thoughts'
import { generateBlogListJsonLd } from '@/libs/jsonLd'

// See REVALIDATION_PERIOD.ARCHIVE in @/consts
export const revalidate = 10800

export const metadata = {
  title: 'Blog Category',
}

export default async function BlogCategoryPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  // In Next.js App Router, URL parameters are automatically decoded
  // However, URL-encoded strings may be passed as-is, so try both
  const decodedName = name.includes('%') ? decodeURIComponent(name) : name

  const [result, categories] = await Promise.all([
    loadThoughtsByCategory(decodedName, 1, 20, 'en'),
    loadAllCategories('en'),
  ])

  if (result.items.length === 0) {
    notFound()
  }

  // Get category name (from the first article's category)
  const categoryName =
    result.items[0]?.categories?.find((cat) => cat.slug === decodedName)?.name || decodedName

  // Use encoded slug for basePath (Next.js params are already decoded, so re-encode)
  const encodedSlug = encodeURIComponent(decodedName)
  const basePath = `/blog/category/${encodedSlug}`

  const jsonLd = generateBlogListJsonLd(
    result.items,
    'en',
    basePath,
    result.currentPage,
    result.totalPages,
    categoryName,
  )

  return (
    <>
      <JsonLd data={jsonLd} />
      <BlogPageContent
        lang="en"
        thoughts={result.items}
        currentPage={result.currentPage}
        totalPages={result.totalPages}
        basePath={basePath}
        categoryName={categoryName}
        categories={categories}
      />
    </>
  )
}
