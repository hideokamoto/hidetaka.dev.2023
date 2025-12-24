import { logger } from '@/libs/logger'
import type { MicroCMSClient, MicroCMSEventsRecord } from './types'

/**
 * microCMS APIリクエストのエラーハンドリングヘルパー
 * クライアントの存在確認、モックモードの判定、エラーハンドリングを統一
 *
 * @param client - microCMSクライアント（nullの場合はモックモードまたは空値を返す）
 * @param mockData - モックモード時の返却値
 * @param requestFn - 実際のAPIリクエストを実行する関数
 * @param emptyValue - クライアントが存在しない、またはエラー時のデフォルト値
 */
export async function handleMicroCMSRequest<T>(
  client: MicroCMSClient | null,
  mockData: T,
  requestFn: () => Promise<T>,
  emptyValue: T,
): Promise<T> {
  // クライアントが存在しない場合
  if (!client) {
    if (process.env.MICROCMS_API_MODE === 'mock') {
      return mockData
    }
    return emptyValue
  }

  try {
    return await requestFn()
  } catch (error) {
    logger.error('MicroCMS API request failed', { error })

    // モックモードの場合はモックデータを返す
    if (process.env.MICROCMS_API_MODE === 'mock') {
      return mockData
    }

    // モックモードでない場合は空値を返す
    return emptyValue
  }
}

/**
 * イベントを日付で降順にソート（最新が先頭）
 * @param events - ソートするイベントの配列
 * @returns ソートされたイベントの配列（元の配列は変更されない）
 */
export function sortByEventDate(events: MicroCMSEventsRecord[]): MicroCMSEventsRecord[] {
  return [...events].sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return dateB - dateA // 降順（新しい日付が先）
  })
}
