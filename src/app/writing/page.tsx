import WritingPageContent from '@/components/containers/pages/WritingPage'
import { loadBlogPosts } from '@/libs/dataSources/blogs'

export const metadata = {
  title: 'Writing',
}

// ISR: 1時間ごとにページを再検証（複数ソースの集約）
export const revalidate = 3600

export default async function WritingPage() {
  const { items: externalArticles, hasMoreBySource } = await loadBlogPosts('en')

  return (
    <WritingPageContent
      lang="en"
      externalArticles={externalArticles}
      hasMoreBySource={hasMoreBySource}
    />
  )
}
