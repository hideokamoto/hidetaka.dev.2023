import { createClient } from 'microcms-js-sdk'
import { reportMissingMicroCMSApiKey } from '../sentry'
import type { MicroCMSClient } from './types'

export const createMicroCMSClient = (): MicroCMSClient => {
  const apiKey = process.env.MICROCMS_API_KEY

  if (apiKey) {
    return createClient({
      serviceDomain: 'hidetaka',
      apiKey: apiKey,
    })
  }

  // Report missing API key to Sentry (only once per process)
  reportMissingMicroCMSApiKey()

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
