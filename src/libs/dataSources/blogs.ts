import { loadDevNotes } from './devnotes'
import { loadDevToPosts } from './devto'
import { loadQiitaPosts } from './qiita'
import type { FeedDataSource, FeedItem } from './types'
import { loadWPPosts } from './wordpress'
import { loadZennPosts } from './zenn'

const sourceDevNotes: FeedDataSource = {
  href: '/ja/writing/dev-notes',
  name: 'Dev Notes',
  color: 'green',
}
export const isJapanese = (locale?: string) => {
  if (!locale) return false
  return /^ja/.test(locale)
}

const sourceStripeDotDev: FeedDataSource = {
  href: 'https://stripe.dev',
  name: 'Stripe.dev',
  color: 'red',
}
const stripeDotDevPosts: Array<FeedItem> = [
  {
    title: 'Easily debug your 3DS authentication with Stripe Workbench',
    href: 'https://stripe.dev/blog/easily-debug-your-3ds-authentication-with-stripe-workbench',
    description:
      "In this article, you'll learn how to investigate the payment process with just a few clicks on the Stripe dashboard. You'll also see how to obtain event data for testing code related to the 3DS authentication flow.",
    datetime: '2024-10-22',
    dataSource: sourceStripeDotDev,
  },
  {
    title: "Optimize payment flow while reducing code complexity with Stripe's A/B Testing",
    href: 'https://stripe.dev/blog/optimize-payment-flow-reduce-complexity-stripe-ab-testing',
    description:
      "This post explores how to leverage Stripe's A/B testing, its benefits, and how you can use it to boost online sales. You can learn how to improve the conversion rate by optimizing payment options without adding further code.",
    datetime: '2024-10-23',
    dataSource: sourceStripeDotDev,
  },
  {
    title: 'Managing SaaS Access Control with Stripe’s Entitlements API',
    href: 'https://stripe.dev/blog/managing-saas-access-control-with-stripe-entitlements-api',
    description:
      "This post introduces how to manage SaaS feature entitlements efficiently using the Stripe API. It explains why it's important to provide multiple plans to your customers and how to differentiate each plan through entitlement management. With the Stripe API, managing entitlements can become more straightforward, allowing you to focus on building and improving your core services.",
    datetime: '2024-10-31',
    dataSource: sourceStripeDotDev,
  },
  {
    title: 'Developing and investigating subscription data flow',
    href: 'https://stripe.dev/blog/developing-and-investigating-subscription-data-flow',
    description:
      "This article shows you how to use Stripe's sandbox to simplify your development process. You'll learn to create isolated test environments, simulate real-world scenarios, and debug your subscription logic efficiently. ",
    datetime: '2024-11-13',
    dataSource: sourceStripeDotDev,
  },
  {
    title: 'Japan Community Highlights: Effective Testing and Security',
    href: 'https://stripe.dev/blog/japan-community-highlights-2024-09',
    description:
      "This article highlights development tips for efficiently developing and operating Stripe at a lower cost, as presented by the Japanese Stripe user community JP_Stripes. We'll focus on content from two events held in September 2024 in Aizuwakamatsu, Fukushima Prefecture, and Sapporo, Hokkaido.",
    datetime: '2024-12-13',
    dataSource: sourceStripeDotDev,
  },
]

export const loadBlogPosts = async (
  locale: 'ja' | 'en' = 'ja',
): Promise<{ items: FeedItem[]; hasMoreBySource: Record<string, boolean> }> => {
  try {
    const wp = await loadWPPosts(isJapanese(locale) ? 'ja' : 'en').catch(() => ({
      items: [],
      hasMore: false,
    }))
    const devto = isJapanese(locale)
      ? { items: [], hasMore: false }
      : await loadDevToPosts().catch(() => ({ items: [], hasMore: false }))
    const zenn = isJapanese(locale)
      ? await loadZennPosts().catch(() => ({ items: [], hasMore: false }))
      : { items: [], hasMore: false }
    const qiita = isJapanese(locale)
      ? await loadQiitaPosts().catch(() => ({ items: [], hasMore: false }))
      : { items: [], hasMore: false }
    const stripePosts = isJapanese(locale) ? [] : stripeDotDevPosts

    // dev-notesを取得（日本語のみ）
    const devNotesResult = isJapanese(locale)
      ? await loadDevNotes(1, 20).catch(() => ({
          items: [],
          totalPages: 0,
          totalItems: 0,
          currentPage: 1,
        }))
      : { items: [], totalPages: 0, totalItems: 0, currentPage: 1 }

    // BlogItemをFeedItemに変換
    const devNotesPosts: FeedItem[] = devNotesResult.items.map((item) => ({
      id: item.id,
      title: item.title,
      href: item.href,
      description: item.description,
      datetime: item.datetime,
      dataSource: sourceDevNotes,
    }))

    // hasMore情報をデータソース名でマッピング
    const hasMoreBySource: Record<string, boolean> = {}
    if (wp.hasMore) hasMoreBySource['WP Kyoto Blog'] = true
    if (zenn.hasMore) hasMoreBySource.Zenn = true
    if (qiita.hasMore) hasMoreBySource.Qiita = true
    if (devto.hasMore) hasMoreBySource['Dev.to'] = true
    if (devNotesResult.totalPages > 1) hasMoreBySource['Dev Notes'] = true

    const allPosts = [
      ...wp.items,
      ...devto.items,
      ...zenn.items,
      ...qiita.items,
      ...stripePosts,
      ...devNotesPosts,
    ]

    const sortedPosts = allPosts.sort((a: FeedItem, b: FeedItem) => {
      const bDate = new Date(b.datetime)
      const aDate = new Date(a.datetime)
      return bDate.getTime() - aDate.getTime()
    })

    return { items: sortedPosts, hasMoreBySource }
  } catch (error) {
    console.error('Error loading blog posts:', error)
    return { items: [], hasMoreBySource: {} }
  }
}
