# Cloudflareエラー1101調査レポート
## Sentry連携後のWorker例外エラー

**発生日時:** Sentry連携リリース後  
**エラーコード:** 1101 (Worker threw an exception)  
**環境:** Cloudflare Workers  
**影響範囲:** 全リクエスト（推測）

---

## エラー概要

Cloudflare Workers環境でエラーコード1101が発生。このエラーは「Worker threw an exception」を示し、Worker内で未処理の例外が発生したことを意味します。

---

## 調査対象と可能性のある原因

### 1. Sentry初期化の問題

#### 1.1 Edge RuntimeでのSentry初期化タイミング
**問題の可能性:** ⚠️ **高**

`src/instrumentation.ts`でEdge Runtime時に`sentry.edge.config.ts`を動的インポートしていますが、Cloudflare Workers環境では`NEXT_RUNTIME`環境変数の値が期待通りでない可能性があります。

```typescript
// src/instrumentation.ts
if (process.env.NEXT_RUNTIME === 'edge') {
  await import('../sentry.edge.config')
}
```

**調査ポイント:**
- Cloudflare Workers環境での`NEXT_RUNTIME`の実際の値
- Edge Runtimeの検出が正しく動作しているか
- 動的インポートが失敗していないか

**推奨対応:**
- Cloudflare Workers環境での`NEXT_RUNTIME`値をログ出力して確認
- 条件分岐をより堅牢にする（`edge`以外の値も考慮）

#### 1.2 Sentry SDKの互換性問題
**問題の可能性:** ⚠️ **高**

`@sentry/nextjs`は主にVercel Edge Runtime向けに設計されています。Cloudflare Workersは異なるランタイム環境のため、互換性の問題が発生している可能性があります。

**調査ポイント:**
- `@sentry/nextjs`がCloudflare Workers環境をサポートしているか
- Edge Runtime用の設定がCloudflare Workersで正しく動作するか
- Sentry SDKの初期化時にエラーが発生していないか

**推奨対応:**
- Sentry公式ドキュメントでCloudflare Workers対応状況を確認
- 必要に応じて`@sentry/cloudflare-workers`などの専用パッケージを検討

### 2. 環境変数の問題

#### 2.1 DSN環境変数の未設定
**問題の可能性:** ⚠️ **中**

Sentry設定ファイルで環境変数`SENTRY_DSN`または`NEXT_PUBLIC_SENTRY_DSN`を参照していますが、Cloudflare Workers環境でこれらの環境変数が設定されていない可能性があります。

```typescript
// sentry.server.config.ts, sentry.edge.config.ts
dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
```

**調査ポイント:**
- Cloudflare Workers環境での環境変数の設定状況
- `wrangler.jsonc`またはCloudflareダッシュボードでの環境変数設定
- DSNが`undefined`の場合のSentry SDKの動作

**推奨対応:**
- Cloudflare Workers環境変数を確認
- DSN未設定時のフォールバック処理を追加
- 環境変数の存在チェックを追加

#### 2.2 環境変数のアクセス方法
**問題の可能性:** ⚠️ **中**

Cloudflare Workers環境では、環境変数のアクセス方法が異なる可能性があります。`process.env`ではなく、`env`オブジェクト経由でアクセスする必要がある場合があります。

**調査ポイント:**
- Cloudflare Workersでの環境変数アクセス方法
- `@opennextjs/cloudflare`が環境変数をどのように処理しているか

**推奨対応:**
- Cloudflare Workers環境での環境変数アクセス方法を確認
- 必要に応じて環境変数の取得方法を修正

### 3. 非同期処理の問題

#### 3.1 instrumentation.tsの非同期処理
**問題の可能性:** ⚠️ **中**

`instrumentation.ts`の`register`関数は非同期ですが、Cloudflare Workers環境での実行タイミングやエラーハンドリングが適切でない可能性があります。

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

**調査ポイント:**
- `register`関数のエラーハンドリング
- 動的インポートの失敗時の挙動
- Cloudflare Workersでの実行順序

**推奨対応:**
- try-catchでエラーハンドリングを追加
- エラー発生時のログ出力を追加
- フォールバック処理を実装

### 4. Sentry SDKの機能制限

#### 4.1 Replay Integrationの互換性
**問題の可能性:** ⚠️ **低**

クライアント側のSentry設定で`replayIntegration()`を使用していますが、これはブラウザ環境専用の機能です。サーバー側やEdge Runtimeでは使用できません。

```typescript
// sentry.client.config.ts
integrations: [Sentry.replayIntegration()],
```

**調査ポイント:**
- サーバー側でReplay Integrationが誤って読み込まれていないか
- Edge RuntimeでのReplay Integrationの動作

**推奨対応:**
- クライアント専用の設定であることを確認
- 必要に応じて条件分岐を追加

#### 4.2 Source Mapsのアップロード
**問題の可能性:** ⚠️ **低**

`next.config.ts`でSentryのSource Mapsアップロードを設定していますが、Cloudflare Workers環境でのビルド時に問題が発生している可能性があります。

**調査ポイント:**
- Cloudflare Workersビルド時のSource Maps生成
- Sentryへのアップロード処理のエラー

**推奨対応:**
- ビルドログでSource Maps関連のエラーを確認
- 必要に応じてSource Mapsアップロードを無効化

### 5. その他の可能性

#### 5.1 メモリ制限
**問題の可能性:** ⚠️ **低**

Sentry SDKがメモリを大量に消費し、Cloudflare Workersのメモリ制限に達している可能性があります。

**調査ポイント:**
- Cloudflare Workersのメモリ使用量
- Sentry SDKのメモリフットプリント

**推奨対応:**
- メモリ使用量を監視
- 必要に応じてSentry設定を最適化

#### 5.2 タイムアウト
**問題の可能性:** ⚠️ **低**

Sentryへのリクエストがタイムアウトし、エラーが発生している可能性があります。

**調査ポイント:**
- Sentryへのリクエスト時間
- Cloudflare Workersのタイムアウト設定

**推奨対応:**
- タイムアウト設定を確認
- 非同期処理の最適化

---

## 推奨される調査手順

### ステップ1: 環境変数の確認
1. Cloudflare Workers環境での環境変数設定を確認
2. `SENTRY_DSN`または`NEXT_PUBLIC_SENTRY_DSN`が設定されているか確認
3. 環境変数の値が正しいか確認

### ステップ2: ログの確認
1. Cloudflare Workersのログを確認
2. エラー1101が発生するタイミングを特定
3. エラーメッセージやスタックトレースを確認

### ステップ3: 段階的な無効化テスト
1. Sentry設定を一時的に無効化してエラーが解消するか確認
2. 各Sentry設定ファイルを個別に無効化して原因を特定
3. 問題のある設定を特定

### ステップ4: エラーハンドリングの追加
1. `instrumentation.ts`にtry-catchを追加
2. エラー発生時のログ出力を追加
3. フォールバック処理を実装

### ステップ5: Sentry SDKの互換性確認
1. Sentry公式ドキュメントでCloudflare Workers対応状況を確認
2. 必要に応じて専用パッケージを検討
3. 代替実装方法を検討

---

## 緊急対応策

### 一時的な回避策

1. **Sentry設定の無効化**
   - `next.config.ts`から`withSentryConfig`を削除
   - `instrumentation.ts`を無効化または削除
   - 環境変数`SENTRY_DSN`を未設定にする

2. **条件付き初期化**
   - Cloudflare Workers環境でのみSentryを無効化
   - 環境変数でSentryの有効/無効を切り替え

3. **エラーハンドリングの強化**
   - Sentry初期化をtry-catchで囲む
   - エラー発生時はSentryを無効化して続行

---

## 調査用チェックリスト

- [ ] Cloudflare Workers環境での環境変数設定を確認
- [ ] Cloudflare Workersのログを確認
- [ ] `NEXT_RUNTIME`環境変数の値を確認
- [ ] Sentry SDKの初期化エラーを確認
- [ ] `instrumentation.ts`の実行を確認
- [ ] 動的インポートの成功/失敗を確認
- [ ] Sentry公式ドキュメントでCloudflare Workers対応を確認
- [ ] ビルドログでエラーを確認
- [ ] メモリ使用量を確認
- [ ] タイムアウト設定を確認

---

## 参考資料

- [Cloudflare Workers エラーコード1101](https://developers.cloudflare.com/workers/configuration/errors/)
- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [@opennextjs/cloudflare Documentation](https://opennext.js.org/cloudflare)
- [Cloudflare Workers Runtime](https://developers.cloudflare.com/workers/runtime-apis/)

---

## 次のアクション

1. **即座に実施:** Cloudflare Workersのログを確認してエラーの詳細を把握
2. **短期対応:** エラーハンドリングを追加してWorkerがクラッシュしないようにする
3. **中期対応:** Sentry SDKの互換性を確認し、必要に応じて代替実装を検討
4. **長期対応:** Cloudflare Workers環境に最適化されたエラーモニタリングを実装

---

**作成日:** 2025-01-XX  
**作成者:** AI Assistant  
**ステータス:** 調査中
