/**
 * サイト全体の設定
 * サイトのメタデータや共通設定を一元管理
 */

export const SITE_CONFIG = {
  // サイトの基本情報
  url: 'https://hidetaka.dev',
  name: 'Hidetaka.dev',

  // 著者情報
  author: {
    name: 'Hidetaka Okamoto',
  },

  // ソーシャルリンク（全サイトで共通）
  social: {
    twitter: {
      url: 'https://twitter.com/hidetaka_dev',
      label: 'Twitter',
      ariaLabel: 'Follow on Twitter',
    },
    github: {
      url: 'https://github.com/hideokamoto',
      label: 'GitHub',
      ariaLabel: 'Follow on GitHub',
    },
    linkedin: {
      url: 'https://www.linkedin.com/in/hideokamoto/',
      label: 'LinkedIn',
      ariaLabel: 'Follow on LinkedIn',
    },
  },

  // Google AdSense 設定
  googleAds: {
    // AdSense クライアント ID
    publisherId: 'ca-pub-6091198629319043',

    // In-Article Ad (記事詳細ページ用)
    // Google AdSense の管理画面で作成した広告ユニットのスロットIDを設定してください
    inArticleAd: {
      slot: 'XXXXXXXXXX', // TODO: AdSense管理画面で作成した In-Article Ad のスロットIDに置き換えてください
    },

    // In-Feed Ad (記事一覧ページ用)
    // Google AdSense の管理画面で作成した広告ユニットのスロットIDとレイアウトキーを設定してください
    inFeedAd: {
      slot: 'YYYYYYYYYY', // TODO: AdSense管理画面で作成した In-Feed Ad のスロットIDに置き換えてください
      layoutKey: '-fb+5w+4e-db+86', // TODO: AdSense管理画面から取得したレイアウトキーに置き換えてください
    },
  },
} as const
