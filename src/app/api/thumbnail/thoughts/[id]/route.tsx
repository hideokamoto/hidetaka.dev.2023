import type { NextRequest } from 'next/server'
import { SITE_CONFIG } from '@/config'
import { env } from '@/env'
import type { WPThought } from '@/libs/dataSources/types'
import { logger } from '@/libs/logger'

// @see https://opennext.js.org/cloudflare/get-started#9-remove-any-export-const-runtime--edge-if-present
// export const runtime = 'edge'

// Wranglerのローカル開発セッションエラーメッセージ
// Service Bindingがローカル開発セッションを見つけられない場合のエラーメッセージ
const WRANGLER_LOCAL_DEV_SESSION_ERROR = "Couldn't find a local dev session"

// getCloudflareContextを動的インポートで取得（OpenNextのビルドプロセスで正しく解決されるように）
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
 * WordPressのthoughts投稿タイプ用のサムネイル画像生成API
 *
 * セキュリティ: post_idからWordPress APIで記事を取得し、存在する記事のタイトルのみを使用
 * これにより、任意の文字列で画像を生成することを防止
 *
 * 将来的に他のコンテンツタイプ用のルートを追加する場合:
 * - /api/thumbnail/posts/[id]/route.tsx - MicroCMSのposts用
 * - /api/thumbnail/projects/[id]/route.tsx - MicroCMSのprojects用
 * - /api/thumbnail/events/[id]/route.tsx - MicroCMSのevents用
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const postId = parseInt(id, 10)

  try {
    // IDが有効な数値でない場合は404を返す
    if (Number.isNaN(postId) || postId <= 0) {
      return new Response('Invalid post ID', { status: 404 })
    }

    const { title } = await fetchThoughtFromWordPress(postId)
    logger.log('Generating thumbnail for post', { postId, title })

    // OpenNextのCloudflareアダプターでは、getCloudflareContext()経由でbindingsにアクセス
    // async: trueを指定することで、SSGや開発環境でも動作する
    const context = (await getCloudflareContext({ async: true })) as {
      env: {
        OG_IMAGE_GENERATOR?: { fetch: typeof fetch }
        OG_IMAGE_GEN_AUTH_TOKEN?: string
      }
    }

    const typedEnv = context.env
    const ogImageGenerator = typedEnv.OG_IMAGE_GENERATOR

    // 新しいWorkerのエンドポイントURLを構築
    const ogImageUrl = new URL('https://cf-ogp-image-gen-worker.wp-kyoto.workers.dev/generate')
    ogImageUrl.searchParams.set('title', title)
    ogImageUrl.searchParams.set('siteUrl', SITE_CONFIG.url)

    // 認証トークンをヘッダーに追加
    const headers = new Headers()
    const authToken = typedEnv.OG_IMAGE_GEN_AUTH_TOKEN || env.OG_IMAGE_GEN_AUTH_TOKEN
    if (authToken) {
      headers.set('Authorization', `Bearer ${authToken}`)
    }

    const response = await generateOGImageWithFallback(title, ogImageGenerator, ogImageUrl, headers)

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

    // ブラウザとCDNの両方で1日間キャッシュ
    // OG画像は記事IDベースで生成されるため、長期キャッシュが有効
    responseHeaders.set('Cache-Control', 'public, max-age=86400, s-maxage=86400')

    // Cloudflare CDNのキャッシュを明示的に設定（1日間）
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
