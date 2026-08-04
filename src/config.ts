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
    nameJa: '岡本 秀高',
    jobTitle: 'Senior Field Engineer',
    image: '/images/profile.jpg',
    worksFor: {
      name: 'CircleCI',
      url: 'https://circleci.com/',
    },
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

  // 個人が運営する技術ブログ（人物と検索資産を接続するための情報）
  wpKyoto: {
    url: 'https://wp-kyoto.net',
    label: 'wp-kyoto.net',
    ariaLabel: 'Visit wp-kyoto.net',
  },
} as const
