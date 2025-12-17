import { describe, expect, it } from 'vitest'
import type { BlogItem, WPThought } from './dataSources/types'
import {
  generateBlogBreadcrumbJsonLd,
  generateBlogListJsonLd,
  generateBlogPostingJsonLd,
  generateDevNoteBreadcrumbJsonLd,
  generateDevNoteJsonLd,
} from './jsonLd'

// テスト用のモックデータファクトリ
const createMockWPThought = (overrides: Partial<WPThought> = {}): WPThought => ({
  id: 123,
  title: { rendered: 'Test Blog Post Title' },
  date: '2024-06-15T10:00:00',
  date_gmt: '2024-06-15T01:00:00',
  modified: '2024-06-20T12:00:00',
  modified_gmt: '2024-06-20T03:00:00',
  excerpt: { rendered: '<p>This is a test excerpt with <strong>HTML</strong> tags.</p>' },
  content: { rendered: '<p>Full content here</p>' },
  link: 'https://example.com/test-post',
  slug: 'test-post',
  ...overrides,
})

const createMockBlogItem = (overrides: Partial<BlogItem> = {}): BlogItem => ({
  id: '1',
  title: 'Blog Item Title',
  href: '/blog/test-item',
  description: 'Test description',
  datetime: '2024-06-15',
  ...overrides,
})

describe('generateBlogPostingJsonLd', () => {
  it('should generate valid BlogPosting JSON-LD structure', () => {
    const thought = createMockWPThought()
    const result = generateBlogPostingJsonLd(thought, 'en', '/blog')

    expect(result['@context']).toBe('https://schema.org')
    expect(result['@type']).toBe('BlogPosting')
    expect(result.headline).toBe('Test Blog Post Title')
    expect(result.datePublished).toBe('2024-06-15T10:00:00')
    expect(result.dateModified).toBe('2024-06-20T12:00:00')
  })

  it('should strip HTML tags from description', () => {
    const thought = createMockWPThought({
      excerpt: { rendered: '<p>Plain <strong>text</strong> here.</p>' },
    })
    const result = generateBlogPostingJsonLd(thought, 'en', '/blog')

    expect(result.description).toBe('Plain text here.')
  })

  it('should generate correct URL from basePath and slug', () => {
    const thought = createMockWPThought({ slug: 'my-awesome-post' })
    const result = generateBlogPostingJsonLd(thought, 'en', '/blog')

    expect(result.url).toBe('https://hidetaka.dev/blog/my-awesome-post')
    expect(result.mainEntityOfPage['@id']).toBe('https://hidetaka.dev/blog/my-awesome-post')
  })

  it('should set inLanguage to ja-JP for Japanese', () => {
    const thought = createMockWPThought()
    const result = generateBlogPostingJsonLd(thought, 'ja', '/ja/blog')

    expect(result.inLanguage).toBe('ja-JP')
  })

  it('should set inLanguage to en-US for English', () => {
    const thought = createMockWPThought()
    const result = generateBlogPostingJsonLd(thought, 'en', '/blog')

    expect(result.inLanguage).toBe('en-US')
  })

  it('should include categories as keywords when present', () => {
    const thought = createMockWPThought({
      _embedded: {
        'wp:term': [
          [
            { id: 1, name: 'Technology', slug: 'technology', taxonomy: 'category' },
            { id: 2, name: 'Programming', slug: 'programming', taxonomy: 'category' },
          ],
        ],
      },
    })
    const result = generateBlogPostingJsonLd(thought, 'en', '/blog')

    expect(result.keywords).toBe('Technology, Programming')
    expect(result.articleSection).toEqual(['Technology', 'Programming'])
  })

  it('should not include keywords when no categories', () => {
    const thought = createMockWPThought()
    const result = generateBlogPostingJsonLd(thought, 'en', '/blog')

    expect(result.keywords).toBeUndefined()
    expect(result.articleSection).toBeUndefined()
  })

  it('should filter out non-category terms', () => {
    const thought = createMockWPThought({
      _embedded: {
        'wp:term': [
          [
            { id: 1, name: 'Technology', slug: 'technology', taxonomy: 'category' },
            { id: 2, name: 'featured', slug: 'featured', taxonomy: 'post_tag' },
          ],
        ],
      },
    })
    const result = generateBlogPostingJsonLd(thought, 'en', '/blog')

    expect(result.keywords).toBe('Technology')
    expect(result.articleSection).toEqual(['Technology'])
  })

  it('should include author and publisher information', () => {
    const thought = createMockWPThought()
    const result = generateBlogPostingJsonLd(thought, 'en', '/blog')

    expect(result.author['@type']).toBe('Person')
    expect(result.author.name).toBe('Hidetaka Okamoto')
    expect(result.publisher['@type']).toBe('Organization')
    expect(result.publisher.name).toBe('Hidetaka.dev')
  })
})

describe('generateDevNoteJsonLd', () => {
  it('should generate valid BlogPosting JSON-LD for dev note', () => {
    const note = createMockWPThought({ slug: 'dev-note-1' })
    const result = generateDevNoteJsonLd(note, '/ja/writing/dev-notes')

    expect(result['@context']).toBe('https://schema.org')
    expect(result['@type']).toBe('BlogPosting')
    expect(result.url).toBe('https://hidetaka.dev/ja/writing/dev-notes/dev-note-1')
  })

  it('should always set inLanguage to ja-JP', () => {
    const note = createMockWPThought()
    const result = generateDevNoteJsonLd(note, '/ja/writing/dev-notes')

    expect(result.inLanguage).toBe('ja-JP')
  })

  it('should strip HTML from description', () => {
    const note = createMockWPThought({
      excerpt: { rendered: '<div>Note <em>excerpt</em></div>' },
    })
    const result = generateDevNoteJsonLd(note, '/ja/writing/dev-notes')

    expect(result.description).toBe('Note excerpt')
  })

  it('should include categories when present', () => {
    const note = createMockWPThought({
      _embedded: {
        'wp:term': [[{ id: 1, name: 'JavaScript', slug: 'javascript', taxonomy: 'category' }]],
      },
    })
    const result = generateDevNoteJsonLd(note, '/ja/writing/dev-notes')

    expect(result.keywords).toBe('JavaScript')
  })
})

describe('generateDevNoteBreadcrumbJsonLd', () => {
  it('should generate valid BreadcrumbList JSON-LD', () => {
    const note = createMockWPThought({ slug: 'my-note', title: { rendered: 'My Note Title' } })
    const result = generateDevNoteBreadcrumbJsonLd(note, '/ja/writing/dev-notes')

    expect(result['@context']).toBe('https://schema.org')
    expect(result['@type']).toBe('BreadcrumbList')
  })

  it('should have Writing as first breadcrumb item', () => {
    const note = createMockWPThought()
    const result = generateDevNoteBreadcrumbJsonLd(note, '/ja/writing/dev-notes')

    expect(result.itemListElement[0].position).toBe(1)
    expect(result.itemListElement[0].name).toBe('Writing')
    expect(result.itemListElement[0].item).toBe('https://hidetaka.dev/ja/writing')
  })

  it('should have note title as second breadcrumb item', () => {
    const note = createMockWPThought({
      slug: 'test-note',
      title: { rendered: 'Test Note' },
    })
    const result = generateDevNoteBreadcrumbJsonLd(note, '/ja/writing/dev-notes')

    expect(result.itemListElement[1].position).toBe(2)
    expect(result.itemListElement[1].name).toBe('Test Note')
    expect(result.itemListElement[1].item).toBe(
      'https://hidetaka.dev/ja/writing/dev-notes/test-note',
    )
  })
})

describe('generateBlogBreadcrumbJsonLd', () => {
  it('should generate valid BreadcrumbList JSON-LD', () => {
    const thought = createMockWPThought()
    const result = generateBlogBreadcrumbJsonLd(thought, 'en', '/blog')

    expect(result['@context']).toBe('https://schema.org')
    expect(result['@type']).toBe('BreadcrumbList')
    expect(result.itemListElement).toHaveLength(2)
  })

  it('should use "Blog" label for English', () => {
    const thought = createMockWPThought()
    const result = generateBlogBreadcrumbJsonLd(thought, 'en', '/blog')

    expect(result.itemListElement[0].name).toBe('Blog')
  })

  it('should use Japanese label for Japanese', () => {
    const thought = createMockWPThought()
    const result = generateBlogBreadcrumbJsonLd(thought, 'ja', '/ja/blog')

    expect(result.itemListElement[0].name).toBe('ブログ')
  })

  it('should generate correct URLs', () => {
    const thought = createMockWPThought({ slug: 'post-slug' })
    const result = generateBlogBreadcrumbJsonLd(thought, 'en', '/blog')

    expect(result.itemListElement[0].item).toBe('https://hidetaka.dev/blog')
    expect(result.itemListElement[1].item).toBe('https://hidetaka.dev/blog/post-slug')
  })
})

describe('generateBlogListJsonLd', () => {
  it('should generate valid CollectionPage JSON-LD', () => {
    const items: BlogItem[] = [createMockBlogItem()]
    const result = generateBlogListJsonLd(items, 'en', '/blog', 1, 5)

    expect(result['@context']).toBe('https://schema.org')
    expect(result['@type']).toBe('CollectionPage')
  })

  it('should use correct title for English', () => {
    const items: BlogItem[] = []
    const result = generateBlogListJsonLd(items, 'en', '/blog', 1, 1)

    expect(result.name).toBe('Blog')
  })

  it('should use correct title for Japanese', () => {
    const items: BlogItem[] = []
    const result = generateBlogListJsonLd(items, 'ja', '/ja/blog', 1, 1)

    expect(result.name).toBe('ブログ')
  })

  it('should include category name in title when provided', () => {
    const items: BlogItem[] = []
    const result = generateBlogListJsonLd(items, 'en', '/blog', 1, 1, 'Technology')

    expect(result.name).toBe('Category: Technology')
  })

  it('should include Japanese category title', () => {
    const items: BlogItem[] = []
    const result = generateBlogListJsonLd(items, 'ja', '/ja/blog', 1, 1, 'テクノロジー')

    expect(result.name).toBe('カテゴリ: テクノロジー')
  })

  it('should generate ItemList with correct positions', () => {
    const items: BlogItem[] = [
      createMockBlogItem({ id: '1', title: 'First', href: '/blog/first' }),
      createMockBlogItem({ id: '2', title: 'Second', href: '/blog/second' }),
      createMockBlogItem({ id: '3', title: 'Third', href: '/blog/third' }),
    ]
    const result = generateBlogListJsonLd(items, 'en', '/blog', 1, 1)

    expect(result.mainEntity.numberOfItems).toBe(items.length)
    result.mainEntity.itemListElement.forEach((element, index) => {
      expect(element.position).toBe(index + 1)
    })
  })

  it('should generate correct URLs for list items', () => {
    const items: BlogItem[] = [createMockBlogItem({ href: '/blog/my-post', title: 'My Post' })]
    const result = generateBlogListJsonLd(items, 'en', '/blog', 1, 1)

    expect(result.mainEntity.itemListElement[0].url).toBe('https://hidetaka.dev/blog/my-post')
    expect(result.mainEntity.itemListElement[0].name).toBe('My Post')
  })

  it('should handle pagination in URL', () => {
    const items: BlogItem[] = []
    const resultPage1 = generateBlogListJsonLd(items, 'en', '/blog', 1, 5)
    const resultPage2 = generateBlogListJsonLd(items, 'en', '/blog', 2, 5)

    expect(resultPage1.url).toBe('https://hidetaka.dev/blog')
    expect(resultPage2.url).toBe('https://hidetaka.dev/blog/page/2')
  })

  it('should set correct inLanguage', () => {
    const items: BlogItem[] = []
    const resultEn = generateBlogListJsonLd(items, 'en', '/blog', 1, 1)
    const resultJa = generateBlogListJsonLd(items, 'ja', '/ja/blog', 1, 1)

    expect(resultEn.inLanguage).toBe('en-US')
    expect(resultJa.inLanguage).toBe('ja-JP')
  })

  it('should include description based on language and category', () => {
    const items: BlogItem[] = []
    const resultEn = generateBlogListJsonLd(items, 'en', '/blog', 1, 1)
    const resultJa = generateBlogListJsonLd(items, 'ja', '/ja/blog', 1, 1)
    const resultWithCategory = generateBlogListJsonLd(items, 'en', '/blog', 1, 1, 'Tech')

    expect(resultEn.description).toContain('non-technical topics')
    expect(resultJa.description).toContain('技術的ではないトピック')
    expect(resultWithCategory.description).toContain('Tech')
  })

  it('should handle empty items array', () => {
    const result = generateBlogListJsonLd([], 'en', '/blog', 1, 1)

    expect(result.mainEntity.numberOfItems).toBe(0)
    expect(result.mainEntity.itemListElement).toEqual([])
  })
})
