# 実装計画: 記事CTAコンポーネント

## 概要

記事CTAコンポーネントシステムを実装し、記事タイプに基づいて適切なコールトゥアクションを表示します。実装は既存のコンポーネント構造に従い、将来のCMS統合を見据えた拡張可能なアーキテクチャを採用します。

**⚠️ CRITICAL: Small Batch Size戦略（必須）⚠️**

このタスクリストは**必ず**Small Batch Size戦略に従って実行すること。以下のルールは絶対に守ること：

1. **各タスクは独立したブランチで実装**
2. **各タスク完了後、即座にPRを作成**
3. **ベースブランチ**: `feat/add-cta-component`（mainではない）
4. **git worktreeを使用して並列開発可能**
5. **1つのブランチで複数タスクを実装することは禁止**

**ベースブランチの変更点:**
- 従来: mainブランチから各タスクブランチをcheckout
- **現在**: `feat/add-cta-component`ブランチから各タスクブランチをcheckout
- PRのベースブランチ: `feat/add-cta-component`

**違反例（絶対にやってはいけないこと）:**
- ❌ 1つのブランチで複数タスクを実装
- ❌ タスク完了後にPRを作成しない
- ❌ mainブランチから直接checkout
- ❌ Small Batch Size戦略を無視して全タスクを一度に実装

**正しい実装フロー:**
1. `feat/add-cta-component`ブランチから`feature/X-task-name`をcheckout
2. タスクXを実装
3. テスト・リントを実行
4. コミット
5. プッシュ
6. **即座にPRを作成**（ベース: `feat/add-cta-component`）
7. 次のタスクへ

## タスク依存関係図

```
タスク1 (型定義) ─┬─→ タスク2 (パターンデータ) ─→ タスク3 (コンポーネント実装) ─→ タスク4 (スタイリング)
                  │                                                                    ↓
                  └─→ タスク5 (バリデーション) ──────────────────────────────────→ タスク6 (統合: Blog)
                                                                                      ↓
                                                                              タスク7 (統合: DevNote)
                                                                                      ↓
                                                                              タスク8 (統合: News)
                                                                                      ↓
                                                                              タスク9 (統合: その他)
```

## タスク

### Phase 1: 基盤構築（並列開発可能）

- [ ] 1. TypeScript型定義の作成
  - **ブランチ**: `feature/1-cta-types`
  - **ファイル**: `src/libs/ctaTypes.ts`（新規作成）
  - **内容**:
    - `ArticleType`型を定義（'tutorial' | 'essay' | 'tool_announcement' | 'general'）
    - `CTAButton`インターフェースを定義（text, href, variant）
    - `CTAData`インターフェースを定義（heading, description, buttons）
    - `CTAPattern`インターフェースを定義（ja, en）
  - **テスト**: 型定義のみのため、テストは不要
  - **PR条件**: 型定義ファイルのみ、他のファイルへの影響なし
  - _要件: 4.1、4.4_

- [ ] 2. CTAパターンデータの作成
  - **ブランチ**: `feature/2-cta-patterns`
  - **依存**: タスク1（型定義）
  - **ファイル**: `src/libs/ctaPatterns.ts`（新規作成）
  - **内容**:
    - タスク1で定義した型をインポート
    - 4つのCTAパターン（tutorial、essay、tool_announcement、general）を日本語・英語で定義
    - `CTA_PATTERNS`定数をエクスポート
  - **テスト**: `src/libs/ctaPatterns.test.ts`
    - 各パターンが必須フィールドを持つことを検証
    - 各パターンがボタンを1〜3個持つことを検証
    - **プロパティテスト**: CTAパターンの構造整合性（プロパティ3）
  - **PR条件**: データファイルとテストのみ、コンポーネントへの影響なし
  - _要件: 4.1、4.2、4.3_

- [ ] 3. バリデーション関数の実装
  - **ブランチ**: `feature/3-cta-validation`
  - **依存**: タスク1（型定義）
  - **ファイル**: `src/libs/ctaValidation.ts`（新規作成）
  - **内容**:
    - `isValidCTAData`関数を実装（型ガード）
    - `normalizeArticleType`関数を実装（無効な値を'general'にフォールバック）
    - `normalizeLang`関数を実装（無効な値を'en'にフォールバック）
  - **テスト**: `src/libs/ctaValidation.test.ts`
    - 有効なデータで`true`を返すことを検証
    - 無効なデータで`false`を返すことを検証
    - フォールバック関数の動作を検証
    - **プロパティテスト**: カスタムCTAデータの優先（プロパティ4）
  - **PR条件**: ユーティリティ関数とテストのみ、独立してマージ可能
  - _要件: 1.5、6.2_

### Phase 2: コンポーネント実装（Phase 1完了後）

- [ ] 4. ArticleCTAコンポーネントの基本実装
  - **ブランチ**: `feature/4-article-cta-component`
  - **依存**: タスク1、2、3
  - **ファイル**: `src/components/ui/ArticleCTA.tsx`（新規作成）
  - **内容**:
    - ArticleCTAPropsインターフェースを定義
    - パターン選択ロジックを実装（articleType、lang、ctaDataに基づく）
    - バリデーション関数を使用してエラーハンドリング
    - 基本的なHTML構造のみ（スタイリングは次タスク）
  - **テスト**: `src/components/ui/ArticleCTA.test.tsx`
    - 各記事タイプで正しいパターンが選択されることを検証
    - 言語切り替えが正しく動作することを検証
    - カスタムctaDataが優先されることを検証
    - **プロパティテスト**: 記事タイプとCTAパターンのマッピング（プロパティ1）
    - **プロパティテスト**: 言語ベースのローカライゼーション（プロパティ2）
  - **PR条件**: コンポーネントロジックとテストのみ、スタイリングなし
  - _要件: 1.1、1.5、2.1、2.2、3.2、3.5_

- [ ] 5. ArticleCTAコンポーネントのスタイリング
  - **ブランチ**: `feature/5-article-cta-styling`
  - **依存**: タスク4
  - **ファイル**: `src/components/ui/ArticleCTA.tsx`（更新）
  - **内容**:
    - Tailwind CSSクラスを追加（背景色、境界線、スペーシング）
    - レスポンシブデザインを実装（sm:、md:、lg:ブレークポイント）
    - ダークモードスタイリングを追加（dark:クラス）
    - 既存のCTAButtonコンポーネントを統合
    - セマンティックHTML要素を使用（section、h2、nav）
    - ARIA属性を追加（aria-label、role）
  - **テスト**: `src/components/ui/ArticleCTA.test.tsx`（更新）
    - セマンティックHTML要素の使用を検証
    - ARIA属性の存在を検証
    - classNameプロパティの適用を検証
    - ダークモードクラスの存在を検証
  - **PR条件**: スタイリングのみの変更、ロジックへの影響なし
  - _要件: 3.3、5.1、5.2、5.3、5.4、5.5、7.1、7.2、7.3、7.4、7.5_

### Phase 3: 段階的統合（Phase 2完了後、並列開発可能）

- [ ] 6. BlogDetailPageへの統合
  - **ブランチ**: `feature/6-integrate-blog-detail`
  - **依存**: タスク5
  - **ファイル**: `src/components/containers/pages/BlogDetailPage.tsx`（更新）
  - **内容**:
    - ArticleCTAコンポーネントをインポート
    - SocialShareButtonsの後、RelatedArticlesの前に配置
    - 適切なprops（lang、articleType='essay'）を渡す
  - **テスト**: `src/components/containers/pages/BlogDetailPage.test.tsx`（新規または更新）
    - ArticleCTAが正しい位置に配置されることを検証
    - 適切なpropsが渡されることを検証
  - **PR条件**: BlogDetailPageのみの変更、他のページへの影響なし
  - _要件: 3.1_

- [ ] 7. DevNoteDetailPageへの統合
  - **ブランチ**: `feature/7-integrate-devnote-detail`
  - **依存**: タスク5
  - **ファイル**: `src/components/containers/pages/DevNoteDetailPage.tsx`（更新）
  - **内容**:
    - ArticleCTAコンポーネントをインポート
    - SocialShareButtonsの後、RelatedArticlesの前に配置
    - 適切なprops（lang、articleType='tutorial'）を渡す
  - **テスト**: `src/components/containers/pages/DevNoteDetailPage.test.tsx`（新規または更新）
    - ArticleCTAが正しい位置に配置されることを検証
    - 適切なpropsが渡されることを検証
  - **PR条件**: DevNoteDetailPageのみの変更、他のページへの影響なし
  - _要件: 3.1_

- [ ] 8. NewsDetailPageへの統合
  - **ブランチ**: `feature/8-integrate-news-detail`
  - **依存**: タスク5
  - **ファイル**: `src/components/containers/pages/NewsDetailPage.tsx`（更新）
  - **内容**:
    - ArticleCTAコンポーネントをインポート
    - SocialShareButtonsの後、RelatedArticlesの前に配置
    - 適切なprops（lang、articleType='tool_announcement'）を渡す
  - **テスト**: `src/components/containers/pages/NewsDetailPage.test.tsx`（新規または更新）
    - ArticleCTAが正しい位置に配置されることを検証
    - 適切なpropsが渡されることを検証
  - **PR条件**: NewsDetailPageのみの変更、他のページへの影響なし
  - _要件: 3.1_

- [ ] 9. その他の詳細ページへの統合
  - **ブランチ**: `feature/9-integrate-other-details`
  - **依存**: タスク5
  - **ファイル**: 
    - `src/components/containers/pages/EventDetailPage.tsx`（更新）
    - `src/components/containers/pages/SpeakingDetailPage.tsx`（更新）
  - **内容**:
    - 各ページにArticleCTAコンポーネントをインポート
    - SocialShareButtonsの後、RelatedArticlesの前に配置
    - 適切なprops（lang、articleType='general'）を渡す
  - **テスト**: 各ページのテストファイル（新規または更新）
    - ArticleCTAが正しい位置に配置されることを検証
    - 適切なpropsが渡されることを検証
  - **PR条件**: 残りのページのみの変更、独立してマージ可能
  - _要件: 3.1_

### Phase 4: 最終検証（Phase 3完了後）

- [ ] 10. パフォーマンス検証とドキュメント
  - **ブランチ**: `feature/10-performance-docs`
  - **依存**: タスク6-9（すべての統合完了）
  - **内容**:
    - コンポーネントがサーバーコンポーネントとして実装されていることを確認
    - 外部APIコールがないことを確認
    - バンドルサイズを測定（`npm run build`後に確認）
    - README.mdまたはコンポーネントドキュメントを更新
  - **テスト**: `src/components/ui/ArticleCTA.test.tsx`（更新）
    - 外部APIコールがないことを検証（モック不使用を確認）
  - **PR条件**: ドキュメントとパフォーマンス検証のみ
  - _要件: 8.1、8.2、8.4_

## Git Worktree + GitHub CLI開発フロー

### 前提条件

```bash
# GitHub CLIのインストール確認
gh --version

# 未インストールの場合
# macOS: brew install gh
# その他: https://cli.github.com/

# GitHub CLIの認証
gh auth login
```

### タスク1の完全なワークフロー例

```bash
# 1. ベースブランチ（feat/add-cta-component）に移動
cd hidetaka.dev
git checkout feat/add-cta-component
git pull origin feat/add-cta-component

# 2. worktreeを作成してブランチを切る（ベース: feat/add-cta-component）
git worktree add ../hidetaka.dev-task1 -b feature/1-cta-types

# 3. worktreeに移動して開発
cd ../hidetaka.dev-task1

# 4. 型定義ファイルを作成
# src/libs/ctaTypes.ts を実装...

# 5. テストを実行
npm test

# 6. リントを実行
npm run lint

# 7. 変更をコミット
git add src/libs/ctaTypes.ts
git commit -m "feat: add CTA type definitions

- Add ArticleType union type
- Add CTAButton interface
- Add CTAData interface
- Add CTAPattern interface

Refs: #<issue-number>"

# 8. ブランチをプッシュ
git push -u origin feature/1-cta-types

# 9. GitHub CLIでPRを作成（即座に）
gh pr create \
  --title "feat: add CTA type definitions" \
  --body "## 概要
タスク1: TypeScript型定義の作成

## 変更内容
- ArticleType型を定義
- CTAButton、CTAData、CTAPatternインターフェースを定義

## テスト
- 型定義のみのため、テストは不要

## チェックリスト
- [x] 変更ファイル数: 1ファイル
- [x] テストが通る
- [x] リントエラーなし
- [x] 依存タスクなし

## 関連
- 要件: 4.1, 4.4
- 次のタスク: タスク2（CTAパターンデータ）、タスク3（バリデーション）" \
  --base feat/add-cta-component \
  --label "feature" \
  --label "small-batch"

# 10. PRのURLが表示される。レビュー依頼やマージはGitHub UIまたはCLIで
# 自動マージの場合（CIが通れば）
# gh pr merge --auto --squash

# 11. マージ後、worktreeをクリーンアップ
cd ../hidetaka.dev
git worktree remove ../hidetaka.dev-task1
git branch -d feature/1-cta-types  # ローカルブランチ削除
```

### Phase 1の並列開発フロー

```bash
# ベースブランチ（feat/add-cta-component）で作業
cd hidetaka.dev
git checkout feat/add-cta-component
git pull origin feat/add-cta-component

# Phase 1の3タスクを並列でworktree作成（ベース: feat/add-cta-component）
git worktree add ../hidetaka.dev-task1 -b feature/1-cta-types
git worktree add ../hidetaka.dev-task2 -b feature/2-cta-patterns
git worktree add ../hidetaka.dev-task3 -b feature/3-cta-validation

# ターミナルを3つ開いて、それぞれで作業

# === ターミナル1: タスク1 ===
cd ../hidetaka.dev-task1
# 実装...
npm test && npm run lint
git add . && git commit -m "feat: add CTA type definitions"
git push -u origin feature/1-cta-types
gh pr create --title "feat: add CTA type definitions" --body "..." --base feat/add-cta-component

# === ターミナル2: タスク2 ===
cd ../hidetaka.dev-task2
# 実装...
npm test && npm run lint
git add . && git commit -m "feat: add CTA pattern data"
git push -u origin feature/2-cta-patterns
gh pr create --title "feat: add CTA pattern data" --body "..." --base feat/add-cta-component

# === ターミナル3: タスク3 ===
cd ../hidetaka.dev-task3
# 実装...
npm test && npm run lint
git add . && git commit -m "feat: add CTA validation functions"
git push -u origin feature/3-cta-validation
gh pr create --title "feat: add CTA validation functions" --body "..." --base feat/add-cta-component
```

### Phase 3の並列統合フロー

```bash
# Phase 2完了後、Phase 3の統合タスクを並列開発
cd hidetaka.dev
git checkout feat/add-cta-component
git pull origin feat/add-cta-component

# 4つの統合タスクを並列でworktree作成（ベース: feat/add-cta-component）
git worktree add ../hidetaka.dev-task6 -b feature/6-integrate-blog-detail
git worktree add ../hidetaka.dev-task7 -b feature/7-integrate-devnote-detail
git worktree add ../hidetaka.dev-task8 -b feature/8-integrate-news-detail
git worktree add ../hidetaka.dev-task9 -b feature/9-integrate-other-details

# 各ターミナルで統合作業 → テスト → コミット → プッシュ → PR作成
# 例: タスク6
cd ../hidetaka.dev-task6
# BlogDetailPage.tsxを編集...
npm test && npm run lint
git add . && git commit -m "feat: integrate ArticleCTA into BlogDetailPage"
git push -u origin feature/6-integrate-blog-detail
gh pr create --title "feat: integrate ArticleCTA into BlogDetailPage" \
  --body "タスク6: BlogDetailPageへの統合..." --base feat/add-cta-component
```

### GitHub CLI便利コマンド

```bash
# PRのステータス確認
gh pr status

# PRのリスト表示
gh pr list --label "small-batch"

# PRのレビュー依頼
gh pr review <PR番号> --approve

# PRのマージ（squash）
gh pr merge <PR番号> --squash --delete-branch

# PRのマージ（自動、CIが通れば）
gh pr merge <PR番号> --auto --squash --delete-branch

# PRの詳細表示
gh pr view <PR番号>

# PRをブラウザで開く
gh pr view <PR番号> --web
```

### PR作成時のチェックリスト

各PRは以下を満たすこと：
- [ ] 変更ファイル数: 1〜3ファイル
- [ ] 変更行数: 200行以下（理想は100行以下）
- [ ] テストカバレッジ: 90%以上
- [ ] すべてのテストが通る（`npm test`）
- [ ] リントエラーなし（`npm run lint`）
- [ ] ビルド成功（`npm run build`）
- [ ] 依存タスクがマージ済み
- [ ] **GitHub CLIでPRを即座に作成済み**

### PRテンプレート

各タスクのPR作成時に使用するテンプレート：

```markdown
## 概要
タスク<番号>: <タスク名>

## 変更内容
- <変更点1>
- <変更点2>

## テスト
- <テスト内容>
- カバレッジ: XX%

## チェックリスト
- [x] 変更ファイル数: Xファイル
- [x] 変更行数: XX行
- [x] テストが通る
- [x] リントエラーなし
- [x] ビルド成功
- [x] 依存タスク: <タスク番号>がマージ済み（または依存なし）

## 関連
- 要件: X.X, X.X
- 次のタスク: タスクX（<タスク名>）
- 依存タスク: タスクX（<タスク名>）

## スクリーンショット（該当する場合）
<画像>
```

## 注意事項

- **Small Batch Size**: 各タスクは独立したPRとしてマージ可能
- **並列開発**: Phase 1とPhase 3のタスクは並列開発可能
- **依存関係**: タスク依存関係図を参照して順序を守る
- **テスト必須**: すべてのタスクにテストを含める
- **継続的統合**: 各PRマージ後、すぐに次のタスクを開始可能
