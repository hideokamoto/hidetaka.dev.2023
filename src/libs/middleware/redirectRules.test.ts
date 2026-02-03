import { describe, expect, it } from 'vitest'
import {
  createRedirectRules,
  DevNotesExclusionRedirectRule,
  LegacyPathRedirectRule,
  type RedirectRule,
  RedirectRuleEngine,
} from './redirectRules'

describe('RedirectRuleEngine', () => {
  describe('shouldRedirect', () => {
    it('パスがルールにマッチする場合はtrueを返す', () => {
      const rule: RedirectRule = {
        shouldRedirect: (pathname) => pathname === '/old-path',
        getRedirectPath: (_pathname, _baseUrl) => '/new-path',
      }
      const engine = new RedirectRuleEngine([rule])
      const result = engine.shouldRedirect('/old-path', 'https://example.com')
      expect(result).toBe(true)
    })

    it('パスがルールにマッチしない場合はfalseを返す', () => {
      const rule: RedirectRule = {
        shouldRedirect: (pathname) => pathname === '/old-path',
        getRedirectPath: (_pathname, _baseUrl) => '/new-path',
      }
      const engine = new RedirectRuleEngine([rule])
      const result = engine.shouldRedirect('/other-path', 'https://example.com')
      expect(result).toBe(false)
    })

    it('複数のルールがある場合、最初にマッチしたルールを使用する', () => {
      const rule1: RedirectRule = {
        shouldRedirect: (pathname) => pathname.startsWith('/a'),
        getRedirectPath: (_pathname, _baseUrl) => '/a-redirect',
      }
      const rule2: RedirectRule = {
        shouldRedirect: (pathname) => pathname.startsWith('/ab'),
        getRedirectPath: (_pathname, _baseUrl) => '/ab-redirect',
      }
      const engine = new RedirectRuleEngine([rule1, rule2])
      const result = engine.shouldRedirect('/abc', 'https://example.com')
      expect(result).toBe(true)
    })

    it('リダイレクト先のパスを正しく取得できる', () => {
      const rule: RedirectRule = {
        shouldRedirect: (pathname) => pathname === '/old-path',
        getRedirectPath: (_pathname, baseUrl) => `${baseUrl}/new-path`,
      }
      const engine = new RedirectRuleEngine([rule])
      const result = engine.getRedirectPath('/old-path', 'https://example.com')
      expect(result).toBe('https://example.com/new-path')
    })

    it('マッチするルールがない場合はエラーをスローする', () => {
      const rule: RedirectRule = {
        shouldRedirect: (pathname) => pathname === '/old-path',
        getRedirectPath: (_pathname, baseUrl) => `${baseUrl}/new-path`,
      }
      const engine = new RedirectRuleEngine([rule])
      expect(() => {
        engine.getRedirectPath('/non-matching-path', 'https://example.com')
      }).toThrow('No matching rule found for pathname: /non-matching-path')
    })
  })
})

describe('LegacyPathRedirectRule', () => {
  describe('shouldRedirect', () => {
    it('/projects を /work にリダイレクトする', () => {
      const rule = new LegacyPathRedirectRule('/projects', '/work')
      expect(rule.shouldRedirect('/projects')).toBe(true)
      expect(rule.shouldRedirect('/projects/')).toBe(true)
      expect(rule.shouldRedirect('/projects/something')).toBe(true)
    })

    it('/ja/projects を /ja/work にリダイレクトする', () => {
      const rule = new LegacyPathRedirectRule('/ja/projects', '/ja/work')
      expect(rule.shouldRedirect('/ja/projects')).toBe(true)
      expect(rule.shouldRedirect('/ja/projects/')).toBe(true)
      expect(rule.shouldRedirect('/ja/projects/something')).toBe(true)
    })

    it('/oss を /work にリダイレクトする', () => {
      const rule = new LegacyPathRedirectRule('/oss', '/work')
      expect(rule.shouldRedirect('/oss')).toBe(true)
      expect(rule.shouldRedirect('/oss/')).toBe(true)
    })

    it('/articles を /writing にリダイレクトする', () => {
      const rule = new LegacyPathRedirectRule('/articles', '/writing')
      expect(rule.shouldRedirect('/articles')).toBe(true)
      expect(rule.shouldRedirect('/articles/')).toBe(true)
    })

    it('マッチしないパスはfalseを返す', () => {
      const rule = new LegacyPathRedirectRule('/projects', '/work')
      expect(rule.shouldRedirect('/other')).toBe(false)
      expect(rule.shouldRedirect('/project')).toBe(false)
    })

    it('getRedirectPathが正しいパスを返す', () => {
      const rule = new LegacyPathRedirectRule('/projects', '/work')
      expect(rule.getRedirectPath('/projects', 'https://example.com')).toBe(
        'https://example.com/work',
      )
      expect(rule.getRedirectPath('/projects/something', 'https://example.com')).toBe(
        'https://example.com/work/something',
      )
    })
  })
})

describe('DevNotesExclusionRedirectRule', () => {
  describe('shouldRedirect', () => {
    it('/writing/[id] を /news にリダイレクトする', () => {
      const rule = new DevNotesExclusionRedirectRule('/writing/', '/news/')
      expect(rule.shouldRedirect('/writing/old-post')).toBe(true)
      expect(rule.shouldRedirect('/writing/something')).toBe(true)
    })

    it('/writing/ 自体はリダイレクトしない', () => {
      const rule = new DevNotesExclusionRedirectRule('/writing/', '/news/')
      expect(rule.shouldRedirect('/writing/')).toBe(false)
    })

    it('/writing/dev-notes で始まるパスはリダイレクトしない（末尾スラッシュなし）', () => {
      const rule = new DevNotesExclusionRedirectRule('/writing/', '/news/')
      expect(rule.shouldRedirect('/writing/dev-notes')).toBe(false)
    })

    it('/writing/dev-notes/ で始まるパスはリダイレクトしない', () => {
      const rule = new DevNotesExclusionRedirectRule('/writing/', '/news/')
      expect(rule.shouldRedirect('/writing/dev-notes/')).toBe(false)
      expect(rule.shouldRedirect('/writing/dev-notes/some-slug')).toBe(false)
    })

    it('/ja/writing/[id] を /ja/news/ にリダイレクトする', () => {
      const rule = new DevNotesExclusionRedirectRule('/ja/writing/', '/ja/news/')
      expect(rule.shouldRedirect('/ja/writing/old-post')).toBe(true)
      expect(rule.shouldRedirect('/ja/writing/something')).toBe(true)
    })

    it('/ja/writing/ 自体はリダイレクトしない', () => {
      const rule = new DevNotesExclusionRedirectRule('/ja/writing/', '/ja/news/')
      expect(rule.shouldRedirect('/ja/writing/')).toBe(false)
    })

    it('/ja/writing/dev-notes で始まるパスはリダイレクトしない（末尾スラッシュなし）', () => {
      const rule = new DevNotesExclusionRedirectRule('/ja/writing/', '/ja/news/')
      expect(rule.shouldRedirect('/ja/writing/dev-notes')).toBe(false)
    })

    it('/ja/writing/dev-notes/ で始まるパスはリダイレクトしない', () => {
      const rule = new DevNotesExclusionRedirectRule('/ja/writing/', '/ja/news/')
      expect(rule.shouldRedirect('/ja/writing/dev-notes/')).toBe(false)
      expect(rule.shouldRedirect('/ja/writing/dev-notes/some-slug')).toBe(false)
    })

    it('getRedirectPathが正しいパスを返す', () => {
      const rule = new DevNotesExclusionRedirectRule('/writing/', '/news/')
      expect(rule.getRedirectPath('/writing/old-post', 'https://example.com')).toBe(
        'https://example.com/news/',
      )
    })
  })
})

describe('統合テスト: 実際のmiddlewareのルール', () => {
  it('dev-notesのパスはリダイレクトされない', () => {
    const rules: RedirectRule[] = [
      new LegacyPathRedirectRule('/projects', '/work'),
      new LegacyPathRedirectRule('/ja/projects', '/ja/work'),
      new LegacyPathRedirectRule('/oss', '/work'),
      new LegacyPathRedirectRule('/ja/oss', '/ja/work'),
      new LegacyPathRedirectRule('/articles', '/writing'),
      new LegacyPathRedirectRule('/ja/articles', '/ja/writing'),
      new DevNotesExclusionRedirectRule('/writing/', '/news/'),
      new DevNotesExclusionRedirectRule('/ja/writing/', '/ja/news/'),
    ]

    const engine = new RedirectRuleEngine(rules)

    // dev-notesはリダイレクトされない
    expect(engine.shouldRedirect('/ja/writing/dev-notes/some-slug', 'https://hidetaka.dev')).toBe(
      false,
    )
    expect(engine.shouldRedirect('/ja/writing/dev-notes/', 'https://hidetaka.dev')).toBe(false)
    expect(engine.shouldRedirect('/ja/writing/dev-notes', 'https://hidetaka.dev')).toBe(false)
    expect(engine.shouldRedirect('/writing/dev-notes/some-slug', 'https://hidetaka.dev')).toBe(
      false,
    )
    expect(engine.shouldRedirect('/writing/dev-notes/', 'https://hidetaka.dev')).toBe(false)
    expect(engine.shouldRedirect('/writing/dev-notes', 'https://hidetaka.dev')).toBe(false)

    // 他のwritingパスはリダイレクトされる
    expect(engine.shouldRedirect('/ja/writing/old-post', 'https://hidetaka.dev')).toBe(true)
    expect(engine.shouldRedirect('/writing/old-post', 'https://hidetaka.dev')).toBe(true)

    // 他のルールも動作する
    expect(engine.shouldRedirect('/projects', 'https://hidetaka.dev')).toBe(true)
    expect(engine.shouldRedirect('/ja/projects', 'https://hidetaka.dev')).toBe(true)
  })
})

describe('createRedirectRules', () => {
  it('すべてのリダイレクトルールを正しく生成する', () => {
    const rules = createRedirectRules()
    expect(rules).toHaveLength(8)
    expect(rules[0]).toBeInstanceOf(LegacyPathRedirectRule)
    expect(rules[6]).toBeInstanceOf(DevNotesExclusionRedirectRule)
  })

  it('生成されたルールが正しく動作する', () => {
    const rules = createRedirectRules()
    const engine = new RedirectRuleEngine(rules)

    // レガシーパスのリダイレクト
    expect(engine.shouldRedirect('/projects', 'https://hidetaka.dev')).toBe(true)
    expect(engine.shouldRedirect('/ja/projects', 'https://hidetaka.dev')).toBe(true)
    expect(engine.shouldRedirect('/oss', 'https://hidetaka.dev')).toBe(true)
    expect(engine.shouldRedirect('/ja/oss', 'https://hidetaka.dev')).toBe(true)
    expect(engine.shouldRedirect('/articles', 'https://hidetaka.dev')).toBe(true)
    expect(engine.shouldRedirect('/ja/articles', 'https://hidetaka.dev')).toBe(true)

    // dev-notesは除外される
    expect(engine.shouldRedirect('/writing/dev-notes', 'https://hidetaka.dev')).toBe(false)
    expect(engine.shouldRedirect('/writing/dev-notes/', 'https://hidetaka.dev')).toBe(false)
    expect(engine.shouldRedirect('/writing/dev-notes/test', 'https://hidetaka.dev')).toBe(false)
    expect(engine.shouldRedirect('/ja/writing/dev-notes', 'https://hidetaka.dev')).toBe(false)
    expect(engine.shouldRedirect('/ja/writing/dev-notes/', 'https://hidetaka.dev')).toBe(false)
    expect(engine.shouldRedirect('/ja/writing/dev-notes/test', 'https://hidetaka.dev')).toBe(false)

    // 他のwritingパスはリダイレクトされる
    expect(engine.shouldRedirect('/writing/old-post', 'https://hidetaka.dev')).toBe(true)
    expect(engine.shouldRedirect('/ja/writing/old-post', 'https://hidetaka.dev')).toBe(true)
  })
})
