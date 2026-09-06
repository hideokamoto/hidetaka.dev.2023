import AboutPageContent from '@/components/containers/pages/AboutPage'
import ProfileStatsSection from '@/components/ui/stats/ProfileStatsSection'
import { buildAlternates } from '@/libs/metadata'
import { hasAnyProfileStat, loadProfileStats } from '@/libs/stats/loadProfileStats'

export const metadata = {
  alternates: buildAlternates('/ja/about'),
  title: 'About',
}

// ISR: 実績の数字は日単位でしか動かないため1日ごとに再検証
export const revalidate = 86400

export default async function AboutPage() {
  const stats = await loadProfileStats()

  // 指標が1つも取れなければスロットごと渡さない。
  // 渡すと ProfileStatsSection が null を返し、見出しだけのセクションが残る。
  const statsSlot = hasAnyProfileStat(stats) ? (
    <ProfileStatsSection stats={stats} lang="ja" />
  ) : undefined

  return <AboutPageContent lang="ja" statsSlot={statsSlot} />
}
