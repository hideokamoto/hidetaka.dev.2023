# CloudflareでOpenNextを使う際のR2/DO設定とブランチデプロイの注意点

## はじめに

Next.jsアプリケーションをCloudflare Workersにデプロイする際、`@opennextjs/cloudflare`を使用することで、Next.jsの機能をCloudflare Workers上で実行できます。ISR（Incremental Static Regeneration）などの高度な機能を利用するには、R2バケットやDurable Objects（DO）の設定が必要になりますが、これらの設定を含むWorkerをブランチデプロイする際には注意が必要です。

## 問題の概要

Cloudflare Builds APIを使用したブランチデプロイでは、`wrangler versions upload`コマンドが使用されます。しかし、Durable Objectsのマイグレーションを含むWorkerは、`wrangler versions upload`ではデプロイできません。

### エラーメッセージ

```
✘ [ERROR] Version upload failed. You attempted to upload a version of a Worker that includes a Durable Object migration, but migrations must be fully applied by running "wrangler deploy". See https://developers.cloudflare.com/workers/configuration/versions-and-deployments/gradual-deployments/#gradual-deployments-for-durable-objects for more information. [code: 10211]
```

## 原因

- `wrangler versions upload`は段階的デプロイメント（Gradual Deployments）用のコマンドで、マイグレーションをサポートしていない
- Durable Objectsのマイグレーションは`wrangler deploy`で完全に適用する必要がある
- Cloudflare Builds APIのブランチデプロイは`wrangler versions upload`を使用するため、マイグレーションを含むWorkerをデプロイできない

## 解決策

### 1. 本番環境で先にマイグレーションを適用する（推奨）

本番環境（mainブランチ）で先に`wrangler deploy`を実行してマイグレーションを適用します。

```bash
# 1. mainブランチにチェックアウト
git checkout main

# 2. 最新の変更を取得
git pull origin main

# 3. ビルド
npm run cf:build

# 4. デプロイ（マイグレーション適用）
npx wrangler deploy
```

これにより、Durable Objectsクラスが本番環境に作成されます。その後、ブランチデプロイではマイグレーションが既に適用済みなので、`wrangler versions upload`でも問題なくデプロイできます。

### 2. ローカルでテストする

ブランチデプロイが失敗する前に、ローカルで設定をテストできます。

```bash
# ビルド
npm run cf:build

# ローカルでプレビュー（Durable ObjectsとR2バケットもエミュレートされる）
npm run cf:preview
# または
npx wrangler dev --local
```

`wrangler dev --local`を使用すると、Durable ObjectsとR2バケットがローカルでエミュレートされ、実際の動作を確認できます。

### 3. wrangler.jsoncの更新だけを先にデプロイする

マイグレーションが必要な設定変更（R2バケットやDurable Objectsの追加）は、コード変更とは別に先にデプロイすることもできます。

```bash
# 1. wrangler.jsoncだけを変更したブランチを作成
git checkout -b setup-r2-do

# 2. wrangler.jsoncにR2バケットとDurable Objectsの設定を追加

# 3. デプロイしてマイグレーションを適用
npx wrangler deploy

# 4. 元のブランチに戻って開発を続ける
git checkout feature-branch
```

## 設定例

### wrangler.jsonc

```jsonc
{
  "name": "hidetaka-dev-workers",
  "main": ".open-next/worker.js",
  "compatibility_date": "2024-12-30",
  "compatibility_flags": ["nodejs_compat", "global_fetch_strictly_public"],
  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS"
  },
  // R2 bucket for incremental cache and ISR
  "r2_buckets": [
    {
      "binding": "NEXT_INC_CACHE_R2_BUCKET",
      "bucket_name": "hidetaka-dev-cache"
    }
  ],
  // Durable Objects for ISR queue handling
  "durable_objects": {
    "bindings": [
      {
        "name": "NEXT_CACHE_DO_QUEUE",
        "class_name": "DOQueueHandler"
      }
    ]
  },
  // Durable Objects migrations
  "migrations": [
    {
      "tag": "v1",
      "new_classes": [
        "DOQueueHandler"
      ]
    }
  ]
}
```

### open-next.config.ts

```typescript
import { defineCloudflareConfig } from "@opennextjs/cloudflare/config";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";

export default defineCloudflareConfig({
	// R2 incremental cache for ISR caching
	incrementalCache: r2IncrementalCache,
	// Durable Objects queue for ISR background revalidation
	queue: doQueue,
});
```

## ベストプラクティス

1. **マイグレーションは本番環境で先に適用**: R2バケットやDurable Objectsの追加は、機能開発とは別に先にデプロイする
2. **ローカルでテスト**: `wrangler dev --local`でローカル環境で動作確認する
3. **段階的な導入**: まずR2バケットだけを追加し、動作確認後にDurable Objectsを追加する
4. **ドキュメント化**: チーム内でこの制約を共有し、デプロイ手順を文書化する

## まとめ

CloudflareでOpenNextを使用する際、R2バケットやDurable Objectsなどの高度な機能を利用する場合：

- **ブランチデプロイは失敗する**: `wrangler versions upload`はマイグレーションをサポートしていない
- **解決策**: 本番環境で先に`wrangler deploy`を実行してマイグレーションを適用する
- **ローカルテスト**: `npm run cf:preview`や`wrangler dev --local`でローカル環境で動作確認する
- **設定の分離**: マイグレーションが必要な設定変更は、コード変更とは別に先にデプロイすることを検討する

この制約を理解し、適切なデプロイ戦略を立てることで、スムーズに開発を進めることができます。
