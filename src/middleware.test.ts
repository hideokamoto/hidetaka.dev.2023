import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'
import { acceptsMarkdown, middleware } from '@/middleware'

function buildRequest(pathname: string, init?: { headers?: Record<string, string> }) {
  return new NextRequest(new URL(pathname, 'https://hidetaka.dev'), {
    headers: init?.headers,
  })
}

describe('middleware', () => {
  // CodeRabbit review finding on PR #262: the unit tests below cover acceptsMarkdown,
  // the rewrite rules, and determineLanguage in isolation, but nothing exercised
  // middleware() itself wiring an `Accept: text/markdown` request on /about through to
  // the rewritten `/api/markdown/about` target — this is that entry-point regression test.
  it('rewrites /about with Accept: text/markdown to /api/markdown/about', () => {
    const response = middleware(buildRequest('/about', { headers: { accept: 'text/markdown' } }))

    expect(response.headers.get('x-middleware-rewrite')).toBe(
      'https://hidetaka.dev/api/markdown/about',
    )
  })

  it('rewrites /ja/about with Accept: text/markdown to /api/markdown/about?lang=ja', () => {
    const response = middleware(
      buildRequest('/ja/about', { headers: { accept: 'text/markdown' } }),
    )

    const rewriteTarget = new URL(response.headers.get('x-middleware-rewrite') ?? '')
    expect(rewriteTarget.pathname).toBe('/api/markdown/about')
    expect(rewriteTarget.searchParams.get('lang')).toBe('ja')
  })

  it('does not rewrite /about when Accept does not ask for Markdown', () => {
    const response = middleware(buildRequest('/about', { headers: { accept: 'text/html' } }))

    expect(response.headers.get('x-middleware-rewrite')).toBeNull()
  })
})

describe('middleware Markdown alternate discovery', () => {
  it('should set a Link header pointing to the Markdown version on a blog post page', () => {
    const response = middleware(buildRequest('/blog/test-post'))

    expect(response.headers.get('Link')).toBe(
      '</blog/test-post.md>; rel="alternate"; type="text/markdown"',
    )
  })

  it('should set a Link header on the Japanese blog post page', () => {
    const response = middleware(buildRequest('/ja/blog/test-post'))

    expect(response.headers.get('Link')).toBe(
      '</ja/blog/test-post.md>; rel="alternate"; type="text/markdown"',
    )
  })

  it('should set a Link header on a news post page', () => {
    const response = middleware(buildRequest('/news/test-post'))

    expect(response.headers.get('Link')).toBe(
      '</news/test-post.md>; rel="alternate"; type="text/markdown"',
    )
  })

  it('should set a Link header on a dev-notes post page', () => {
    const response = middleware(buildRequest('/writing/dev-notes/test-post'))

    expect(response.headers.get('Link')).toBe(
      '</writing/dev-notes/test-post.md>; rel="alternate"; type="text/markdown"',
    )
  })

  it('should not set a Link header on the blog list page', () => {
    const response = middleware(buildRequest('/blog'))

    expect(response.headers.get('Link')).toBeNull()
  })

  it('should not set a Link header on excluded blog sub-paths (pagination, category)', () => {
    expect(middleware(buildRequest('/blog/page/2')).headers.get('Link')).toBeNull()
    expect(middleware(buildRequest('/blog/category/nextjs')).headers.get('Link')).toBeNull()
  })

  it('should not set a Link header on an unrelated page', () => {
    const response = middleware(buildRequest('/about'))

    expect(response.headers.get('Link')).toBeNull()
  })

  it('should still rewrite to the Markdown API when the path already ends in .md, without adding a duplicate Link header', () => {
    const response = middleware(buildRequest('/blog/test-post.md'))

    expect(response.headers.get('x-middleware-rewrite')).toContain('/api/markdown/blog/test-post')
    expect(response.headers.get('Link')).toBeNull()
  })

  it('should still rewrite via content negotiation when Accept: text/markdown is sent, without adding a duplicate Link header', () => {
    const response = middleware(
      buildRequest('/blog/test-post', { headers: { accept: 'text/markdown' } }),
    )

    expect(response.headers.get('x-middleware-rewrite')).toContain('/api/markdown/blog/test-post')
    expect(response.headers.get('Link')).toBeNull()
  })
})

describe('acceptsMarkdown', () => {
  it('matches the lowercase text/markdown media type', () => {
    expect(acceptsMarkdown(buildRequest('/about', { headers: { accept: 'text/markdown' } }))).toBe(
      true,
    )
  })

  it('matches text/markdown regardless of case, per RFC 9110 media-type case-insensitivity', () => {
    // CodeRabbit review finding on PR #262: `Accept: Text/Markdown` (mixed case) previously
    // failed to match, silently falling through to the normal HTML response instead of
    // rewriting to the Markdown API.
    expect(
      acceptsMarkdown(buildRequest('/about', { headers: { accept: 'Text/Markdown' } })),
    ).toBe(true)
    expect(
      acceptsMarkdown(buildRequest('/about', { headers: { accept: 'TEXT/MARKDOWN' } })),
    ).toBe(true)
  })

  it('matches text/markdown alongside other media types in the Accept header', () => {
    expect(
      acceptsMarkdown(
        buildRequest('/about', { headers: { accept: 'text/html, text/markdown;q=0.9' } }),
      ),
    ).toBe(true)
  })

  it('does not match when text/markdown is absent', () => {
    expect(acceptsMarkdown(buildRequest('/about', { headers: { accept: 'text/html' } }))).toBe(
      false,
    )
    expect(acceptsMarkdown(buildRequest('/about'))).toBe(false)
  })
})
