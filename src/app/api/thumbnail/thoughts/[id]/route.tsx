import type { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { SITE_CONFIG } from '@/config'
import type { WPThought } from '@/libs/dataSources/types'
import { logger } from '@/libs/logger'

// @see https://opennext.js.org/cloudflare/get-started#9-remove-any-export-const-runtime--edge-if-present
// export const runtime = 'edge'

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

    // WordPress REST APIから記事を取得
    const wpResponse = await fetch(
      `https://wp-api.wp-kyoto.net/wp-json/wp/v2/thoughs/${postId}?_fields=id,title`,
    )

    if (!wpResponse.ok) {
      if (wpResponse.status === 404) {
        return new Response('Post not found', { status: 404 })
      }
      logger.error('WordPress API error', {
        status: wpResponse.status,
        statusText: wpResponse.statusText,
        postId,
      })
      return new Response('Failed to fetch post', { status: wpResponse.status })
    }

    const thought: WPThought = await wpResponse.json()

    // タイトルが存在しない場合はエラー
    if (!thought.title?.rendered) {
      return new Response('Post title not found', { status: 500 })
    }

    const title = thought.title.rendered
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
    if (!ogImageGenerator) {
      logger.error('OG_IMAGE_GENERATOR Service Binding is not available')
      return new Response('Service Binding not available', { status: 500 })
    }

    // 新しいWorkerのエンドポイントURLを構築
    const ogImageUrl = new URL('https://cf-ogp-image-gen-worker.wp-kyoto.workers.dev/generate')
    ogImageUrl.searchParams.set('title', title)
    ogImageUrl.searchParams.set('siteUrl', SITE_CONFIG.url)

    // 認証トークンをヘッダーに追加
    const headers = new Headers()
    const authToken = typedEnv.OG_IMAGE_GEN_AUTH_TOKEN || process.env.OG_IMAGE_GEN_AUTH_TOKEN
    if (authToken) {
      headers.set('Authorization', `Bearer ${authToken}`)
    }

    // Service Binding経由でOG画像生成Workerを呼び出す
    const response = await ogImageGenerator.fetch(ogImageUrl, { headers })

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
    logger.error('Error generating thumbnail image', {
      error,
      postId: id,
    })

    // Sentryに直接送信（より詳細なコンテキスト）
    if (error instanceof Error) {
      Sentry.captureException(error, {
        tags: {
          route: 'thumbnail',
          contentType: 'thoughts',
        },
        extra: {
          postId: id,
        },
      })
    }

    return new Response('Failed to generate image', { status: 500 })
  }
}
