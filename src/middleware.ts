import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import TurndownService from 'turndown'
import { createRedirectRules, RedirectRuleEngine } from '@/libs/middleware/redirectRules'

// リダイレクトルールエンジンを初期化（シングルトン）
const redirectEngine = new RedirectRuleEngine(createRedirectRules())

/**
 * HTMLをMarkdownに変換するユーティリティ関数
 */
function convertHtmlToMarkdown(html: string): string {
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
  })
  return turndownService.turndown(html)
}

/**
 * .md拡張子のリクエストを処理し、HTMLをMarkdownに変換して返す
 */
async function handleMarkdownRequest(request: NextRequest): Promise<Response> {
  const { pathname } = request.nextUrl

  // .mdを除去して元のHTMLパスを取得
  const htmlPath = pathname.replace(/\.md$/, '')

  // 元のHTMLページをフェッチ
  const htmlUrl = new URL(htmlPath, request.url)
  const htmlResponse = await fetch(htmlUrl.toString(), {
    headers: {
      ...Object.fromEntries(request.headers),
      Accept: 'text/html',
    },
  })

  if (!htmlResponse.ok) {
    return new Response('Page not found', { status: 404 })
  }

  // HTMLを取得
  const html = await htmlResponse.text()

  // HTMLをMarkdownに変換
  const markdown = convertHtmlToMarkdown(html)

  // Markdownレスポンスを返す
  return new Response(markdown, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const baseUrl = request.url.split(request.nextUrl.pathname)[0]

  // .md拡張子のリクエストを処理
  if (pathname.endsWith('.md')) {
    return handleMarkdownRequest(request)
  }

  // /ja-JP/* を /ja/* にリダイレクト（特別なルール）
  if (pathname.startsWith('/ja-JP')) {
    const newPath = pathname.replace('/ja-JP', '/ja')
    return NextResponse.redirect(new URL(newPath, request.url))
  }

  // リダイレクトルールエンジンで判定
  if (redirectEngine.shouldRedirect(pathname, baseUrl)) {
    const redirectUrl = redirectEngine.getRedirectPath(pathname, baseUrl)
    return NextResponse.redirect(new URL(redirectUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
