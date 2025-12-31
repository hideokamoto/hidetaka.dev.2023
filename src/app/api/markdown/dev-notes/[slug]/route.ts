import { NextResponse } from 'next/server'
import { extractCategories, getDevNoteBySlug } from '@/libs/dataSources/devnotes'
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
  // rewrite後のURL（/api/markdown/dev-notes/...）または元のURL（/ja/writing/dev-notes/...）の両方に対応
  if (!slug) {
    // rewrite後のURLから抽出を試みる
    let pathMatch = url.pathname.match(/\/api\/markdown\/dev-notes\/(.+)$/)
    if (pathMatch) {
      slug = pathMatch[1]
    } else {
      // 元のURLから抽出を試みる（/ja/writing/dev-notes/...）
      pathMatch = url.pathname.match(/\/ja\/writing\/dev-notes\/(.+)\.md$/)
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

  // dev-notes記事を取得（現在は日本語版のみ）
  const note = await getDevNoteBySlug(slug)

  if (!note) {
    return new NextResponse('Dev note not found', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })
  }

  // カテゴリ情報を抽出
  const categories = extractCategories(note)

  // Markdown形式に変換
  const markdown = formatArticleAsMarkdown({
    title: note.title.rendered,
    date: note.date,
    categories: categories.map((cat) => ({ name: cat.name })),
    content: note.content.rendered,
    url: `https://hidetaka.dev/ja/writing/dev-notes/${note.slug}`,
  })

  // Markdown形式でレスポンスを返す
  return new NextResponse(markdown, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `inline; filename="${note.slug}.md"`,
    },
  })
}
