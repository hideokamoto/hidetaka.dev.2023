# Hidetaka.dev - Next.js Portfolio Website

ポートフォリオサイトです。Next.js 16とCloudflare Workersを使用して構築されています。

## 技術スタック

- **Framework**: Next.js 16 (App Router)
- **Runtime**: Cloudflare Workers
- **Styling**: Tailwind CSS
- **CMS**: microCMS
- **Language**: TypeScript

## セットアップ

1. 依存関係のインストール:
```bash
npm install
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
npm run dev
```

## ビルドとデプロイ

### ローカルビルド
```bash
npm run build
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
   npm run cf:build
   ```
   このコマンドは以下を実行します:
   - Next.jsアプリケーションをビルド
   - OpenNextを使用してCloudflare Workers用にアダプト
   - `.open-next/`ディレクトリにビルド成果物を生成

#### プレビュー（ローカルテスト）

ビルド後、ローカルでプレビューできます:

```bash
npm run cf:preview
```

このコマンドは以下を実行します:
- `npm run cf:build`でビルド
- `wrangler dev`でローカルプレビューサーバーを起動（`http://localhost:8787`）

**注意**: R2バケットは不要です。R2はISR（Incremental Static Regeneration）のキャッシュが必要な場合のみオプションで使用します。

#### デプロイ手順

1. **本番環境へのデプロイ**
   ```bash
   npm run cf:deploy
   # または明示的に
   npm run cf:deploy:production
   ```
   このコマンドは以下を実行します:
   - `npm run cf:build`でビルド
   - `opennextjs-cloudflare deploy --env production`でCloudflare Workersにデプロイ

2. **非本番環境（staging）へのデプロイ**
   ```bash
   npm run cf:deploy:staging
   ```
   このコマンドは以下を実行します:
   - `npm run cf:build`でビルド
   - `opennextjs-cloudflare deploy --env staging`でCloudflare Workersにデプロイ

   **注意**: `wrangler.toml`に`[env.staging]`セクションが設定されている必要があります。

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

- `npm run cf:build` - Cloudflare Workers用にビルド
- `npm run cf:preview` - ビルド後、ローカルでプレビュー（`wrangler dev`）
- `npm run cf:dev` - ビルド後、`opennextjs-cloudflare preview`でプレビュー
- `npm run cf:deploy` - ビルド後、本番環境にデプロイ（デフォルト）
- `npm run cf:deploy:production` - ビルド後、本番環境にデプロイ（明示的）
- `npm run cf:deploy:staging` - ビルド後、非本番環境（staging）にデプロイ

## CI/CD パイプライン

このプロジェクトはCircleCIを使用して自動化されたCI/CDパイプラインを実装しています。

### パイプライン概要

```text
lint → test → cf-build → deploy
```

1. **lint** - Biomeによるコード品質チェック
2. **test** - Vitestによるユニットテスト実行
3. **cf-build** - Cloudflare Workers用のビルド
4. **deploy** - 本番環境またはプレビュー環境へのデプロイ

### Free プランの最適化

CircleCIの無料プラン（6,000ビルド分/月）を効率的に使用するため、以下の最適化を実施:

- **Small リソースクラス** (1 vCPU, 2GB RAM)
- **自動キャッシュ** - node orbによる`node_modules/`の自動キャッシュ
- **1日のワークスペース保持** - ビルド成果物の効率的な共有
- **並列実行** - `test`と`cf-build`を並列実行して時間短縮

### 必須環境変数

CircleCIプロジェクト設定で以下の環境変数を設定する必要があります:

| 変数名 | 説明 |
|--------|------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare Workers デプロイ用APIトークン |
| `CLOUDFLARE_ACCOUNT_ID` | CloudflareアカウントID |
| `MICROCMS_API_KEY` | microCMS APIキー |
| `OG_IMAGE_GEN_AUTH_TOKEN` | OG画像生成認証トークン |

### デプロイ戦略

**Cloudflare Workers Buildsと同じアーキテクチャ:**
- 単一Worker (`hidetaka-dev`) でバージョン管理
- プレビューエイリアスによるブランチ分離
- 手動クリーンアップ不要

**本番デプロイ** (`main`ブランチ):
- コマンド: `wrangler versions deploy`
- URL: `https://hidetaka-dev.workers.dev`
- バージョンベースのデプロイで本番トラフィックを管理

**プレビューデプロイ** (その他のブランチ):
- コマンド: `wrangler versions upload --preview-alias`
- URL: `https://{branch-alias}-hidetaka-dev.workers.dev`
- 例: `feature/new-ui` → `https://feature-new-ui-hidetaka-dev.workers.dev`
- 同じブランチへの追加コミットでもURLは変わらない

### プレビュー管理

✅ **手動クリーンアップ不要** - Cloudflareが自動管理

プレビューエイリアスは自動的にCloudflareによって管理されるため、手動でのWorker削除は不要です。すべてのデプロイが単一のWorker上でバージョンとして管理されます。

**バージョン確認 (任意):**

```bash
npx wrangler versions list
```

### 詳細ドキュメント

CircleCIセットアップの詳細については、以下を参照してください:
- [CircleCIセットアップガイド](docs/guides/circleci-setup.md) - パイプライン構成、ジョブ詳細、トラブルシューティング

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
