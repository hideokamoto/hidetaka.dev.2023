import { describe, expect, it } from 'vitest'
import { determineLanguage } from './route'

describe('determineLanguage', () => {
  it('reads lang=ja from the query string added by the middleware rewrite', () => {
    expect(determineLanguage(new URL('http://localhost/api/markdown/about?lang=ja'))).toBe('ja')
  })

  it('falls back to the original /ja/ path when the query string never arrived', () => {
    // Some middleware-rewrite paths hand the route handler the pre-rewrite
    // request URL rather than the rewritten one, dropping the `?lang=ja` the
    // middleware attached. This is the regression this fallback exists for.
    expect(determineLanguage(new URL('http://localhost/ja/about.md'))).toBe('ja')
  })

  it('defaults to English with no lang signal at all', () => {
    expect(determineLanguage(new URL('http://localhost/api/markdown/about'))).toBe('en')
    expect(determineLanguage(new URL('http://localhost/about.md'))).toBe('en')
  })

  it('prefers the query string over the path when both are present', () => {
    expect(determineLanguage(new URL('http://localhost/about?lang=ja'))).toBe('ja')
  })
})
