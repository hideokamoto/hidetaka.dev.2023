import type { MicroCMSProjectsRecord } from './types'

export const MICROCMS_MOCK_BOOKs: MicroCMSProjectsRecord[] = [
  {
    id: 'revtrona',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-04-23T00:00:00.000Z',
    publishedAt: '2025-01-01T00:00:00.000Z',
    revisedAt: '2025-04-23T00:00:00.000Z',
    title: 'Revtrona',
    url: 'https://revtrona.com',
    published_at: '2025-01-01T00:00:00.000Z',
    tags: ['Stripe', 'SaaS', 'Dashboard Extensions', 'Developer Tools'],
    project_type: ['owned_oss'],
    image: {
      url: '/images/revtrona/hero-image.png',
      height: 540,
      width: 786,
    },
    lang: ['Japanese'],
    is_solo: true,
    about:
      'A platform providing Stripe dashboard extensions and developer tools to improve revenue operations, development workflows, and customer success for SaaS businesses. Trusted by 1000+ developers worldwide.',
    background: `
      <h3>Products & Services</h3>
      <h4>Stripe Marketplace Apps</h4>
      <ul>
        <li><strong>Payment Links Query Addon</strong> - Enhance Stripe Payment Links with query string support for promo codes, email addresses, and UTM tracking. Generate custom QR codes with query parameters.</li>
        <li><strong>Advanced Customer View (v0.2.1)</strong> - Streamline Stripe subscription management with customer custom fields, terms of agreement confirmation, subscription details, multi-subscription detection, exchange rate display, and one-click metadata copying. Supports Japanese language.</li>
      </ul>
      <h4>Developer Tools (10+ Tools)</h4>
      <ul>
        <li><strong>Stripe Testing MCP Server</strong> - Model Context Protocol server for Stripe integration testing with time-based tests, customer management, and product management.</li>
        <li><strong>Express Stripe Webhook Middleware</strong> - TypeScript library for Express webhook signature verification with type-safe, secure implementation and minimal setup.</li>
        <li><strong>stripe-decline-codes</strong> - TypeScript library with human-readable descriptions of 44 Stripe decline codes in multiple languages (English/Japanese). Zero dependencies, fully typed.</li>
        <li><strong>microCMS × Stripe Simple Commerce Template</strong> - Next.js e-commerce template with product sync, draft preview, and webhook integration.</li>
      </ul>
      <h4>Content & Knowledge Hub</h4>
      <p>50+ resources covering dashboard extensions, billing management efficiency, and Stripe/SaaS development best practices. Available in both Japanese and English.</p>
    `,
    architecture: `
      <h3>Technical Stack</h3>
      <ul>
        <li><strong>Frontend</strong>: Next.js 16, React 19, TypeScript 5, Tailwind CSS v4 (responsive, dark mode enabled)</li>
        <li><strong>Content Management</strong>: WordPress REST API (blog), microCMS SDK (tools directory), Static TypeScript data</li>
        <li><strong>Analytics</strong>: Google Analytics 4, Microsoft Clarity (session recording, heatmaps)</li>
        <li><strong>Deployment</strong>: Cloudflare Workers via OpenNext.js</li>
        <li><strong>Security</strong>: sanitize-html for XSS protection, URL validation</li>
      </ul>
      <h3>Mission</h3>
      <p>Improve revenue, development, and operations for Stripe and SaaS businesses by providing extensions and tools that streamline customer support, billing management, and customer success operations.</p>
    `,
  },
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
  },
]
