# RCA: Cloudflare Pages での npm ci 失敗問題

## 概要

**発生日時**: 2026-02-15  
**影響範囲**: Cloudflare Pages / GitHub Actions のビルド環境  
**症状**: `npm ci` が "Missing from lock file" エラーで失敗  
**根本原因**: ローカル環境とCI/CD環境の npm 設定の違い（`legacy-peer-deps`）  
**結論**: npmのバグではなく、環境設定の不一致が原因

---

## エラー内容

### Cloudflare Pages ビルドログ

```text
2026-02-15T08:17:38.306Z	npm error code EUSAGE
2026-02-15T08:17:38.307Z	npm error
2026-02-15T08:17:38.307Z	npm error `npm ci` can only install packages when your package.json and package-lock.json or npm-shrinkwrap.json are in sync. Please update your lock file with `npm install` before continuing.
2026-02-15T08:17:38.307Z	npm error
2026-02-15T08:17:38.307Z	npm error Missing: webpack@5.105.2 from lock file
2026-02-15T08:17:38.307Z	npm error Missing: @types/eslint-scope@3.7.7 from lock file
2026-02-15T08:17:38.307Z	npm error Missing: @types/json-schema@7.0.15 from lock file
...（webpack関連の依存関係50個以上が欠落）
```

### 重要な観察事項

- **ローカル環境**: `npm ci` が成功
- **Cloudflare環境**: `npm ci` が失敗
- **同じ package-lock.json を使用しているにも関わらず結果が異なる**

---

## 調査プロセス

### 1. 初期仮説（誤り）

最初は「webpackがpackage-lock.jsonに含まれていないため」と考えた。

**検証結果**:
```bash
# webpackがlock fileに存在しない
$ cat package-lock.json | grep -c '"node_modules/webpack"'
0

# しかし、@sentry/webpack-pluginはpeer dependencyとしてwebpackを要求
$ cat package-lock.json | grep -A 20 '"node_modules/@sentry/webpack-plugin"'
"peerDependencies": {
  "webpack": ">=4.40.0"
}
```

**問題点**: この仮説では「なぜローカルで成功するのか」を説明できない。

### 2. 環境差分の調査

ローカル環境の npm 設定を確認:

```bash
$ npm config list
; "user" config from /Users/okamotohidetaka/.npmrc

//registry.npmjs.org/:_authToken = (protected)
init-author-name = "hideokamoto"
legacy-peer-deps = true  # ← これが原因！

; node version = v22.13.0
; npm version = 10.9.2
```

**重要な発見**: グローバルに `legacy-peer-deps = true` が設定されていた。

### 3. legacy-peer-deps の影響

#### legacy-peer-deps = true の場合（ローカル環境）

- peer dependency の検証が緩和される
- webpack が package-lock.json に含まれていなくても `npm ci` が成功する
- `npm install` も peer dependency を無視して lock file を生成する

#### legacy-peer-deps = false の場合（Cloudflare環境）

- peer dependency を厳密に検証する
- `@sentry/webpack-plugin` が要求する `webpack >=4.40.0` が lock file に存在しないため、エラーになる

### 4. 再現テスト

プロジェクトレベルで `.npmrc` を作成して検証:

```bash
# .npmrc を作成
$ echo "legacy-peer-deps=false" > .npmrc

# node_modules を削除
$ rm -rf node_modules

# npm ci を実行
$ npm ci
npm error code EUSAGE
npm error Missing: webpack@5.105.2 from lock file
...（Cloudflareと同じエラーが再現！）
```

**結果**: ローカルでも Cloudflare と同じエラーが再現できた。

---

## 根本原因

### 原因の詳細

1. **ローカル環境の設定**
   - `~/.npmrc` に `legacy-peer-deps = true` が設定されていた
   - この設定により peer dependency の検証が無効化されていた
   - package-lock.json が peer dependency なしで生成されていた

2. **Cloudflare 環境の設定**
   - デフォルト設定（`legacy-peer-deps = false`）
   - peer dependency を厳密に検証する
   - `@sentry/webpack-plugin` の peer dependency である webpack が lock file に存在しないため失敗

3. **依存関係チェーン**
   ```text
   @sentry/nextjs@10.36.0
     └── @sentry/webpack-plugin@4.7.0
           └── peerDependency: webpack >=4.40.0 (満たされていない)
   ```

4. **Next.js 16 の変更**
   - Next.js 16 は Turbopack をデフォルトで使用
   - webpack を依存関係ツリーに含めなくなった
   - しかし Sentry の webpack plugin はまだ webpack を期待している

### なぜ npm のバグではないのか

- npm は仕様通りに動作している
- `legacy-peer-deps = false` の場合、peer dependency の厳密な検証は正しい動作
- 問題は環境間の設定の不一致

---

## 解決策

### 実施した修正

#### 1. プロジェクトレベルの .npmrc を作成

```bash
# hidetaka.dev/.npmrc
legacy-peer-deps=false
```

**目的**:
- グローバル設定を上書き
- Cloudflare 環境と同じ条件をローカルでも再現
- チーム全体で一貫した動作を保証

#### 2. package-lock.json の再生成

```bash
$ npm install
added 1279 packages, and audited 1280 packages in 15s
```

**結果**:
- webpack とその依存関係（678行）が package-lock.json に追加された
- peer dependency が満たされた

#### 3. 検証

```bash
# npm ci が成功することを確認
$ npm ci
added 1279 packages, and audited 1280 packages in 20s

# ビルドが成功することを確認
$ npm run build
✓ Compiled successfully
```

### 変更内容

```bash
$ git diff --stat
 .npmrc            |   1 +
 package-lock.json | 736 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++-----
 2 files changed, 679 insertions(+), 58 deletions(-)
```

**追加された主な依存関係**:
- `webpack@5.105.2` (peer dependency として)
- `@types/eslint-scope@3.7.7`
- `@types/json-schema@7.0.15`
- `@webassemblyjs/*` パッケージ群
- その他 webpack の依存関係 50個以上

---

## 学んだこと

### 1. グローバル設定の危険性

グローバルの npm 設定（`~/.npmrc`）は、プロジェクト間で予期しない動作の違いを引き起こす可能性がある。

**ベストプラクティス**:
- プロジェクトレベルで `.npmrc` を作成し、必要な設定を明示的に指定する
- `.npmrc` をリポジトリにコミットして、チーム全体で共有する

### 2. CI/CD 環境との一致

ローカル環境と CI/CD 環境の設定を一致させることが重要。

**チェックリスト**:
- [ ] npm バージョンの一致
- [ ] Node.js バージョンの一致
- [ ] npm 設定（.npmrc）の一致
- [ ] 環境変数の一致

### 3. legacy-peer-deps の使用

`legacy-peer-deps = true` は便利だが、問題を隠蔽する可能性がある。

**推奨**:
- 新規プロジェクトでは `legacy-peer-deps = false` を使用
- peer dependency の警告に適切に対処する
- 必要に応じて明示的に依存関係を追加する

### 4. エラーメッセージの解釈

"Missing from lock file" エラーは、必ずしも lock file が壊れているわけではない。環境設定の違いによって発生することもある。

**調査手順**:
1. ローカルで再現できるか確認
2. 再現できない場合、環境設定の違いを調査
3. npm config、環境変数、バージョンなどを比較

---

## 今後の対策

### 1. プロジェクトセットアップ時

新規プロジェクトを作成する際は、以下を実施:

```bash
# .npmrc を作成
echo "legacy-peer-deps=false" > .npmrc

# package-lock.json を生成
npm install

# .npmrc をコミット
git add .npmrc
git commit -m "chore: add .npmrc with legacy-peer-deps=false"
```

### 2. CI/CD パイプライン

Cloudflare Pages のビルド設定で、npm バージョンを明示的に指定:

```json
{
  "build": {
    "command": "npm ci && npm run build",
    "environment": {
      "NODE_VERSION": "22.13.0",
      "NPM_VERSION": "10.9.2"
    }
  }
}
```

### 3. ドキュメント化

チーム内で以下をドキュメント化:
- 推奨される npm 設定
- ローカル環境のセットアップ手順
- トラブルシューティングガイド

---

## 参考情報

### npm ci と npm install の違い

| 特徴 | npm ci | npm install |
|------|--------|-------------|
| lock file | 厳密に従う | 更新する可能性がある |
| node_modules | 削除してから再作成 | 既存を更新 |
| peer dependency | 厳密に検証 | 設定に依存 |
| 速度 | 高速 | やや遅い |
| 用途 | CI/CD | 開発環境 |

### legacy-peer-deps の歴史

- **npm 3-6**: peer dependency は手動でインストールする必要があった
- **npm 7**: peer dependency を自動的にインストールするようになった
- **npm 8+**: peer dependency の検証が厳格化された
- **legacy-peer-deps**: npm 3-6 の動作に戻すオプション

### 関連リンク

- [npm ci documentation](https://docs.npmjs.com/cli/v10/commands/npm-ci)
- [npm config documentation](https://docs.npmjs.com/cli/v10/using-npm/config)
- [Peer Dependencies](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#peerdependencies)

---

## まとめ

この問題は npm のバグではなく、ローカル環境とCI/CD環境の設定の不一致が原因でした。

**キーポイント**:
1. グローバルの `legacy-peer-deps = true` がローカルで問題を隠蔽していた
2. Cloudflare 環境ではデフォルト設定で peer dependency を厳密に検証していた
3. プロジェクトレベルで `.npmrc` を作成し、設定を明示的に管理することで解決

**修正内容**:
- `.npmrc` を作成して `legacy-peer-deps=false` を設定
- `npm install` で package-lock.json を再生成
- webpack とその依存関係を lock file に追加

これにより、ローカルと Cloudflare 環境で一貫した動作が保証されるようになりました。
