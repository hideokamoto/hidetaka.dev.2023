import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import {
  createMarkdownRewriteRules,
  MarkdownRewriteRuleEngine,
} from '@/libs/middleware/markdownRewriteRules'
import { createRedirectRules, RedirectRuleEngine } from '@/libs/middleware/redirectRules'

// リダイレクトルールエンジンを初期化（シングルトン）
const redirectEngine = new RedirectRuleEngine(createRedirectRules())
// Markdownリライトルールエンジンを初期化（シングルトン）
const markdownRewriteEngine = new MarkdownRewriteRuleEngine(createMarkdownRewriteRules())

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const baseUrl = request.url.split(request.nextUrl.pathname)[0]

  // .md拡張子のリクエストをMarkdown APIにrewrite
  if (pathname.endsWith('.md') && markdownRewriteEngine.shouldRewrite(pathname)) {
    const { pathname: rewritePath, searchParams } = markdownRewriteEngine.getRewritePath(pathname)
    const newUrl = new URL(request.url)
    newUrl.pathname = rewritePath
    // 言語プレフィックスがある場合はクエリパラメータに追加
    if (searchParams) {
      for (const [key, value] of Object.entries(searchParams)) {
        newUrl.searchParams.set(key, value)
      }
    }
    return NextResponse.rewrite(newUrl)
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
