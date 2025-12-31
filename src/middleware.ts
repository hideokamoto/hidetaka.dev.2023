import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createRedirectRules, RedirectRuleEngine } from '@/libs/middleware/redirectRules'

// リダイレクトルールエンジンを初期化（シングルトン）
const redirectEngine = new RedirectRuleEngine(createRedirectRules())

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const baseUrl = request.url.split(request.nextUrl.pathname)[0]

  // .md拡張子のリクエストをMarkdown APIにrewrite
  if (pathname.endsWith('.md')) {
    // /blog/<slug>.md または /ja/blog/<slug>.md のパターンをマッチ
    const blogMatch = pathname.match(/^(\/ja)?\/blog\/(.+)\.md$/)
    if (blogMatch) {
      const [, langPrefix, slug] = blogMatch
      const newUrl = new URL(request.url)
      newUrl.pathname = `/api/markdown/blog/${slug}`
      // 元のパス情報を保持するために、言語プレフィックスをクエリパラメータに追加
      if (langPrefix) {
        newUrl.searchParams.set('lang', 'ja')
      }
      return NextResponse.rewrite(newUrl)
    }

    // /writing/dev-notes/<slug>.md または /ja/writing/dev-notes/<slug>.md のパターンをマッチ
    const devNotesMatch = pathname.match(/^(?:\/ja)?\/writing\/dev-notes\/(.+)\.md$/)
    if (devNotesMatch) {
      const [, slug] = devNotesMatch
      const newUrl = new URL(request.url)
      newUrl.pathname = `/api/markdown/dev-notes/${slug}`
      return NextResponse.rewrite(newUrl)
    }
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
