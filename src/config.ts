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
    jobTitle: 'Developer Experience Engineer',
    image: '/images/profile.jpg',
    worksFor: {
      name: 'DigitalCube',
      url: 'https://en.digitalcube.jp/',
    },
    social: {
      twitter: 'https://twitter.com/hidetaka_dev',
      github: 'https://github.com/hideokamoto',
      linkedin: 'https://www.linkedin.com/in/hideokamoto/',
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
} as const
