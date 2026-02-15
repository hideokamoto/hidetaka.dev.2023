# 実装計画: 記事CTAコンポーネント

## 概要

記事CTAコンポーネントシステムを実装し、記事タイプに基づいて適切なコールトゥアクションを表示します。実装は既存のコンポーネント構造に従い、将来のCMS統合を見据えた拡張可能なアーキテクチャを採用します。

**Small Batch Size戦略**: 各タスクは独立したPRとしてマージ可能な最小単位に分割されています。git worktreeを使用して並列開発を行い、mainブランチに対して小さなPRを継続的にマージすることを推奨します。

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

## Git Worktree開発フロー

### 推奨ワークフロー

```bash
# メインディレクトリで作業
cd hidetaka.dev

# Phase 1のタスクを並列開発
git worktree add ../hidetaka.dev-task1 -b feature/1-cta-types
git worktree add ../hidetaka.dev-task2 -b feature/2-cta-patterns
git worktree add ../hidetaka.dev-task3 -b feature/3-cta-validation

# 各worktreeで独立して開発
cd ../hidetaka.dev-task1
# タスク1を実装、テスト、コミット、PR作成

cd ../hidetaka.dev-task2
# タスク2を実装、テスト、コミット、PR作成

# Phase 3の統合タスクも並列開発可能
git worktree add ../hidetaka.dev-task6 -b feature/6-integrate-blog-detail
git worktree add ../hidetaka.dev-task7 -b feature/7-integrate-devnote-detail
git worktree add ../hidetaka.dev-task8 -b feature/8-integrate-news-detail
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

## 注意事項

- **Small Batch Size**: 各タスクは独立したPRとしてマージ可能
- **並列開発**: Phase 1とPhase 3のタスクは並列開発可能
- **依存関係**: タスク依存関係図を参照して順序を守る
- **テスト必須**: すべてのタスクにテストを含める
- **継続的統合**: 各PRマージ後、すぐに次のタスクを開始可能
