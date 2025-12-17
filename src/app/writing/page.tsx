import WritingPageContent from '@/components/containers/pages/WritingPage'
import { loadBlogPosts } from '@/libs/dataSources/blogs'
import { MicroCMSAPI } from '@/libs/microCMS/apis'
import { createMicroCMSClient } from '@/libs/microCMS/client'

export const metadata = {
  title: 'Writing',
}

// ISR: 1時間ごとにページを再検証（複数ソースの集約）
export const revalidate = 3600

export default async function WritingPage() {
  const microCMS = new MicroCMSAPI(createMicroCMSClient())
  const { items: externalArticles, hasMoreBySource } = await loadBlogPosts('en')
  const newsArticles = await microCMS.listPosts({ lang: 'english' })

  return (
    <WritingPageContent
      lang="en"
      externalArticles={externalArticles}
      hasMoreBySource={hasMoreBySource}
      newsArticles={newsArticles}
    />
  )
}
