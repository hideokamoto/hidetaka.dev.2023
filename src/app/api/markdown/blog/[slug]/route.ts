import { getThoughtBySlug } from '@/libs/dataSources/thoughts'
import { convertThoughtToMarkdown } from '@/libs/markdown/htmlToMarkdown'
import { notFound } from 'next/navigation'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  // URLから言語を判定（/ja/blog か /blog か）
  const url = new URL(request.url)
  const isJapanese = url.searchParams.get('lang') === 'ja'

  const thought = await getThoughtBySlug(slug, isJapanese ? 'ja' : 'en')

  if (!thought) {
    notFound()
  }

  const markdown = convertThoughtToMarkdown(thought)

  return new Response(markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  })
}
