import SpeakingSlidesPage from '@/components/containers/pages/SpeakingSlidesPage'
import { loadSlidesGold } from '@/libs/contentLake/slides'
import { buildAlternates } from '@/libs/metadata'
import { groupSlidesByYear, toSlideEntries } from '@/libs/speaking/slides'

export const metadata = {
  alternates: buildAlternates('/speaking/slides'),
  title: 'Slides',
}

// ISR: 1時間ごとにページを再検証（Content Lake Gold の更新頻度に合わせる）
export const revalidate = 3600

export default async function SlidesPage() {
  const gold = await loadSlidesGold()
  const entries = gold ? toSlideEntries(gold) : []

  return <SpeakingSlidesPage lang="en" groups={groupSlidesByYear(entries)} total={entries.length} />
}
