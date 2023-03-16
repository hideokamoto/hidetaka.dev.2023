import { createClient } from 'microcms-js-sdk'

console.log(import.meta.env.MICROCMS_API_KEY)
export const microCMSClient = import.meta.env.MICROCMS_API_KEY
  ? createClient({
      serviceDomain: 'hidetaka',
      apiKey: import.meta.env.MICROCMS_API_KEY as string,
    })
  : undefined
