# 要件定義書

## はじめに

本機能は、WordPress記事本文内に含まれる外部URLを自動的にOGPブログカードに変換する機能です。Next.js 16 + Cloudflare Workersで構築されたポートフォリオサイト（hidetaka.dev）において、WordPress REST API（wp-api.wp-kyoto.net）から取得した記事の本文HTMLを解析し、独立したURLをiframeベースのブログカードに置換します。

## 用語集

- **System**: WordPress記事本文のURL変換システム
- **URL_Detector**: 記事本文HTML内の独立したURLを検出するモジュール
- **Blog_Card_Transformer**: 検出されたURLをiframeタグに変換するモジュール
- **OGP_Service**: OGPメタデータを取得してブログカードHTMLを生成する外部サービス（https://ogp-metadata-service.wp-kyoto.workers.dev）
- **WordPress_API**: WordPress REST APIエンドポイント（wp-api.wp-kyoto.net）
- **Transformed_Content**: URL変換後のHTML本文
- **Independent_URL**: 独立したURL（`<p>https://example.com</p>`のような形式）
- **Excluded_URL**: 変換対象外のURL（既存のリンクタグ内、画像URL、自サイトURL）

## 要件

### 要件 1: 独立したURLの検出

**ユーザーストーリー:** 開発者として、記事本文HTML内の独立したURLを正確に検出したい。これにより、適切なURLのみをブログカードに変換できる。

#### 受入基準

1. WHEN 記事本文HTMLに独立したURL（`<p>https://example.com</p>`形式）が含まれる THEN THE URL_Detector SHALL そのURLを検出する
2. WHEN 記事本文HTMLにリンクタグ内のURL（`<a href="https://example.com">リンク</a>`）が含まれる THEN THE URL_Detector SHALL そのURLを検出しない
3. WHEN 記事本文HTMLに画像URL（.jpg, .png, .gif, .webp, .svg拡張子）が含まれる THEN THE URL_Detector SHALL そのURLを検出しない
4. WHEN 記事本文HTMLに自サイトURL（hidetaka.dev）が含まれる THEN THE URL_Detector SHALL そのURLを検出しない
5. WHEN 記事本文HTMLに複数の独立したURLが含まれる THEN THE URL_Detector SHALL すべての独立したURLを検出する

### 要件 2: URLのブログカード変換

**ユーザーストーリー:** 開発者として、検出されたURLをiframeベースのブログカードに変換したい。これにより、記事内でリッチなプレビューを表示できる。

#### 受入基準

1. WHEN 独立したURLが検出される THEN THE Blog_Card_Transformer SHALL そのURLをiframeタグに置換する
2. WHEN iframeタグを生成する THEN THE Blog_Card_Transformer SHALL URLをエスケープ処理（encodeURIComponent）する
3. WHEN iframeタグを生成する THEN THE Blog_Card_Transformer SHALL loading="lazy"属性を含める
4. WHEN iframeタグを生成する THEN THE Blog_Card_Transformer SHALL OGP_Serviceのエンドポイント（/card?url={URL}）を参照する
5. WHEN 複数のURLが検出される THEN THE Blog_Card_Transformer SHALL すべてのURLを個別のiframeタグに変換する

### 要件 3: サーバーサイド処理

**ユーザーストーリー:** 開発者として、URL変換処理をサーバーサイドで完結させたい。これにより、クライアント側の負荷を軽減し、SEOに最適化できる。

#### 受入基準

1. THE System SHALL Next.jsサーバーコンポーネントでURL変換処理を実行する
2. WHEN WordPress_APIから記事を取得する THEN THE System SHALL 記事本文HTMLを解析する
3. WHEN 記事本文HTMLを解析する THEN THE System SHALL URL_Detectorを使用して独立したURLを検出する
4. WHEN 独立したURLを検出する THEN THE System SHALL Blog_Card_Transformerを使用してiframeタグに変換する
5. WHEN 変換が完了する THEN THE System SHALL Transformed_Contentをクライアントに返す

### 要件 4: パフォーマンス最適化

**ユーザーストーリー:** 開発者として、URL変換処理が軽量で高速であることを保証したい。これにより、ページ読み込み速度を維持できる。

#### 受入基準

1. THE System SHALL URL検出と置換を文字列処理のみで実行する
2. THE System SHALL OGP_Serviceへのfetchリクエストを実行しない
3. WHEN iframeタグを生成する THEN THE System SHALL loading="lazy"属性を含めて遅延読み込みを有効化する
4. THE System SHALL Next.jsのISR（revalidate = 86400）と組み合わせてキャッシュを活用する
5. WHEN 記事本文HTMLが大きい THEN THE System SHALL 処理時間が100ms以内に完了する

### 要件 5: セキュリティ

**ユーザーストーリー:** 開発者として、URL変換処理が安全であることを保証したい。これにより、XSS攻撃やSSRF攻撃を防止できる。

#### 受入基準

1. WHEN URLをiframeタグに埋め込む THEN THE System SHALL URLをエスケープ処理（encodeURIComponent）する
2. THE OGP_Service SHALL SSRF保護を実装している
3. THE OGP_Service SHALL CORS設定でhidetaka.devを許可している
4. WHEN 不正なURLが検出される THEN THE System SHALL そのURLを変換せずにスキップする
5. THE System SHALL ユーザー入力を直接処理しない（WordPress CMSからの信頼されたコンテンツのみ）

### 要件 6: エラーハンドリング

**ユーザーストーリー:** 開発者として、URL変換処理が失敗した場合でも記事表示が継続されることを保証したい。これにより、ユーザー体験を損なわない。

#### 受入基準

1. WHEN URL検出処理が失敗する THEN THE System SHALL 元の記事本文HTMLを返す
2. WHEN URL変換処理が失敗する THEN THE System SHALL 元の記事本文HTMLを返す
3. WHEN 不正なHTMLが入力される THEN THE System SHALL エラーをログに記録し、元のHTMLを返す
4. WHEN OGP_Serviceが利用不可能 THEN THE System SHALL iframeタグを生成する（OGP_Service側でエラーハンドリング）
5. THE System SHALL すべてのエラーをログに記録する

### 要件 7: テスト可能性

**ユーザーストーリー:** 開発者として、URL変換処理が正しく動作することを自動テストで検証したい。これにより、リグレッションを防止できる。

#### 受入基準

1. THE System SHALL URL_Detectorを独立したモジュールとして実装する
2. THE System SHALL Blog_Card_Transformerを独立したモジュールとして実装する
3. WHEN ユニットテストを実行する THEN THE System SHALL URL検出ロジックをテストできる
4. WHEN ユニットテストを実行する THEN THE System SHALL URL変換ロジックをテストできる
5. WHEN プロパティベーステストを実行する THEN THE System SHALL ランダムなHTML入力で正しく動作することを検証できる

### 要件 8: 統合とデプロイ

**ユーザーストーリー:** 開発者として、既存のBlogDetailPageコンポーネントに最小限の変更で統合したい。これにより、既存機能への影響を最小化できる。

#### 受入基準

1. THE System SHALL BlogDetailPageコンポーネントで使用できるサーバーコンポーネントを提供する
2. WHEN BlogDetailPageコンポーネントが記事を表示する THEN THE System SHALL Transformed_Contentを使用する
3. WHEN 既存のdangerouslySetInnerHTMLを置き換える THEN THE System SHALL 同じスタイリングを維持する
4. THE System SHALL 既存のISR設定（revalidate = 86400）を維持する
5. WHEN デプロイする THEN THE System SHALL Cloudflare Workersで正常に動作する
