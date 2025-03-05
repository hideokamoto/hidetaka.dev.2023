import type { MicroCMSEventsRecord, MicroCMSProjectsRecord, MicroCMSPostsRecord } from './types'

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

export const MICROCMS_MOCK_EVENTs: MicroCMSEventsRecord[] = [
  {
    id: 'f80mm0zspiqp',
    createdAt: '2022-05-11T09:39:45.062Z',
    updatedAt: '2022-05-11T09:41:04.987Z',
    publishedAt: '2022-05-11T09:39:45.062Z',
    revisedAt: '2022-05-11T09:41:04.987Z',
    title: 'JP_Stripes DeepDive',
    url: 'https://www.facebook.com/groups/jpstripes/posts/3029419883978371/',
    date: '2022-02-10T03:15:00.000Z',
    place: 'online',
    slide_url: 'https://speakerdeck.com/stripehideokamoto/jpstripes-deepdive-202202',
    session_title: 'Stripe Quotesで見積書発行から請求業務をノーコードで管理しよう',
  },
  {
    id: 'q9_wbwteh',
    createdAt: '2022-05-11T09:34:04.382Z',
    updatedAt: '2022-05-11T09:35:50.295Z',
    publishedAt: '2022-05-11T09:35:50.295Z',
    revisedAt: '2022-05-11T09:35:50.295Z',
    title: "JP_Stripes What's new 2022/01",
    url: 'https://www.facebook.com/groups/jpstripes/posts/3009506845969675/',
    date: '2022-01-13T03:15:00.000Z',
    place: 'Online',
    slide_url: 'https://speakerdeck.com/stripehideokamoto/jpstripes-whats-new-202201',
    blog_url: 'https://qiita.com/hideokamoto/items/2775e20fd260e907ca04',
  },
]

export const MICROCMS_MOCK_POSTs: MicroCMSPostsRecord[] = [
  {
    id: '8bf8y2ih-dt',
    createdAt: '2025-03-05T04:31:24.865Z',
    updatedAt: '2025-03-05T04:31:24.865Z',
    publishedAt: '2025-03-05T04:31:24.865Z',
    revisedAt: '2025-03-05T04:31:24.865Z',
    title: '京都地下鉄ラスト・コールをリリースしました',
    content: '<p>2024年11月30日に、新しい個人開発アプリケーション「京都地下鉄ラスト・コール」をリリースしました。</p><p>オープンデータと生成AIを利用したアプリケーション開発の可能性を探究し、データ活用やマッシュアップの可能性を提案することを目的とし、京都市が公開しているデータを利用したアプリケーションをリリースしました。</p>',
    tags: [
        'アプリケーション'
    ],
    lang: [
        'japanese'
    ]
  }
]
