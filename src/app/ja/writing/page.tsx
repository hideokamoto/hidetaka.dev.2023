import WritingPageContent from '@/components/containers/pages/WritingPage'
import { loadBlogPosts } from '@/libs/dataSources/blogs'
import { MicroCMSAPI } from '@/libs/microCMS/apis'
import { createMicroCMSClient } from '@/libs/microCMS/client'

// See REVALIDATION_PERIOD.ARCHIVE in @/consts
export const revalidate = 10800

export const metadata = {
  title: 'Writing',
}

export default async function WritingPage() {
  const microCMS = new MicroCMSAPI(createMicroCMSClient())
  const { items: externalArticles, hasMoreBySource } = await loadBlogPosts('ja')
  const newsArticles = await microCMS.listPosts({ lang: 'japanese' })

  return (
    <WritingPageContent
      lang="ja"
      externalArticles={externalArticles}
      hasMoreBySource={hasMoreBySource}
      newsArticles={newsArticles}
    />
  )
}
