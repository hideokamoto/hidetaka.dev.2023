import { createClient } from 'microcms-js-sdk'
import { env } from '@/env'
import type { MicroCMSClient } from './types'

/**
 * Create microCMS API client with type-safe environment variables
 *
 * The API key is validated at startup via src/env.ts, so we can safely
 * use it here without additional null checks or fallback logic.
 */
export const createMicroCMSClient = (): MicroCMSClient => {
  return createClient({
    serviceDomain: 'hidetaka',
    apiKey: env.MICROCMS_API_KEY, // Type-safe, guaranteed to exist
  })
}
