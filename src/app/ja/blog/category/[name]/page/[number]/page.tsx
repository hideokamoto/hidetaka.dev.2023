import BlogPageContent from '@/components/containers/pages/BlogPage'
import { loadThoughtsByCategory } from '@/libs/dataSources/thoughts'
import { notFound } from 'next/navigation'

export const metadata = {
  title: 'ブログカテゴリ',
}

export default async function BlogCategoryPageNumber({
  params,
}: {
  params: Promise<{ name: string; number: string }>
}) {
  const { name, number } = await params
  // Next.jsのApp Routerでは、URLパラメータは自動的にデコードされる
  // ただし、URLエンコードされた文字列がそのまま渡される場合もあるので、両方試す
  const decodedName = name.includes('%') ? decodeURIComponent(name) : name
  const pageNumber = parseInt(number, 10)

  if (isNaN(pageNumber) || pageNumber < 1) {
    notFound()
  }

  const result = await loadThoughtsByCategory(decodedName, pageNumber, 20, 'ja')

  if (result.items.length === 0 && result.currentPage > result.totalPages) {
    notFound()
  }

  // カテゴリ名を取得（最初の記事のカテゴリから）
  const categoryName = result.items[0]?.categories?.find(cat => cat.slug === decodedName)?.name || decodedName

  return (
    <BlogPageContent
      lang="ja"
      thoughts={result.items}
      currentPage={result.currentPage}
      totalPages={result.totalPages}
      basePath={`/ja/blog/category/${name}`}
      categoryName={categoryName}
    />
  )
}

