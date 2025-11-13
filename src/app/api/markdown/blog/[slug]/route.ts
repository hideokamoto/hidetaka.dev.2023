import { getThoughtBySlug } from '@/libs/dataSources/thoughts'
import { convertThoughtToMarkdown } from '@/libs/markdown/htmlToMarkdown'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  // URLから言語を判定（/ja/blog か /blog か）
  const url = new URL(request.url)
  const isJapanese = url.searchParams.get('lang') === 'ja'

  console.log('[Markdown API] Request:', {
    slug,
    lang: isJapanese ? 'ja' : 'en',
    url: request.url,
  })

  const thought = await getThoughtBySlug(slug, isJapanese ? 'ja' : 'en')

  if (!thought) {
    console.log('[Markdown API] Thought not found:', slug)
    return new Response('Not Found', { status: 404 })
  }

  console.log('[Markdown API] Converting to markdown:', thought.title.rendered)

  const markdown = convertThoughtToMarkdown(thought)

  return new Response(markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  })
}
