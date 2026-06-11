import WritingPageContent from '@/components/containers/pages/WritingPage'
import StatsSection from '@/components/ui/stats/StatsSection'
import { loadBlogPosts } from '@/libs/dataSources/blogs'
import { buildAlternates } from '@/libs/metadata'
import { loadStatsPosts } from '@/libs/stats/loadStatsPosts'

export const metadata = {
  alternates: buildAlternates('/ja/writing'),
  title: 'Writing',
}

// ISR: 1時間ごとにページを再検証（複数ソースの集約）
export const revalidate = 3600

export default async function WritingPage() {
  const [{ items: externalArticles, hasMoreBySource }, statsItems] = await Promise.all([
    loadBlogPosts('ja'),
    loadStatsPosts('ja'),
  ])

  return (
    <WritingPageContent
      lang="ja"
      externalArticles={externalArticles}
      hasMoreBySource={hasMoreBySource}
      statsSlot={<StatsSection items={statsItems} lang="ja" />}
    />
  )
}
