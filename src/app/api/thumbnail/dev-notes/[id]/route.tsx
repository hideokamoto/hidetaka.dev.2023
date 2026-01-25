import type { NextRequest } from 'next/server'
import { SITE_CONFIG } from '@/config'
import { generateOGImageWithFallback, getOGImageGeneratorBindings } from '@/libs/api/cloudflare'
import { withRateLimit } from '@/libs/api/handler'
import { getImmutableCacheHeaders } from '@/libs/cache'
import type { WPThought } from '@/libs/dataSources/types'
import { logger } from '@/libs/logger'

// WordPress APIからdev-noteを取得
async function fetchDevNoteFromWordPress(postId: number): Promise<{ title: string }> {
  const wpResponse = await fetch(
    `https://wp-api.wp-kyoto.net/wp-json/wp/v2/dev-notes/${postId}?_fields=id,title`,
  )

  if (!wpResponse.ok) {
    if (wpResponse.status === 404) {
      throw new Response('Post not found', { status: 404 })
    }
    logger.error('WordPress API error', {
      status: wpResponse.status,
      statusText: wpResponse.statusText,
      postId,
    })
    throw new Response('Failed to fetch post', { status: wpResponse.status })
  }

  const note: WPThought = await wpResponse.json()

  if (!note.title?.rendered) {
    throw new Response('Post title not found', { status: 500 })
  }

  return { title: note.title.rendered }
}

/**
 * WordPressのdev-notes投稿タイプ用のサムネイル画像生成API
 * Rate limiting: 30 requests per minute
 * Cache: Immutable (1 year)
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withRateLimit(
    request,
    async () => {
      const { id } = await params
      const postId = Number.parseInt(id, 10)

      try {
        if (Number.isNaN(postId) || postId <= 0) {
          return new Response('Invalid post ID', { status: 404 })
        }

        const { title } = await fetchDevNoteFromWordPress(postId)
        logger.log('Generating thumbnail for dev-note', { postId, title })

        const { ogImageGenerator, authToken } = await getOGImageGeneratorBindings()

        const ogImageUrl = new URL('https://cf-ogp-image-gen-worker.wp-kyoto.workers.dev/generate')
        ogImageUrl.searchParams.set('title', title)
        ogImageUrl.searchParams.set('siteUrl', SITE_CONFIG.url)

        const headers = new Headers()
        if (authToken) {
          headers.set('Authorization', `Bearer ${authToken}`)
        }

        const response = await generateOGImageWithFallback(ogImageUrl, headers, ogImageGenerator)

        if (!response.ok) {
          logger.error('OG image generation failed', {
            status: response.status,
            statusText: response.statusText,
            postId,
            title,
          })
          return new Response('Failed to generate image', { status: response.status })
        }

        const responseHeaders = new Headers(response.headers)
        // Use immutable cache headers (thumbnails never change for a given ID)
        const cacheHeaders = getImmutableCacheHeaders()
        for (const [key, value] of Object.entries(cacheHeaders)) {
          responseHeaders.set(key, value)
        }

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
        })
      } catch (error) {
        if (error instanceof Response) {
          return error
        }
        logger.error('Error generating thumbnail image', {
          error,
          postId: id,
        })
        return new Response('Failed to generate image', { status: 500 })
      }
    },
    {
      rateLimit: { limit: 30, window: 60 },
    },
  )
}
