import type { MicroCMSProjectsRecord } from './types'

export const MICROCMS_MOCK_OSS_PROJECTS: MicroCMSProjectsRecord[] = [
  {
    id: 'wordpress-skills-oss',
    createdAt: '2026-06-02T00:00:00.000Z',
    updatedAt: '2026-06-02T00:00:00.000Z',
    publishedAt: '2026-06-02T00:00:00.000Z',
    revisedAt: '2026-06-02T00:00:00.000Z',
    title: 'wordpress-skills',
    url: 'https://hidetaka.dev/work/wordpress-skills',
    published_at: '2026-06-02T00:00:00.000Z',
    tags: ['WordPress', 'AI', 'Claude Code', 'Agent Skills', 'Cloudflare Workers', 'Python'],
    project_type: ['owned_oss'],
    lang: ['English'],
    is_solo: true,
    status: 'active',
    about:
      'Agent Skills that give AI coding agents primary-source grounding for WordPress development. Instead of generating code from memory, the agent searches and reads official WordPress Developer Handbooks at request time.',
  },
]

export const MICROCMS_MOCK_BOOKs: MicroCMSProjectsRecord[] = [
  {
    id: '48xxv5o8vt8j',
    createdAt: '2022-05-13T13:54:45.272Z',
    updatedAt: '2022-05-13T13:58:55.375Z',
    publishedAt: '2022-05-13T13:54:45.272Z',
    revisedAt: '2022-05-13T13:58:55.375Z',
    title: 'Stripe CLIの本',
    url: 'https://zenn.dev/hideokamoto/books/e961b4bad92429',
    published_at: '2021-03-15T00:00:00.000Z',
    tags: ['Stripe'],
    project_type: ['books'],
    image: {
      url: 'https://images.microcms-assets.io/assets/84260f8928d947c88c6b769034e42e36/1d23bd3e52e44eeeb2e128b7d3186d0a/e4d9851d37.jpeg',
      height: 700,
      width: 500,
    },
    lang: ['Japanese'],
    is_solo: true,
    status: 'active',
  },
  {
    id: 'iutgcn7l3ad',
    createdAt: '2022-05-13T13:55:29.912Z',
    updatedAt: '2022-05-13T13:59:37.166Z',
    publishedAt: '2022-05-13T13:55:29.912Z',
    revisedAt: '2022-05-13T13:59:37.166Z',
    title: 'NestJSとStripe Checkoutで簡易的な商品注文ページをフルスクラッチしてみよう',
    url: 'https://zenn.dev/hideokamoto/books/d36d61c56b5d25',
    published_at: '2021-06-05T00:00:00.000Z',
    tags: ['Stripe'],
    project_type: ['books'],
    image: {
      url: 'https://images.microcms-assets.io/assets/84260f8928d947c88c6b769034e42e36/76cb8ac28672486ab5ea9a362f17c7e9/6d6bcbd850.jpeg',
      height: 700,
      width: 500,
    },
    lang: ['Japanese'],
    is_solo: true,
    status: 'deprecated',
  },
]
