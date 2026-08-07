import { describe, expect, it } from 'vitest'
import type { BlogItem, WPThought } from './dataSources/types'
import {
  generateBlogBreadcrumbJsonLd,
  generateBlogListJsonLd,
  generateBlogPostingJsonLd,
  generateDevNoteBreadcrumbJsonLd,
  generateDevNoteJsonLd,
  generatePersonJsonLd,
} from './jsonLd'
import type { Profile } from './profile/types'

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

  it.each([
    ['ja', '/ja/blog', 'ja-JP'],
    ['en', '/blog', 'en-US'],
  ])('should set inLanguage to %s for %s', (lang, basePath, expectedLanguage) => {
    const thought = createMockWPThought()
    const result = generateBlogPostingJsonLd(thought, lang, basePath)

    expect(result.inLanguage).toBe(expectedLanguage)
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

  it.each([
    ['en', '/blog', 'Blog'],
    ['ja', '/ja/blog', 'ブログ'],
  ])('should use correct label for %s', (lang, basePath, expectedLabel) => {
    const thought = createMockWPThought()
    const result = generateBlogBreadcrumbJsonLd(thought, lang, basePath)

    expect(result.itemListElement[0].name).toBe(expectedLabel)
  })

  it('should generate correct URLs', () => {
    const thought = createMockWPThought({ slug: 'post-slug' })
    const result = generateBlogBreadcrumbJsonLd(thought, 'en', '/blog')

    expect(result.itemListElement[0].item).toBe('https://hidetaka.dev/blog')
    expect(result.itemListElement[1].item).toBe('https://hidetaka.dev/blog/post-slug')
  })
})

describe('generateBlogListJsonLd', () => {
  const emptyItems: BlogItem[] = []

  it('should generate valid CollectionPage JSON-LD', () => {
    const items: BlogItem[] = [createMockBlogItem()]
    const result = generateBlogListJsonLd(items, 'en', '/blog', 1, 5)

    expect(result['@context']).toBe('https://schema.org')
    expect(result['@type']).toBe('CollectionPage')
  })

  it.each([
    ['en', '/blog', 'Blog'],
    ['ja', '/ja/blog', 'ブログ'],
  ])('should use correct title for %s', (lang, basePath, expectedTitle) => {
    const result = generateBlogListJsonLd(emptyItems, lang, basePath, 1, 1)

    expect(result.name).toBe(expectedTitle)
  })

  it('should include category name in title when provided', () => {
    const result = generateBlogListJsonLd(emptyItems, 'en', '/blog', 1, 1, 'Technology')

    expect(result.name).toBe('Category: Technology')
  })

  it('should include Japanese category title', () => {
    const result = generateBlogListJsonLd(emptyItems, 'ja', '/ja/blog', 1, 1, 'テクノロジー')

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
    const resultPage1 = generateBlogListJsonLd(emptyItems, 'en', '/blog', 1, 5)
    const resultPage2 = generateBlogListJsonLd(emptyItems, 'en', '/blog', 2, 5)

    expect(resultPage1.url).toBe('https://hidetaka.dev/blog')
    expect(resultPage2.url).toBe('https://hidetaka.dev/blog/page/2')
  })

  it.each([
    ['en', '/blog', 'en-US'],
    ['ja', '/ja/blog', 'ja-JP'],
  ])('should set correct inLanguage for %s', (lang, basePath, expectedLanguage) => {
    const result = generateBlogListJsonLd(emptyItems, lang, basePath, 1, 1)

    expect(result.inLanguage).toBe(expectedLanguage)
  })

  it('should include description based on language and category', () => {
    const resultEn = generateBlogListJsonLd(emptyItems, 'en', '/blog', 1, 1)
    const resultJa = generateBlogListJsonLd(emptyItems, 'ja', '/ja/blog', 1, 1)
    const resultWithCategory = generateBlogListJsonLd(emptyItems, 'en', '/blog', 1, 1, 'Tech')

    expect(resultEn.description).toContain('non-technical topics')
    expect(resultJa.description).toContain('技術的ではないトピック')
    expect(resultWithCategory.description).toContain('Tech')
  })

  it('should handle empty items array', () => {
    const result = generateBlogListJsonLd(emptyItems, 'en', '/blog', 1, 1)

    expect(result.mainEntity.numberOfItems).toBe(0)
    expect(result.mainEntity.itemListElement).toEqual([])
  })
})

describe('generatePersonJsonLd', () => {
  // 上流 profile-as-a-service が返す Person を parse した後の形。
  const PROFILE: Profile = {
    name: 'Hidetaka Okamoto',
    jobTitle: 'Senior Field Engineer',
    description: 'Senior Field Engineer at CircleCI (JAPAC), ex-Stripe Developer Advocate.',
    image: 'https://gravatar.com/avatar/abc123',
    url: 'https://example.cloudfront.net/p/hidetaka/en/',
    sameAs: [
      'https://github.com/hideokamoto',
      'https://twitter.com/hidetaka_dev',
      'https://www.linkedin.com/in/hideokamoto/',
      'https://wp-kyoto.net/',
      'https://hidetaka.dev',
    ],
    social: [],
    worksFor: { name: 'CircleCI' },
    knowsAbout: ['TypeScript', 'AWS', 'Stripe'],
    awards: ['AWS Samurai 2017', 'Alexa Champion'],
  }

  it('should generate valid Person JSON-LD structure', () => {
    const result = generatePersonJsonLd(PROFILE)

    expect(result['@context']).toBe('https://schema.org')
    expect(result['@type']).toBe('Person')
  })

  it('should take name from the upstream profile', () => {
    expect(generatePersonJsonLd(PROFILE).name).toBe('Hidetaka Okamoto')
  })

  it('should include the other language name as alternateName when supplied', () => {
    expect(generatePersonJsonLd(PROFILE, '岡本 秀高').alternateName).toBe('岡本 秀高')
  })

  it('should omit alternateName when no other language name is supplied', () => {
    expect(generatePersonJsonLd(PROFILE)).not.toHaveProperty('alternateName')
  })

  it('should keep the site URL as the canonical url, not the upstream one', () => {
    // 上流の url は CloudFront 上の正規URL。人物の代表URLをCDNドメインにしてはいけない。
    expect(generatePersonJsonLd(PROFILE).url).toBe('https://hidetaka.dev')
  })

  it('should keep the site-owned absolute image URL, not the upstream avatar', () => {
    expect(generatePersonJsonLd(PROFILE).image).toBe('https://hidetaka.dev/images/profile.jpg')
  })

  it('should take jobTitle from the upstream profile', () => {
    expect(generatePersonJsonLd(PROFILE).jobTitle).toBe('Senior Field Engineer')
  })

  it('should include description from the upstream profile', () => {
    expect(generatePersonJsonLd(PROFILE).description).toContain('CircleCI')
  })

  it('should include worksFor as an Organization object', () => {
    const result = generatePersonJsonLd(PROFILE)

    expect(result.worksFor).toBeDefined()
    expect(result.worksFor?.['@type']).toBe('Organization')
    expect(result.worksFor?.name).toBe('CircleCI')
  })

  it('should supplement the organization URL when the org name still matches SITE_CONFIG', () => {
    // 上流の JSON Resume は組織URLを持たないので SITE_CONFIG から補う。
    expect(generatePersonJsonLd(PROFILE).worksFor?.url).toBe('https://circleci.com/')
  })

  it('should NOT attach the old employer URL after a job change', () => {
    const moved = { ...PROFILE, worksFor: { name: 'Some Other Company' } }

    const result = generatePersonJsonLd(moved)

    expect(result.worksFor?.name).toBe('Some Other Company')
    expect(result.worksFor).not.toHaveProperty('url')
  })

  it('should include sameAs array with social profile URLs', () => {
    const result = generatePersonJsonLd(PROFILE)

    expect(Array.isArray(result.sameAs)).toBe(true)
    expect(result.sameAs).toContain('https://twitter.com/hidetaka_dev')
    expect(result.sameAs).toContain('https://github.com/hideokamoto')
    expect(result.sameAs).toContain('https://www.linkedin.com/in/hideokamoto/')
    expect(result.sameAs).toContain('https://wp-kyoto.net/')
  })

  it('should drop the site own URL from sameAs (it is already the url field)', () => {
    const result = generatePersonJsonLd(PROFILE)

    expect(result.sameAs).not.toContain('https://hidetaka.dev')
    expect(result.sameAs).toHaveLength(4)
  })

  it('should include knowsAbout from the upstream skills, not a hardcoded list', () => {
    expect(generatePersonJsonLd(PROFILE).knowsAbout).toEqual(['TypeScript', 'AWS', 'Stripe'])
  })

  it('should include awards from the upstream profile', () => {
    expect(generatePersonJsonLd(PROFILE).award).toEqual(['AWS Samurai 2017', 'Alexa Champion'])
  })

  it('should omit optional fields the upstream profile does not carry', () => {
    const minimal: Profile = {
      name: 'Hidetaka Okamoto',
      sameAs: [],
      social: [],
      knowsAbout: [],
      awards: [],
    }

    const result = generatePersonJsonLd(minimal)

    expect(result).not.toHaveProperty('jobTitle')
    expect(result).not.toHaveProperty('description')
    expect(result).not.toHaveProperty('worksFor')
    expect(result).not.toHaveProperty('sameAs')
    expect(result).not.toHaveProperty('knowsAbout')
    expect(result).not.toHaveProperty('award')
    // 恒久的にサイトが持つ項目は残る。
    expect(result.name).toBe('Hidetaka Okamoto')
    expect(result.url).toBe('https://hidetaka.dev')
  })

  it('should have all required Person schema properties', () => {
    const result = generatePersonJsonLd(PROFILE, '岡本 秀高')

    expect(result).toHaveProperty('@context')
    expect(result).toHaveProperty('@type')
    expect(result).toHaveProperty('name')
    expect(result).toHaveProperty('url')
    expect(result).toHaveProperty('image')
    expect(result).toHaveProperty('jobTitle')
    expect(result).toHaveProperty('worksFor')
    expect(result).toHaveProperty('sameAs')
    expect(result).toHaveProperty('alternateName')
    expect(result).toHaveProperty('knowsAbout')
  })
})
