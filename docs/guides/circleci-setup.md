# CircleCI CI/CD設定ガイド

このドキュメントでは、Hidetaka.devプロジェクトのCircleCI CI/CD設定とブランチデプロイの方法について説明します。

## 概要

CircleCIを使用して以下のCI/CDパイプラインを実装しています：

1. **Lintチェック**: Biomeによるコード品質チェック
2. **Unit Test**: Vitestによるユニットテスト実行
3. **Build**: Next.jsアプリケーションのビルド
4. **Cloudflare Build**: Cloudflare Workers用のビルド
5. **Production Deploy**: mainブランチへのデプロイ（本番環境）
6. **Branch Deploy**: その他のブランチへのデプロイ（プレビュー環境）

## CircleCI設定ファイル

設定ファイルは `.circleci/config.yml` にあります。

### ワークフロー構成

```yaml
workflows:
  ci:
    jobs:
      - lint
      - test
      - build
      - cf-build
      - deploy-production:  # mainブランチのみ
      - deploy-branch:      # main以外のブランチ
```

### ジョブの説明

#### 1. lint
- Biomeによるリントチェックを実行
- `npm run lint:check` を実行

#### 2. test
- Vitestによるユニットテストを実行
- カバレッジレポートを生成し、アーティファクトとして保存

#### 3. build
- Next.jsアプリケーションをビルド
- `MICROCMS_API_MODE=mock` でモックデータを使用

#### 4. cf-build
- Cloudflare Workers用のビルドを実行
- `.open-next` ディレクトリをワークスペースに保存

#### 5. deploy-production
- mainブランチのみ実行
- 本番環境（`hidetaka-dev-workers`）にデプロイ
- `wrangler deploy` を使用

#### 6. deploy-branch
- main以外のブランチで実行
- ブランチ名を含むWorker名でデプロイ
- 例: `hidetaka-dev-workers-feature-branch`

## 環境変数の設定

CircleCIで以下の環境変数を設定する必要があります：

### 必須環境変数

1. **CLOUDFLARE_API_TOKEN**
   - Cloudflare APIトークン
   - [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens) で作成
   - 必要な権限:
     - Account: Workers Scripts: Edit
     - Zone: Zone Settings: Read, Zone: Read
     - Account: Account Settings: Read

2. **CLOUDFLARE_ACCOUNT_ID**
   - CloudflareアカウントID
   - [Cloudflare Dashboard](https://dash.cloudflare.com/) の右サイドバーから確認可能

### 環境変数の設定方法

1. CircleCIのプロジェクトページにアクセス
2. **Project Settings** > **Environment Variables** に移動
3. 以下の環境変数を追加:
   - `CLOUDFLARE_API_TOKEN`: Cloudflare APIトークン
   - `CLOUDFLARE_ACCOUNT_ID`: CloudflareアカウントID

## ブランチデプロイの仕組み

### Worker名の生成

ブランチデプロイでは、ブランチ名を基にWorker名を生成します：

```bash
# ブランチ名: feature/new-feature
# Worker名: hidetaka-dev-workers-feature-new-feature

# ブランチ名: claude/add-feature
# Worker名: hidetaka-dev-workers-claude-add-feature
```

### ブランチ名の正規化

ブランチ名は以下のルールで正規化されます：

1. スラッシュ（`/`）をハイフン（`-`）に変換
2. アンダースコア（`_`）をハイフン（`-`）に変換
3. 大文字を小文字に変換
4. 最大50文字に制限

### デプロイコマンド

```bash
# ブランチ名を含むWorker名でデプロイ
npx wrangler deploy --name ${WORKER_NAME}
```

`--name` オプションを使用することで、`wrangler.jsonc` の `name` フィールドを上書きできます。

## デプロイURL

### 本番環境

```
https://hidetaka-dev-workers.${CLOUDFLARE_ACCOUNT_ID}.workers.dev
```

### ブランチプレビュー

```
https://hidetaka-dev-workers-${BRANCH_NAME}.${CLOUDFLARE_ACCOUNT_ID}.workers.dev
```

例:
- ブランチ: `feature/new-feature`
- URL: `https://hidetaka-dev-workers-feature-new-feature.${CLOUDFLARE_ACCOUNT_ID}.workers.dev`

## 注意事項

### Durable Objectsとマイグレーション

このプロジェクトはDurable Objectsを使用しているため、ブランチデプロイには注意が必要です。

詳細は [cloudflare-opennext-r2-do-branch-deploy.md](./cloudflare-opennext-r2-do-branch-deploy.md) を参照してください。

**重要なポイント:**
- 本番環境で先に `wrangler deploy` を実行してマイグレーションを適用する必要があります
- ブランチデプロイは `wrangler deploy` を使用するため、マイグレーション済みのWorkerに対しては問題なく動作します

### R2バケットとDurable Objectsの設定

ブランチデプロイでも、本番環境と同じR2バケットとDurable Objectsを使用します。

**注意:** ブランチデプロイでは、本番環境と同じリソース（R2バケット、Durable Objects）を共有するため、データの競合に注意してください。

## トラブルシューティング

### デプロイが失敗する場合

1. **環境変数の確認**
   - CircleCIの環境変数が正しく設定されているか確認
   - `CLOUDFLARE_API_TOKEN` と `CLOUDFLARE_ACCOUNT_ID` が設定されているか

2. **Cloudflare APIトークンの権限確認**
   - APIトークンに必要な権限が付与されているか確認

3. **Worker名の制限**
   - Worker名は63文字以下である必要があります
   - ブランチ名が長すぎる場合は、自動的に50文字に制限されます

### ビルドが失敗する場合

1. **依存関係の確認**
   - `package.json` と `package-lock.json` が最新か確認
   - `npm ci` が正常に実行されるか確認

2. **TypeScriptエラー**
   - ローカルで `npm run build` を実行してエラーを確認

3. **テストの失敗**
   - ローカルで `npm run test` を実行してエラーを確認

## GitHub Actionsからの移行

このプロジェクトは以前GitHub Actionsを使用していましたが、CircleCIに移行しました。

### 主な違い

| 機能 | GitHub Actions | CircleCI |
|------|---------------|----------|
| 設定ファイル | `.github/workflows/test.yml` | `.circleci/config.yml` |
| 環境変数 | GitHub Secrets | CircleCI Environment Variables |
| ブランチデプロイ | 手動設定が必要 | 自動的にブランチごとにデプロイ |

### 移行のメリット

1. **ブランチデプロイの自動化**: すべてのブランチで自動的にプレビュー環境が作成される
2. **設定の簡素化**: 単一の設定ファイルで管理
3. **柔軟な設定**: CircleCIのワークフロー機能を活用

## 参考リンク

- [CircleCI Documentation](https://circleci.com/docs/)
- [Wrangler Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [@opennextjs/cloudflare Documentation](https://opennext.js.org/cloudflare)
