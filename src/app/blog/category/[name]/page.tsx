import BlogPageContent from '@/components/containers/pages/BlogPage'
import { loadThoughtsByCategory, loadAllCategories } from '@/libs/dataSources/thoughts'
import { notFound } from 'next/navigation'

export const metadata = {
  title: 'Blog Category',
}

export default async function BlogCategoryPage({
  params,
}: {
  params: Promise<{ name: string }>
}) {
  const { name } = await params
  // Next.jsのApp Routerでは、URLパラメータは自動的にデコードされる
  // ただし、URLエンコードされた文字列がそのまま渡される場合もあるので、両方試す
  const decodedName = name.includes('%') ? decodeURIComponent(name) : name
  
  const [result, categories] = await Promise.all([
    loadThoughtsByCategory(decodedName, 1, 20, 'en'),
    loadAllCategories('en'),
  ])

  if (result.items.length === 0) {
    notFound()
  }

  // カテゴリ名を取得（最初の記事のカテゴリから）
  const categoryName = result.items[0]?.categories?.find(cat => cat.slug === decodedName)?.name || decodedName

  // basePathにはエンコードされたslugを使用（Next.jsのparamsはデコード済みなので再エンコード）
  const encodedSlug = encodeURIComponent(decodedName)

  return (
    <BlogPageContent
      lang="en"
      thoughts={result.items}
      currentPage={result.currentPage}
      totalPages={result.totalPages}
      basePath={`/blog/category/${encodedSlug}`}
      categoryName={categoryName}
      categories={categories}
    />
  )
}

