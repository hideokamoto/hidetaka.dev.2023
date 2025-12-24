import { notFound } from 'next/navigation'
import WritingPageContent from '@/components/containers/pages/WritingPage'
import { loadAllCategories, loadBlogPostsByCategory } from '@/libs/dataSources/blogs'

// See REVALIDATION_PERIOD.ARCHIVE in @/consts
export const revalidate = 10800

export const metadata = {
  title: 'Writing カテゴリ',
}

export default async function WritingCategoryPage({
  params,
}: {
  params: Promise<{ name: string }>
}) {
  const { name } = await params
  // Next.jsのApp Routerでは、URLパラメータは自動的にデコードされる
  // ただし、URLエンコードされた文字列がそのまま渡される場合もあるので、両方試す
  const decodedName = name.includes('%') ? decodeURIComponent(name) : name

  const [result, categories] = await Promise.all([
    loadBlogPostsByCategory(decodedName, 'ja'),
    loadAllCategories('ja'),
  ])

  if (result.items.length === 0) {
    notFound()
  }

  // カテゴリ名を取得（最初の記事のカテゴリから）
  const categoryName =
    result.items[0]?.categories?.find((cat) => {
      const normalizedSlug = cat.slug.includes('%') ? decodeURIComponent(cat.slug) : cat.slug
      return normalizedSlug === decodedName || cat.slug === decodedName
    })?.name || decodedName

  // basePathにはエンコードされたslugを使用（Next.jsのparamsはデコード済みなので再エンコード）
  const encodedSlug = encodeURIComponent(decodedName)
  const basePath = `/ja/writing/category/${encodedSlug}`

  return (
    <WritingPageContent
      lang="ja"
      externalArticles={result.items}
      hasMoreBySource={result.hasMoreBySource}
      categories={categories}
      basePath={basePath}
      categoryName={categoryName}
    />
  )
}
