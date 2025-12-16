import { notFound } from 'next/navigation'
import WritingPageContent from '@/components/containers/pages/WritingPage'
import { loadBlogPosts } from '@/libs/dataSources/blogs'
import { MicroCMSAPI } from '@/libs/microCMS/apis'
import { createMicroCMSClient } from '@/libs/microCMS/client'

export const metadata = {
  title: 'Writing Category',
}

// ISR: 1時間ごとにページを再検証（複数ソースの集約）
export const revalidate = 3600

export default async function WritingCategoryPage({
  params,
}: {
  params: Promise<{ name: string }>
}) {
  const { name } = await params
  // Next.jsのApp Routerでは、URLパラメータは自動的にデコードされる
  // ただし、URLエンコードされた文字列がそのまま渡される場合もあるので、両方試す
  const decodedName = name.includes('%') ? decodeURIComponent(name) : name

  const microCMS = new MicroCMSAPI(createMicroCMSClient())

  // カテゴリ(タグ)でフィルタリングされたニュース記事を取得
  const newsArticles = await microCMS.listPostsByTag(decodedName, { lang: 'english' })

  // 外部記事は全て取得してクライアント側でフィルタリング
  // (外部記事にはタグ情報がないため、すべて取得する必要がある)
  const { items: externalArticles, hasMoreBySource } = await loadBlogPosts('en')

  // ニュース記事が存在しない場合は404
  if (newsArticles.length === 0) {
    notFound()
  }

  return (
    <WritingPageContent
      lang="en"
      externalArticles={externalArticles}
      hasMoreBySource={hasMoreBySource}
      newsArticles={newsArticles}
      categoryName={decodedName}
    />
  )
}
