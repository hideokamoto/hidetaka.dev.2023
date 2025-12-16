import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { extractCategories, getRelatedDevNotes } from './devnotes'
import type { WPThought } from './types'

describe('extractCategories', () => {
  it('should extract dev-note-category taxonomy from _embedded.wp:term', () => {
    const note: WPThought = {
      id: 17868,
      title: { rendered: 'Test Note' },
      date: '2025-12-16T08:56:00',
      date_gmt: '2025-12-15T23:56:00',
      excerpt: { rendered: 'Test excerpt' },
      content: { rendered: 'Test content' },
      link: 'https://example.com/test',
      slug: 'test-note',
      _embedded: {
        'wp:term': [
          [], // post_tag用（空）
          [
            {
              id: 707,
              name: 'CircleCI',
              slug: 'circleci',
              taxonomy: 'dev-note-category',
            },
            {
              id: 708,
              name: 'CircleCI Orbs',
              slug: 'circleci-orbs',
              taxonomy: 'dev-note-category',
            },
          ],
        ],
      },
    }

    const categories = extractCategories(note)

    expect(categories).toHaveLength(2)
    expect(categories[0]).toEqual({
      id: 707,
      name: 'CircleCI',
      slug: 'circleci',
      taxonomy: 'dev-note-category',
    })
    expect(categories[1]).toEqual({
      id: 708,
      name: 'CircleCI Orbs',
      slug: 'circleci-orbs',
      taxonomy: 'dev-note-category',
    })
  })

  it('should exclude post_tag taxonomy', () => {
    const note: WPThought = {
      id: 1,
      title: { rendered: 'Test' },
      date: '2025-01-01',
      date_gmt: '2025-01-01',
      excerpt: { rendered: 'Test' },
      content: { rendered: 'Test' },
      link: 'https://example.com',
      slug: 'test',
      _embedded: {
        'wp:term': [
          [
            {
              id: 1,
              name: 'Tag1',
              slug: 'tag1',
              taxonomy: 'post_tag',
            },
          ],
          [
            {
              id: 707,
              name: 'CircleCI',
              slug: 'circleci',
              taxonomy: 'dev-note-category',
            },
          ],
        ],
      },
    }

    const categories = extractCategories(note)

    expect(categories).toHaveLength(1)
    expect(categories[0].taxonomy).toBe('dev-note-category')
    expect(categories[0].name).toBe('CircleCI')
  })

  it('should return empty array when _embedded.wp:term is missing', () => {
    const note: WPThought = {
      id: 1,
      title: { rendered: 'Test' },
      date: '2025-01-01',
      date_gmt: '2025-01-01',
      excerpt: { rendered: 'Test' },
      content: { rendered: 'Test' },
      link: 'https://example.com',
      slug: 'test',
    }

    const categories = extractCategories(note)

    expect(categories).toEqual([])
  })

  it('should return empty array when _embedded is missing', () => {
    const note: WPThought = {
      id: 1,
      title: { rendered: 'Test' },
      date: '2025-01-01',
      date_gmt: '2025-01-01',
      excerpt: { rendered: 'Test' },
      content: { rendered: 'Test' },
      link: 'https://example.com',
      slug: 'test',
      _embedded: undefined,
    }

    const categories = extractCategories(note)

    expect(categories).toEqual([])
  })

  it('should handle standard category taxonomy', () => {
    const note: WPThought = {
      id: 1,
      title: { rendered: 'Test' },
      date: '2025-01-01',
      date_gmt: '2025-01-01',
      excerpt: { rendered: 'Test' },
      content: { rendered: 'Test' },
      link: 'https://example.com',
      slug: 'test',
      _embedded: {
        'wp:term': [
          [
            {
              id: 1,
              name: 'Standard Category',
              slug: 'standard-category',
              taxonomy: 'category',
            },
          ],
        ],
      },
    }

    const categories = extractCategories(note)

    expect(categories).toHaveLength(1)
    expect(categories[0].taxonomy).toBe('category')
  })

  it('should handle multiple taxonomies excluding post_tag', () => {
    const note: WPThought = {
      id: 1,
      title: { rendered: 'Test' },
      date: '2025-01-01',
      date_gmt: '2025-01-01',
      excerpt: { rendered: 'Test' },
      content: { rendered: 'Test' },
      link: 'https://example.com',
      slug: 'test',
      _embedded: {
        'wp:term': [
          [
            {
              id: 1,
              name: 'Tag1',
              slug: 'tag1',
              taxonomy: 'post_tag',
            },
            {
              id: 2,
              name: 'Tag2',
              slug: 'tag2',
              taxonomy: 'post_tag',
            },
          ],
          [
            {
              id: 707,
              name: 'CircleCI',
              slug: 'circleci',
              taxonomy: 'dev-note-category',
            },
          ],
          [
            {
              id: 1,
              name: 'Custom Category',
              slug: 'custom-category',
              taxonomy: 'custom-taxonomy',
            },
          ],
        ],
      },
    }

    const categories = extractCategories(note)

    expect(categories).toHaveLength(2)
    expect(categories.every((cat) => cat.taxonomy !== 'post_tag')).toBe(true)
    expect(categories.some((cat) => cat.taxonomy === 'dev-note-category')).toBe(true)
    expect(categories.some((cat) => cat.taxonomy === 'custom-taxonomy')).toBe(true)
  })
})

describe('getRelatedDevNotes', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should use custom taxonomy name (dev-note-category) in API URL when category has custom taxonomy', async () => {
    const currentNote: WPThought = {
      id: 17868,
      title: { rendered: 'Current Note' },
      date: '2025-12-16T08:56:00',
      date_gmt: '2025-12-15T23:56:00',
      excerpt: { rendered: 'Current excerpt' },
      content: { rendered: 'Current content' },
      link: 'https://example.com/current',
      slug: 'current-note',
      _embedded: {
        'wp:term': [
          [],
          [
            {
              id: 707,
              name: 'CircleCI',
              slug: 'circleci',
              taxonomy: 'dev-note-category',
            },
          ],
        ],
      },
    }

    const mockResponse = {
      ok: true,
      json: async () => [
        {
          id: 17844,
          title: { rendered: 'Related Note' },
          date: '2025-12-15T08:00:00',
          date_gmt: '2025-12-14T23:00:00',
          excerpt: { rendered: 'Related excerpt' },
          slug: 'related-note',
          link: 'https://example.com/related',
          _embedded: {
            'wp:term': [
              [],
              [
                {
                  id: 707,
                  name: 'CircleCI',
                  slug: 'circleci',
                  taxonomy: 'dev-note-category',
                },
              ],
            ],
          },
        },
      ],
    }

    vi.mocked(fetch).mockResolvedValue(mockResponse as Response)

    await getRelatedDevNotes(currentNote, 4)

    expect(fetch).toHaveBeenCalledTimes(1)
    const callUrl = vi.mocked(fetch).mock.calls[0]?.[0] as string
    expect(callUrl).toContain('dev-note-category=707')
    expect(callUrl).toContain('exclude=17868')
    expect(callUrl).not.toContain('categories=707')
  })

  it('should use standard categories parameter when taxonomy is category', async () => {
    const currentNote: WPThought = {
      id: 1,
      title: { rendered: 'Current Note' },
      date: '2025-01-01',
      date_gmt: '2025-01-01',
      excerpt: { rendered: 'Current excerpt' },
      content: { rendered: 'Current content' },
      link: 'https://example.com/current',
      slug: 'current-note',
      _embedded: {
        'wp:term': [
          [
            {
              id: 1,
              name: 'Standard Category',
              slug: 'standard-category',
              taxonomy: 'category',
            },
          ],
        ],
      },
    }

    const mockResponse = {
      ok: true,
      json: async () => [],
    }

    vi.mocked(fetch).mockResolvedValue(mockResponse as Response)

    await getRelatedDevNotes(currentNote, 4)

    expect(fetch).toHaveBeenCalledTimes(1)
    const callUrl = vi.mocked(fetch).mock.calls[0]?.[0] as string
    expect(callUrl).toContain('categories=1')
    expect(callUrl).not.toContain('category=1')
  })

  it('should fetch all articles when no categories are found', async () => {
    const currentNote: WPThought = {
      id: 1,
      title: { rendered: 'Current Note' },
      date: '2025-01-01',
      date_gmt: '2025-01-01',
      excerpt: { rendered: 'Current excerpt' },
      content: { rendered: 'Current content' },
      link: 'https://example.com/current',
      slug: 'current-note',
    }

    const mockResponse = {
      ok: true,
      json: async () => [
        {
          id: 2,
          title: { rendered: 'Other Note' },
          date: '2025-01-02',
          date_gmt: '2025-01-02',
          excerpt: { rendered: 'Other excerpt' },
          slug: 'other-note',
          link: 'https://example.com/other',
          _embedded: {
            'wp:term': [],
          },
        },
      ],
    }

    vi.mocked(fetch).mockResolvedValue(mockResponse as Response)

    await getRelatedDevNotes(currentNote, 4)

    expect(fetch).toHaveBeenCalledTimes(1)
    const callUrl = vi.mocked(fetch).mock.calls[0]?.[0] as string
    expect(callUrl).toContain('exclude=1')
    expect(callUrl).not.toContain('categories=')
    expect(callUrl).not.toContain('dev-note-category=')
  })

  it('should return empty array when API request fails', async () => {
    const currentNote: WPThought = {
      id: 1,
      title: { rendered: 'Current Note' },
      date: '2025-01-01',
      date_gmt: '2025-01-01',
      excerpt: { rendered: 'Current excerpt' },
      content: { rendered: 'Current content' },
      link: 'https://example.com/current',
      slug: 'current-note',
      _embedded: {
        'wp:term': [
          [],
          [
            {
              id: 707,
              name: 'CircleCI',
              slug: 'circleci',
              taxonomy: 'dev-note-category',
            },
          ],
        ],
      },
    }

    const mockResponse = {
      ok: false,
      status: 500,
    }

    vi.mocked(fetch).mockResolvedValue(mockResponse as Response)
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const result = await getRelatedDevNotes(currentNote, 4)

    expect(result).toEqual([])
    expect(consoleErrorSpy).toHaveBeenCalled()

    consoleErrorSpy.mockRestore()
  })

  it('should limit results to specified limit', async () => {
    const currentNote: WPThought = {
      id: 1,
      title: { rendered: 'Current Note' },
      date: '2025-01-01',
      date_gmt: '2025-01-01',
      excerpt: { rendered: 'Current excerpt' },
      content: { rendered: 'Current content' },
      link: 'https://example.com/current',
      slug: 'current-note',
      _embedded: {
        'wp:term': [
          [],
          [
            {
              id: 707,
              name: 'CircleCI',
              slug: 'circleci',
              taxonomy: 'dev-note-category',
            },
          ],
        ],
      },
    }

    const mockNotes = Array.from({ length: 10 }, (_, i) => ({
      id: i + 2,
      title: { rendered: `Note ${i + 2}` },
      date: `2025-01-${String(i + 2).padStart(2, '0')}`,
      date_gmt: `2025-01-${String(i + 2).padStart(2, '0')}`,
      excerpt: { rendered: `Excerpt ${i + 2}` },
      slug: `note-${i + 2}`,
      link: `https://example.com/note-${i + 2}`,
      _embedded: {
        'wp:term': [],
      },
    }))

    const mockResponse = {
      ok: true,
      json: async () => mockNotes,
    }

    vi.mocked(fetch).mockResolvedValue(mockResponse as Response)

    const result = await getRelatedDevNotes(currentNote, 4)

    expect(result).toHaveLength(4)
  })

  it('should transform WPThought to BlogItem correctly', async () => {
    const currentNote: WPThought = {
      id: 1,
      title: { rendered: 'Current Note' },
      date: '2025-01-01',
      date_gmt: '2025-01-01',
      excerpt: { rendered: 'Current excerpt' },
      content: { rendered: 'Current content' },
      link: 'https://example.com/current',
      slug: 'current-note',
      _embedded: {
        'wp:term': [
          [],
          [
            {
              id: 707,
              name: 'CircleCI',
              slug: 'circleci',
              taxonomy: 'dev-note-category',
            },
          ],
        ],
      },
    }

    const mockResponse = {
      ok: true,
      json: async () => [
        {
          id: 2,
          title: { rendered: 'Related Note' },
          date: '2025-01-02T08:00:00',
          date_gmt: '2025-01-01T23:00:00',
          excerpt: { rendered: '<p>Related excerpt with HTML</p>' },
          slug: 'related-note',
          link: 'https://example.com/related',
          _embedded: {
            'wp:term': [
              [],
              [
                {
                  id: 707,
                  name: 'CircleCI',
                  slug: 'circleci',
                  taxonomy: 'dev-note-category',
                },
              ],
            ],
          },
        },
      ],
    }

    vi.mocked(fetch).mockResolvedValue(mockResponse as Response)

    const result = await getRelatedDevNotes(currentNote, 4)

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      id: '2',
      title: 'Related Note',
      description: 'Related excerpt with HTML',
      datetime: '2025-01-02T08:00:00',
      href: '/ja/writing/dev-notes/related-note',
      categories: [
        {
          id: 707,
          name: 'CircleCI',
          slug: 'circleci',
          taxonomy: 'dev-note-category',
        },
      ],
    })
  })
})
