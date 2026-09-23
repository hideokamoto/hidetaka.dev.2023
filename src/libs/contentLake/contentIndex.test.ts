import { afterEach, describe, expect, it, vi } from 'vitest'
import { logger } from '@/libs/logger'
import { isContentIndexGold, loadContentIndexGold } from './contentIndex'
import type { ContentIndexGold } from './types'

const validIndex: ContentIndexGold = {
  target: 'hidetaka.dev',
  updatedAt: '2026-09-23T07:53:39.061Z',
  itemCount: 200,
  items: [
    {
      id: 'wordpress:dev-notes:19842',
      title: 'circleciのyaml fixはrerunでは解決しない',
      url: 'https://hidetaka.dev/ja/writing/dev-notes/circleci-yaml-fix-rerun-not-solved/',
      publishedAt: '2026-09-22T02:57:00.000Z',
      source: 'wordpress',
      type: 'article',
    },
    {
      id: 'github-release:hideokamoto/cwswee:1.0.0',
      title: 'cwswee 1.0.0',
      url: 'https://github.com/hideokamoto/cwswee/releases/tag/1.0.0',
      publishedAt: '2026-09-20T10:00:00.000Z',
      source: 'github-release',
      type: 'release',
    },
  ],
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('isContentIndexGold', () => {
  it('accepts a valid ContentIndexGold payload', () => {
    expect(isContentIndexGold(validIndex)).toBe(true)
  })

  it('accepts an empty items array', () => {
    expect(isContentIndexGold({ ...validIndex, items: [] })).toBe(true)
  })

  it('rejects null', () => {
    expect(isContentIndexGold(null)).toBe(false)
  })

  it('rejects items that is not an array', () => {
    expect(isContentIndexGold({ ...validIndex, items: 'nope' })).toBe(false)
  })

  it('rejects an item missing a required string field', () => {
    expect(
      isContentIndexGold({
        ...validIndex,
        items: [{ ...validIndex.items[0], publishedAt: 123 }],
      }),
    ).toBe(false)
  })
})

describe('loadContentIndexGold', () => {
  it('returns the parsed ContentIndexGold on success', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify(validIndex), { status: 200 }))
    vi.spyOn(logger, 'error').mockImplementation(() => {})

    const index = await loadContentIndexGold()
    expect(index).toEqual(validIndex)
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://lake.hidetaka.dev/index.json',
      expect.objectContaining({ next: { revalidate: 3600 } }),
    )
  })

  it('returns null on non-ok responses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('denied', { status: 403 }))
    vi.spyOn(logger, 'error').mockImplementation(() => {})

    await expect(loadContentIndexGold()).resolves.toBeNull()
  })
})
