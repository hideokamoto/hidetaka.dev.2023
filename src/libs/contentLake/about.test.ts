import { afterEach, describe, expect, it, vi } from 'vitest'
import { logger } from '@/libs/logger'
import { isAboutGold, loadAboutGold } from './about'
import type { AboutGold } from './types'

const validAbout: AboutGold = {
  schemaVersion: 1,
  target: 'hidetaka',
  generatedAt: '2026-02-03T00:00:00.000Z',
  writing: {
    source: 'wordpress',
    total: 1395,
    firstYear: 2013,
    yearsActive: 14,
    byYear: [
      { year: 2013, count: 10, cumulative: 10 },
      { year: 2014, count: 20, cumulative: 30 },
    ],
  },
  speaking: { reports: 27 },
  oss: {
    npm: { packages: { value: 58, asOf: '2026-02-01' } },
    wordpressOrg: {
      plugins: 5,
      activeInstalls: { value: 59250, asOf: '2026-02-01' },
      downloads: { value: 839504, asOf: '2026-02-01' },
    },
  },
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('isAboutGold', () => {
  it('accepts a valid AboutGold payload', () => {
    expect(isAboutGold(validAbout)).toBe(true)
  })

  it('accepts null writing and null oss members', () => {
    expect(
      isAboutGold({
        ...validAbout,
        writing: null,
        oss: { npm: null, wordpressOrg: null },
      }),
    ).toBe(true)
  })

  it('rejects null', () => {
    expect(isAboutGold(null)).toBe(false)
  })

  it('rejects a different schemaVersion', () => {
    expect(isAboutGold({ ...validAbout, schemaVersion: 2 })).toBe(false)
  })

  it('rejects a payload missing speaking', () => {
    const { speaking: _speaking, ...rest } = validAbout
    expect(isAboutGold(rest)).toBe(false)
  })

  it('rejects writing.byYear that is not an array', () => {
    expect(
      isAboutGold({
        ...validAbout,
        writing: { ...validAbout.writing, byYear: 'nope' },
      }),
    ).toBe(false)
  })

  it('rejects oss.npm missing a numeric value', () => {
    expect(
      isAboutGold({
        ...validAbout,
        oss: { ...validAbout.oss, npm: { packages: { asOf: '2026-02-01' } } },
      }),
    ).toBe(false)
  })
})

describe('loadAboutGold', () => {
  it('returns the parsed AboutGold on success', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(validAbout), { status: 200 }),
    )
    vi.spyOn(logger, 'error').mockImplementation(() => {})

    const about = await loadAboutGold()
    expect(about).toEqual(validAbout)
  })

  it('returns null on non-ok responses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('denied', { status: 403 }))
    vi.spyOn(logger, 'error').mockImplementation(() => {})

    await expect(loadAboutGold()).resolves.toBeNull()
  })
})
