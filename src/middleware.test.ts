import type { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'
import { acceptsMarkdown, middleware } from '@/middleware'

function requestWithAccept(accept: string | null): NextRequest {
  return {
    headers: {
      get: (name: string) => (name === 'accept' ? accept : null),
    },
  } as unknown as NextRequest
}

/**
 * A minimal fake `NextRequest` covering exactly what `middleware()` reads: `.nextUrl.pathname`,
 * `.url`, and `.headers.get('accept')`. Not a real `NextRequest` — Next.js's own request
 * parsing is out of scope here; this test is only about `middleware()`'s own dispatch logic.
 */
function fakeRequest(url: string, accept?: string): NextRequest {
  const parsed = new URL(url)
  return {
    url,
    nextUrl: { pathname: parsed.pathname },
    headers: {
      get: (name: string) => (name === 'accept' ? (accept ?? null) : null),
    },
  } as unknown as NextRequest
}

describe('middleware', () => {
  // CodeRabbit review finding on PR #262: the unit tests below cover acceptsMarkdown,
  // the rewrite rules, and determineLanguage in isolation, but nothing exercised
  // middleware() itself wiring an `Accept: text/markdown` request on /about through to
  // the rewritten `/api/markdown/about` target — this is that entry-point regression test.
  it('rewrites /about with Accept: text/markdown to /api/markdown/about', () => {
    const response = middleware(fakeRequest('https://hidetaka.dev/about', 'text/markdown'))

    expect(response.headers.get('x-middleware-rewrite')).toBe(
      'https://hidetaka.dev/api/markdown/about',
    )
  })

  it('rewrites /ja/about with Accept: text/markdown to /api/markdown/about?lang=ja', () => {
    const response = middleware(fakeRequest('https://hidetaka.dev/ja/about', 'text/markdown'))

    const rewriteTarget = new URL(response.headers.get('x-middleware-rewrite') ?? '')
    expect(rewriteTarget.pathname).toBe('/api/markdown/about')
    expect(rewriteTarget.searchParams.get('lang')).toBe('ja')
  })

  it('does not rewrite /about when Accept does not ask for Markdown', () => {
    const response = middleware(fakeRequest('https://hidetaka.dev/about', 'text/html'))

    expect(response.headers.get('x-middleware-rewrite')).toBeNull()
  })
})

describe('acceptsMarkdown', () => {
  it('matches the lowercase text/markdown media type', () => {
    expect(acceptsMarkdown(requestWithAccept('text/markdown'))).toBe(true)
  })

  it('matches text/markdown regardless of case, per RFC 9110 media-type case-insensitivity', () => {
    // CodeRabbit review finding on PR #262: `Accept: Text/Markdown` (mixed case) previously
    // failed to match, silently falling through to the normal HTML response instead of
    // rewriting to the Markdown API.
    expect(acceptsMarkdown(requestWithAccept('Text/Markdown'))).toBe(true)
    expect(acceptsMarkdown(requestWithAccept('TEXT/MARKDOWN'))).toBe(true)
  })

  it('matches text/markdown alongside other media types in the Accept header', () => {
    expect(acceptsMarkdown(requestWithAccept('text/html, text/markdown;q=0.9'))).toBe(true)
  })

  it('does not match when text/markdown is absent', () => {
    expect(acceptsMarkdown(requestWithAccept('text/html'))).toBe(false)
    expect(acceptsMarkdown(requestWithAccept(null))).toBe(false)
  })
})
