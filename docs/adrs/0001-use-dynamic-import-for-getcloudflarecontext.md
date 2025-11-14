# ADR-0001: getCloudflareContextの動的インポート使用

## ステータス

承認済み

## 日付

2024-11-12

## コンテキスト

`/api/og`エンドポイントで、OpenNextのCloudflareアダプターを使用してService Bindingにアクセスする際に、以下のエラーが発生していました：

```
TypeError: Cannot read properties of undefined (reading 'default')
at interopDefault
(file:///.../.open-next/server-functions/default/handler.mjs:110:37081)
at loadComponentsImpl
```

このエラーは、`npx opennextjs-cloudflare preview`で起動したサーバーで発生していました。

## 調査結果

### 問題の原因

1. **静的インポートの問題**
   - 元のコードでは`import { getCloudflareContext } from '@opennextjs/cloudflare'`という静的インポートを使用していた
   - OpenNextのビルドプロセス（`npx opennextjs-cloudflare build`）では、`@opennextjs/cloudflare`パッケージがルートハンドラーのバンドルに正しく含まれていなかった
   - ビルド後の`.open-next/server-functions/default/handler.mjs`では、モジュールが`undefined`として解決されていた

2. **モジュール解決のタイミング**
   - OpenNextのビルドプロセスでは、`@opennextjs/cloudflare`の関数は`open-next.config.mjs`にインライン化される
   - しかし、ルートハンドラーから直接インポートする場合、ビルド時にモジュールが正しく解決されない
   - Next.jsの`api-resolver.js`では動的インポート（`await import("@opennextjs/cloudflare")`）を使用していることが確認できた

3. **エラーの発生メカニズム**
   - モジュールが`undefined`の状態で、Next.jsの`interopDefault`関数が`default`プロパティにアクセスしようとしてエラーが発生
   - これは、モジュールの読み込みが失敗した際の典型的なエラーパターン

### 調査で確認したこと

- `.open-next/server-functions/default/open-next.config.mjs`には`getCloudflareContext`がインライン化されているが、エクスポートされていない
- `.open-next/server-functions/default/node_modules`には`@opennextjs/cloudflare`が存在しない
- `package.json`では`@opennextjs/cloudflare`が`dependencies`に正しく配置されている
- Next.jsの`api-resolver.js`では動的インポートを使用している

## 決定

`getCloudflareContext`を動的インポート（`await import()`）で取得するように変更しました。

### 実装内容

1. **動的インポートの使用**
   ```typescript
   const { getCloudflareContext: getContext } = await import('@opennextjs/cloudflare')
   ```

2. **フォールバック機能の追加**
   - 動的インポートが失敗した場合、グローバルスコープから直接取得するフォールバックを実装
   - `Symbol.for('__cloudflare-context__')`を使用してグローバルスコープからコンテキストを取得

3. **型安全性の確保**
   - TypeScriptのオーバーロードを適切に処理
   - `async: true`と`async: false`の両方のケースに対応

## 結果

### メリット

1. **実行時解決**: 動的インポートにより、実行時にモジュールが正しく解決される
2. **フォールバック**: インポートが失敗した場合でも、グローバルスコープから取得できる
3. **互換性**: OpenNextのビルドプロセスと互換性がある
4. **型安全性**: TypeScriptの型チェックを維持

### デメリット

1. **パフォーマンス**: 動的インポートは静的インポートより若干遅い（ただし、初回のみ）
2. **コードの複雑性**: フォールバック処理により、コードが若干複雑になった

### 影響範囲

- `/api/og`エンドポイントのみに影響
- 他のエンドポイントやコンポーネントには影響なし

## 代替案の検討

### 代替案1: グローバルスコープから直接取得

**検討内容**: `Symbol.for('__cloudflare-context__')`から直接取得する

**却下理由**: 
- OpenNextの内部実装に依存しすぎる
- 将来のバージョンで変更される可能性がある

### 代替案2: ビルド設定の変更

**検討内容**: OpenNextのビルド設定を変更して、`@opennextjs/cloudflare`をバンドルに含める

**却下理由**:
- OpenNextのビルドプロセスを変更する必要があり、メンテナンスが困難
- 公式ドキュメントに記載されていない方法

### 代替案3: 動的インポートのみ（フォールバックなし）

**検討内容**: フォールバック機能を削除して、動的インポートのみを使用

**却下理由**:
- エラーハンドリングが不十分
- デバッグが困難になる可能性がある

## 参考資料

- [OpenNext Cloudflare Documentation](https://opennext.js.org/cloudflare/get-started)
- Next.js `api-resolver.js`の実装（`.open-next/server-functions/default/node_modules/next/dist/server/api-utils/node/api-resolver.js`）

## 関連するADR

なし

