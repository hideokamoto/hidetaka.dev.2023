import { NextRequest } from 'next/server'
import { SITE_CONFIG } from '@/config'

// @see https://opennext.js.org/cloudflare/get-started#9-remove-any-export-const-runtime--edge-if-present
// export const runtime = 'edge'

// getCloudflareContextを動的インポートで取得（OpenNextのビルドプロセスで正しく解決されるように）
async function getCloudflareContext(options: { async: true } | { async?: false } = { async: false }) {
  try {
    const { getCloudflareContext: getContext } = await import('@opennextjs/cloudflare')
    // 型アサーションでオーバーロードを解決
    if (options.async === true) {
      return getContext({ async: true })
    } else {
      return getContext({ async: false })
    }
  } catch (error) {
    // フォールバック: グローバルスコープから直接取得
    const cloudflareContextSymbol = Symbol.for('__cloudflare-context__')
    const context = (globalThis as any)[cloudflareContextSymbol]
    if (context) {
      return options.async === true ? Promise.resolve(context) : context
    }
    throw new Error('Cloudflare context is not available')
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const title = searchParams.get('title') || 'Blog Post'
    console.log('title', title)
    // dateパラメータは受け取るが新しいWorkerには渡さない（保持のみ）
    const dateParam = searchParams.get('date')
    console.log('dateParam', dateParam)

    // OpenNextのCloudflareアダプターでは、getCloudflareContext()経由でbindingsにアクセス
    // async: trueを指定することで、SSGや開発環境でも動作する
    const { env } = await getCloudflareContext({ async: true })
    // 型定義は npm run cf-typegen で生成されるが、ここでは型アサーションを使用
    const typedEnv = env as {
      OG_IMAGE_GENERATOR?: { fetch: typeof fetch }
      OG_IMAGE_GEN_AUTH_TOKEN?: string
    }
    const ogImageGenerator = typedEnv.OG_IMAGE_GENERATOR
    console.log('ogImageGenerator', ogImageGenerator)
    if (!ogImageGenerator) {
      console.error('OG_IMAGE_GENERATOR Service Binding is not available')
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
    // @ts-ignore
    const response = await ogImageGenerator.fetch(ogImageUrl, { headers })

    // エラーハンドリング
    if (!response.ok) {
      console.error('OG image generation failed:', response.status, response.statusText)
      return new Response('Failed to generate image', { status: response.status })
    }

    // 新しいWorkerからのレスポンスをそのまま返す
    return response
  } catch (error) {
    console.error('Error generating OG image:', error)
    return new Response('Failed to generate image', { status: 500 })
  }
}
