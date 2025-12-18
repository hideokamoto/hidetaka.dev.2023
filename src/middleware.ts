import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

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
  // /writing/[id] → /news/ (microCMS posts API廃止に伴う移行)
  if (pathname.startsWith('/writing/') && pathname !== '/writing/') {
    return NextResponse.redirect(new URL('/news/', request.url))
  }
  // /ja/writing/[id] → /ja/news/
  if (pathname.startsWith('/ja/writing/') && pathname !== '/ja/writing/') {
    return NextResponse.redirect(new URL('/ja/news/', request.url))
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
