import WritingPageContent from '@/components/containers/pages/WritingPage'
import { loadBlogPosts } from '@/libs/dataSources/blogs'
import { loadDevNotes } from '@/libs/dataSources/devNotes'
import { MicroCMSAPI } from '@/libs/microCMS/apis'
import { createMicroCMSClient } from '@/libs/microCMS/client'

export const metadata = {
  title: 'Writing',
}

export default async function WritingPage() {
  const microCMS = new MicroCMSAPI(createMicroCMSClient())
  const [{ items: externalArticles, hasMoreBySource }, newsArticles, devNotesResult] =
    await Promise.all([
      loadBlogPosts('ja'),
      microCMS.listPosts({ lang: 'japanese' }),
      loadDevNotes(1, 20, 'ja'),
    ])

  return (
    <WritingPageContent
      lang="ja"
      externalArticles={externalArticles}
      hasMoreBySource={hasMoreBySource}
      newsArticles={newsArticles}
      devNotes={devNotesResult.items}
    />
  )
}
