import { createClient } from 'next-sanity'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
// API version is pinned to prevent breaking changes from Sanity API updates
const apiVersion = '2025-01-18'
const token = process.env.SANITY_API_TOKEN

// Validate required environment variables
if (!projectId) {
  throw new Error(
    'Missing NEXT_PUBLIC_SANITY_PROJECT_ID environment variable. Please add it to your .env.local file.',
  )
}

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // Set to false if statically generating pages, using ISR or tag-based revalidation
  perspective: 'published',
})

export const previewClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
  perspective: 'previewDrafts',
})

export const getClient = (preview = false) => {
  if (preview && !token) {
    throw new Error(
      'Missing SANITY_API_TOKEN environment variable. Preview mode requires an API token to access draft content.',
    )
  }
  return preview ? previewClient : client
}
