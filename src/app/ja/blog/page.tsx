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

// ISR: 30分ごとにページを再検証（WordPressから毎日1〜2記事更新）
export const revalidate = 1800

export default async function BlogPage() {
  const [result, categories] = await Promise.all([
    loadThoughts(1, 20, 'ja'),
    loadAllCategories('ja'),
  ])

  if (result.items.length === 0 && result.currentPage > 1) {
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
