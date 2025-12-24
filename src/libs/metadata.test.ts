import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { WPThought } from './dataSources/types'
import { generateBlogPostMetadata, generateDevNoteMetadata } from './metadata'

// テスト用のモックデータファクトリ
const createMockWPThought = (overrides: Partial<WPThought> = {}): WPThought => ({
  id: 123,
  title: { rendered: 'Test Blog Post Title' },
  date: '2024-06-15T10:00:00',
  date_gmt: '2024-06-15T01:00:00',
  modified: '2024-06-20T12:00:00',
  modified_gmt: '2024-06-20T03:00:00',
  excerpt: { rendered: '<p>This is a test excerpt.</p>' },
  content: { rendered: '<p>Full content here</p>' },
  link: 'https://example.com/test-post',
  slug: 'test-post',
  ...overrides,
})

describe('generateDevNoteMetadata', () => {
  const originalEnv = process.env.NEXT_PUBLIC_SITE_URL

  beforeEach(() => {
    // テスト前に環境変数を設定
    process.env.NEXT_PUBLIC_SITE_URL = 'https://hidetaka.dev'
  })

  afterEach(() => {
    // テスト後に環境変数を復元
    if (originalEnv) {
      process.env.NEXT_PUBLIC_SITE_URL = originalEnv
    } else {
      delete process.env.NEXT_PUBLIC_SITE_URL
    }
  })

  it('should generate valid metadata structure', () => {
    const note = createMockWPThought({
      id: 456,
      title: { rendered: 'Test Dev Note' },
      date: '2024-07-01T12:00:00',
    })

    const result = generateDevNoteMetadata(note)

    expect(result.title).toBe('Test Dev Note')
    expect(result.openGraph).toBeDefined()
    expect(result.openGraph?.title).toBe('Test Dev Note')
    expect(result.openGraph?.type).toBe('article')
    expect(result.openGraph?.publishedTime).toBe('2024-07-01T12:00:00')
    expect(result.twitter).toBeDefined()
    expect(result.twitter?.card).toBe('summary_large_image')
    expect(result.twitter?.title).toBe('Test Dev Note')
  })

  it('should generate correct OG image URL for dev-notes', () => {
    const note = createMockWPThought({
      id: 789,
    })

    const result = generateDevNoteMetadata(note)

    expect(result.openGraph?.images).toBeDefined()
    expect(result.openGraph?.images).toHaveLength(1)
    expect(result.openGraph?.images?.[0]?.url).toBe(
      'https://hidetaka.dev/api/thumbnail/dev-notes/789',
    )
    expect(result.openGraph?.images?.[0]?.width).toBe(1200)
    expect(result.openGraph?.images?.[0]?.height).toBe(630)
    expect(result.openGraph?.images?.[0]?.alt).toBe('Test Blog Post Title')
  })

  it('should use default URL when NEXT_PUBLIC_SITE_URL is not set', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL

    const note = createMockWPThought({
      id: 999,
    })

    const result = generateDevNoteMetadata(note)

    expect(result.openGraph?.images?.[0]?.url).toBe(
      'https://hidetaka.dev/api/thumbnail/dev-notes/999',
    )
  })

  it('should use custom site URL from environment variable', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://custom.example.com'

    const note = createMockWPThought({
      id: 111,
    })

    const result = generateDevNoteMetadata(note)

    expect(result.openGraph?.images?.[0]?.url).toBe(
      'https://custom.example.com/api/thumbnail/dev-notes/111',
    )
  })

  it('should include title in Twitter card', () => {
    const note = createMockWPThought({
      title: { rendered: 'My Custom Title' },
    })

    const result = generateDevNoteMetadata(note)

    expect(result.twitter?.title).toBe('My Custom Title')
    expect(result.twitter?.images).toBeDefined()
    expect(result.twitter?.images).toHaveLength(1)
    expect(result.twitter?.images?.[0]).toBe('https://hidetaka.dev/api/thumbnail/dev-notes/123')
  })
})

describe('generateBlogPostMetadata', () => {
  const originalEnv = process.env.NEXT_PUBLIC_SITE_URL

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://hidetaka.dev'
  })

  afterEach(() => {
    if (originalEnv) {
      process.env.NEXT_PUBLIC_SITE_URL = originalEnv
    } else {
      delete process.env.NEXT_PUBLIC_SITE_URL
    }
  })

  it('should generate valid metadata structure', () => {
    const thought = createMockWPThought({
      id: 456,
      title: { rendered: 'Test Blog Post' },
      date: '2024-07-01T12:00:00',
    })

    const result = generateBlogPostMetadata(thought)

    expect(result.title).toBe('Test Blog Post')
    expect(result.openGraph).toBeDefined()
    expect(result.openGraph?.title).toBe('Test Blog Post')
    expect(result.openGraph?.type).toBe('article')
    expect(result.openGraph?.publishedTime).toBe('2024-07-01T12:00:00')
    expect(result.twitter).toBeDefined()
    expect(result.twitter?.card).toBe('summary_large_image')
    expect(result.twitter?.title).toBe('Test Blog Post')
  })

  it('should generate correct OG image URL for thoughts', () => {
    const thought = createMockWPThought({
      id: 789,
    })

    const result = generateBlogPostMetadata(thought)

    expect(result.openGraph?.images).toBeDefined()
    expect(result.openGraph?.images).toHaveLength(1)
    expect(result.openGraph?.images?.[0]?.url).toBe(
      'https://hidetaka.dev/api/thumbnail/thoughts/789',
    )
    expect(result.openGraph?.images?.[0]?.width).toBe(1200)
    expect(result.openGraph?.images?.[0]?.height).toBe(630)
    expect(result.openGraph?.images?.[0]?.alt).toBe('Test Blog Post Title')
  })

  it('should use default URL when NEXT_PUBLIC_SITE_URL is not set', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL

    const thought = createMockWPThought({
      id: 999,
    })

    const result = generateBlogPostMetadata(thought)

    expect(result.openGraph?.images?.[0]?.url).toBe(
      'https://hidetaka.dev/api/thumbnail/thoughts/999',
    )
  })

  it('should use custom site URL from environment variable', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://custom.example.com'

    const thought = createMockWPThought({
      id: 111,
    })

    const result = generateBlogPostMetadata(thought)

    expect(result.openGraph?.images?.[0]?.url).toBe(
      'https://custom.example.com/api/thumbnail/thoughts/111',
    )
  })

  it('should include title in Twitter card', () => {
    const thought = createMockWPThought({
      title: { rendered: 'My Custom Blog Title' },
    })

    const result = generateBlogPostMetadata(thought)

    expect(result.twitter?.title).toBe('My Custom Blog Title')
    expect(result.twitter?.images).toBeDefined()
    expect(result.twitter?.images).toHaveLength(1)
    expect(result.twitter?.images?.[0]).toBe('https://hidetaka.dev/api/thumbnail/thoughts/123')
  })

  it('should handle different post IDs correctly', () => {
    const thought1 = createMockWPThought({ id: 1 })
    const thought2 = createMockWPThought({ id: 2 })

    const result1 = generateBlogPostMetadata(thought1)
    const result2 = generateBlogPostMetadata(thought2)

    expect(result1.openGraph?.images?.[0]?.url).toContain('/thoughts/1')
    expect(result2.openGraph?.images?.[0]?.url).toContain('/thoughts/2')
  })
})
