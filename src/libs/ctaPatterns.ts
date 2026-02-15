/**
 * CTA (Call-to-Action) パターンデータ
 *
 * 記事タイプごとのハードコードされたCTAパターンを定義します。
 * 将来的にCMS統合に移行する際の基盤となります。
 */

import type { ArticleType, CTAPattern } from '@/libs/ctaTypes'

/**
 * 記事タイプごとのCTAパターン定義
 *
 * 各パターンは日本語と英語の両方のコンテンツを含みます。
 * - tutorial: 実践指向のアクション
 * - essay: 探索指向のアクション
 * - tool_announcement: 今すぐ試すアクション
 * - general: 一般的なエンゲージメントアクション
 * - dev_note: 開発ノート指向のアクション
 * - news_article: ニュース指向のアクション
 * - event_report: イベントレポート指向のアクション
 * - speaking_report: 登壇・講演レポート指向のアクション
 */
export const CTA_PATTERNS: Record<ArticleType, CTAPattern> = {
  tutorial: {
    ja: {
      heading: '学んだことを実践してみましょう',
      description: 'このチュートリアルで学んだ技術を自分のプロジェクトで試してみませんか？',
      buttons: [
        { text: '関連記事を読む', href: '/blog', variant: 'primary' },
        { text: 'プロジェクト一覧', href: '/work', variant: 'secondary' },
      ],
    },
    en: {
      heading: 'Put What You Learned Into Practice',
      description: 'Ready to try these techniques in your own projects?',
      buttons: [
        { text: 'Read More Articles', href: '/blog', variant: 'primary' },
        { text: 'View Projects', href: '/work', variant: 'secondary' },
      ],
    },
  },
  essay: {
    ja: {
      heading: 'さらに深く探求する',
      description: 'このトピックに興味を持ちましたか？関連する記事やプロフィールをご覧ください。',
      buttons: [
        { text: '他の記事を読む', href: '/blog', variant: 'primary' },
        { text: 'プロフィールを見る', href: '/about', variant: 'outline' },
      ],
    },
    en: {
      heading: 'Explore Further',
      description: 'Interested in this topic? Check out related articles and profile.',
      buttons: [
        { text: 'Read More', href: '/blog', variant: 'primary' },
        { text: 'View Profile', href: '/about', variant: 'outline' },
      ],
    },
  },
  tool_announcement: {
    ja: {
      heading: '今すぐ試してみる',
      description: 'このツールを実際に使ってみて、あなたのワークフローを改善しましょう。',
      buttons: [
        { text: 'プロジェクト一覧', href: '/work', variant: 'primary' },
        { text: 'GitHubで見る', href: 'https://github.com/hideokamoto', variant: 'secondary' },
      ],
    },
    en: {
      heading: 'Try It Now',
      description: 'Experience this tool firsthand and improve your workflow.',
      buttons: [
        { text: 'View Projects', href: '/work', variant: 'primary' },
        { text: 'View on GitHub', href: 'https://github.com/hideokamoto', variant: 'secondary' },
      ],
    },
  },
  general: {
    ja: {
      heading: '次に読む',
      description: '他の記事やプロジェクトもぜひご覧ください。',
      buttons: [
        { text: 'ブログ一覧', href: '/blog', variant: 'primary' },
        { text: 'プロジェクト', href: '/work', variant: 'secondary' },
      ],
    },
    en: {
      heading: 'What to Read Next',
      description: 'Explore more articles and projects.',
      buttons: [
        { text: 'All Articles', href: '/blog', variant: 'primary' },
        { text: 'Projects', href: '/work', variant: 'secondary' },
      ],
    },
  },
  dev_note: {
    ja: {
      heading: '開発ノートをもっと読む',
      description: '技術的な学びや実践的な開発ノートをもっと探索してみませんか？',
      buttons: [
        { text: '開発ノート一覧', href: '/writing/dev-notes', variant: 'primary' },
        { text: 'ブログ記事', href: '/blog', variant: 'secondary' },
      ],
    },
    en: {
      heading: 'Read More Dev Notes',
      description: 'Explore more technical learnings and practical development notes.',
      buttons: [
        { text: 'All Dev Notes', href: '/writing/dev-notes', variant: 'primary' },
        { text: 'Blog Articles', href: '/blog', variant: 'secondary' },
      ],
    },
  },
  news_article: {
    ja: {
      heading: '最新のニュースとプロジェクト',
      description: '他のニュースやプロジェクトもぜひご覧ください。',
      buttons: [
        { text: 'ニュース一覧', href: '/news', variant: 'primary' },
        { text: 'プロジェクト', href: '/work', variant: 'secondary' },
      ],
    },
    en: {
      heading: 'Latest News and Projects',
      description: 'Check out more news and projects.',
      buttons: [
        { text: 'All News', href: '/news', variant: 'primary' },
        { text: 'Projects', href: '/work', variant: 'secondary' },
      ],
    },
  },
  event_report: {
    ja: {
      heading: '他のイベントもチェック',
      description: '登壇・講演の記録や他の記事もご覧ください。',
      buttons: [
        { text: '登壇・講演一覧', href: '/speaking', variant: 'primary' },
        { text: 'ブログ記事', href: '/blog', variant: 'secondary' },
      ],
    },
    en: {
      heading: 'Check Out Other Events',
      description: 'Explore more speaking engagements and articles.',
      buttons: [
        { text: 'All Speaking', href: '/speaking', variant: 'primary' },
        { text: 'Blog Articles', href: '/blog', variant: 'secondary' },
      ],
    },
  },
  speaking_report: {
    ja: {
      heading: '他の登壇・講演記録',
      description: '他のイベントレポートやブログ記事もぜひご覧ください。',
      buttons: [
        { text: '登壇・講演一覧', href: '/speaking', variant: 'primary' },
        { text: 'ブログ記事', href: '/blog', variant: 'secondary' },
      ],
    },
    en: {
      heading: 'More Speaking Reports',
      description: 'Explore more event reports and blog articles.',
      buttons: [
        { text: 'All Speaking', href: '/speaking', variant: 'primary' },
        { text: 'Blog Articles', href: '/blog', variant: 'secondary' },
      ],
    },
  },
}
