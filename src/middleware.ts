import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const acceptHeader = request.headers.get('Accept')

  // /ja-JP/* を /ja/* にリダイレクト
  if (pathname.startsWith('/ja-JP')) {
    const newPath = pathname.replace('/ja-JP', '/ja')
    return NextResponse.redirect(new URL(newPath, request.url))
  }

  // 旧URLを新URLにリダイレクト
  // /projects → /work
  if (pathname === '/projects' || pathname.startsWith('/projects/')) {
    const newPath = pathname.replace('/projects', '/work')
    return NextResponse.redirect(new URL(newPath, request.url))
  }
  // /ja/projects → /ja/work
  if (pathname === '/ja/projects' || pathname.startsWith('/ja/projects/')) {
    const newPath = pathname.replace('/ja/projects', '/ja/work')
    return NextResponse.redirect(new URL(newPath, request.url))
  }
  // /oss → /work
  if (pathname === '/oss' || pathname.startsWith('/oss/')) {
    const newPath = pathname.replace('/oss', '/work')
    return NextResponse.redirect(new URL(newPath, request.url))
  }
  // /ja/oss → /ja/work
  if (pathname === '/ja/oss' || pathname.startsWith('/ja/oss/')) {
    const newPath = pathname.replace('/ja/oss', '/ja/work')
    return NextResponse.redirect(new URL(newPath, request.url))
  }
  // /articles → /writing
  if (pathname === '/articles' || pathname.startsWith('/articles/')) {
    const newPath = pathname.replace('/articles', '/writing')
    return NextResponse.redirect(new URL(newPath, request.url))
  }
  // /ja/articles → /ja/writing
  if (pathname === '/ja/articles' || pathname.startsWith('/ja/articles/')) {
    const newPath = pathname.replace('/ja/articles', '/ja/writing')
    return NextResponse.redirect(new URL(newPath, request.url))
  }
  // /news → /writing
  if (pathname === '/news' || pathname.startsWith('/news/')) {
    const newPath = pathname.replace('/news', '/writing')
    return NextResponse.redirect(new URL(newPath, request.url))
  }
  // /ja/news → /ja/writing
  if (pathname === '/ja/news' || pathname.startsWith('/ja/news/')) {
    const newPath = pathname.replace('/ja/news', '/ja/writing')
    return NextResponse.redirect(new URL(newPath, request.url))
  }

  // Acceptヘッダーにtext/markdownが含まれる場合、ブログ記事をMarkdown APIにリライト
  if (acceptHeader?.includes('text/markdown')) {
    // /blog/[slug] のパターン
    const blogMatch = pathname.match(/^\/blog\/([^/]+)$/)
    if (blogMatch) {
      const slug = blogMatch[1]
      const url = request.nextUrl.clone()
      url.pathname = `/api/markdown/blog/${slug}`
      url.searchParams.set('lang', 'en')
      return NextResponse.rewrite(url)
    }

    // /ja/blog/[slug] のパターン
    const jaBlogMatch = pathname.match(/^\/ja\/blog\/([^/]+)$/)
    if (jaBlogMatch) {
      const slug = jaBlogMatch[1]
      const url = request.nextUrl.clone()
      url.pathname = `/api/markdown/blog/${slug}`
      url.searchParams.set('lang', 'ja')
      return NextResponse.rewrite(url)
    }
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

