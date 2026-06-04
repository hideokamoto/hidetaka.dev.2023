import { describe, expect, it } from 'vitest'
import { getProjectHref, isProjectLandingPage, PROJECT_LANDING_PAGES } from './projectLandingPages'

describe('isProjectLandingPage', () => {
  it('returns true for a project backed by a landing page', () => {
    expect(isProjectLandingPage('wordpress-skills')).toBe(true)
  })

  it('returns false for a regular microCMS project id', () => {
    expect(isProjectLandingPage('48xxv5o8vt8j')).toBe(false)
  })
})

describe('getProjectHref', () => {
  it('returns the English LP path for a landing-page project', () => {
    expect(getProjectHref('wordpress-skills', 'en')).toBe(
      PROJECT_LANDING_PAGES['wordpress-skills'].en,
    )
  })

  it('returns the Japanese LP path for a landing-page project', () => {
    expect(getProjectHref('wordpress-skills', 'ja')).toBe(
      PROJECT_LANDING_PAGES['wordpress-skills'].ja,
    )
  })

  it('falls back to the internal detail route for a regular project (en)', () => {
    expect(getProjectHref('abc123', 'en')).toBe('/work/abc123')
  })

  it('falls back to the internal detail route for a regular project (ja)', () => {
    expect(getProjectHref('abc123', 'ja')).toBe('/ja/work/abc123')
  })

  it('treats any ja-prefixed locale as Japanese', () => {
    expect(getProjectHref('abc123', 'ja-JP')).toBe('/ja/work/abc123')
  })
})
