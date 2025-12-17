# Cloudflareビルドエラー調査レポート

## エラー概要

Cloudflare Pagesでのビルドが失敗し、以下のエラーが発生しています。

## 主要な問題

### 1. `revalidate`の重複定義エラー（ビルド失敗の直接原因）

**エラーメッセージ:**
```
the name `revalidate` is defined multiple times
```

**影響を受けるファイル:**
- `src/app/blog/page.tsx` (8行目と15行目)
- `src/app/ja/blog/page.tsx` (8行目と15行目)
- `src/app/writing/page.tsx` (7行目と14行目)
- `src/app/ja/writing/page.tsx` (7行目と14行目)

**原因:**
各ファイルで`revalidate`が2回定義されています：
- 1回目: `export const revalidate = 10800` (REVALIDATION_PERIOD.ARCHIVEの値)
- 2回目: より短い間隔の値（blog: 1800秒、writing: 3600秒）

Turbopack（Next.js 16のビルドツール）が重複定義を検出し、ビルドを失敗させています。

**修正方法:**
古い定義（8行目または7行目）を削除し、新しい定義（15行目または14行目）のみを残す。

### 2. Node.jsバージョンの警告（ビルドには影響しないが注意が必要）

**警告メッセージ:**
```
npm warn EBADENGINE Unsupported engine {
  package: 'vite@7.2.4',
  required: { node: '^20.19.0 || >=22.12.0' },
  current: { node: 'v22.1.0', npm: '10.7.0' }
}
```

**原因:**
Cloudflare PagesがNode.js 22.1.0を使用していますが、依存パッケージ（vite@7.2.4、yargs@18.0.0、yargs-parser@22.0.0）が以下のバージョンを要求しています：
- Node.js 20.19.0以上、または
- Node.js 22.12.0以上

22.1.0は22.12.0未満のため、警告が表示されています。

**影響:**
現時点では警告のみで、ビルド自体は通るはずですが、将来的に問題が発生する可能性があります。

**推奨対応:**
- Cloudflare PagesのNode.jsバージョンを22.12.0以上に設定する
- または、Node.js 20.19.0以上を使用する

## 修正手順

1. 4つのファイルから重複している`revalidate`定義を削除
2. ビルドが通ることを確認
3. （オプション）Cloudflare PagesのNode.jsバージョン設定を確認・更新

## 修正後の期待結果

- ビルドが正常に完了する
- `revalidate`の重複定義エラーが解消される
- Node.jsバージョンの警告は残るが、ビルドには影響しない
