import type { NextRequest } from 'next/server'
import { SITE_CONFIG } from '@/config'
import type { WPThought } from '@/libs/dataSources/types'

// @see https://opennext.js.org/cloudflare/get-started#9-remove-any-export-const-runtime--edge-if-present
// export const runtime = 'edge'

// Get getCloudflareContext via dynamic import (so it resolves correctly in OpenNext build process)
async function getCloudflareContext(
  options: { async: true } | { async?: false } = { async: false },
) {
  try {
    const { getCloudflareContext: getContext } = await import('@opennextjs/cloudflare')
    // 型アサーションでオーバーロードを解決
    if (options.async === true) {
      return await getContext({ async: true })
    }
    return getContext({ async: false })
  } catch (_error) {
    // フォールバック: グローバルスコープから直接取得
    const cloudflareContextSymbol = Symbol.for('__cloudflare-context__')
    const context = (
      globalThis as typeof globalThis & {
        [key: symbol]: unknown
      }
    )[cloudflareContextSymbol]
    if (context) {
      return options.async === true ? Promise.resolve(context) : context
    }
    throw new Error('Cloudflare context is not available')
  }
}

/**
 * Thumbnail image generation API for WordPress thoughts post type
 *
 * Security: Fetch article from WordPress API using post_id and only use titles from existing articles
 * This prevents generating images with arbitrary strings
 *
 * To add routes for other content types in the future:
 * - /api/thumbnail/posts/[id]/route.tsx - For MicroCMS posts
 * - /api/thumbnail/projects/[id]/route.tsx - For MicroCMS projects
 * - /api/thumbnail/events/[id]/route.tsx - For MicroCMS events
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const postId = parseInt(id, 10)

    // Return 404 if ID is not a valid number
    if (Number.isNaN(postId) || postId <= 0) {
      return new Response('Invalid post ID', { status: 404 })
    }

    // Fetch article from WordPress REST API
    const wpResponse = await fetch(
      `https://wp-api.wp-kyoto.net/wp-json/wp/v2/thoughs/${postId}?_fields=id,title`,
    )

    if (!wpResponse.ok) {
      if (wpResponse.status === 404) {
        return new Response('Post not found', { status: 404 })
      }
      console.error('WordPress API error:', wpResponse.status, wpResponse.statusText)
      return new Response('Failed to fetch post', { status: wpResponse.status })
    }

    const thought: WPThought = await wpResponse.json()

    // Return error if title does not exist
    if (!thought.title?.rendered) {
      return new Response('Post title not found', { status: 500 })
    }

    const title = thought.title.rendered
    console.log('Generating thumbnail for post:', postId, 'title:', title)

    // In OpenNext Cloudflare adapter, access bindings via getCloudflareContext()
    // Specify async: true to work in SSG and development environments
    const context = (await getCloudflareContext({ async: true })) as {
      env: {
        OG_IMAGE_GENERATOR?: { fetch: typeof fetch }
        OG_IMAGE_GEN_AUTH_TOKEN?: string
      }
    }
    const typedEnv = context.env
    const ogImageGenerator = typedEnv.OG_IMAGE_GENERATOR
    console.log('ogImageGenerator', ogImageGenerator)
    if (!ogImageGenerator) {
      console.error('OG_IMAGE_GENERATOR Service Binding is not available')
      return new Response('Service Binding not available', { status: 500 })
    }

    // Build new Worker endpoint URL
    const ogImageUrl = new URL('https://cf-ogp-image-gen-worker.wp-kyoto.workers.dev/generate')
    ogImageUrl.searchParams.set('title', title)
    ogImageUrl.searchParams.set('siteUrl', SITE_CONFIG.url)

    // Add authentication token to headers
    const headers = new Headers()
    const authToken = typedEnv.OG_IMAGE_GEN_AUTH_TOKEN || process.env.OG_IMAGE_GEN_AUTH_TOKEN
    if (authToken) {
      headers.set('Authorization', `Bearer ${authToken}`)
    }

    // Call OG image generation Worker via Service Binding
    const response = await ogImageGenerator.fetch(ogImageUrl, { headers })

    // Error handling
    if (!response.ok) {
      console.error('OG image generation failed:', response.status, response.statusText)
      return new Response('Failed to generate image', { status: response.status })
    }

    // Add cache headers to response from new Worker and return
    const responseHeaders = new Headers(response.headers)

    // Cache for 1 day in both browser and CDN
    // OG images are generated based on article ID, so long-term caching is effective
    responseHeaders.set('Cache-Control', 'public, max-age=86400, s-maxage=86400')

    // Explicitly set Cloudflare CDN cache (1 day)
    responseHeaders.set('CDN-Cache-Control', 'public, max-age=86400')

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error('Error generating thumbnail image:', error)
    return new Response('Failed to generate image', { status: 500 })
  }
}
