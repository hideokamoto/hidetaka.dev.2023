# WordPress URL to Blog Card - 動作確認ガイド

## 概要

このガイドでは、WordPress記事本文内のURLをOGPブログカードに自動変換する機能の動作確認手順を説明します。

## 前提条件

- 開発環境がセットアップされていること
- WordPress REST API（wp-api.wp-kyoto.net）にアクセス可能であること
- ブラウザの開発者ツールの使用方法を理解していること

## 動作確認手順

### 1. 開発サーバーの起動

ターミナルで以下のコマンドを実行してください：

```bash
npm run dev
```

開発サーバーが起動し、`http://localhost:3000`（またはポート番号が異なる場合は表示されたURL）でアクセス可能になります。

### 2. ブログ記事ページへのアクセス

以下のいずれかの方法でブログ記事ページにアクセスしてください：

#### 方法A: トップページから
1. `http://localhost:3000`にアクセス
2. ブログセクションに移動
3. 任意の記事をクリック

#### 方法B: 直接URLでアクセス
- 日本語ブログ: `http://localhost:3000/ja/thoughts/[記事スラッグ]`
- 英語ブログ: `http://localhost:3000/en/thoughts/[記事スラッグ]`

### 3. URL変換機能の確認

記事本文内で以下の点を確認してください：

#### 3.1 独立したURLがブログカードに変換されていることを確認

**確認ポイント:**
- 記事本文内に独立したURL（`<p>https://example.com</p>`形式）が含まれている場合
- そのURLがiframe形式のブログカードとして表示されていること
- ブログカードにOGP情報（タイトル、説明、画像）が表示されていること

**期待される動作:**
```html
<!-- 変換前 -->
<p>https://example.com</p>

<!-- 変換後 -->
<iframe 
  src="https://ogp-metadata-service.wp-kyoto.workers.dev/card?url=https%3A%2F%2Fexample.com"
  width="100%"
  height="155"
  frameborder="0"
  loading="lazy"
  style="border: 1px solid #e5e7eb; border-radius: 0.5rem; margin: 1rem 0;"
></iframe>
```

#### 3.2 除外条件の確認

以下のURLは変換されず、元の形式のまま表示されることを確認してください：

**A. リンクタグ内のURL**
```html
<a href="https://example.com">リンクテキスト</a>
```
→ 通常のリンクとして表示される（ブログカードに変換されない）

**B. 画像URL**
```html
<p>https://example.com/image.jpg</p>
<p>https://example.com/photo.png</p>
```
→ 画像URLはブログカードに変換されない

**C. 自サイトURL**
```html
<p>https://hidetaka.dev/ja/thoughts/some-article</p>
```
→ 自サイトのURLはブログカードに変換されない

#### 3.3 複数URLの変換確認

記事内に複数の独立したURLが含まれている場合：
- すべてのURLが個別のブログカードに変換されていること
- 各ブログカードが正しく表示されていること

#### 3.4 iframeの遅延読み込み確認

**ブラウザの開発者ツールを使用:**

1. ブラウザの開発者ツールを開く（F12キー）
2. Networkタブを選択
3. ページをリロード
4. 記事ページをスクロールしてブログカードが表示される位置まで移動
5. Networkタブで`ogp-metadata-service.wp-kyoto.workers.dev`へのリクエストを確認

**期待される動作:**
- ページ読み込み時にはiframeのコンテンツは読み込まれない
- ブログカードが画面に表示される直前にiframeのコンテンツが読み込まれる（loading="lazy"の効果）

#### 3.5 スタイリングの確認

ブログカードが以下のスタイルで表示されていることを確認：
- 幅: 100%（親要素の幅に合わせる）
- 高さ: 155px
- ボーダー: 1px solid #e5e7eb（グレーの細い線）
- ボーダー半径: 0.5rem（角が丸い）
- マージン: 上下1rem

### 4. コンソールログの確認

ブラウザの開発者ツールのConsoleタブで以下のログを確認してください：

**成功時のログ:**
```
[TransformedBlogContent] Successfully transformed X URL(s) to blog cards
{
  thoughtId: 123,
  thoughtSlug: "article-slug",
  detectedUrls: ["https://example.com", ...]
}
```

**エラー時のログ:**
```
[TransformedBlogContent] Failed to transform URLs to blog cards
{
  thoughtId: 123,
  thoughtSlug: "article-slug",
  error: { message: "...", stack: "..." }
}
```

### 5. エラーハンドリングの確認

以下のシナリオでエラーが発生しないことを確認：

#### 5.1 URLが含まれない記事
- 記事本文にURLが含まれていない場合でも正常に表示される
- エラーが発生しない

#### 5.2 不正なHTML構造
- 記事本文のHTMLに不正な構造が含まれている場合でも、元のHTMLが表示される
- ページがクラッシュしない

#### 5.3 OGP Serviceが利用不可能
- OGP Serviceが一時的に利用不可能な場合でも、iframeタグは生成される
- OGP Service側でエラーハンドリングが行われる

## テストケース例

### テストケース1: 基本的なURL変換

**記事本文:**
```html
<p>この記事が参考になりました。</p>
<p>https://example.com</p>
<p>詳細はこちらをご覧ください。</p>
```

**期待される結果:**
- `https://example.com`がブログカードに変換される
- 他のテキストは変更されない

### テストケース2: 複数URLの変換

**記事本文:**
```html
<p>参考リンク1:</p>
<p>https://example.com</p>
<p>参考リンク2:</p>
<p>https://test.com</p>
```

**期待される結果:**
- 両方のURLがそれぞれブログカードに変換される
- 2つのiframeが表示される

### テストケース3: 除外条件の確認

**記事本文:**
```html
<p>通常のリンク: <a href="https://example.com">こちら</a></p>
<p>画像: https://example.com/image.jpg</p>
<p>自サイト: https://hidetaka.dev/ja/thoughts/article</p>
<p>変換対象: https://external-site.com</p>
```

**期待される結果:**
- `https://external-site.com`のみがブログカードに変換される
- 他のURLは変換されない

## パフォーマンス確認

### 処理時間の確認

ブラウザの開発者ツールのPerformanceタブで以下を確認：

1. Performanceタブを開く
2. 記録を開始
3. ページをリロード
4. 記録を停止
5. サーバーサイドレンダリングの処理時間を確認

**期待される結果:**
- URL変換処理が100ms以内に完了すること
- ページ全体の読み込み時間に大きな影響がないこと

### メモリ使用量の確認

1. Memoryタブを開く
2. Heap snapshotを取得
3. ページをリロード
4. 再度Heap snapshotを取得
5. メモリリークがないことを確認

## トラブルシューティング

### ブログカードが表示されない

**原因1: URLが検出されていない**
- Consoleタブでログを確認
- `detectedUrls`配列が空でないか確認

**原因2: iframeタグが生成されていない**
- ページのHTMLソースを表示（右クリック → ページのソースを表示）
- iframeタグが存在するか確認

**原因3: OGP Serviceが応答していない**
- Networkタブで`ogp-metadata-service.wp-kyoto.workers.dev`へのリクエストを確認
- レスポンスステータスコードを確認（200 OKが期待される）

### スタイリングが崩れている

**原因: CSSが適用されていない**
- iframeタグのstyle属性を確認
- ブラウザの開発者ツールでElementsタブを開き、iframeのスタイルを確認

### エラーが発生する

**原因: 不正なHTML構造**
- Consoleタブでエラーログを確認
- エラーメッセージとスタックトレースを記録
- 元のHTMLが表示されることを確認（フォールバック動作）

## 確認完了チェックリスト

以下の項目をすべて確認してください：

- [ ] 開発サーバーが正常に起動する
- [ ] ブログ記事ページにアクセスできる
- [ ] 独立したURLがブログカードに変換される
- [ ] リンクタグ内のURLは変換されない
- [ ] 画像URLは変換されない
- [ ] 自サイトURLは変換されない
- [ ] 複数のURLがそれぞれブログカードに変換される
- [ ] iframeが遅延読み込みされる（loading="lazy"）
- [ ] ブログカードのスタイリングが正しい
- [ ] Consoleに成功ログが表示される
- [ ] エラーが発生しない
- [ ] ページの読み込み速度が遅くならない

## 次のステップ

すべての確認項目をクリアしたら、タスク9.1を完了としてマークし、次のタスク（9.2 パフォーマンスの確認）に進んでください。

問題が発生した場合は、トラブルシューティングセクションを参照するか、開発チームに報告してください。
