import SpeakingPageContent, { type UnifiedEvent } from '@/components/containers/pages/SpeakingPage'
import { MicroCMSAPI } from '@/libs/microCMS/apis'
import { createMicroCMSClient } from '@/libs/microCMS/client'
import { loadWPEvents } from '@/libs/dataSources/events'

export const metadata = {
  title: '登壇・講演',
}

export default async function SpeakingPage() {
  const microCMS = new MicroCMSAPI(createMicroCMSClient())
  
  // 両方のデータソースから並列取得
  const [microCMSEvents, wpEvents] = await Promise.all([
    microCMS.listEndedEvents(),
    loadWPEvents(),
  ])

  // 統合イベント配列を作成
  const unifiedEvents: UnifiedEvent[] = [
    // MicroCMSイベント（告知）
    ...microCMSEvents.map(event => ({
      ...event,
      type: 'announcement' as const,
      source: 'microcms' as const,
    })),
    // WordPressイベント（レポート）
    ...wpEvents.map(event => ({
      ...event,
      type: 'report' as const,
      source: 'wordpress' as const,
    })),
  ]

  // 日付でソート（新しい順）
  unifiedEvents.sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return dateB - dateA
  })

  return <SpeakingPageContent lang="ja" events={unifiedEvents} basePath="/ja/event-reports" />
}

