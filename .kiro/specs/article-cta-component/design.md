# 設計書

## 概要

記事CTAコンポーネントは、記事コンテンツの後に表示される柔軟なコールトゥアクションシステムです。このコンポーネントは、記事タイプに基づいて適切なCTAパターンを選択し、読者に明確な次のアクションを提供することで、サイトのエンゲージメント指標を改善します。

主な特徴：
- 記事タイプ別の4つのCTAパターン（tutorial、essay、tool_announcement、general）
- 日本語・英語のバイリンガルサポート
- 既存コンポーネント（CTAButton、SocialShareButtons）との統合
- 将来のCMS統合を見据えた拡張可能なアーキテクチャ
- サーバーコンポーネントとしての実装によるパフォーマンス最適化

## アーキテクチャ

### コンポーネント階層

```
ArticleCTA (メインコンポーネント)
├── CTAPattern (パターン選択ロジック)
│   ├── TutorialCTA
│   ├── EssayCTA
│   ├── ToolAnnouncementCTA
│   └── DefaultCTA
└── CTAButton (既存コンポーネント)
```

### データフロー

1. 記事詳細ページがArticleCTAコンポーネントをレンダリング
2. ArticleCTAがarticleType propに基づいて適切なCTAパターンを選択
3. 選択されたパターンがlang propに基づいてローカライズされたコンテンツを表示
4. CTAButtonコンポーネントがアクションボタンをレンダリング

### 配置戦略

ArticleCTAコンポーネントは以下の順序で配置されます：

```
<article>
  {/* 記事コンテンツ */}
</article>

<SocialShareButtons />  {/* 既存 */}

<ArticleCTA />          {/* 新規 - この位置に挿入 */}

<RelatedArticles />     {/* 既存 */}
```

## コンポーネントとインターフェース

### ArticleCTA コンポーネント

メインのCTAコンポーネント。記事タイプと言語に基づいて適切なCTAパターンを表示します。

```typescript
// src/components/ui/ArticleCTA.tsx

export type ArticleType = 'tutorial' | 'essay' | 'tool_announcement' | 'general'

export interface CTAData {
  heading: string
  description: string
  buttons: Array<{
    text: string
    href: string
    variant?: 'primary' | 'secondary' | 'outline'
  }>
}

export interface ArticleCTAProps {
  articleType?: ArticleType
  lang: 'ja' | 'en'
  ctaData?: CTAData  // 将来のCMS統合用
  className?: string
}

export default function ArticleCTA({
  articleType = 'general',
  lang,
  ctaData,
  className = '',
}: ArticleCTAProps): JSX.Element
```

### CTAパターンデータ構造

各CTAパターンは以下の構造を持ちます：

```typescript
// src/libs/ctaPatterns.ts

interface CTAPattern {
  ja: CTAData
  en: CTAData
}

const CTA_PATTERNS: Record<ArticleType, CTAPattern> = {
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
```

## データモデル

### CTAData インターフェース

```typescript
interface CTAData {
  heading: string        // CTAセクションの見出し
  description: string    // 説明テキスト
  buttons: CTAButton[]   // アクションボタンの配列
}

interface CTAButton {
  text: string                                    // ボタンテキスト
  href: string                                    // リンク先URL
  variant?: 'primary' | 'secondary' | 'outline'  // ボタンスタイル
}
```

### ArticleType 列挙型

```typescript
type ArticleType = 'tutorial' | 'essay' | 'tool_announcement' | 'general'
```

各タイプの用途：
- `tutorial`: 技術チュートリアル記事
- `essay`: エッセイや考察記事
- `tool_announcement`: ツールやプロジェクトの発表記事
- `general`: その他の一般記事（デフォルト）

## 正確性プロパティ


プロパティとは、システムのすべての有効な実行において真であるべき特性または動作です。本質的には、システムが何をすべきかについての形式的な記述です。プロパティは、人間が読める仕様と機械で検証可能な正確性保証の橋渡しとなります。

### プロパティ1: 記事タイプとCTAパターンのマッピング

*任意の*記事タイプ（tutorial、essay、tool_announcement、general、またはundefined）に対して、ArticleCTAコンポーネントは対応する正しいCTAパターンを表示すること

**検証: 要件 1.1、1.5**

### プロパティ2: 言語ベースのローカライゼーション

*任意の*記事タイプと言語（jaまたはen）の組み合わせに対して、ArticleCTAコンポーネントは指定された言語のコンテンツを表示すること

**検証: 要件 2.1、2.2**

### プロパティ3: CTAパターンの構造整合性

*すべての*CTAパターン（tutorial、essay、tool_announcement、general）は、見出し（heading）、説明（description）、および1〜3個のボタン（buttons）を含むこと

**検証: 要件 4.1、4.2、4.3**

### プロパティ4: カスタムCTAデータの優先

*任意の*ctaDataプロパティが提供された場合、ArticleCTAコンポーネントはハードコードされたパターンではなく、提供されたctaDataを使用すること

**検証: 要件 6.2**

## エラーハンドリング

### 無効な記事タイプ

ArticleCTAコンポーネントは、無効または未定義の記事タイプに対してデフォルトの'general'パターンにフォールバックします。

```typescript
const normalizedArticleType = articleType && 
  ['tutorial', 'essay', 'tool_announcement', 'general'].includes(articleType)
  ? articleType
  : 'general'
```

### 無効な言語

コンポーネントは、サポートされていない言語コードに対して英語にフォールバックします。

```typescript
const normalizedLang = lang === 'ja' ? 'ja' : 'en'
```

### カスタムCTAデータの検証

ctaDataプロパティが提供された場合、コンポーネントは必須フィールドの存在を検証します。

```typescript
function isValidCTAData(data: unknown): data is CTAData {
  if (!data || typeof data !== 'object') return false
  const d = data as Partial<CTAData>
  return (
    typeof d.heading === 'string' &&
    typeof d.description === 'string' &&
    Array.isArray(d.buttons) &&
    d.buttons.length > 0 &&
    d.buttons.length <= 3 &&
    d.buttons.every(btn => 
      typeof btn.text === 'string' && 
      typeof btn.href === 'string'
    )
  )
}
```

無効なctaDataが提供された場合、コンポーネントは警告をログに記録し、ハードコードされたパターンにフォールバックします。

## テスト戦略

### デュアルテストアプローチ

ArticleCTAコンポーネントのテストは、ユニットテストとプロパティベーステストの両方を使用します：

- **ユニットテスト**: 特定の例、エッジケース、エラー条件を検証
- **プロパティテスト**: すべての入力にわたる普遍的なプロパティを検証

両方のアプローチは補完的であり、包括的なカバレッジに必要です。

### ユニットテストの焦点

ユニットテストは以下に焦点を当てます：

- 特定の記事タイプ（tutorial、essay、tool_announcement）に対する正しいパターンの表示
- classNameプロパティの適用
- セマンティックHTML要素の使用（section、h2）
- ARIA属性の存在
- Next.js/React 19との互換性
- 外部APIコールがないことの確認

### プロパティベーステストの焦点

プロパティテストは以下に焦点を当てます：

- 記事タイプとCTAパターンのマッピング（プロパティ1）
- 言語ベースのローカライゼーション（プロパティ2）
- CTAパターンの構造整合性（プロパティ3）
- カスタムCTAデータの優先（プロパティ4）

### プロパティテスト設定

- **ライブラリ**: fast-check（TypeScript用のプロパティベーステストライブラリ）
- **イテレーション数**: 各プロパティテストで最低100回の反復
- **タグ形式**: `Feature: article-cta-component, Property {番号}: {プロパティテキスト}`

例：
```typescript
import fc from 'fast-check'
import { render } from '@testing-library/react'
import ArticleCTA from './ArticleCTA'

describe('ArticleCTA Property Tests', () => {
  it('Property 1: 記事タイプとCTAパターンのマッピング', () => {
    // Feature: article-cta-component, Property 1: 記事タイプとCTAパターンのマッピング
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant('tutorial'),
          fc.constant('essay'),
          fc.constant('tool_announcement'),
          fc.constant('general'),
          fc.constant(undefined)
        ),
        fc.oneof(fc.constant('ja'), fc.constant('en')),
        (articleType, lang) => {
          const { container } = render(
            <ArticleCTA articleType={articleType} lang={lang} />
          )
          // 正しいパターンが表示されることを検証
          const expectedType = articleType || 'general'
          // パターン固有のコンテンツが存在することを確認
          expect(container.textContent).toBeTruthy()
        }
      ),
      { numRuns: 100 }
    )
  })
})
```

### テストカバレッジ目標

- ユニットテストカバレッジ: 90%以上
- プロパティテストカバレッジ: すべての正確性プロパティ
- 統合テスト: 記事詳細ページでのコンポーネント配置

### テスト実行

```bash
# すべてのテストを実行
npm test

# プロパティテストのみを実行
npm test -- --grep "Property"

# カバレッジレポートを生成
npm test -- --coverage
```
