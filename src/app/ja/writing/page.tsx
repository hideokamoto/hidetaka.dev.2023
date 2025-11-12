import WritingPageContent from '@/components/containers/pages/WritingPage'
import { loadBlogPosts } from '@/libs/dataSources/blogs'
import { MicroCMSAPI } from '@/lib/microCMS/apis'
import { createMicroCMSClient } from '@/lib/microCMS/client'

export const metadata = {
  title: 'Writing',
}

export default async function WritingPage() {
  const microCMS = new MicroCMSAPI(createMicroCMSClient())
  const externalArticles = await loadBlogPosts('ja')
  const newsArticles = await microCMS.listPosts({ lang: 'japanese' })

  return <WritingPageContent lang="ja" externalArticles={externalArticles} newsArticles={newsArticles} />
}

