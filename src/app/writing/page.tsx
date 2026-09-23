import WritingPageContent from '@/components/containers/pages/WritingPage'
import StatsSection from '@/components/ui/stats/StatsSection'
import { loadBlogPosts } from '@/libs/dataSources/blogs'
import { buildAlternates } from '@/libs/metadata'
import { loadWritingActivity } from '@/libs/stats/writingActivity'

export const metadata = {
  alternates: buildAlternates('/writing'),
  title: 'Writing',
}

// ISR: 1時間ごとにページを再検証（複数ソースの集約）
export const revalidate = 3600

export default async function WritingPage() {
  const [{ items: externalArticles, hasMoreBySource }, activity] = await Promise.all([
    loadBlogPosts('en'),
    loadWritingActivity(),
  ])

  return (
    <WritingPageContent
      lang="en"
      externalArticles={externalArticles}
      hasMoreBySource={hasMoreBySource}
      statsSlot={<StatsSection activity={activity} lang="en" />}
    />
  )
}
