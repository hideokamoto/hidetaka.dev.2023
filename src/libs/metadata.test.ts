import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { WPThought } from './dataSources/types'
import {
  buildAlternates,
  generateBlogPostMetadata,
  generateDevNoteMetadata,
  generateProjectMetadata,
  getOpenGraphLocale,
} from './metadata'
import type { MicroCMSProjectsRecord } from './microCMS/types'

// プロジェクト用のモックデータファクトリ
const createMockProject = (
  overrides: Partial<MicroCMSProjectsRecord> = {},
): MicroCMSProjectsRecord => ({
  id: 'project-1',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  publishedAt: '2024-01-01T00:00:00.000Z',
  title: 'Test Project',
  url: 'https://example.com/project',
  tags: ['typescript'],
  project_type: ['owned_oss'],
  lang: ['English'],
  is_solo: true,
  about: '<p>A great project about testing.</p>',
  ...overrides,
})

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

    const result = generateDevNoteMetadata(note, '/writing/dev-notes/test-post')

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

    const result = generateDevNoteMetadata(note, '/writing/dev-notes/test-post')

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

    const result = generateDevNoteMetadata(note, '/writing/dev-notes/test-post')

    expect(result.openGraph?.images?.[0]?.url).toBe(
      'https://hidetaka.dev/api/thumbnail/dev-notes/999',
    )
  })

  it('should use custom site URL from environment variable', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://custom.example.com'

    const note = createMockWPThought({
      id: 111,
    })

    const result = generateDevNoteMetadata(note, '/writing/dev-notes/test-post')

    expect(result.openGraph?.images?.[0]?.url).toBe(
      'https://custom.example.com/api/thumbnail/dev-notes/111',
    )
  })

  it('should include title in Twitter card', () => {
    const note = createMockWPThought({
      title: { rendered: 'My Custom Title' },
    })

    const result = generateDevNoteMetadata(note, '/writing/dev-notes/test-post')

    expect(result.twitter?.title).toBe('My Custom Title')
    expect(result.twitter?.images).toBeDefined()
    expect(result.twitter?.images).toHaveLength(1)
    expect(result.twitter?.images?.[0]).toBe('https://hidetaka.dev/api/thumbnail/dev-notes/123')
  })

  describe('description', () => {
    it('should generate a description from the excerpt', () => {
      const note = createMockWPThought({
        excerpt: { rendered: '<p>This is a useful summary of the note.</p>' },
      })

      const result = generateDevNoteMetadata(note, '/writing/dev-notes/test-post')

      expect(result.description).toBe('This is a useful summary of the note.')
      expect(result.openGraph?.description).toBe('This is a useful summary of the note.')
      expect(result.twitter?.description).toBe('This is a useful summary of the note.')
    })

    it('should strip HTML tags from the description', () => {
      const note = createMockWPThought({
        excerpt: { rendered: '<p>Hello <strong>world</strong> from <a href="#">here</a>.</p>' },
      })

      const result = generateDevNoteMetadata(note, '/writing/dev-notes/test-post')

      expect(result.description).toBe('Hello world from here.')
      expect(result.description).not.toMatch(/<[^>]*>/)
    })

    it('should normalize whitespace in the description', () => {
      const note = createMockWPThought({
        excerpt: { rendered: '<p>Multiple   spaces\n\nand newlines</p>' },
      })

      const result = generateDevNoteMetadata(note, '/writing/dev-notes/test-post')

      expect(result.description).toBe('Multiple spaces and newlines')
    })

    it('should truncate the description to roughly 120 characters', () => {
      const longText = 'A'.repeat(300)
      const note = createMockWPThought({
        excerpt: { rendered: `<p>${longText}</p>` },
      })

      const result = generateDevNoteMetadata(note, '/writing/dev-notes/test-post')

      expect(result.description).toBeDefined()
      expect((result.description as string).length).toBeLessThanOrEqual(123)
    })

    it('should fall back to content when the excerpt is empty', () => {
      const note = createMockWPThought({
        excerpt: { rendered: '' },
        content: { rendered: '<p>Fallback content body.</p>' },
      })

      const result = generateDevNoteMetadata(note, '/writing/dev-notes/test-post')

      expect(result.description).toBe('Fallback content body.')
    })

    it('should fall back to the title when excerpt and content are empty', () => {
      const note = createMockWPThought({
        title: { rendered: 'Only Title Available' },
        excerpt: { rendered: '' },
        content: { rendered: '' },
      })

      const result = generateDevNoteMetadata(note, '/writing/dev-notes/test-post')

      expect(result.description).toBe('Only Title Available')
    })

    it('should never produce an empty string description', () => {
      const note = createMockWPThought({
        title: { rendered: 'Some Title' },
        excerpt: { rendered: '<p>   </p>' },
        content: { rendered: '<p></p>' },
      })

      const result = generateDevNoteMetadata(note, '/writing/dev-notes/test-post')

      expect(result.description).toBeTruthy()
    })
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

    const result = generateBlogPostMetadata(thought, '/blog/test-post')

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

    const result = generateBlogPostMetadata(thought, '/blog/test-post')

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

    const result = generateBlogPostMetadata(thought, '/blog/test-post')

    expect(result.openGraph?.images?.[0]?.url).toBe(
      'https://hidetaka.dev/api/thumbnail/thoughts/999',
    )
  })

  it('should use custom site URL from environment variable', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://custom.example.com'

    const thought = createMockWPThought({
      id: 111,
    })

    const result = generateBlogPostMetadata(thought, '/blog/test-post')

    expect(result.openGraph?.images?.[0]?.url).toBe(
      'https://custom.example.com/api/thumbnail/thoughts/111',
    )
  })

  it('should include title in Twitter card', () => {
    const thought = createMockWPThought({
      title: { rendered: 'My Custom Blog Title' },
    })

    const result = generateBlogPostMetadata(thought, '/blog/test-post')

    expect(result.twitter?.title).toBe('My Custom Blog Title')
    expect(result.twitter?.images).toBeDefined()
    expect(result.twitter?.images).toHaveLength(1)
    expect(result.twitter?.images?.[0]).toBe('https://hidetaka.dev/api/thumbnail/thoughts/123')
  })

  it('should handle different post IDs correctly', () => {
    const thought1 = createMockWPThought({ id: 1 })
    const thought2 = createMockWPThought({ id: 2 })

    const result1 = generateBlogPostMetadata(thought1, '/blog/post-1')
    const result2 = generateBlogPostMetadata(thought2, '/blog/post-2')

    expect(result1.openGraph?.images?.[0]?.url).toContain('/thoughts/1')
    expect(result2.openGraph?.images?.[0]?.url).toContain('/thoughts/2')
  })

  describe('description', () => {
    it('should generate a description from the excerpt', () => {
      const thought = createMockWPThought({
        excerpt: { rendered: '<p>This is a useful summary of the post.</p>' },
      })

      const result = generateBlogPostMetadata(thought, '/blog/test-post')

      expect(result.description).toBe('This is a useful summary of the post.')
      expect(result.openGraph?.description).toBe('This is a useful summary of the post.')
      expect(result.twitter?.description).toBe('This is a useful summary of the post.')
    })

    it('should strip HTML tags from the description', () => {
      const thought = createMockWPThought({
        excerpt: { rendered: '<p>Hello <strong>world</strong> from <a href="#">here</a>.</p>' },
      })

      const result = generateBlogPostMetadata(thought, '/blog/test-post')

      expect(result.description).toBe('Hello world from here.')
      expect(result.description).not.toMatch(/<[^>]*>/)
    })

    it('should normalize whitespace in the description', () => {
      const thought = createMockWPThought({
        excerpt: { rendered: '<p>Multiple   spaces\n\nand newlines</p>' },
      })

      const result = generateBlogPostMetadata(thought, '/blog/test-post')

      expect(result.description).toBe('Multiple spaces and newlines')
    })

    it('should truncate the description to roughly 120 characters', () => {
      const longText = 'A'.repeat(300)
      const thought = createMockWPThought({
        excerpt: { rendered: `<p>${longText}</p>` },
      })

      const result = generateBlogPostMetadata(thought, '/blog/test-post')

      expect(result.description).toBeDefined()
      expect((result.description as string).length).toBeLessThanOrEqual(123)
    })

    it('should fall back to content when the excerpt is empty', () => {
      const thought = createMockWPThought({
        excerpt: { rendered: '' },
        content: { rendered: '<p>Fallback content body.</p>' },
      })

      const result = generateBlogPostMetadata(thought, '/blog/test-post')

      expect(result.description).toBe('Fallback content body.')
    })

    it('should fall back to the title when excerpt and content are empty', () => {
      const thought = createMockWPThought({
        title: { rendered: 'Only Title Available' },
        excerpt: { rendered: '' },
        content: { rendered: '' },
      })

      const result = generateBlogPostMetadata(thought, '/blog/test-post')

      expect(result.description).toBe('Only Title Available')
    })

    it('should never produce an empty string description', () => {
      const thought = createMockWPThought({
        title: { rendered: 'Some Title' },
        excerpt: { rendered: '<p>   </p>' },
        content: { rendered: '<p></p>' },
      })

      const result = generateBlogPostMetadata(thought, '/blog/test-post')

      expect(result.description).toBeTruthy()
    })
  })
})

describe('generateProjectMetadata', () => {
  it('should use project title as the metadata title', () => {
    const project = createMockProject({ title: 'My OSS Tool' })

    const result = generateProjectMetadata(project, 'en')

    expect(result.title).toBe('My OSS Tool')
    expect(result.openGraph?.title).toBe('My OSS Tool')
    expect(result.twitter?.title).toBe('My OSS Tool')
  })

  it('should strip HTML tags from about to build the description', () => {
    const project = createMockProject({
      about: '<p>A <strong>great</strong> project.</p>',
    })

    const result = generateProjectMetadata(project, 'en')

    expect(result.description).toBe('A great project.')
    expect(result.description).not.toContain('<')
    expect(result.openGraph?.description).toBe('A great project.')
    expect(result.twitter?.description).toBe('A great project.')
  })

  it('should normalize whitespace in the description', () => {
    const project = createMockProject({
      about: '<p>Line one.</p>\n   <p>Line two.</p>',
    })

    const result = generateProjectMetadata(project, 'en')

    expect(result.description).toBe('Line one. Line two.')
  })

  it('should truncate long descriptions to about 120 characters', () => {
    const longText = 'あ'.repeat(300)
    const project = createMockProject({ about: `<p>${longText}</p>` })

    const result = generateProjectMetadata(project, 'ja')

    expect(result.description).toBeDefined()
    expect((result.description as string).length).toBeLessThanOrEqual(121)
  })

  it('should fall back to title when about is missing', () => {
    const project = createMockProject({ title: 'No About Project', about: undefined })

    const result = generateProjectMetadata(project, 'en')

    expect(result.description).toBe('No About Project')
    expect(result.openGraph?.description).toBe('No About Project')
  })

  it('should set openGraph type to website', () => {
    const project = createMockProject()

    const result = generateProjectMetadata(project, 'en')

    expect(result.openGraph?.type).toBe('website')
  })

  it('should set twitter card to summary_large_image', () => {
    const project = createMockProject()

    const result = generateProjectMetadata(project, 'en')

    expect(result.twitter?.card).toBe('summary_large_image')
  })

  it('should include the project image in openGraph when present', () => {
    const project = createMockProject({
      image: { url: 'https://images.microcms-assets.io/test.png', width: 1200, height: 630 },
    })

    const result = generateProjectMetadata(project, 'en')

    expect(result.openGraph?.images).toBeDefined()
    expect(result.openGraph?.images).toHaveLength(1)
    expect(result.openGraph?.images?.[0]?.url).toBe('https://images.microcms-assets.io/test.png')
  })

  it('should omit openGraph images when the project has no image', () => {
    const project = createMockProject({ image: undefined })

    const result = generateProjectMetadata(project, 'en')

    expect(result.openGraph?.images).toBeUndefined()
  })
})

describe('buildAlternates', () => {
  it('should build canonical and hreflang for an English path', () => {
    const result = buildAlternates('/work')

    expect(result.canonical).toBe('https://hidetaka.dev/work')
    expect(result.languages).toEqual({
      en: 'https://hidetaka.dev/work',
      ja: 'https://hidetaka.dev/ja/work',
      'x-default': 'https://hidetaka.dev/work',
    })
  })

  it('should build canonical and hreflang for a Japanese path', () => {
    const result = buildAlternates('/ja/work')

    expect(result.canonical).toBe('https://hidetaka.dev/ja/work')
    expect(result.languages).toEqual({
      en: 'https://hidetaka.dev/work',
      ja: 'https://hidetaka.dev/ja/work',
      'x-default': 'https://hidetaka.dev/work',
    })
  })

  it('should handle the root path', () => {
    const result = buildAlternates('/')

    expect(result.canonical).toBe('https://hidetaka.dev')
    expect(result.languages).toEqual({
      en: 'https://hidetaka.dev',
      ja: 'https://hidetaka.dev/ja',
      'x-default': 'https://hidetaka.dev',
    })
  })

  it('should handle the Japanese root path', () => {
    const result = buildAlternates('/ja')

    expect(result.canonical).toBe('https://hidetaka.dev/ja')
    expect(result.languages).toEqual({
      en: 'https://hidetaka.dev',
      ja: 'https://hidetaka.dev/ja',
      'x-default': 'https://hidetaka.dev',
    })
  })

  it('should normalize canonical to the Japanese path when canonicalLang is ja', () => {
    const result = buildAlternates('/writing/dev-notes/my-note', { canonicalLang: 'ja' })

    expect(result.canonical).toBe('https://hidetaka.dev/ja/writing/dev-notes/my-note')
    expect(result.languages).toEqual({
      en: 'https://hidetaka.dev/writing/dev-notes/my-note',
      ja: 'https://hidetaka.dev/ja/writing/dev-notes/my-note',
      'x-default': 'https://hidetaka.dev/writing/dev-notes/my-note',
    })
  })

  it('should normalize canonical to the English path when canonicalLang is en', () => {
    const result = buildAlternates('/ja/blog/my-post', { canonicalLang: 'en' })

    expect(result.canonical).toBe('https://hidetaka.dev/blog/my-post')
  })

  it('should limit hreflang to available languages for single-language pages', () => {
    const result = buildAlternates('/ja/events/my-event', { availableLanguages: ['ja'] })

    expect(result.canonical).toBe('https://hidetaka.dev/ja/events/my-event')
    expect(result.languages).toEqual({
      ja: 'https://hidetaka.dev/ja/events/my-event',
      'x-default': 'https://hidetaka.dev/ja/events/my-event',
    })
  })
})

describe('getOpenGraphLocale', () => {
  it('should return en_US for English', () => {
    expect(getOpenGraphLocale('en')).toBe('en_US')
  })

  it('should return ja_JP for Japanese', () => {
    expect(getOpenGraphLocale('ja')).toBe('ja_JP')
  })
})

describe('canonical / hreflang / og:url integration', () => {
  it('generateBlogPostMetadata should use the given path as canonical and og:url', () => {
    const thought = createMockWPThought()

    const result = generateBlogPostMetadata(thought, '/blog/test-post')

    expect(result.alternates?.canonical).toBe('https://hidetaka.dev/blog/test-post')
    expect(result.alternates?.languages).toEqual({
      en: 'https://hidetaka.dev/blog/test-post',
      ja: 'https://hidetaka.dev/ja/blog/test-post',
      'x-default': 'https://hidetaka.dev/blog/test-post',
    })
    expect(result.openGraph?.url).toBe('https://hidetaka.dev/blog/test-post')
    expect(result.openGraph?.siteName).toBe('Hidetaka.dev')
    expect(result.openGraph?.locale).toBe('en_US')
  })

  it('generateBlogPostMetadata should use ja locale for Japanese paths', () => {
    const thought = createMockWPThought()

    const result = generateBlogPostMetadata(thought, '/ja/blog/test-post')

    expect(result.alternates?.canonical).toBe('https://hidetaka.dev/ja/blog/test-post')
    expect(result.openGraph?.url).toBe('https://hidetaka.dev/ja/blog/test-post')
    expect(result.openGraph?.locale).toBe('ja_JP')
  })

  it('generateBlogPostMetadata should respect availableLanguages option', () => {
    const thought = createMockWPThought()

    const result = generateBlogPostMetadata(thought, '/ja/events/test-event', {
      availableLanguages: ['ja'],
    })

    expect(result.alternates?.canonical).toBe('https://hidetaka.dev/ja/events/test-event')
    expect(result.alternates?.languages).toEqual({
      ja: 'https://hidetaka.dev/ja/events/test-event',
      'x-default': 'https://hidetaka.dev/ja/events/test-event',
    })
  })

  it('generateDevNoteMetadata should normalize canonical and og:url to the Japanese path', () => {
    const note = createMockWPThought()

    const enResult = generateDevNoteMetadata(note, '/writing/dev-notes/test-post')
    const jaResult = generateDevNoteMetadata(note, '/ja/writing/dev-notes/test-post')

    // en/jaで同一コンテンツのため、どちらもja側のURLをcanonicalとする
    expect(enResult.alternates?.canonical).toBe(
      'https://hidetaka.dev/ja/writing/dev-notes/test-post',
    )
    expect(jaResult.alternates?.canonical).toBe(
      'https://hidetaka.dev/ja/writing/dev-notes/test-post',
    )
    expect(enResult.openGraph?.url).toBe('https://hidetaka.dev/ja/writing/dev-notes/test-post')
    expect(enResult.alternates?.languages).toEqual({
      en: 'https://hidetaka.dev/writing/dev-notes/test-post',
      ja: 'https://hidetaka.dev/ja/writing/dev-notes/test-post',
      'x-default': 'https://hidetaka.dev/writing/dev-notes/test-post',
    })
    // og:localeは表示中のページの言語に従う
    expect(enResult.openGraph?.locale).toBe('en_US')
    expect(jaResult.openGraph?.locale).toBe('ja_JP')
  })

  it('generateProjectMetadata should build canonical from lang and project id', () => {
    const project = createMockProject({ id: 'my-project' })

    const enResult = generateProjectMetadata(project, 'en')
    const jaResult = generateProjectMetadata(project, 'ja')

    expect(enResult.alternates?.canonical).toBe('https://hidetaka.dev/work/my-project')
    expect(enResult.openGraph?.url).toBe('https://hidetaka.dev/work/my-project')
    expect(enResult.openGraph?.locale).toBe('en_US')
    expect(enResult.openGraph?.siteName).toBe('Hidetaka.dev')
    expect(jaResult.alternates?.canonical).toBe('https://hidetaka.dev/ja/work/my-project')
    expect(jaResult.openGraph?.url).toBe('https://hidetaka.dev/ja/work/my-project')
    expect(jaResult.openGraph?.locale).toBe('ja_JP')
    expect(jaResult.alternates?.languages).toEqual({
      en: 'https://hidetaka.dev/work/my-project',
      ja: 'https://hidetaka.dev/ja/work/my-project',
      'x-default': 'https://hidetaka.dev/work/my-project',
    })
  })
})
