import { notFound } from 'next/navigation'
import WritingPageContent from '@/components/containers/pages/WritingPage'
import { loadAllCategoriesFromWriting } from '@/libs/dataSources/blogs'
import { loadDevNotesByCategory } from '@/libs/dataSources/devnotes'
import type { FeedItem } from '@/libs/dataSources/types'

// ISR: 3時間ごとにページを再検証
export const revalidate = 10800

export const metadata = {
  title: 'Writingカテゴリ',
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
    loadDevNotesByCategory(decodedName, 1, 20),
    loadAllCategoriesFromWriting('ja'),
  ])

  if (result.items.length === 0) {
    notFound()
  }

  // カテゴリ名を取得（最初の記事のカテゴリから）
  const categoryName =
    result.items[0]?.categories?.find((cat) => cat.slug === decodedName)?.name || decodedName

  // basePathにはエンコードされたslugを使用（Next.jsのparamsはデコード済みなので再エンコード）
  const encodedSlug = encodeURIComponent(decodedName)
  const basePath = `/ja/writing/category/${encodedSlug}`

  // BlogItemをFeedItemに変換
  const sourceDevNotes = {
    href: '/ja/writing/dev-notes',
    name: 'Dev Notes',
    color: 'green',
  }

  const feedItems: FeedItem[] = result.items.map((item) => ({
    id: item.id,
    title: item.title,
    href: item.href,
    description: item.description,
    datetime: item.datetime,
    dataSource: sourceDevNotes,
    categories: item.categories,
  }))

  return (
    <WritingPageContent
      lang="ja"
      externalArticles={feedItems}
      categoryName={categoryName}
      categories={categories}
      basePath={basePath}
    />
  )
}
