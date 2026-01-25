import type { NextRequest } from 'next/server'
import { SITE_CONFIG } from '@/config'
import { env } from '@/env'
import type { WPThought } from '@/libs/dataSources/types'
import { logger } from '@/libs/logger'

// Wranglerのローカル開発セッションエラーメッセージ
// Service Bindingがローカル開発セッションを見つけられない場合のエラーメッセージ
const WRANGLER_LOCAL_DEV_SESSION_ERROR = "Couldn't find a local dev session"

// getCloudflareContextを動的インポートで取得（OpenNextのビルドプロセスで正しく解決されるように）
async function getCloudflareContext(
  options: { async: true } | { async?: false } = { async: false },
) {
  try {
    const { getCloudflareContext: getContext } = await import('@opennextjs/cloudflare')
    if (options.async === true) {
      return await getContext({ async: true })
    }
    return getContext({ async: false })
  } catch (_error) {
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

// Service Bindingのフォールバック付きでOG画像を生成
async function generateOGImageWithFallback(
  _title: string,
  ogImageGenerator: { fetch: typeof fetch } | undefined,
  ogImageUrl: URL,
  headers: Headers,
): Promise<Response> {
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
 * WordPressのdev-notes投稿タイプ用のサムネイル画像生成API
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const postId = Number.parseInt(id, 10)

  try {
    if (Number.isNaN(postId) || postId <= 0) {
      return new Response('Invalid post ID', { status: 404 })
    }

    const { title } = await fetchDevNoteFromWordPress(postId)
    logger.log('Generating thumbnail for dev-note', { postId, title })

    const context = (await getCloudflareContext({ async: true })) as {
      env: {
        OG_IMAGE_GENERATOR?: { fetch: typeof fetch }
        OG_IMAGE_GEN_AUTH_TOKEN?: string
      }
    }
    const typedEnv = context.env
    const ogImageGenerator = typedEnv.OG_IMAGE_GENERATOR

    const ogImageUrl = new URL('https://cf-ogp-image-gen-worker.wp-kyoto.workers.dev/generate')
    ogImageUrl.searchParams.set('title', title)
    ogImageUrl.searchParams.set('siteUrl', SITE_CONFIG.url)

    const headers = new Headers()
    const authToken = typedEnv.OG_IMAGE_GEN_AUTH_TOKEN || env.OG_IMAGE_GEN_AUTH_TOKEN
    if (authToken) {
      headers.set('Authorization', `Bearer ${authToken}`)
    }

    const response = await generateOGImageWithFallback(title, ogImageGenerator, ogImageUrl, headers)

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
    responseHeaders.set('Cache-Control', 'public, max-age=86400, s-maxage=86400')
    responseHeaders.set('CDN-Cache-Control', 'public, max-age=86400')

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
}
