import { createClient } from 'microcms-js-sdk'

export const microCMSClient = import.meta.env.MICROCMS_API_KEY
  ? createClient({
      serviceDomain: 'hidetaka',
      apiKey: import.meta.env.MICROCMS_API_KEY as string,
    })
  : undefined
