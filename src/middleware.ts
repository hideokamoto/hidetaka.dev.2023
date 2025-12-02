import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const preferredLangCookie = request.cookies.get('preferred-lang')?.value

  // 日本語ページにアクセスした場合、クッキーを更新（ユーザーの明示的な選択）
  if (pathname.startsWith('/ja/') || pathname === '/ja') {
    if (preferredLangCookie !== 'ja') {
      const response = NextResponse.next()
      response.cookies.set('preferred-lang', 'ja', {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      })
      return response
    }
  }
  // 英語ページにアクセスした場合
  else {
    // クッキーがない場合、Accept-Languageヘッダーから判定
    if (!preferredLangCookie) {
      const acceptLanguage = request.headers.get('accept-language') || ''
      const preferredLanguages = acceptLanguage
        .split(',')
        .map((lang) => {
          const [locale, qValue] = lang.trim().split(';q=')
          return {
            locale: locale.toLowerCase(),
            quality: qValue ? parseFloat(qValue) : 1.0,
          }
        })
        .sort((a, b) => b.quality - a.quality)

      // 最も優先度の高い言語が日本語の場合、/ja/* にリダイレクトしてクッキーを設定
      const topLanguage = preferredLanguages[0]?.locale || ''
      if (topLanguage.startsWith('ja')) {
        const newPath = pathname === '/' ? '/ja' : `/ja${pathname}`
        const response = NextResponse.redirect(new URL(newPath, request.url))
        response.cookies.set('preferred-lang', 'ja', {
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: '/',
        })
        return response
      } else {
        // 英語が優先の場合もクッキーに保存
        const response = NextResponse.next()
        response.cookies.set('preferred-lang', 'en', {
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: '/',
        })
        return response
      }
    }
    // クッキーに日本語設定がある場合、/ja/* にリダイレクト
    else if (preferredLangCookie === 'ja') {
      const newPath = pathname === '/' ? '/ja' : `/ja${pathname}`
      return NextResponse.redirect(new URL(newPath, request.url))
    }
    // クッキーに英語設定があるが、まだ設定されていない可能性があるので更新
    else if (preferredLangCookie !== 'en') {
      const response = NextResponse.next()
      response.cookies.set('preferred-lang', 'en', {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      })
      return response
    }
  }

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
