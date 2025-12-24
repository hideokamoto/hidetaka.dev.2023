import { logger } from '@/libs/logger'
import type { MicroCMSClient } from './types'

/**
 * microCMS APIリクエストのエラーハンドリングヘルパー
 * クライアントの存在確認、モックモードの判定、エラーハンドリングを統一
 */
export async function handleMicroCMSRequest<T>(
  client: MicroCMSClient | null,
  mockData: T,
  requestFn: () => Promise<T>,
): Promise<T> {
  // クライアントが存在しない場合
  if (!client) {
    if (process.env.MICROCMS_API_MODE === 'mock') {
      return mockData
    }
    return [] as T
  }

  try {
    return await requestFn()
  } catch (error) {
    logger.error('MicroCMS API request failed', {
      error: error instanceof Error ? error.message : String(error),
    })

    // モックモードの場合はモックデータを返す
    if (process.env.MICROCMS_API_MODE === 'mock') {
      return mockData
    }

    // モックモードでない場合は空配列を返す
    return [] as T
  }
}
