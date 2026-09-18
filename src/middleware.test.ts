import type { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'
import { acceptsMarkdown } from './middleware'

function requestWithAccept(accept: string | null): NextRequest {
  return {
    headers: {
      get: (name: string) => (name === 'accept' ? accept : null),
    },
  } as unknown as NextRequest
}

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
