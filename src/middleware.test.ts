import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'
import { middleware } from './middleware'

function buildRequest(pathname: string, init?: { headers?: Record<string, string> }) {
  return new NextRequest(new URL(pathname, 'https://hidetaka.dev'), {
    headers: init?.headers,
  })
}

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
