import { afterEach, describe, expect, it, vi } from 'vitest'
import { logger } from '@/libs/logger'
import { isSlidesGold, loadSlidesGold } from './slides'
import type { SlidesGold } from './types'

const validSlides: SlidesGold = {
  target: 'hidetaka.dev',
  updatedAt: '2026-09-23T07:53:39.061Z',
  itemCount: 2,
  items: [
    {
      id: 'docswell:https://www.docswell.com/s/hideokamoto/ABC123',
      source: 'docswell',
      type: 'slide',
      title: '[スライド] Amplify Hosting の CI/CD 入門',
      url: 'https://www.docswell.com/s/hideokamoto/ABC123',
      publishedAt: '2026-09-20T10:00:00.000Z',
      excerpt: 'Amplify Hosting での CI/CD パイプライン構築について',
      dataSource: {
        name: 'Docswell',
        href: 'https://www.docswell.com/user/hideokamoto',
        color: '#0073ec',
      },
    },
    {
      id: 'docswell:https://www.docswell.com/s/hideokamoto/DEF456',
      source: 'docswell',
      type: 'slide',
      title: '[スライド] Serverless WordPress',
      url: 'https://www.docswell.com/s/hideokamoto/DEF456',
      publishedAt: '2026-08-10T10:00:00.000Z',
    },
  ],
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('isSlidesGold', () => {
  it('accepts a valid SlidesGold payload', () => {
    expect(isSlidesGold(validSlides)).toBe(true)
  })

  it('accepts an empty items array', () => {
    expect(isSlidesGold({ ...validSlides, items: [] })).toBe(true)
  })

  it('rejects null and non-object payloads', () => {
    expect(isSlidesGold(null)).toBe(false)
    expect(isSlidesGold('nope')).toBe(false)
  })

  it('rejects when items is missing or not an array', () => {
    const { items: _items, ...rest } = validSlides
    expect(isSlidesGold(rest)).toBe(false)
    expect(isSlidesGold({ ...validSlides, items: 'nope' })).toBe(false)
  })

  it('rejects an item missing url', () => {
    const { url: _url, ...itemWithoutUrl } = validSlides.items[0]
    expect(isSlidesGold({ ...validSlides, items: [itemWithoutUrl] })).toBe(false)
  })

  it('rejects an item with a non-string excerpt', () => {
    const bad = { ...validSlides.items[0], excerpt: 42 }
    expect(isSlidesGold({ ...validSlides, items: [bad] })).toBe(false)
  })
})

describe('loadSlidesGold', () => {
  it('returns the parsed SlidesGold on success', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify(validSlides), { status: 200 }))
    vi.spyOn(logger, 'error').mockImplementation(() => {})

    const slides = await loadSlidesGold()
    expect(slides).toEqual(validSlides)
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://lake.hidetaka.dev/slides.json',
      expect.objectContaining({ next: { revalidate: 3600 } }),
    )
  })

  it('returns null on non-ok responses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('denied', { status: 403 }))
    vi.spyOn(logger, 'error').mockImplementation(() => {})

    await expect(loadSlidesGold()).resolves.toBeNull()
  })
})
