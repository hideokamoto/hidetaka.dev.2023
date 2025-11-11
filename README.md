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
# .env.localにMICROCMS_API_KEYを設定
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

1. Cloudflare用のビルド:
```bash
npm run cf:build
```

2. ローカルでのテスト:
```bash
npm run cf:dev
```

3. デプロイ:
```bash
npm run cf:deploy
```

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

- Cloudflare Workersにデプロイする場合は、`@cloudflare/next-on-pages`を使用してビルドする必要があります
- 静的アセットは `public/` ディレクトリに配置してください
- 環境変数はCloudflare Pagesのダッシュボードで設定してください
