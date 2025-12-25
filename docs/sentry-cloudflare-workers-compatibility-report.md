# Sentry SDKのCloudflare Workers互換性調査レポート

**調査日:** 2025-01-XX  
**調査対象:** `@sentry/nextjs` v10.32.1 の Cloudflare Workers 互換性  
**関連エラー:** Cloudflareエラー1101 (Worker threw an exception)

---

## エグゼクティブサマリー

**結論:** `@sentry/nextjs`は**Cloudflare Workers環境を直接サポートしていません**。現在の実装では、Vercel Edge Runtime向けの`@sentry/vercel-edge`を使用しており、これがCloudflare Workers環境で互換性の問題を引き起こしている可能性が高いです。

**推奨対応:**
1. **短期対応:** Cloudflare Workers環境でのSentry初期化を無効化または条件付きで実行
2. **中期対応:** `@sentry/cloudflare`パッケージの導入を検討
3. **長期対応:** Next.js + Cloudflare Workers環境に最適化されたSentry統合を実装

---

## 調査結果の詳細

### 1. 現在のSentry実装の構成

#### 1.1 使用中のパッケージ
- **メインパッケージ:** `@sentry/nextjs@10.32.1`
- **依存パッケージ:**
  - `@sentry/node@10.32.1` (Node.js環境用)
  - `@sentry/vercel-edge@10.32.1` (Vercel Edge Runtime用)
  - `@sentry/react@10.32.1` (React用)
  - `@sentry/core@10.32.1` (コアライブラリ)

#### 1.2 設定ファイルの構成
```
sentry.client.config.ts    # クライアント側（ブラウザ）
sentry.server.config.ts    # サーバー側（Node.js）
sentry.edge.config.ts      # Edge Runtime（Vercel Edge Runtime想定）
src/instrumentation.ts      # Next.js instrumentation hook
```

#### 1.3 instrumentation.tsの実装
```typescript
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config')
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config')
  }
}
```

**問題点:**
- `NEXT_RUNTIME === 'edge'`はVercel Edge Runtimeを想定
- Cloudflare Workers環境では`NEXT_RUNTIME`の値が異なる可能性
- `@sentry/vercel-edge`はCloudflare Workers環境で動作しない可能性が高い

---

### 2. Sentry SDKのランタイム別サポート状況

#### 2.1 各パッケージの目的

| パッケージ | 対象環境 | 説明 |
|-----------|---------|------|
| `@sentry/nextjs` | Next.js全般 | Next.jsアプリケーション向けの統合パッケージ |
| `@sentry/node` | Node.js | Node.jsサーバー環境用 |
| `@sentry/vercel-edge` | Vercel Edge Runtime | Vercel Edge Runtime専用 |
| `@sentry/cloudflare` | Cloudflare Workers/Pages | Cloudflare Workers専用 |

#### 2.2 `@sentry/vercel-edge`の詳細

**説明:** "Official Sentry SDK for the Vercel Edge Runtime"  
**GitHub:** https://github.com/getsentry/sentry-javascript/tree/master/packages/vercel-edge

**重要な点:**
- Vercel Edge Runtime専用に設計されている
- Cloudflare Workersとは異なるランタイム環境
- Vercel Edge RuntimeはV8ベースだが、Cloudflare Workersは独自のランタイム

#### 2.3 `@sentry/cloudflare`の存在確認

**パッケージ名:** `@sentry/cloudflare@10.32.1`  
**説明:** "Official Sentry SDK for Cloudflare Workers and Pages"  
**GitHub:** https://github.com/getsentry/sentry-javascript/tree/master/packages/cloudflare

**依存関係:**
```json
{
  "dependencies": {
    "@opentelemetry/api": "^1.9.0",
    "@sentry/core": "10.32.1"
  },
  "peerDependencies": {
    "@cloudflare/workers-types": "^4.x"
  }
}
```

**重要な点:**
- Cloudflare Workers専用のパッケージが存在する
- `@sentry/nextjs`には含まれていない
- 別途インストールが必要

---

### 3. Cloudflare Workers環境での問題点

#### 3.1 ランタイム環境の違い

| 項目 | Vercel Edge Runtime | Cloudflare Workers |
|------|-------------------|-------------------|
| ベースランタイム | V8 (Chrome) | V8 (独自実装) |
| 互換性フラグ | 不要 | `nodejs_compat`または`nodejs_als`が必要 |
| 環境変数アクセス | `process.env` | `env`オブジェクト経由 |
| AsyncLocalStorage | 利用可能 | 互換性フラグが必要 |
| グローバルオブジェクト | `globalThis` | `globalThis` (制限あり) |

#### 3.2 現在の実装での問題

1. **ランタイム検出の不確実性**
   - `NEXT_RUNTIME === 'edge'`がCloudflare Workersで正しく動作するか不明
   - `@opennextjs/cloudflare`がどのようにランタイムを設定するか不明

2. **SDKの互換性**
   - `@sentry/vercel-edge`はVercel Edge Runtime向け
   - Cloudflare Workers環境では動作しない可能性が高い

3. **環境変数のアクセス方法**
   - Cloudflare Workersでは`process.env`ではなく`env`オブジェクト経由
   - Sentry設定で環境変数が正しく取得できない可能性

4. **AsyncLocalStorageの依存**
   - `@sentry/cloudflare`は`nodejs_als`または`nodejs_compat`フラグが必要
   - 現在の`wrangler.jsonc`には`nodejs_compat`はあるが、`nodejs_als`はない

---

### 4. `@opennextjs/cloudflare`との関係

#### 4.1 OpenNextJS Cloudflareの役割
- Next.jsアプリケーションをCloudflare Workers向けに変換
- App RouterとServer Componentsをサポート
- Edge Runtimeの変換処理

#### 4.2 推測される動作
- Next.jsのEdge RuntimeをCloudflare Workersに変換
- `NEXT_RUNTIME`環境変数の設定方法は不明
- Sentry SDKの初期化タイミングとの競合の可能性

#### 4.3 確認が必要な事項
- `@opennextjs/cloudflare`が`NEXT_RUNTIME`をどのように設定するか
- Edge Runtimeのコードがどのように変換されるか
- Sentry SDKの初期化が変換後のコードで正しく動作するか

---

### 5. 公式ドキュメントの確認

#### 5.1 Sentry Next.js公式ドキュメント
- Cloudflare Workersに関する言及なし
- Vercel Edge Runtimeのサポートは記載あり
- Cloudflare Workers専用のガイドは存在しない

#### 5.2 Sentry Cloudflare公式ドキュメント
- Cloudflare Workers/Pages専用のガイドが存在
- Next.jsとの統合方法は記載なし
- `sentryPagesPlugin`を使用したミドルウェア設定が推奨

---

## 問題の根本原因（推測）

### シナリオ1: ランタイム検出の失敗
```
1. Cloudflare Workers環境でNEXT_RUNTIMEが'edge'に設定されない
2. sentry.edge.config.tsが読み込まれない
3. Sentryが初期化されず、後続の処理でエラーが発生
```

### シナリオ2: SDKの互換性問題
```
1. NEXT_RUNTIMEが'edge'に設定される
2. sentry.edge.config.tsが読み込まれる
3. @sentry/vercel-edgeがCloudflare Workers環境で動作しない
4. 初期化時に例外が発生し、Workerがクラッシュ（エラー1101）
```

### シナリオ3: 環境変数のアクセス失敗
```
1. Sentry設定でprocess.env.SENTRY_DSNにアクセス
2. Cloudflare Workers環境でprocess.envが正しく動作しない
3. undefinedがDSNとして渡される
4. Sentry SDKの初期化でエラーが発生
```

### シナリオ4: AsyncLocalStorageの不足
```
1. Sentry SDKがAsyncLocalStorageを使用
2. nodejs_alsフラグが設定されていない
3. AsyncLocalStorageが利用できない
4. SDKの初期化でエラーが発生
```

---

## 推奨される対応策

### 短期対応（緊急）

#### 1. Cloudflare Workers環境でのSentry無効化
```typescript
// src/instrumentation.ts
export async function register() {
  // Cloudflare Workers環境を検出
  const isCloudflareWorkers = 
    typeof globalThis !== 'undefined' && 
    ('Cloudflare' in globalThis || 
     process.env.CF_PAGES === '1' ||
     process.env.CF_PAGES_BRANCH !== undefined)

  if (isCloudflareWorkers) {
    console.warn('[Sentry] Disabled in Cloudflare Workers environment')
    return
  }

  try {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
      await import('../sentry.server.config')
    }
    if (process.env.NEXT_RUNTIME === 'edge') {
      await import('../sentry.edge.config')
    }
  } catch (error) {
    console.error('[Sentry] Failed to initialize:', error)
  }
}
```

#### 2. エラーハンドリングの追加
すべてのSentry設定ファイルにエラーハンドリングを追加

#### 3. 環境変数の存在チェック
DSNが設定されていない場合の処理を追加

### 中期対応（推奨）

#### 1. `@sentry/cloudflare`の導入検討
- Cloudflare Workers専用のSDKを使用
- Next.jsとの統合方法を調査
- 段階的な移行を実施

#### 2. 条件付き初期化の実装
- 環境に応じて適切なSDKを選択
- Cloudflare Workers環境では`@sentry/cloudflare`を使用

#### 3. `wrangler.jsonc`の更新
```jsonc
{
  "compatibility_flags": [
    "nodejs_compat",
    "nodejs_als",  // AsyncLocalStorageサポート
    "global_fetch_strictly_public"
  ]
}
```

### 長期対応（理想）

#### 1. Next.js + Cloudflare Workers統合の最適化
- `@opennextjs/cloudflare`との統合方法を確立
- Sentry SDKの初期化タイミングを最適化
- 公式ドキュメントの作成

#### 2. モニタリング戦略の見直し
- Cloudflare Workers環境でのエラートラッキング方法を確立
- パフォーマンスモニタリングの実装

---

## 検証すべき項目

### 1. 環境変数の確認
- [ ] Cloudflare Workers環境での`NEXT_RUNTIME`の値
- [ ] `process.env`の動作確認
- [ ] `SENTRY_DSN`環境変数の設定状況

### 2. ランタイム検出の確認
- [ ] Cloudflare Workers環境でのランタイム検出方法
- [ ] `@opennextjs/cloudflare`の動作確認
- [ ] Edge Runtimeの変換処理の確認

### 3. SDKの動作確認
- [ ] `@sentry/vercel-edge`がCloudflare Workersで動作するか
- [ ] `@sentry/cloudflare`の導入可能性
- [ ] エラーログの詳細確認

### 4. 互換性フラグの確認
- [ ] `nodejs_als`フラグの必要性
- [ ] `nodejs_compat`フラグで十分か
- [ ] その他の必要なフラグ

---

## 参考資料

### 公式ドキュメント
- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Cloudflare Documentation](https://docs.sentry.io/platforms/javascript/guides/cloudflare/)
- [@sentry/cloudflare npm](https://www.npmjs.com/package/@sentry/cloudflare)
- [@sentry/vercel-edge npm](https://www.npmjs.com/package/@sentry/vercel-edge)

### GitHubリポジトリ
- [sentry-javascript/packages/cloudflare](https://github.com/getsentry/sentry-javascript/tree/master/packages/cloudflare)
- [sentry-javascript/packages/vercel-edge](https://github.com/getsentry/sentry-javascript/tree/master/packages/vercel-edge)
- [opennextjs/opennextjs-cloudflare](https://github.com/opennextjs/opennextjs-cloudflare)

### Cloudflare Workers関連
- [Cloudflare Workers Runtime](https://developers.cloudflare.com/workers/runtime-apis/)
- [Cloudflare Workers Compatibility Flags](https://developers.cloudflare.com/workers/configuration/compatibility-dates/#compatibility-flags)

---

## 結論

`@sentry/nextjs`はCloudflare Workers環境を直接サポートしておらず、Vercel Edge Runtime向けの実装が使用されているため、互換性の問題が発生している可能性が高いです。

**即座に実施すべき対応:**
1. Cloudflare Workers環境でのSentry初期化を無効化
2. エラーハンドリングを追加してWorkerのクラッシュを防止
3. Cloudflare Workersのログを確認してエラーの詳細を把握

**今後検討すべき対応:**
1. `@sentry/cloudflare`パッケージの導入検討
2. Next.js + Cloudflare Workers環境に最適化された統合方法の確立
3. 公式ドキュメントの作成とベストプラクティスの確立

---

**作成日:** 2025-01-XX  
**作成者:** AI Assistant  
**ステータス:** 調査完了
