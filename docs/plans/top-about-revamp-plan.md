# TOP / about ページ改修 — 詳細プラン

**ステータス:** 実装前のプランのみ(コードは未着手)
**購読導線の方針(決定済み):** メールニュースレターは持たず、**RSS + SNSフォロー**への導線強化に絞る
**作成日:** 2026-06-11

---

## 0. 前提:なぜ「全面作り直し」ではなく「部分改修」なのか

デザインシステム・レイアウト・コンポーネント階層(UI / container / layout)は健全で、人物証明の素材(経歴カード、Stripe認定4種、SpeakerProfile、Person JSON-LD)も揃っている。問題は **「何を誰に言うか(メッセージ)」と「来た人をどこに流すか(導線)」** の2点に局所化できる。よって骨格は維持し、コピーと導線を差し替える。

### 現状構成(把握済み)

| ページ | セクション構成 | 性格 |
|--------|--------------|------|
| `/`(home) | Hero → Capabilities → StackShowcase → FeaturedContent | Hero/Capabilities/StackShowcaseは**受託営業LP**。FeaturedContentのみ読者・主催者向けに機能 |
| `/about` | Hero(Profile) → Experience → Certifications → Connect(SNS) | 人物証明は良好。Connectは最下部のSNSリンクのみ、RSSなし |

### 訪問者の実像(前回レポート)とのギャップ

- 流入の83%がDirect+SNS。主役は「レイオフ記事・ツールレビューを読みに来る同業者」と「登壇・実績を確認する主催者・採用担当」。
- TOPは年間約5,000PVで全ページ1位の玄関なのに、この2ペルソナのどちらにも最適化されていない。
- Capabilities/StackShowcaseの文章は「どの受託サイトにも書ける」汎用営業文で、戦略上の強み(岡本秀高にしか書けない一次情報)と真逆。

---

## 🔴 土台(最優先・前提バグ): 壊れたRSSリンクの修復

`src/app/layout.tsx:55` が以下を宣言している:

```html
<link rel="alternate" type="application/rss+xml" title="RSS" href="/projects/rss.xml" />
```

しかし `src/app/` 配下に該当ルートは存在せず、**現状 `/projects/rss.xml` は404**。RSSを購読導線の柱に据える方針である以上、まずこれを塞がないと「フォローしてね」と言っても受け皿が無い。

**対応案(いずれか):**
- **(A) RSS出力ルートを新設**して、site配信記事(`loadBlogPosts`が集約しているDev.to/Qiita/Zenn/WordPressの統合フィード、または自前のnews/dev-notes)をRSSで出す。`src/app/projects/rss.xml/route.ts`(または現実装に合わせ`/rss.xml`)としてRoute Handlerを実装。`feed.utils.ts`に生成ヘルパーを追加。
- **(B) href先を実在する配信元に差し替え**。ただし外部フィードの寄せ集めを「岡本のRSS」と称するのは弱いので、(A)推奨。

**論点(要確認):** RSSに何を載せるか。①自前コンテンツ(news / writing/dev-notes)のみ、②外部含む統合フィード全部、のどちらか。購読者体験としては①が素直。

---

## ① 購読 / フォロー導線の新設(止血効果・最重要)

月3,500ユーザーのバイラルが翌月800に戻る構造を、ページ改修より先に「フォロー先の提示」で止血する。**新規UIコンポーネント1つ**を作り、home と about に差し込む。

### 新規コンポーネント `src/components/ui/FollowCTA.tsx`(純粋UI)

- Props: `lang: 'ja' | 'en'`、`variant?: 'band' | 'card'`(任意)
- 内容:
  - 見出し:「更新を受け取る / Stay in the loop」程度
  - **RSS購読ボタン**(土台で実装したRSS URLへ)
  - **SNSフォロー**: X / GitHub / LinkedIn(+ 後述のBluesky追加を検討)
  - 補足コピー1行(「レイオフ・Stripe・AWS・WordPressの一次情報を発信」など、何が届くかを明示)
- ダークモード・レスポンシブ対応、`SITE_CONFIG.social` を参照(ハードコードしない)

### 設置箇所

1. **home**: `FeaturedContent` の直後(記事を読んだ直後=フォロー意欲が最も高い位置)に `band` variantで1本。`src/app/page.tsx` と `src/app/ja/page.tsx` に追加。
2. **about**: 既存 `Connect` セクションを `FollowCTA` ベースに置換 or 強化(RSSを追加、文言を「フォローしてね」から「何が届くか」に)。

---

## ② Capabilities → 実績 / 一次情報セクションへ差し替え

`src/components/home/Capabilities.tsx`(「私ができること」4枚の汎用サービスカード)を、**証拠で語る**セクションに置換する。営業文を消すのではなく、間接収益(登壇・執筆・顧問)に効く「実績の列挙」へ転換。

### 差し替え案 `src/components/home/Highlights.tsx`(新規 or Capabilities改修)

カード or 統計バンドで、岡本にしか書けない事実を並べる:

- **登壇歴ハイライト**: WordCamp Kansai 2024 実行委員長 / JP_Stripes Connect 2019(日本初のStripeユーザーカンファレンス)実行委員長 → `/speaking` へリンク
- **コミュニティ運営**: JP_Stripes、wp-kyoto(運営10年級の検索資産)
- **認定 / アワード**: Stripe認定4種、AWS Samurai 2017、Alexa Champions、AWS Community Builders
- **発信実績**: バイラル記事(レイオフ記事等)/ Dev.to・Qiita・Zenn 統合フィード → `/writing` へ

> StackShowcase(技術スタック)は**技術的信頼の証明**として主催者・採用担当に有効なので残す。ただしコピーの「事業のスピードを最大化」等の営業トーンは、専門領域の提示トーンへ微修正。

---

## ③ Hero の CTA 複線化 + メッセージ修正

`src/components/Hero/Hero.tsx`:

1. **CTA複線化**: 現状「View my projects」一本(`/work`)を2本立てに。
   - ペルソナ①(機会をくれる人)→ `/speaking` または `/about`(実績・登壇)
   - ペルソナ②(SNSから来た同業者)→ `/writing`(記事)+ RSS/フォロー
2. **descriptionの脱・営業文**: 「SaaS・ECサイトの収益最大化を支援します」という受託訴求から、「Stripe / AWS / WordPress について発信するエンジニア。Stripe Developer Advocate・WordCamp/JP_Stripes主催」など、一次情報発信者としての自己紹介へ。
3. **細かい不整合の修正**:
   - `Hero.tsx:13` の `role` が日英で同一文字列の三項演算子になっている(無意味)→ 単一定数化。
   - 自己紹介の軸ブレ統一: Heroは「engineering partner」、aboutは「DigitalCubeのBizDev」。どちらかに寄せる(発信戦略なら「BizDev / 元Stripe DevAdvocate / コミュニティオーガナイザー」が一貫)。

---

## ④ about ページの部分強化(登壇者・主催者向け)

`src/components/containers/pages/AboutPage.tsx`:

1. **コピペ可能なスピーカープロフィール明示**: 主催者が登壇依頼時にそのまま使える「短縮版プロフィール + 顔写真リンク + 肩書き」のブロックを追加(既存SpeakerProfile文を整形し、コピーしやすい体裁に)。
2. **wp-kyoto運営者であることの明記**: 検索資産(wp-kyoto)と人物名の接続。Experience か SpeakerProfile に1行追加。
3. **Connectセクション → FollowCTA化**(①と共通化): RSS追加、Bluesky検討。
4. **構造化データ確認**: Person JSON-LD(`generatePersonJsonLd`)は `layout.tsx:56` で全ページに適用済み・`sameAs`あり=**対応済み**。aboutに二重で入れる必要はない。`sameAs` にBlueskyを足す程度。

---

## ⑤ 付随: SITE_CONFIG の拡張

`src/config.ts` の `social` に、必要なら **Bluesky** を追加(`bsky` 現状未登録)。`generatePersonJsonLd` の `sameAs` と FollowCTA の両方が `SITE_CONFIG` を参照する形を維持する。

> 要確認: BlueskyアカウントのURL。無ければこの項はスキップ。

---

## 実装順序(疎結合な単位でPR分割を推奨)

| 順 | 単位 | 対象ファイル | 独立性 |
|----|------|------------|--------|
| 1 | 🔴 RSS土台の修復 | `app/projects/rss.xml/route.ts`(新), `feed.utils.ts` | 高(他と独立) |
| 2 | ① FollowCTA新設 + home/about設置 | `ui/FollowCTA.tsx`(新), `page.tsx` ×2, `AboutPage.tsx` | 高 |
| 3 | ② Capabilities→実績差し替え | `home/Capabilities.tsx` or `Highlights.tsx`(新) | 中 |
| 4 | ③ Hero CTA複線化・コピー修正 | `Hero/Hero.tsx` | 高 |
| 5 | ④ about強化 | `AboutPage.tsx`, `config.ts`, `jsonLd.ts` | 中 |

各PRとも、CLAUDE.md準拠で `pnpm lint:check` / `pnpm test` / `pnpm build` を通してからpush。日英両方(`/` と `/ja`)を必ず対で修正する。

---

## 実装着手前に決めたい論点(3つ)

1. **RSSの中身**: 自前コンテンツ(news/writing)のみ vs 外部含む統合フィード全部。→ 推奨: 自前のみ。
2. **自己紹介の軸**: 「発信者・オーガナイザー」に寄せてよいか(現状の「engineering partner / 収益最大化支援」という受託トーンを後退させる判断)。
3. **Bluesky等の追加アカウント**: フォロー先に加えるアカウントのURL一覧(X/GitHub/LinkedIn以外にあるか)。
