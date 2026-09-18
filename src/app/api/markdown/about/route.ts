import { NextResponse } from 'next/server'
import { formatProfileAsMarkdown } from '@/libs/profile/formatProfileMarkdown'
import { loadProfileForRequest } from '@/libs/profile/loadProfile'

export const revalidate = 86400

/**
 * middlewareのrewriteが `?lang=ja` を付けている場合はそれを優先するが、rewrite後も
 * `request.url` が元のURL（例: `/ja/about.md`）のまま渡ってくる環境があるため、
 * 他の markdown ルート（blog/dev-notes/news）と同じくパス自体からも言語を判定する
 * フォールバックを持つ。どちらも無ければ英語。
 */
export function determineLanguage(url: URL): 'ja' | 'en' {
  const lang = url.searchParams.get('lang')
  if (lang === 'ja') return 'ja'
  if (url.pathname.startsWith('/ja/')) return 'ja'
  return 'en'
}

/**
 * プロフィールをMarkdownで返す。`/about.md`・`/ja/about.md`・`Accept: text/markdown` での
 * `/about`・`/ja/about` へのアクセスは、middlewareのrewriteによりここに到達する。
 */
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const lang = determineLanguage(url)

  const profile = await loadProfileForRequest(lang)
  const markdown = formatProfileAsMarkdown(profile, lang)

  return new NextResponse(markdown, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': 'inline; filename="about.md"',
      Vary: 'Accept',
    },
  })
}
