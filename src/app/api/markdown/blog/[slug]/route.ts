import { getThoughtBySlug } from '@/libs/dataSources/thoughts'
import { convertThoughtToMarkdown } from '@/libs/markdown/htmlToMarkdown'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // middlewareから渡されたカスタムヘッダーから言語を判定
    const blogLang = request.headers.get('x-blog-lang')
    const lang = blogLang === 'ja' ? 'ja' : 'en'

    console.log('[Markdown API] Request:', {
      slug,
      lang,
      blogLang,
      url: request.url,
      headers: {
        'x-blog-lang': request.headers.get('x-blog-lang'),
        'Accept': request.headers.get('Accept'),
      },
    })

    const thought = await getThoughtBySlug(slug, lang)

    console.log('[Markdown API] getThoughtBySlug result:', {
      found: !!thought,
      slug,
      lang,
      thoughtId: thought?.id,
      thoughtTitle: thought?.title.rendered,
    })

    if (!thought) {
      console.log('[Markdown API] Thought not found:', { slug, lang })
      return new Response(JSON.stringify({
        error: 'Not Found',
        slug,
        lang,
        message: `Article with slug "${slug}" not found for language "${lang}"`
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }

    console.log('[Markdown API] Converting to markdown:', thought.title.rendered)

    const markdown = convertThoughtToMarkdown(thought)

    console.log('[Markdown API] Markdown generated, length:', markdown.length)

    return new Response(markdown, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
      },
    })
  } catch (error) {
    console.error('[Markdown API] Error:', error)
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}
