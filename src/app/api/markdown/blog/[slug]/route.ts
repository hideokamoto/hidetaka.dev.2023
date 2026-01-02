import { NextResponse } from 'next/server'
import { getThoughtBySlug } from '@/libs/dataSources/thoughts'
import { formatArticleAsMarkdown } from '@/libs/htmlToMarkdown'

export const revalidate = 86400

type Params = {
  slug: string
}

export async function GET(
  request: Request,
  { params }: { params: Promise<Params> },
): Promise<Response> {
  // middlewareでrewriteされた場合、paramsが正しく解決されない可能性があるため、
  // request.urlから直接slugを抽出する
  const url = new URL(request.url)
  let slug: string | null = null

  // まずparamsから取得を試みる
  const resolvedParams = await params
  if (resolvedParams.slug) {
    slug = resolvedParams.slug
  }

  // paramsが空の場合は、request.urlから抽出
  // rewrite後のURL（/api/markdown/blog/...）または元のURL（/ja/blog/...）の両方に対応
  if (!slug) {
    // rewrite後のURLから抽出を試みる
    let pathMatch = url.pathname.match(/\/api\/markdown\/blog\/(.+)$/)
    if (pathMatch) {
      slug = pathMatch[1]
    } else {
      // 元のURLから抽出を試みる（/ja/blog/... または /blog/...）
      pathMatch = url.pathname.match(/\/(?:ja\/)?blog\/(.+)\.md$/)
      if (pathMatch) {
        slug = pathMatch[1]
      }
    }
  }

  if (!slug) {
    return new NextResponse('Slug not found', {
      status: 400,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })
  }

  // URLクエリパラメータから言語を判定
  // middlewareでrewriteされた場合、request.urlは元のURLを指す可能性があるため、
  // クエリパラメータとpathnameの両方から判定する
  let lang = url.searchParams.get('lang')
  if (!lang) {
    // pathnameから言語を判定（/ja/blog/... の場合は日本語）
    if (url.pathname.includes('/ja/blog/')) {
      lang = 'ja'
    }
  }
  const isJapanese = lang === 'ja'

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
