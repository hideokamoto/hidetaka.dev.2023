/**
 * Shared utilities for thumbnail generation API routes
 *
 * Provides common functions for WordPress data fetching, OG image generation,
 * and Cloudflare context access.
 */

import { SITE_CONFIG } from '@/config'
import type { WPEvent, WPThought } from '@/libs/dataSources/types'
import { logger } from '@/libs/logger'

// Wranglerのローカル開発セッションエラーメッセージ
const WRANGLER_LOCAL_DEV_SESSION_ERROR = "Couldn't find a local dev session"

/**
 * WordPress post types supported for thumbnail generation
 * Note: 'thoughs' is the actual WordPress custom post type slug (not a typo)
 */
export type WordPressPostType = 'dev-notes' | 'events' | 'thoughs'

/**
 * Cloudflare environment bindings
 */
export type CloudflareEnv = {
  OG_IMAGE_GENERATOR?: { fetch: typeof fetch }
  OG_IMAGE_GEN_AUTH_TOKEN?: string
}

/**
 * Cloudflare context with environment bindings
 */
export type CloudflareContext = {
  env: CloudflareEnv
  waitUntil?: (promise: Promise<unknown>) => void
}

/**
 * Get Cloudflare context with dynamic import for OpenNext compatibility
 *
 * @param options - Async option for SSG/dev compatibility
 * @returns Cloudflare context with env bindings
 */
export async function getCloudflareContext(
  options: { async: true } | { async?: false } = { async: false },
): Promise<unknown> {
  try {
    const { getCloudflareContext: getContext } = await import('@opennextjs/cloudflare')
    if (options.async === true) {
      return await getContext({ async: true })
    }
    return getContext({ async: false })
  } catch (_error) {
    // Fallback: グローバルスコープから直接取得
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
 * Fetch WordPress post by ID and type
 *
 * @param postId - WordPress post ID
 * @param postType - WordPress post type (dev-notes, events, thoughs)
 * @returns Post title
 * @throws Response with appropriate error status
 */
export async function fetchWordPressPost(
  postId: number,
  postType: WordPressPostType,
): Promise<{ title: string }> {
  const wpResponse = await fetch(
    `https://wp-api.wp-kyoto.net/wp-json/wp/v2/${postType}/${postId}?_fields=id,title`,
  )

  if (!wpResponse.ok) {
    if (wpResponse.status === 404) {
      throw new Response('Post not found', { status: 404 })
    }
    logger.error('WordPress API error', {
      status: wpResponse.status,
      statusText: wpResponse.statusText,
      postId,
      postType,
    })
    throw new Response('Failed to fetch post', { status: wpResponse.status })
  }

  const post: WPThought | WPEvent = await wpResponse.json()

  if (!post.title?.rendered) {
    throw new Response('Post title not found', { status: 500 })
  }

  return { title: post.title.rendered }
}

/**
 * Generate OG image with Service Binding fallback
 *
 * @param title - Post title for OG image
 * @param ogImageGenerator - Service Binding for OG image generator
 * @param authToken - Authentication token for OG image service
 * @returns Response with generated image
 */
export async function generateOGImage(
  title: string,
  ogImageGenerator: { fetch: typeof fetch } | undefined,
  authToken: string | undefined,
): Promise<Response> {
  // OG画像生成URLを構築
  const ogImageUrl = new URL('https://cf-ogp-image-gen-worker.wp-kyoto.workers.dev/generate')
  ogImageUrl.searchParams.set('title', title)
  ogImageUrl.searchParams.set('siteUrl', SITE_CONFIG.url)

  // 認証トークンをヘッダーに追加
  const headers = new Headers()
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`)
  }

  // Service Bindingがある場合は使用、なければ通常のfetchにフォールバック
  const fallbackFetch = () => fetch(ogImageUrl, { headers })
  let response: Response

  if (ogImageGenerator) {
    response = await ogImageGenerator.fetch(ogImageUrl, { headers })

    // Service Bindingが503エラーを返し、ローカル開発セッションが見つからない場合は通常のfetchにフォールバック
    if (response.status === 503) {
      const responseBodyText = await response
        .clone()
        .text()
        .catch(() => '')
      if (responseBodyText.includes(WRANGLER_LOCAL_DEV_SESSION_ERROR)) {
        response = await fallbackFetch()
      }
    }
  } else {
    // Service Bindingが利用できない場合は通常のfetchを使用
    response = await fallbackFetch()
  }

  return response
}

/**
 * Validate post ID from string parameter
 *
 * @param id - String ID from route parameter
 * @returns Validated numeric post ID
 * @throws Response with 404 status if invalid
 */
export function validatePostId(id: string): number {
  const postId = Number.parseInt(id, 10)
  if (Number.isNaN(postId) || postId <= 0) {
    throw new Response('Invalid post ID', { status: 404 })
  }
  return postId
}
