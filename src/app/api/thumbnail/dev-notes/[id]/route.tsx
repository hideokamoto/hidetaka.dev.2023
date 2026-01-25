import type { NextRequest } from 'next/server'
import { withCacheAndContext } from '@/libs/api/cloudflareCache'
import { withRateLimit } from '@/libs/api/rateLimit'
import {
  type CloudflareContext,
  fetchWordPressPost,
  generateOGImage,
  getCloudflareContext,
  validatePostId,
} from '@/libs/api/thumbnailUtils'
import { logger } from '@/libs/logger'

/**
 * WordPressのdev-notes投稿タイプ用のサムネイル画像生成API
 *
 * Features:
 * - Rate limiting: 60 requests per minute per IP
 * - Cloudflare Cache API: 1 year TTL for generated images
 * - WordPress post validation: Only generates images for existing posts
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    // Validate post ID
    const postId = validatePostId(id)

    // Apply rate limiting (60 requests/minute)
    return await withRateLimit(
      request,
      async () => {
        // Get Cloudflare context
        const context = (await getCloudflareContext({ async: true })) as CloudflareContext
        const { env } = context

        // Use Cloudflare Cache API with 1 year TTL
        return await withCacheAndContext(
          request,
          context as { waitUntil: (promise: Promise<unknown>) => void },
          async () => {
            // Fetch WordPress post to validate and get title
            const { title } = await fetchWordPressPost(postId, 'dev-notes')
            logger.log('Generating thumbnail for dev-note', { postId, title })

            // Generate OG image
            const authToken = env.OG_IMAGE_GEN_AUTH_TOKEN || process.env.OG_IMAGE_GEN_AUTH_TOKEN
            const response = await generateOGImage(title, env.OG_IMAGE_GENERATOR, authToken)

            if (!response.ok) {
              logger.error('OG image generation failed', {
                status: response.status,
                statusText: response.statusText,
                postId,
                title,
              })
              return new Response('Failed to generate image', { status: response.status })
            }

            return response
          },
          { ttl: 31536000, immutable: true }, // 1 year cache
        )
      },
      { maxRequests: 60, windowSeconds: 60 },
    )
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
}
