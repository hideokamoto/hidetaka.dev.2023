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

/**
 * Acceptヘッダーをパースして、text/markdownがリクエストされているかを判定
 * @param request リクエスト
 * @returns text/markdownがAcceptヘッダーに含まれている場合true
 */
function acceptsMarkdown(request: NextRequest): boolean {
  const acceptHeader = request.headers.get('accept') || ''
  return /(^|,\s*)text\/markdown($|;|,)/.test(acceptHeader)
}

/**
 * 個別のブログ記事URLかどうかを判定（リスト、ページネーション、カテゴリを除外）
 * @param pathname パス
 * @returns 個別記事URLの場合true
 */
function isBlogPostUrl(pathname: string): boolean {
  // ブログ記事URLのパターン: /blog/[slug] または /ja/blog/[slug]
  const blogPostPattern = /^\/(?:ja)?\/blog\/[^/]+$/
  // ページネーション、カテゴリページを除外
  const excludedPattern = /\/(page|category)\//

  return blogPostPattern.test(pathname) && !excludedPattern.test(pathname)
}

/**
 * dev-notesのURLかどうかを判定
 * @param pathname パス
 * @returns dev-notes URLの場合true
 */
function isDevNoteUrl(pathname: string): boolean {
  // dev-notes URLのパターン: /writing/dev-notes/[slug] または /ja/writing/dev-notes/[slug]
  const devNotePattern = /^\/(?:ja\/)?writing\/dev-notes\/[^/]+$/
  return devNotePattern.test(pathname)
}

/**
 * ニュース記事のURLかどうかを判定
 * @param pathname パス
 * @returns ニュース記事URLの場合true
 */
function isNewsUrl(pathname: string): boolean {
  // ニュース記事URLのパターン: /news/[slug] または /ja/news/[slug]
  const newsPattern = /^\/(?:ja\/)?news\/[^/]+$/
  return newsPattern.test(pathname)
}

/**
 * ブログ記事URLからslugを抽出し、APIパスに変換
 * @param pathname パス
 * @returns リライト先のパスとクエリパラメータ
 */
function getBlogMarkdownRewritePath(pathname: string): {
  pathname: string
  searchParams?: Record<string, string>
} {
  const match = pathname.match(/^(\/ja)?\/blog\/([^/]+)$/)
  if (!match) {
    throw new Error(`Failed to extract slug from pathname: ${pathname}`)
  }

  const [, langPrefix, slug] = match
  const rewritePath = `/api/markdown/blog/${slug}`

  // 言語プレフィックスがある場合はクエリパラメータに追加
  if (langPrefix) {
    return {
      pathname: rewritePath,
      searchParams: { lang: 'ja' },
    }
  }

  return {
    pathname: rewritePath,
  }
}

/**
 * dev-notes URLからslugを抽出し、APIパスに変換
 * @param pathname パス
 * @returns リライト先のパスとクエリパラメータ
 */
function getDevNoteMarkdownRewritePath(pathname: string): {
  pathname: string
  searchParams?: Record<string, string>
} {
  const match = pathname.match(/^(\/ja)?\/writing\/dev-notes\/([^/]+)$/)
  if (!match) {
    throw new Error(`Failed to extract slug from pathname: ${pathname}`)
  }

  const [, langPrefix, slug] = match
  const rewritePath = `/api/markdown/dev-notes/${slug}`

  // 言語プレフィックスがある場合はクエリパラメータに追加
  if (langPrefix) {
    return {
      pathname: rewritePath,
      searchParams: { lang: 'ja' },
    }
  }

  return {
    pathname: rewritePath,
  }
}

/**
 * ニュース記事URLからslugを抽出し、APIパスに変換
 * @param pathname パス
 * @returns リライト先のパスとクエリパラメータ
 */
function getNewsMarkdownRewritePath(pathname: string): {
  pathname: string
  searchParams?: Record<string, string>
} {
  const match = pathname.match(/^(\/ja)?\/news\/([^/]+)$/)
  if (!match) {
    throw new Error(`Failed to extract slug from pathname: ${pathname}`)
  }

  const [, langPrefix, slug] = match
  const rewritePath = `/api/markdown/news/${slug}`

  // 言語プレフィックスがある場合はクエリパラメータに追加
  if (langPrefix) {
    return {
      pathname: rewritePath,
      searchParams: { lang: 'ja' },
    }
  }

  return {
    pathname: rewritePath,
  }
}

/**
 * Content Negotiationの処理：Acceptヘッダーに基づいてMarkdownをrewrite
 * @param request リクエスト
 * @param pathname パス
 * @returns rewriteレスポンスまたはnull
 */
function handleContentNegotiation(request: NextRequest, pathname: string): NextResponse | null {
  if (!acceptsMarkdown(request)) {
    return null
  }

  let rewritePath: string
  let searchParams: Record<string, string> | undefined

  // ブログ記事の処理
  if (isBlogPostUrl(pathname)) {
    const result = getBlogMarkdownRewritePath(pathname)
    rewritePath = result.pathname
    searchParams = result.searchParams
  }
  // dev-notes記事の処理
  else if (isDevNoteUrl(pathname)) {
    const result = getDevNoteMarkdownRewritePath(pathname)
    rewritePath = result.pathname
    searchParams = result.searchParams
  }
  // ニュース記事の処理
  else if (isNewsUrl(pathname)) {
    const result = getNewsMarkdownRewritePath(pathname)
    rewritePath = result.pathname
    searchParams = result.searchParams
  }
  // マッチしたコンテンツタイプがない場合は処理を続行
  else {
    return null
  }

  const newUrl = new URL(request.url)
  newUrl.pathname = rewritePath
  // 言語プレフィックスがある場合はクエリパラメータに追加
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      newUrl.searchParams.set(key, value)
    }
  }
  const response = NextResponse.rewrite(newUrl)
  // キャッシュの適切な分離を確保するため、Varyヘッダーを設定
  response.headers.set('Vary', 'Accept')
  return response
}

/**
 * .md拡張子のリクエストをMarkdown APIにrewrite
 * @param pathname パス
 * @param request リクエスト
 * @returns rewriteレスポンスまたはnull
 */
function handleMarkdownExtension(pathname: string, request: NextRequest): NextResponse | null {
  if (!pathname.endsWith('.md') || !markdownRewriteEngine.shouldRewrite(pathname)) {
    return null
  }

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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const baseUrl = request.url.split(request.nextUrl.pathname)[0]

  // Content Negotiation: Acceptヘッダーに基づいてMarkdownをrewrite
  const negotiationResponse = handleContentNegotiation(request, pathname)
  if (negotiationResponse) {
    return negotiationResponse
  }

  // .md拡張子のリクエストをMarkdown APIにrewrite
  const markdownExtensionResponse = handleMarkdownExtension(pathname, request)
  if (markdownExtensionResponse) {
    return markdownExtensionResponse
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
