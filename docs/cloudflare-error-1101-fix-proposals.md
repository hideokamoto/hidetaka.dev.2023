# Cloudflareエラー1101修正提案
## 具体的な修正案と実装手順

---

## 修正案1: instrumentation.tsのエラーハンドリング強化

### 問題点
現在の`instrumentation.ts`にはエラーハンドリングがなく、Sentry初期化に失敗した場合にWorkerがクラッシュする可能性があります。

### 修正内容

```typescript
import * as Sentry from '@sentry/nextjs'

export async function register() {
  try {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
      await import('../sentry.server.config')
    }

    if (process.env.NEXT_RUNTIME === 'edge') {
      await import('../sentry.edge.config')
    }
  } catch (error) {
    // Sentry初期化に失敗してもWorkerをクラッシュさせない
    console.error('[Sentry] Failed to initialize:', error)
    // エラーをSentryに送信しようとしない（無限ループを防ぐ）
  }
}

export const onRequestError = Sentry.captureRequestError
```

### メリット
- Sentry初期化に失敗してもWorkerがクラッシュしない
- エラーログが出力されるため、問題の特定が容易
- 段階的なデバッグが可能

---

## 修正案2: 環境変数の存在チェック

### 問題点
Sentry設定ファイルで環境変数が未設定の場合、`undefined`がDSNとして渡される可能性があります。

### 修正内容

#### sentry.server.config.ts
```typescript
import * as Sentry from '@sentry/nextjs'

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 1,
    enableLogs: true,
    sendDefaultPii: true,
  })
} else {
  console.warn('[Sentry] DSN not configured. Sentry is disabled.')
}
```

#### sentry.edge.config.ts
```typescript
import * as Sentry from '@sentry/nextjs'

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 1,
    enableLogs: true,
    sendDefaultPii: true,
  })
} else {
  console.warn('[Sentry] DSN not configured. Sentry is disabled.')
}
```

### メリット
- DSN未設定時もエラーが発生しない
- 警告ログで設定漏れを検知可能
- 開発環境での動作が安定

---

## 修正案3: Cloudflare Workers環境での条件付き無効化

### 問題点
Cloudflare Workers環境でSentry SDKが正しく動作しない可能性があります。

### 修正内容

#### instrumentation.ts
```typescript
import * as Sentry from '@sentry/nextjs'

// Cloudflare Workers環境を検出
const isCloudflareWorkers = typeof globalThis !== 'undefined' && 
  'Cloudflare' in globalThis || 
  process.env.CF_PAGES === '1' ||
  process.env.CF_PAGES_BRANCH !== undefined

export async function register() {
  // Cloudflare Workers環境ではSentryを無効化
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

export const onRequestError = Sentry.captureRequestError
```

### メリット
- Cloudflare Workers環境での問題を回避
- 他の環境ではSentryが正常に動作
- 段階的な対応が可能

---

## 修正案4: 環境変数の追加とドキュメント化

### 問題点
`.env.example`にSentry関連の環境変数が記載されていません。

### 修正内容

#### .env.example
```bash
MICROCMS_API_KEY=xxxx
OG_IMAGE_GEN_AUTH_TOKEN=xxx
# Optional: Google Analytics 4 Measurement ID (defaults to G-RV8PYHHYHN if not set)
# NEXT_PUBLIC_GA_ID=G-RV8PYHHYHN

# Sentry Error Tracking
# Server-side DSN (recommended for production)
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
# Client-side DSN (fallback, can be used for both client and server)
# NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

### メリット
- 環境変数の設定方法が明確
- 新規メンバーが迷わない
- 設定漏れを防止

---

## 修正案5: 段階的な有効化フラグ

### 問題点
Sentryを完全に無効化する方法がありません。

### 修正内容

#### sentry.server.config.ts, sentry.edge.config.ts
```typescript
import * as Sentry from '@sentry/nextjs'

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN
const isEnabled = process.env.SENTRY_ENABLED !== 'false' && !!dsn

if (isEnabled) {
  Sentry.init({
    dsn,
    tracesSampleRate: process.env.SENTRY_TRACES_SAMPLE_RATE 
      ? parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE) 
      : 1,
    enableLogs: true,
    sendDefaultPii: true,
  })
} else {
  console.warn('[Sentry] Disabled by configuration or missing DSN')
}
```

### メリット
- 環境変数でSentryを簡単に無効化可能
- 緊急時の対応が容易
- 段階的な有効化が可能

---

## 推奨される実装順序

### フェーズ1: 緊急対応（即座に実施）
1. **修正案1**: `instrumentation.ts`にエラーハンドリングを追加
2. **修正案2**: Sentry設定ファイルにDSN存在チェックを追加

### フェーズ2: 環境整備（短期対応）
3. **修正案4**: `.env.example`にSentry環境変数を追加
4. **修正案5**: Sentry有効/無効フラグを追加

### フェーズ3: 根本対応（中期対応）
5. **修正案3**: Cloudflare Workers環境での条件付き無効化を実装
6. Sentry SDKの互換性を確認し、必要に応じて代替実装を検討

---

## テスト手順

### 1. ローカル環境でのテスト
```bash
# 環境変数を設定せずにビルド
npm run build

# Sentry無効化フラグでビルド
SENTRY_ENABLED=false npm run build

# 正常にビルドできることを確認
```

### 2. Cloudflare Workers環境でのテスト
```bash
# Cloudflare Workers環境でビルド
npm run cf:build

# プレビューで動作確認
npm run cf:preview

# エラー1101が発生しないことを確認
```

### 3. エラーハンドリングのテスト
```bash
# 不正なDSNを設定してビルド
SENTRY_DSN=invalid npm run build

# エラーが発生せず、警告のみが出力されることを確認
```

---

## ロールバック手順

問題が発生した場合の緊急ロールバック手順：

### 方法1: 環境変数で無効化
```bash
# Cloudflare Workers環境変数に設定
SENTRY_ENABLED=false
```

### 方法2: コードをロールバック
```bash
# Sentry連携前のコミットに戻す
git revert <commit-hash>
```

### 方法3: instrumentation.tsを無効化
```typescript
// instrumentation.tsを空にする
export async function register() {
  // Sentry disabled
}
```

---

## 監視とアラート

修正後は以下を監視：

1. **Cloudflare Workersのエラーレート**
   - エラー1101の発生頻度
   - その他のエラーの発生状況

2. **Sentryの動作状況**
   - エラーが正常に送信されているか
   - 初期化エラーが発生していないか

3. **パフォーマンス**
   - Workerのレスポンスタイム
   - メモリ使用量

---

**作成日:** 2025-01-XX  
**作成者:** AI Assistant  
**ステータス:** 提案中
