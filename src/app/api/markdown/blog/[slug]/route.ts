import { NextResponse } from 'next/server'
import { getThoughtBySlug } from '@/libs/dataSources/thoughts'
import { formatArticleAsMarkdown } from '@/libs/htmlToMarkdown'

export const revalidate = 86400

type Params = {
  slug: string
}

function extractSlugFromUrl(url: URL): string | null {
  // rewrite後のURLから抽出を試みる
  const rewriteMatch = url.pathname.match(/\/api\/markdown\/blog\/(.+)$/)
  if (rewriteMatch) {
    return rewriteMatch[1]
  }
  // 元のURLから抽出を試みる（/ja/blog/... または /blog/...）
  const originalMatch = url.pathname.match(/\/(?:ja\/)?blog\/(.+)\.md$/)
  return originalMatch ? originalMatch[1] : null
}

function determineLanguage(url: URL): 'ja' | 'en' {
  const lang = url.searchParams.get('lang')
  if (lang === 'ja') return 'ja'
  if (url.pathname.includes('/ja/blog/')) return 'ja'
  return 'en'
}

export async function GET(
  request: Request,
  { params }: { params: Promise<Params> },
): Promise<Response> {
  // middlewareでrewriteされた場合、paramsが正しく解決されない可能性があるため、
  // request.urlから直接slugを抽出する
  const url = new URL(request.url)
  const resolvedParams = await params
  let slug: string | null = resolvedParams.slug || null

  // paramsが空の場合は、request.urlから抽出
  if (!slug) {
    slug = extractSlugFromUrl(url)
  }

  if (!slug) {
    return new NextResponse('Slug not found', {
      status: 400,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })
  }

  const isJapanese = determineLanguage(url) === 'ja'

  // 記事を取得
  const thought = await getThoughtBySlug(slug, isJapanese ? 'ja' : 'en')

  if (!thought) {
    return new NextResponse('Article not found', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })
  }

  // カテゴリ情報を抽出
  const categories =
    thought._embedded?.['wp:term']?.flat().filter((term) => term.taxonomy === 'category') || []

  // Markdown形式に変換
  const markdown = formatArticleAsMarkdown({
    title: thought.title.rendered,
    date: thought.date,
    categories: categories.map((cat) => ({ name: cat.name })),
    content: thought.content.rendered,
    url: `https://hidetaka.dev${isJapanese ? '/ja' : ''}/blog/${thought.slug}`,
  })

  // Markdown形式でレスポンスを返す
  return new NextResponse(markdown, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `inline; filename="${thought.slug}.md"`,
      Vary: 'Accept',
    },
  })
}
