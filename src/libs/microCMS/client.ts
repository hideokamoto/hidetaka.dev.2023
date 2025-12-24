import { createClient } from 'microcms-js-sdk'
import { logger } from '@/libs/logger'
import type { MicroCMSClient } from './types'

export const createMicroCMSClient = (): MicroCMSClient => {
  const apiKey = process.env.MICROCMS_API_KEY

  if (apiKey) {
    return createClient({
      serviceDomain: 'hidetaka',
      apiKey: apiKey,
    })
  }

  logger.warn('Failed to load the microcms API keys')

  return {
    async get(props) {
      if (props.contentId) {
        return {}
      }
      return {
        contents: [],
      }
    },
    async getAllContents(_props) {
      return []
    },
  } as MicroCMSClient
}
