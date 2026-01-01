import { describe, expect, it } from 'vitest'
import {
  createMarkdownRewriteRules,
  type MarkdownRewriteRule,
  MarkdownRewriteRuleEngine,
  RegexMarkdownRewriteRule,
} from './markdownRewriteRules'

describe('RegexMarkdownRewriteRule', () => {
  describe('blog pattern', () => {
    const rule = new RegexMarkdownRewriteRule(
      /^(\/ja)?\/blog\/(.+)\.md$/,
      '/api/markdown/blog/{slug}',
      true,
    )

    it('should match English blog path', () => {
      expect(rule.matches('/blog/test-post.md')).toBe(true)
    })

    it('should match Japanese blog path', () => {
      expect(rule.matches('/ja/blog/test-post.md')).toBe(true)
    })

    it('should not match non-blog path', () => {
      expect(rule.matches('/news/test.md')).toBe(false)
    })

    it('should rewrite English blog path correctly', () => {
      const result = rule.getRewritePath('/blog/test-post.md')
      expect(result.pathname).toBe('/api/markdown/blog/test-post')
      expect(result.searchParams).toBeUndefined()
    })

    it('should rewrite Japanese blog path correctly', () => {
      const result = rule.getRewritePath('/ja/blog/test-post.md')
      expect(result.pathname).toBe('/api/markdown/blog/test-post')
      expect(result.searchParams).toEqual({ lang: 'ja' })
    })
  })

  describe('dev-notes pattern', () => {
    const rule = new RegexMarkdownRewriteRule(
      /^(\/ja)?\/writing\/dev-notes\/(.+)\.md$/,
      '/api/markdown/dev-notes/{slug}',
      false,
    )

    it('should match English dev-notes path', () => {
      expect(rule.matches('/writing/dev-notes/test-note.md')).toBe(true)
    })

    it('should match Japanese dev-notes path', () => {
      expect(rule.matches('/ja/writing/dev-notes/test-note.md')).toBe(true)
    })

    it('should not match non-dev-notes path', () => {
      expect(rule.matches('/writing/other/test.md')).toBe(false)
    })

    it('should rewrite English dev-notes path correctly', () => {
      const result = rule.getRewritePath('/writing/dev-notes/test-note.md')
      expect(result.pathname).toBe('/api/markdown/dev-notes/test-note')
      expect(result.searchParams).toBeUndefined()
    })

    it('should rewrite Japanese dev-notes path correctly', () => {
      const result = rule.getRewritePath('/ja/writing/dev-notes/test-note.md')
      expect(result.pathname).toBe('/api/markdown/dev-notes/test-note')
      expect(result.searchParams).toBeUndefined()
    })
  })

  describe('news pattern', () => {
    const rule = new RegexMarkdownRewriteRule(
      /^(\/ja)?\/news\/(.+)\.md$/,
      '/api/markdown/news/{slug}',
      true,
    )

    it('should match English news path', () => {
      expect(rule.matches('/news/test-news.md')).toBe(true)
    })

    it('should match Japanese news path', () => {
      expect(rule.matches('/ja/news/test-news.md')).toBe(true)
    })

    it('should rewrite English news path correctly', () => {
      const result = rule.getRewritePath('/news/test-news.md')
      expect(result.pathname).toBe('/api/markdown/news/test-news')
      expect(result.searchParams).toBeUndefined()
    })

    it('should rewrite Japanese news path correctly', () => {
      const result = rule.getRewritePath('/ja/news/test-news.md')
      expect(result.pathname).toBe('/api/markdown/news/test-news')
      expect(result.searchParams).toEqual({ lang: 'ja' })
    })
  })
})

describe('MarkdownRewriteRuleEngine', () => {
  const rules = createMarkdownRewriteRules()
  const engine = new MarkdownRewriteRuleEngine(rules)

  describe('shouldRewrite', () => {
    it('should return true for blog paths', () => {
      expect(engine.shouldRewrite('/blog/test.md')).toBe(true)
      expect(engine.shouldRewrite('/ja/blog/test.md')).toBe(true)
    })

    it('should return true for dev-notes paths', () => {
      expect(engine.shouldRewrite('/writing/dev-notes/test.md')).toBe(true)
      expect(engine.shouldRewrite('/ja/writing/dev-notes/test.md')).toBe(true)
    })

    it('should return true for news paths', () => {
      expect(engine.shouldRewrite('/news/test.md')).toBe(true)
      expect(engine.shouldRewrite('/ja/news/test.md')).toBe(true)
    })

    it('should return false for non-matching paths', () => {
      expect(engine.shouldRewrite('/about.md')).toBe(false)
      expect(engine.shouldRewrite('/blog/test.html')).toBe(false)
    })
  })

  describe('getRewritePath', () => {
    it('should rewrite blog paths correctly', () => {
      const result = engine.getRewritePath('/blog/my-post.md')
      expect(result.pathname).toBe('/api/markdown/blog/my-post')
    })

    it('should rewrite Japanese blog paths with lang param', () => {
      const result = engine.getRewritePath('/ja/blog/my-post.md')
      expect(result.pathname).toBe('/api/markdown/blog/my-post')
      expect(result.searchParams).toEqual({ lang: 'ja' })
    })

    it('should rewrite dev-notes paths correctly', () => {
      const result = engine.getRewritePath('/writing/dev-notes/my-note.md')
      expect(result.pathname).toBe('/api/markdown/dev-notes/my-note')
      expect(result.searchParams).toBeUndefined()
    })

    it('should rewrite Japanese dev-notes paths correctly', () => {
      const result = engine.getRewritePath('/ja/writing/dev-notes/my-note.md')
      expect(result.pathname).toBe('/api/markdown/dev-notes/my-note')
      expect(result.searchParams).toBeUndefined()
    })

    it('should rewrite news paths correctly', () => {
      const result = engine.getRewritePath('/news/my-news.md')
      expect(result.pathname).toBe('/api/markdown/news/my-news')
    })

    it('should rewrite Japanese news paths with lang param', () => {
      const result = engine.getRewritePath('/ja/news/my-news.md')
      expect(result.pathname).toBe('/api/markdown/news/my-news')
      expect(result.searchParams).toEqual({ lang: 'ja' })
    })

    it('should throw error for non-matching paths', () => {
      expect(() => engine.getRewritePath('/about.md')).toThrow()
    })
  })
})
