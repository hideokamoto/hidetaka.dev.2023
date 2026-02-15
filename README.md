# Hidetaka.dev - Next.js Portfolio Website

ポートフォリオサイトです。Next.js 16とCloudflare Workersを使用して構築されています。

## 技術スタック

- **Framework**: Next.js 16 (App Router)
- **Runtime**: Cloudflare Workers
- **Styling**: Tailwind CSS
- **CMS**: microCMS
- **Language**: TypeScript

## セットアップ

### パッケージマネージャー

このプロジェクトは**pnpm**を使用しています。npmのoptional dependencies問題（`@ast-grep/napi`のネイティブバインディングエラー）を回避するため、pnpmへ移行しました。

pnpmのインストール:
```bash
npm install -g pnpm
# または
brew install pnpm
```

1. 依存関係のインストール:
```bash
pnpm install
```

2. 環境変数の設定:
```bash
cp .env.example .env.local
# .env.localに以下の環境変数を設定:
# - MICROCMS_API_KEY: microCMS APIキー
# - OG_IMAGE_GEN_AUTH_TOKEN: OG画像生成の認証トークン
# - NEXT_PUBLIC_ENABLE_HATENA_STAR: はてなスター機能の有効化 (true/false)
```

3. 開発サーバーの起動:
```bash
pnpm run dev
```

### npmからの移行

既存のnpmプロジェクトからpnpmへ移行する場合:

```bash
# 既存のnode_modulesとpackage-lock.jsonを削除
rm -rf node_modules package-lock.json

# pnpmで依存関係をインストール
pnpm install
```

## ビルドとデプロイ

### ローカルビルド
```bash
pnpm run build
```

### Cloudflare Workersへのデプロイ

このプロジェクトは`@opennextjs/cloudflare`を使用してCloudflare Workersにデプロイします。

#### 前提条件

1. **Cloudflareアカウントの準備**
   - [Cloudflare](https://dash.cloudflare.com/)でアカウントを作成
   - Workers & Pages の有効化

2. **Wrangler CLIの認証**
   ```bash
   npx wrangler login
   ```
   ブラウザが開き、Cloudflareアカウントでログインして認証を完了します。

3. **環境変数の設定**
   - Cloudflare Workersダッシュボードで環境変数を設定するか、`wrangler.toml`の`[env.production]`セクションで設定
   - 必要な環境変数: `MICROCMS_API_KEY`

#### ビルド手順

1. **Cloudflare用のビルド**
   ```bash
   pnpm run cf:build
   ```
   このコマンドは以下を実行します:
   - Next.jsアプリケーションをビルド
   - OpenNextを使用してCloudflare Workers用にアダプト
   - `.open-next/`ディレクトリにビルド成果物を生成

#### プレビュー（ローカルテスト）

ビルド後、ローカルでプレビューできます:

```bash
pnpm run cf:preview
```

このコマンドは以下を実行します:
- `pnpm run cf:build`でビルド
- `wrangler dev`でローカルプレビューサーバーを起動（`http://localhost:8787`）

**注意**: R2バケットは不要です。R2はISR（Incremental Static Regeneration）のキャッシュが必要な場合のみオプションで使用します。

#### デプロイ手順

1. **本番環境へのデプロイ**
   ```bash
   pnpm run cf:deploy
   # または明示的に
   pnpm run cf:deploy:production
   ```
   このコマンドは以下を実行します:
   - `pnpm run cf:build`でビルド
   - `opennextjs-cloudflare deploy --env production`でCloudflare Workersにデプロイ

2. **非本番環境（staging）へのデプロイ**
   ```bash
   pnpm run cf:deploy:staging
   ```
   このコマンドは以下を実行します:
   - `pnpm run cf:build`でビルド
   - `opennextjs-cloudflare deploy --env staging`でCloudflare Workersにデプロイ

   **注意**: `wrangler.jsonc`に`env.staging`セクションが設定されている必要があります。

3. **デプロイ後の確認**
   - Cloudflareダッシュボードでデプロイ状況を確認
   - デプロイされたURLでサイトにアクセスして動作確認

#### 環境変数の設定

各環境の環境変数は以下のいずれかの方法で設定できます:

**方法1: wrangler.tomlで設定**
```toml
# 本番環境
[env.production]
vars = {
  MICROCMS_API_KEY = "your-production-api-key",
  NEXT_PUBLIC_ENABLE_HATENA_STAR = "true"
}

# 非本番環境（例: staging）
[env.staging]
vars = {
  MICROCMS_API_KEY = "your-staging-api-key",
  NEXT_PUBLIC_ENABLE_HATENA_STAR = "false"
}
```

**方法2: Cloudflareダッシュボードで設定**
1. Cloudflareダッシュボードにログイン
2. Workers & Pages > hidetaka-dev を選択
3. Settings > Variables で環境変数を設定
4. 環境ごとに異なる値を設定できます

**方法3: Wrangler CLIで設定**
```bash
# 本番環境のシークレットを設定
npx wrangler secret put MICROCMS_API_KEY --env production

# 非本番環境のシークレットを設定
npx wrangler secret put MICROCMS_API_KEY --env staging
```

#### 利用可能なスクリプト

- `pnpm run cf:build` - Cloudflare Workers用にビルド
- `pnpm run cf:preview` - ビルド後、ローカルでプレビュー（`wrangler dev`）
- `pnpm run cf:dev` - ビルド後、`opennextjs-cloudflare preview`でプレビュー
- `pnpm run cf:deploy` - ビルド後、本番環境にデプロイ（デフォルト）
- `pnpm run cf:deploy:production` - ビルド後、本番環境にデプロイ（明示的）
- `pnpm run cf:deploy:staging` - ビルド後、非本番環境（staging）にデプロイ

## プロジェクト構造

```
src/
├── app/              # Next.js App Router pages
│   ├── page.tsx     # トップページ（英語）
│   ├── about/       # Aboutページ
│   ├── projects/    # Projectsページ
│   ├── news/        # Newsページ
│   └── ja/          # 日本語版ページ
├── components/       # Reactコンポーネント
├── lib/             # ユーティリティとライブラリ
│   ├── microCMS/    # microCMS統合
│   └── sanitize.ts  # HTMLサニタイズ
└── libs/            # データソース（既存のAstroコードから移行）
    └── dataSources/ # ブログ投稿のデータソース
```

## 多言語対応

- 英語版: `/` から始まるパス
- 日本語版: `/ja/` から始まるパス
- 既存の `/ja-JP/*` パスは自動的に `/ja/*` にリダイレクトされます（middleware.tsで実装）

## 注意事項

- Cloudflare Workersにデプロイする場合は、`@opennextjs/cloudflare`を使用してビルドする必要があります
- 静的アセットは `public/` ディレクトリに配置してください
- 環境変数は`wrangler.toml`またはCloudflare Workersのダッシュボードで設定してください
- R2バケットはオプションです。ISR（Incremental Static Regeneration）のキャッシュが必要な場合のみ使用します
- ビルド成果物は`.open-next/`ディレクトリに生成されます（`.gitignore`に含まれています）
