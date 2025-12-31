import { NextResponse } from 'next/server'
import { getProductBySlug } from '@/libs/dataSources/products'
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
  // rewrite後のURL（/api/markdown/news/...）または元のURL（/ja/news/...）の両方に対応
  if (!slug) {
    // rewrite後のURLから抽出を試みる
    let pathMatch = url.pathname.match(/\/api\/markdown\/news\/(.+)$/)
    if (pathMatch) {
      slug = pathMatch[1]
    } else {
      // 元のURLから抽出を試みる（/ja/news/... または /news/...）
      pathMatch = url.pathname.match(/\/(?:ja\/)?news\/(.+)\.md$/)
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
    // pathnameから言語を判定（/ja/news/... の場合は日本語）
    if (url.pathname.includes('/ja/news/')) {
      lang = 'ja'
    }
  }
  const isJapanese = lang === 'ja'

  // 記事を取得
  const product = await getProductBySlug(slug, isJapanese ? 'ja' : 'en')

  if (!product) {
    return new NextResponse('Article not found', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })
  }

  // Markdown形式に変換
  const markdown = formatArticleAsMarkdown({
    title: product.title.rendered,
    date: product.date,
    categories: [], // productsにはカテゴリがないため空配列
    content: product.content.rendered,
    url: `https://hidetaka.dev${isJapanese ? '/ja' : ''}/news/${product.slug}`,
  })

  // Markdown形式でレスポンスを返す
  return new NextResponse(markdown, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `inline; filename="${product.slug}.md"`,
    },
  })
}
