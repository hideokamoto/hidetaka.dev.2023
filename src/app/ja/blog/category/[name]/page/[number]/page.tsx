import BlogPageContent from '@/components/containers/pages/BlogPage'
import { loadThoughtsByCategory, loadAllCategories } from '@/libs/dataSources/thoughts'
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
  
  // Next.jsのApp Routerでは、URLパラメータは自動的にデコードされるはずだが、
  // 実際にはエンコードされた形式で渡される場合がある
  // エンコードされている場合はデコード、そうでない場合はそのまま使用
  let decodedName = name
  try {
    // %が含まれている場合はエンコードされていると判断してデコード
    // ただし、既にデコードされている場合もあるので、デコードを試みる
    if (name.includes('%')) {
      decodedName = decodeURIComponent(name)
    } else {
      // デコードされていない場合でも、念のためエンコードしてからデコードしてみる
      // これは、Next.jsが既にデコードしている場合のフォールバック
      decodedName = name
    }
  } catch (e) {
    // デコードに失敗した場合はそのまま使用
    decodedName = name
  }
  
  const pageNumber = parseInt(number, 10)

  if (isNaN(pageNumber) || pageNumber < 1) {
    notFound()
  }

  const [result, categories] = await Promise.all([
    loadThoughtsByCategory(decodedName, pageNumber, 20, 'ja'),
    loadAllCategories('ja'),
  ])

  // ページが存在しない場合
  // ページ2以降で結果がない場合、または総ページ数を超えている場合は404
  if (result.items.length === 0) {
    if (result.totalPages === 0 || pageNumber > result.totalPages) {
      notFound()
    }
  }

  // カテゴリ名を取得（最初の記事のカテゴリから）
  const categoryName = result.items[0]?.categories?.find(cat => cat.slug === decodedName)?.name || decodedName

  // basePathにはエンコードされたslugを使用（Next.jsのparamsはデコード済みなので再エンコード）
  const encodedSlug = encodeURIComponent(decodedName)

  return (
    <BlogPageContent
      lang="ja"
      thoughts={result.items}
      currentPage={result.currentPage}
      totalPages={result.totalPages}
      basePath={`/ja/blog/category/${encodedSlug}`}
      categoryName={categoryName}
      categories={categories}
    />
  )
}

