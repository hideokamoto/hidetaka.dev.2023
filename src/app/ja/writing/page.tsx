import WritingPageContent from '@/components/containers/pages/WritingPage'
import StatsSection from '@/components/ui/stats/StatsSection'
import { loadBlogPosts } from '@/libs/dataSources/blogs'
import { buildAlternates } from '@/libs/metadata'
import { loadWritingActivity } from '@/libs/stats/writingActivity'

export const metadata = {
  alternates: buildAlternates('/ja/writing'),
  title: 'Writing',
}

// ISR: 1時間ごとにページを再検証（複数ソースの集約）
export const revalidate = 3600

export default async function WritingPage() {
  const [{ items: externalArticles, hasMoreBySource }, activity] = await Promise.all([
    loadBlogPosts('ja'),
    loadWritingActivity(),
  ])

  return (
    <WritingPageContent
      lang="ja"
      externalArticles={externalArticles}
      hasMoreBySource={hasMoreBySource}
      statsSlot={<StatsSection activity={activity} lang="ja" />}
    />
  )
}
