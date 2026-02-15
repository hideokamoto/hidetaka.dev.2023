# WordPress URL to Blog Card

WordPress記事本文内の独立したURLを自動的にOGPブログカードに変換するモジュール。

## 概要

このモジュールは、WordPress REST APIから取得した記事本文HTML内の独立したURL（`<p>https://example.com</p>`形式）を検出し、iframeベースのOGPブログカードに変換します。

Next.jsサーバーコンポーネントで動作し、軽量な文字列処理のみで高速に変換を実行します。外部APIへのfetchは行わず、iframeの遅延読み込み（`loading="lazy"`）により、ページ読み込み速度を維持します。

## 主な機能

### URL検出（urlDetector）

記事本文HTML内の独立したURLを正確に検出します。

- `<p>タグ内のURL`を検出（例: `<p>https://example.com</p>`）
- 以下のURLは自動的に除外：
  - リンクタグ内のURL（`<a href="...">`）
  - 画像URL（.jpg, .png, .gif, .webp, .svg）
  - 自サイトURL（hidetaka.dev）
- 重複URLを自動的に除去

### ブログカード変換（blogCardTransformer）

検出されたURLをiframeタグに変換します。

- URLを安全にエスケープ（`encodeURIComponent`）
- OGP Serviceを使用してブログカードを表示
- `loading="lazy"`属性で遅延読み込みを有効化
- レスポンシブデザイン対応（width="100%"）

### サーバーサイド処理

- Next.jsサーバーコンポーネントで完結
- クライアント側の負荷なし
- SEOに最適化
- ISR（Incremental Static Regeneration）と統合可能

### パフォーマンス最適化

- 軽量な文字列処理のみ（外部APIへのfetchなし）
- iframeの遅延読み込み（`loading="lazy"`）
- 処理時間: 100ms以内（大きな記事本文でも高速）

### エラーハンドリング

- 変換処理が失敗しても元のHTMLを表示
- エラーをログに記録
- ユーザー体験を損なわない

## モジュール構成

```
src/libs/blogCard/
├── types.ts                           # TypeScript型定義
├── urlDetector.ts                     # URL検出ロジック
├── blogCardTransformer.ts             # URL変換ロジック
├── index.ts                           # モジュールエクスポート
├── urlDetector.test.ts                # ユニットテスト
├── urlDetector.property.test.ts       # プロパティベーステスト
├── blogCardTransformer.test.ts        # ユニットテスト
├── blogCardTransformer.property.test.ts # プロパティベーステスト
└── README.md                          # このファイル
```

## 使用方法

### 基本的な使用方法（サーバーコンポーネント）

`TransformedBlogContent`コンポーネントを使用して、WordPress記事本文を自動的に変換します。

```tsx
import TransformedBlogContent from '@/components/BlogPosts/TransformedBlogContent'
import type { WPThought } from '@/libs/blogCard/types'

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  // WordPress APIから記事を取得
  const thought = await getThoughtBySlug(params.slug)

  return (
    <article>
      <h1>{thought.title.rendered}</h1>
      
      {/* 記事本文を自動的に変換 */}
      <TransformedBlogContent
        thought={thought}
        className="blog-content text-zinc-700 dark:text-zinc-300 leading-relaxed"
      />
    </article>
  )
}
```

### 低レベルAPI（カスタム実装）

モジュールを直接使用して、カスタムロジックを実装することもできます。

```typescript
import { detectIndependentUrls } from '@/libs/blogCard/urlDetector'
import { transformUrlsToBlogCards } from '@/libs/blogCard/blogCardTransformer'

// 1. HTML文字列から独立したURLを検出
const html = '<p>https://example.com</p><p>https://test.com</p>'
const detectedUrls = detectIndependentUrls(html)
// => ['https://example.com', 'https://test.com']

// 2. 検出されたURLをブログカードに変換
const transformedHtml = transformUrlsToBlogCards(html, detectedUrls)
// => '<iframe src="https://ogp-metadata-service.wp-kyoto.workers.dev/card?url=https%3A%2F%2Fexample.com" ...></iframe>...'
```

### URL検出のみ

URL検出機能のみを使用する場合：

```typescript
import { detectIndependentUrls } from '@/libs/blogCard'

const html = `
  <p>https://example.com</p>
  <a href="https://link.com">リンク</a>
  <p>https://image.jpg</p>
  <p>https://hidetaka.dev/blog</p>
`

const urls = detectIndependentUrls(html)
// => ['https://example.com']
// リンクタグ内、画像URL、自サイトURLは除外される
```

### ブログカード変換のみ

既に検出されたURLをブログカードに変換する場合：

```typescript
import { transformUrlsToBlogCards } from '@/libs/blogCard/blogCardTransformer'

const html = '<p>https://example.com</p>'
const urls = ['https://example.com']

const transformedHtml = transformUrlsToBlogCards(html, urls)
// => '<iframe src="https://ogp-metadata-service.wp-kyoto.workers.dev/card?url=https%3A%2F%2Fexample.com" width="100%" height="155" frameborder="0" loading="lazy" style="border: 1px solid #e5e7eb; border-radius: 0.5rem; margin: 1rem 0;"></iframe>'
```

## API リファレンス

### `detectIndependentUrls(html: string): string[]`

HTML文字列から独立したURLを検出します。

**パラメータ:**
- `html` (string): 検索対象のHTML文字列

**戻り値:**
- `string[]`: 検出されたURLの配列（重複なし）

**例:**
```typescript
const urls = detectIndependentUrls('<p>https://example.com</p>')
// => ['https://example.com']
```

### `transformUrlsToBlogCards(html: string, urls: string[]): string`

HTML文字列内のURLをブログカードiframeに変換します。

**パラメータ:**
- `html` (string): 変換対象のHTML文字列
- `urls` (string[]): 変換するURLの配列

**戻り値:**
- `string`: 変換後のHTML文字列

**例:**
```typescript
const transformed = transformUrlsToBlogCards(
  '<p>https://example.com</p>',
  ['https://example.com']
)
// => '<iframe src="..." ...></iframe>'
```

### `TransformedBlogContent`

WordPress記事本文を自動的に変換するサーバーコンポーネント。

**Props:**
- `thought` (WPThought): WordPress記事オブジェクト
- `className?` (string): CSSクラス名（オプション）

**例:**
```tsx
<TransformedBlogContent
  thought={thought}
  className="blog-content"
/>
```

## 技術仕様

### OGP Service

ブログカードの表示には、以下のOGP Serviceを使用します：

```
https://ogp-metadata-service.wp-kyoto.workers.dev/card?url={encodedUrl}
```

- URLは`encodeURIComponent`でエスケープされます
- SSRF保護が実装されています
- CORS設定でhidetaka.devを許可しています

### iframeタグの仕様

生成されるiframeタグの仕様：

```html
<iframe
  src="https://ogp-metadata-service.wp-kyoto.workers.dev/card?url={encodedUrl}"
  width="100%"
  height="155"
  frameborder="0"
  loading="lazy"
  style="border: 1px solid #e5e7eb; border-radius: 0.5rem; margin: 1rem 0;"
></iframe>
```

- `width="100%"`: レスポンシブデザイン対応
- `height="155"`: ブログカードの高さ
- `loading="lazy"`: 遅延読み込みを有効化
- `style`: Tailwind CSSに準拠したスタイル

### 除外条件

以下のURLは自動的に除外されます：

1. **リンクタグ内のURL**: `<a href="https://example.com">リンク</a>`
2. **画像URL**: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`拡張子を持つURL
3. **自サイトURL**: `hidetaka.dev`を含むURL

## テスト

### テストフレームワーク

- **Vitest**: ユニットテスト
- **fast-check**: プロパティベーステスト

### テスト実行

```bash
# すべてのテストを実行
npm test

# 特定のテストファイルを実行
npm test urlDetector.test.ts

# プロパティベーステストのみを実行
npm test urlDetector.property.test.ts
```

### テストカバレッジ

- ユニットテスト: 90%以上のコードカバレッジ
- プロパティベーステスト: すべての正確性プロパティをカバー
- 統合テスト: TransformedBlogContentコンポーネントのエンドツーエンドフロー

### プロパティベーステスト

プロパティベーステストでは、ランダムな入力に対して普遍的なプロパティを検証します：

1. **独立したURLの検出**: 任意のHTML文字列において、`<p>`タグ内のURLが検出される
2. **除外条件の適用**: リンクタグ内、画像URL、自サイトURLが除外される
3. **複数URLの完全な検出**: 複数のURLがすべて検出され、重複なく返される
4. **URLからiframeへの変換**: 任意のURLがiframeタグに変換される
5. **iframeタグの正しい生成**: URLがエスケープされ、loading="lazy"属性が含まれる
6. **複数URLの個別変換**: 複数のURLがそれぞれ個別のiframeタグに変換される
7. **不正なURLのスキップ**: 不正なURLが変換されずにスキップされる
8. **不正なHTMLのエラーハンドリング**: 不正なHTMLでエラーが発生しても元のHTMLが返される
9. **ラウンドトリップ一貫性**: 変換後も元のコンテンツ（iframeタグ以外）が変更されない

## トラブルシューティング

### URLが検出されない

- `<p>`タグ内に直接URLが記述されているか確認してください
- リンクタグ（`<a href="...">`）内のURLは検出されません
- 画像URL（.jpg, .png, .gif, .webp, .svg）は検出されません
- 自サイトURL（hidetaka.dev）は検出されません

### ブログカードが表示されない

- ブラウザの開発者ツールでiframeタグが生成されているか確認してください
- OGP Serviceが利用可能か確認してください
- iframeの`loading="lazy"`属性により、スクロールするまで読み込まれない場合があります

### エラーが発生する

- エラーログを確認してください（コンソールに出力されます）
- 変換処理が失敗しても、元のHTMLが表示されます
- 不正なURLは自動的にスキップされます

## ライセンス

このモジュールは、hidetaka.devプロジェクトの一部として提供されています。
