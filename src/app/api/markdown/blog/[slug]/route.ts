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
  const { slug } = await params

  // URLクエリパラメータから言語を判定
  const url = new URL(request.url)
  const lang = url.searchParams.get('lang')
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
    },
  })
}
