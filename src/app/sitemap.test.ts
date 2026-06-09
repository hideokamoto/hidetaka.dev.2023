import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SITE_CONFIG } from '@/config'
import { createRedirectRules } from '@/libs/middleware/redirectRules'

// 外部データ取得をモック化し、静的ルートとプロジェクトパス生成の検証に集中する
vi.mock('@/libs/dataSources/thoughts', () => ({
  loadAllThoughts: vi.fn().mockResolvedValue([]),
}))
vi.mock('@/libs/dataSources/products', () => ({
  loadAllProducts: vi.fn().mockResolvedValue([]),
}))
vi.mock('@/libs/dataSources/devnotes', () => ({
  loadAllDevNotes: vi.fn().mockResolvedValue([]),
}))
vi.mock('@/libs/microCMS/client', () => ({
  createMicroCMSClient: vi.fn().mockReturnValue({}),
}))
vi.mock('@/libs/microCMS/apis', () => ({
  MicroCMSAPI: class {
    listAllProjects() {
      return Promise.resolve([{ id: 'sample-project', updatedAt: '2025-01-01T00:00:00.000Z' }])
    }
  },
}))

import sitemap from './sitemap'

describe('sitemap', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('リダイレクト対象のレガシーURLを含まない', async () => {
    const entries = await sitemap()
    const pathnames = entries.map((entry) => entry.url.replace(SITE_CONFIG.url, ''))

    const forbidden = ['/articles', '/oss', '/projects', '/ja/articles', '/ja/oss', '/ja/projects']
    for (const path of forbidden) {
      expect(pathnames).not.toContain(path)
      // 配下のパス（例: /projects/xxx）も含まないこと
      expect(pathnames.some((p) => p === path || p.startsWith(`${path}/`))).toBe(false)
    }
  })

  it('sitemapが返す全URLがどのリダイレクトルールにもマッチしない', async () => {
    const entries = await sitemap()
    const rules = createRedirectRules()

    const matched = entries
      .map((entry) => entry.url.replace(SITE_CONFIG.url, ''))
      .filter((pathname) => rules.some((rule) => rule.shouldRedirect(pathname)))

    expect(matched).toEqual([])
  })

  it('リダイレクトされない正規の静的URLは維持する', async () => {
    const entries = await sitemap()
    const pathnames = entries.map((entry) => entry.url.replace(SITE_CONFIG.url, ''))

    const expected = [
      '',
      '/about',
      '/blog',
      '/news',
      '/speaking',
      '/work',
      '/writing',
      '/ja',
      '/ja/about',
      '/ja/blog',
      '/ja/news',
      '/ja/speaking',
      '/ja/work',
      '/ja/writing',
    ]
    for (const path of expected) {
      expect(pathnames).toContain(path)
    }
  })

  it('プロジェクトページは /work と /ja/work のみに生成される', async () => {
    const entries = await sitemap()
    const pathnames = entries.map((entry) => entry.url.replace(SITE_CONFIG.url, ''))

    expect(pathnames).toContain('/work/sample-project')
    expect(pathnames).toContain('/ja/work/sample-project')
    expect(pathnames).not.toContain('/projects/sample-project')
    expect(pathnames).not.toContain('/ja/projects/sample-project')
  })
})
