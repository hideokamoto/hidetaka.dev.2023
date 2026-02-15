/**
 * CTA (Call-to-Action) パターンデータ
 *
 * 記事タイプごとのハードコードされたCTAパターンを定義します。
 * 将来的にCMS統合に移行する際の基盤となります。
 */

import type { ArticleType, CTAPattern } from './ctaTypes'

/**
 * 記事タイプごとのCTAパターン定義
 *
 * 各パターンは日本語と英語の両方のコンテンツを含みます。
 * - tutorial: 実践指向のアクション
 * - essay: 探索指向のアクション
 * - tool_announcement: 今すぐ試すアクション
 * - general: 一般的なエンゲージメントアクション
 */
export const CTA_PATTERNS: Record<ArticleType, CTAPattern> = {
  tutorial: {
    ja: {
      heading: '学んだことを実践してみましょう',
      description: 'このチュートリアルで学んだ技術を自分のプロジェクトで試してみませんか？',
      buttons: [
        { text: '関連記事を読む', href: '/blog', variant: 'primary' },
        { text: 'プロジェクト一覧', href: '/projects', variant: 'secondary' },
      ],
    },
    en: {
      heading: 'Put What You Learned Into Practice',
      description: 'Ready to try these techniques in your own projects?',
      buttons: [
        { text: 'Read More Articles', href: '/blog', variant: 'primary' },
        { text: 'View Projects', href: '/projects', variant: 'secondary' },
      ],
    },
  },
  essay: {
    ja: {
      heading: 'さらに深く探求する',
      description: 'このトピックに興味を持ちましたか？関連する記事やプロジェクトをご覧ください。',
      buttons: [
        { text: '他の記事を読む', href: '/blog', variant: 'primary' },
        { text: 'ニュースレター登録', href: '/newsletter', variant: 'outline' },
      ],
    },
    en: {
      heading: 'Explore Further',
      description: 'Interested in this topic? Check out related articles and projects.',
      buttons: [
        { text: 'Read More', href: '/blog', variant: 'primary' },
        { text: 'Subscribe', href: '/newsletter', variant: 'outline' },
      ],
    },
  },
  tool_announcement: {
    ja: {
      heading: '今すぐ試してみる',
      description: 'このツールを実際に使ってみて、あなたのワークフローを改善しましょう。',
      buttons: [
        { text: 'ツールを試す', href: '/projects', variant: 'primary' },
        { text: 'ドキュメント', href: '/docs', variant: 'secondary' },
        { text: 'GitHubで見る', href: 'https://github.com', variant: 'outline' },
      ],
    },
    en: {
      heading: 'Try It Now',
      description: 'Experience this tool firsthand and improve your workflow.',
      buttons: [
        { text: 'Try the Tool', href: '/projects', variant: 'primary' },
        { text: 'Documentation', href: '/docs', variant: 'secondary' },
        { text: 'View on GitHub', href: 'https://github.com', variant: 'outline' },
      ],
    },
  },
  general: {
    ja: {
      heading: '次に読む',
      description: '他の記事やプロジェクトもぜひご覧ください。',
      buttons: [
        { text: 'ブログ一覧', href: '/blog', variant: 'primary' },
        { text: 'プロジェクト', href: '/projects', variant: 'secondary' },
      ],
    },
    en: {
      heading: 'What to Read Next',
      description: 'Explore more articles and projects.',
      buttons: [
        { text: 'All Articles', href: '/blog', variant: 'primary' },
        { text: 'Projects', href: '/projects', variant: 'secondary' },
      ],
    },
  },
}
