# ブログリアクション機能 PoC レポート

## 概要

個人ブログに軽い反応（いいね、スター、メンション）を追加する機能のProof of Concept (PoC)を実装しました。
songmuさんのブログ（https://blog.song.mu/）で使用されている3つのリアクション機能を参考に実装しています。

## 実装した機能

### 1. はてなスター (Hatena Star) ⭐

**特徴:**
- 日本語圏で人気の軽いリアクション機能
- はてなアカウントを持つユーザーが記事にスター（★）を付けられる
- 複数のスターや色付きスターにも対応

**実装方法:**
- 公式の埋め込みスクリプト（`https://s.hatena.ne.jp/js/HatenaStar.js`）を使用
- Next.jsの`<Script>`コンポーネントで最適化された読み込み
- `strategy="lazyOnload"`で遅延読み込み
- 記事のURLとタイトルを指定するだけで動作

**本番環境での設定:**
- アカウント登録: 不要
- 追加設定: なし（はてなの公式スクリプトをロードするだけ）
- 反応可能なユーザー: はてなアカウント保有者のみ
- 表示: 誰でも見られる

**ファイル:**
- `src/components/ui/reactions/HatenaStar.tsx`

### 2. Disqus Reactions 👍

**特徴:**
- 絵文字ベースのリアクション（👍❤️😂など）
- コメントシステムのDisqusに付属する軽量反応機能
- 多様な感情表現が可能

**実装方法:**
- Disqusの公式埋め込みスクリプトを使用
- Next.jsの`<Script>`コンポーネントで最適化された読み込み
- `strategy="lazyOnload"`で遅延読み込み
- 記事のURL、識別子、タイトルを指定

**本番環境での設定:**
1. Disqusアカウントを作成（https://disqus.com/）
2. サイトを登録してshortnameを取得
3. 管理画面でReactions機能を有効化
4. コンポーネントにshortnameを設定

**注意点:**
- Disqusはやや重い（外部スクリプトのロード）
- プライバシー面で懸念がある場合は要検討
- 無料プランでは広告が表示される

**ファイル:**
- `src/components/ui/reactions/DisqusReactions.tsx`

### 3. Webmention 🔗

**特徴:**
- IndieWebの標準プロトコル
- 他のウェブサイトからの言及（メンション）を収集・表示
- 分散型でプライバシーに配慮
- TwitterやFacebookのような「引用」機能の分散版

**実装方法:**
- Webmention.io（無料サービス）のAPIを使用
- クライアントコンポーネントとして実装
- 記事URLに対するメンションを取得して表示

**本番環境での設定:**
1. Webmention.ioでアカウントを作成（https://webmention.io/）
2. ドメインを認証
3. HTMLの`<head>`に以下のタグを追加:
```html
<link rel="webmention" href="https://webmention.io/your-domain/webmention" />
<link rel="pingback" href="https://webmention.io/your-domain/xmlrpc" />
```
4. 他のサイトがあなたの記事をリンクすると自動的にメンションが記録される

**特徴:**
- プライバシー重視
- 長期的に持続可能
- IndieWebコミュニティで推奨されている

**ファイル:**
- `src/components/ui/reactions/WebmentionDisplay.tsx`

## 統合コンポーネント

### BlogReactions

3つのリアクション機能を統合的に管理するコンポーネントを作成しました。

**機能:**
- タブUIで切り替え表示（すべて / はてなスター / リアクション / Webmention）
- 各機能の有効/無効を切り替え可能
- 多言語対応（日本語/英語）
- PoC用の説明テキストを含む

**使用方法:**
```tsx
<BlogReactions
  url="https://hidetaka.dev/blog/example-post"
  title="記事タイトル"
  slug="example-post"
  lang="ja"
  enableHatenaStar={true}
  enableDisqus={true}
  enableWebmention={true}
/>
```

**ファイル:**
- `src/components/ui/reactions/BlogReactions.tsx`

## ブログ詳細ページへの統合

`BlogDetailPage`コンポーネントに統合しました。

**配置場所:**
- プロフィールカードの後
- 関連記事の前
- 適切な余白とボーダーで区切り

**変更ファイル:**
- `src/components/containers/pages/BlogDetailPage.tsx`

## 技術的な詳細

### コンポーネント設計

**Next.js最適化:**
- ✅ **`next/script`の`<Script>`コンポーネントを使用**
  - はてなスターとDisqusで`next/script`を活用
  - `strategy="lazyOnload"`で遅延読み込み
  - パフォーマンス最適化とバンドルサイズ削減
  - 重複ロードの自動防止
  - スクリプトの読み込み順序を制御

**クライアントコンポーネント:**
- すべてのリアクションコンポーネントは`'use client'`ディレクティブを使用
- 外部スクリプトの読み込みに`next/script`を使用（`useEffect`の手動管理は不要）
- Webmentionのデータ取得に`useState`と`useEffect`を使用

**型安全性:**
- propsのみに依存
- 再利用可能な設計
- TypeScriptで型安全
- `declare global`でWindow型を拡張（はてなスター・Disqus用）

**スタイリング:**
- TailwindCSSのユーティリティクラスを使用
- ダークモード対応
- レスポンシブデザイン

### ディレクトリ構造

```
src/components/ui/reactions/
├── HatenaStar.tsx           # はてなスター
├── DisqusReactions.tsx      # Disqusリアクション
├── WebmentionDisplay.tsx    # Webmention表示
└── BlogReactions.tsx        # 統合コンポーネント
```

## テスト結果

### Lint

```bash
npm run lint
```

**結果:**
- ✅ 新規作成したコンポーネントは問題なし
- ⚠️ `HatenaStar.tsx`で`any`型を2箇所使用（外部API型定義がないため許容範囲）
- ⚠️ 既存コードの警告は変更なし

### Build

```bash
npm run build
```

**結果:**
- ✅ TypeScriptコンパイル成功
- ✅ すべてのページの静的生成成功
- ⚠️ 外部API（WordPress、npm、Qiita等）への接続エラーはネットワーク環境の問題（コードの問題ではない）

## 推奨する導入方法

### 段階的な導入

**Phase 1: はてなスターのみ**
- 最も簡単（設定不要）
- 日本語ユーザーに人気
- 即座に導入可能

```tsx
<BlogReactions
  url={articleUrl}
  title={articleTitle}
  slug={articleSlug}
  lang="ja"
  enableHatenaStar={true}
  enableDisqus={false}
  enableWebmention={false}
/>
```

**Phase 2: Webmentionを追加**
- webmention.ioでアカウント作成
- HTMLヘッダーにタグ追加
- プライバシー重視で長期的に推奨

**Phase 3: Disqusを検討**
- より多様なリアクションが必要な場合
- プライバシーとパフォーマンスへの影響を考慮

### 本番環境での設定

#### 環境変数（オプション）

```env
# .env.local
DISQUS_SHORTNAME=your-disqus-shortname
WEBMENTION_DOMAIN=hidetaka.dev
```

#### HTMLヘッダーへの追加

`src/app/layout.tsx`に以下を追加（Webmention用）:

```tsx
<head>
  <link rel="webmention" href="https://webmention.io/hidetaka.dev/webmention" />
  <link rel="pingback" href="https://webmention.io/hidetaka.dev/xmlrpc" />
</head>
```

## メリットとデメリット

### はてなスター

**メリット:**
- 設定不要で即座に導入可能
- 日本語圏で広く認知されている
- 軽量

**デメリット:**
- はてなアカウント必須（海外ユーザーには不向き）
- 感情表現が限定的

### Disqus Reactions

**メリット:**
- 多様な絵文字で感情表現が豊富
- 国際的に認知されている
- 簡単に導入可能

**デメリット:**
- やや重い（外部スクリプト）
- プライバシー懸念
- 無料プランは広告あり

### Webmention

**メリット:**
- 分散型で持続可能
- プライバシー重視
- IndieWebの標準
- 他サイトからの引用を収集できる

**デメリット:**
- 初期設定が必要（ドメイン認証）
- 認知度が低い（まだ普及していない）
- リアクション数が少ない可能性

## 次のステップ

### 本番環境への適用前に必要な作業

1. **Disqus設定**
   - Disqusアカウント作成
   - shortnameを取得
   - `DisqusReactions.tsx`にshortnameを設定

2. **Webmention設定**
   - webmention.ioでドメイン認証
   - HTMLヘッダーにタグ追加
   - テスト投稿で動作確認

3. **パフォーマンス最適化**
   - 外部スクリプトの遅延ロード検討
   - 必要に応じてサーバーサイドキャッシュ

4. **ユーザーテスト**
   - ライト/ダークモード確認
   - モバイル表示確認
   - ブラウザ互換性確認

### 拡張可能性

- **カスタムスタイリング**: TailwindCSSクラスでカスタマイズ可能
- **条件付き表示**: 特定カテゴリのみリアクションを表示
- **統計表示**: リアクション数の集計とグラフ化
- **通知機能**: リアクションがあったら通知

## 結論

3つのリアクション機能のPoCを実装しました。各機能は独立して動作し、組み合わせて使用することも可能です。

**推奨導入順序:**
1. はてなスター（即座に導入可能）
2. Webmention（長期的に推奨、初期設定必要）
3. Disqus（必要に応じて検討）

コードは本番環境に近い品質で実装されており、必要な設定を行えばすぐに本番適用可能です。

## 参考リンク

- [はてなスター開発者向けドキュメント](https://developer.hatena.ne.jp/ja/documents/star/embed)
- [Disqus公式サイト](https://disqus.com/)
- [Webmention.io](https://webmention.io/)
- [IndieWeb - Webmention](https://indieweb.org/Webmention)
- [songmuさんのブログ](https://blog.song.mu/)

## 作成ファイル一覧

```
src/components/ui/reactions/
├── HatenaStar.tsx           # 新規作成
├── DisqusReactions.tsx      # 新規作成
├── WebmentionDisplay.tsx    # 新規作成
└── BlogReactions.tsx        # 新規作成

src/components/containers/pages/
└── BlogDetailPage.tsx       # 変更（リアクション統合）

docs/poc/
└── blog-reactions-poc-report.md  # 本ドキュメント
```

---

**作成日:** 2026-01-03
**作成者:** Claude Code
**PoC対象:** ブログリアクション機能（はてなスター、Disqus、Webmention）

## 更新履歴

- **2026-01-03 (初版)**: 初回PoC実装（はてなスター、Disqus、Webmention）
- **2026-01-03 (v2)**: Next.jsの`next/script`を使った最適化実装に変更
  - `useEffect`での手動スクリプト管理から`<Script>`コンポーネントへ移行
  - `strategy="lazyOnload"`で遅延読み込みを実現
  - パフォーマンス向上とバンドルサイズ削減
  - TypeScript型定義を`declare global`で追加
