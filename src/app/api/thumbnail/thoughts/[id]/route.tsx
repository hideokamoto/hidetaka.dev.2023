import type { NextRequest } from 'next/server'
import { SITE_CONFIG } from '@/config'
import { generateOGImageWithFallback, getOGImageGeneratorBindings } from '@/libs/api/cloudflare'
import { withRateLimit } from '@/libs/api/handler'
import { getImmutableCacheHeaders } from '@/libs/cache'
import type { WPThought } from '@/libs/dataSources/types'
import { logger } from '@/libs/logger'

// @see https://opennext.js.org/cloudflare/get-started#9-remove-any-export-const-runtime--edge-if-present
// export const runtime = 'edge'

// WordPress APIからthoughtを取得
async function fetchThoughtFromWordPress(postId: number): Promise<{ title: string }> {
  const wpResponse = await fetch(
    `https://wp-api.wp-kyoto.net/wp-json/wp/v2/thoughs/${postId}?_fields=id,title`,
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

  const thought: WPThought = await wpResponse.json()

  if (!thought.title?.rendered) {
    throw new Response('Post title not found', { status: 500 })
  }

  return { title: thought.title.rendered }
}

/**
 * WordPressのthoughts投稿タイプ用のサムネイル画像生成API
 *
 * セキュリティ: post_idからWordPress APIで記事を取得し、存在する記事のタイトルのみを使用
 * これにより、任意の文字列で画像を生成することを防止
 * Rate limiting: 30 requests per minute
 * Cache: Immutable (1 year)
 *
 * 将来的に他のコンテンツタイプ用のルートを追加する場合:
 * - /api/thumbnail/posts/[id]/route.tsx - MicroCMSのposts用
 * - /api/thumbnail/projects/[id]/route.tsx - MicroCMSのprojects用
 * - /api/thumbnail/events/[id]/route.tsx - MicroCMSのevents用
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withRateLimit(
    request,
    async () => {
      const { id } = await params
      const postId = Number.parseInt(id, 10)

      try {
        // IDが有効な数値でない場合は404を返す
        if (Number.isNaN(postId) || postId <= 0) {
          return new Response('Invalid post ID', { status: 404 })
        }

        const { title } = await fetchThoughtFromWordPress(postId)
        logger.log('Generating thumbnail for post', { postId, title })

        const { ogImageGenerator, authToken } = await getOGImageGeneratorBindings()

        // 新しいWorkerのエンドポイントURLを構築
        const ogImageUrl = new URL('https://cf-ogp-image-gen-worker.wp-kyoto.workers.dev/generate')
        ogImageUrl.searchParams.set('title', title)
        ogImageUrl.searchParams.set('siteUrl', SITE_CONFIG.url)

        // 認証トークンをヘッダーに追加
        const headers = new Headers()
        if (authToken) {
          headers.set('Authorization', `Bearer ${authToken}`)
        }

        const response = await generateOGImageWithFallback(ogImageUrl, headers, ogImageGenerator)

        // エラーハンドリング
        if (!response.ok) {
          logger.error('OG image generation failed', {
            status: response.status,
            statusText: response.statusText,
            postId,
            title,
          })
          return new Response('Failed to generate image', { status: response.status })
        }

        // 新しいWorkerからのレスポンスにキャッシュヘッダーを追加して返す
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
