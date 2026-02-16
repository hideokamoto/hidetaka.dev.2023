# ナビゲーション再設計レポート検証結果

**検証日:** 2026-02-16
**検証方法:** ソースコード解析による事実検証

---

## 総合評価

レポートの方向性は妥当だが、**重大な事実誤認が複数ある**。

---

## 1. ナビゲーション項目数: 6つ → 実際は5つ

### レポートの主張

> グローバルナビゲーション: About / Work / Writing / Blog / News / Speaking（6つ）

### 実際（Header.tsx）

```
About / Work / Writing / Blog / Speaking（5つ）
```

**Newsはグローバルナビに存在しない。** `src/components/tailwindui/Header.tsx` のナビリンク定義にNewsは含まれていない。Newsはページ（`/news`）として存在するがヘッダーナビには未掲載。

フッター（`src/components/tailwindui/Footer.tsx`）も同様: About, Work, Writing, Blog, Speaking, Privacy Policy。Newsなし。

**影響:** レポートの「6セクション = 認知負荷が高い」「Newsは独立セクションとして不要」という分析は、**既に存在しない問題を議論している**。

---

## 2. 各セクション検証

### About ✅ レポート正確

- 静的コンテンツ（API呼び出しなし）
- 経歴、Stripe認定バッジ、ソーシャルリンク

### Work ✅ レポート概ね正確

- **データソース:** microCMS + npm Registry + WordPress.org plugins
- **カテゴリ:** Projects / Open Source / Books / OSS Contributions
- 検索・フィルター機能あり
- 現在の製品と過去の実績が混在するというレポートの指摘は妥当
- ⚠️ レポートの「Revtrona製品」という記述はコード内に参照なし（CMSデータの可能性はあるが未確認）

### Writing ⚠️ レポート部分的に不正確

- **実態:** 6つの外部ソースからの記事アグリゲーター
  - WordPress(WP Kyoto), Zenn, Qiita, Dev.to, Stripe.dev(5記事ハードコード), Dev Notes
- ISR: 1時間、検索・データソース別フィルター

**レポートは「BlogとWritingの境界が曖昧」と主張するが、技術的には明確に異なる:**

| | Writing | Blog |
|---|---------|------|
| データソース | 6つの外部ソース集約 | WordPress「thoughs」のみ |
| コンテンツ性質 | 外部リンク集 | サイト内全文閲覧 |
| 英語 | Stripe.dev + Dev.to + WP EN | **存在しない（空配列を即返却）** |
| ページネーション | なし（最新20件） | あり（20件/ページ） |
| フィルター | データソース別 | WordPressカテゴリ別 |

ただし、**ユーザー視点でラベルから区別がつきにくい**という指摘には一理ある。

### Blog ✅ レポート正確

- WordPress REST API (`thoughs` カスタム投稿タイプ)
- **英語版は完全に空**（コードで即座に空配列を返す）
- 日本語版のみ実質的に機能
- ISR: 30分、カテゴリフィルター、ページネーション対応

### News ❌ レポートの前提が誤り

- WordPress REST API (`products` カスタム投稿タイプ)
- カテゴリなし、ページネーションなし（100件一括）
- **レポートはNewsをグローバルナビの一部として分析しているが、実際にはナビに未掲載**
- ミドルウェアで `/writing/[slug]`（dev-notes以外）→ `/news/` へのリダイレクトあり

### Speaking ✅ レポート正確

- WordPress REST API (`events` カスタム投稿タイプ)
- 年別フィルター、検索機能あり
- ⚠️ 詳細ページのパスが英日で異なる（`/event-reports/[slug]` vs `/ja/events/[slug]`）

---

## 3. リダイレクト構造（レポートが見落としている点）

現在のリダイレクトルール（`src/libs/middleware/redirectRules.ts`）:

| リダイレクト元 | リダイレクト先 | 種別 |
|--------------|--------------|------|
| /projects | /work | レガシー |
| /oss | /work | レガシー |
| /articles | /writing | レガシー |
| /writing/[slug] (dev-notes以外) | /news/ | microCMS廃止移行 |

**重要:** `/articles` → `/writing` のリダイレクトが既に存在する。案Aで `/articles` をメインURLにする場合、リダイレクト方向の逆転が必要。

---

## 4. 事実誤認まとめ

| # | レポートの主張 | 実際 | 重大度 |
|---|-------------|------|--------|
| 1 | ナビは6セクション（Newsを含む） | **5セクション（Newsはナビ不在）** | 高 |
| 2 | Newsの独立セクション不要 | **既にナビから除外済み** | 高 |
| 3 | 6つ + 言語切替 = 7項目 | 5つ + 言語切替 = 6項目 | 中 |
| 4 | Writing + Blog の境界が曖昧 | 技術的には明確（外部集約 vs 内部WP） | 低 |
| 5 | Revtrona製品がWorkに含まれる | コード上に参照なし | 低 |

---

## 5. レポートが見落としている点

1. **`/articles` URLは既にリダイレクト先として使用中** → 案Aの「Articles」URL採用にはリダイレクト逆転が必要
2. **Dev Notes（`/writing/dev-notes/`）** というWritingのサブセクションの存在とリダイレクト除外ルール
3. **英語Blogは既に空**で日本語版への誘導UIが実装済み
4. **Privacy Policyがフッターナビに存在**
5. **Speaking詳細ページのパスが英日で不統一**（`/event-reports/` vs `/ja/events/`）
6. **`/writing/[slug]` → `/news/` リダイレクト**の歴史的経緯（microCMS posts廃止）

---

## 6. 推奨案Aの技術的評価

### Work → Products（改名）: 容易

ルーティング変更 + リダイレクト追加。microCMSの `project_type` フィールドで分割も可能。

### Writing + Blog → Articles（統合）: 複雑

- 型の不一致: `FeedItem`（外部リンク）≠ `BlogItem`（内部記事 + カテゴリ）
- UXの不一致: 外部リンク（別タブ遷移）vs サイト内全文閲覧
- フィルターロジック統合: データソース別 + WordPressカテゴリ別
- ページネーション戦略の再設計

### Speaking → フッター移動: 容易

Header.tsxからリンク削除のみ。フッターには既に掲載済み。

---

## 7. 結論

レポートの**方向性**（セクション削減、明確な分類）は妥当だが、**現状分析の前提に重大な誤り**がある。

### 修正必須の前提
- ナビは6つではなく**5つ**
- Newsは**既にナビ除外済み**
- `/articles` URLは**既にリダイレクト先として使用中**

### 有効な指摘
- Writing/Blogのラベルの分かりにくさ（ユーザー視点）
- Workページ内のコンテンツ混在
- Speakingのメインナビ配置の妥当性

### 推奨
1. 現状分析をコード実態に合わせて修正
2. 実際の5セクション構造に基づいて再評価
3. Writing + Blog統合の技術コストを詳細見積り
4. 段階的実装（Speaking移動 → Work改名 → 統合）を検討
