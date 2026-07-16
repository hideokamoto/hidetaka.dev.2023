# RCA: 新規記事がGoogleにインデックスされない問題

## 概要

**確認日**: 2026-07-16
**影響範囲**: hidetaka.dev の `/sitemap.xml` 配信(Cloudflare Workers / OpenNext)
**症状**: 2026年3月以降に公開した記事が Google に発見・クロールされない
**根本原因**: `/sitemap.xml` が Next.js ISR(30分 revalidate)の静的ルートとして配信されており、OpenNext Cloudflare の stale-while-revalidate はリクエストトリガー型のため、アクセス頻度の低い `/sitemap.xml` が実際には revalidate 周期を大幅に超えて古い内容のまま配信され続けていた可能性が高い
**対策**: `src/app/sitemap.ts` に `export const dynamic = 'force-dynamic'` を追加し、リクエスト毎に最新コンテンツで再計算するよう変更(PR で対応)

---

## 観測された症状(Search Console URL Inspection API、2026-07-16実測)

| 記事 | 公開日 | coverageState | 発見元 |
|---|---|---|---|
| /ja/blog/1459 | 2025-09-17 | PASS(送信して登録されました) | — |
| /ja/blog/recap-2025 | 2025-12-31 | クロール済み・インデックス未登録 | **sitemap.xml** |
| /ja/blog/join-cci-2026 | 2026-02-24 | クロール済み・インデックス未登録 | **内部リンク**(sitemapではない) |
| /ja/blog/use-gen-ai-for-onboarding-partner | 2026-05-06 | URLが認識されていません | — |
| /ja/writing/dev-notes/try-claude-code-auto-fix | 2026-03-27 | URLが認識されていません | — |
| /ja/writing/dev-notes/resolve-npm-ci-error-via-npmrc | 2026-03-11 | URLが認識されていません | — |
| /ja/writing/dev-notes/deploy-static-html-to-cloudflare-workers-as-a-static-assets | 2025-10-12 | URLが認識されていません | — |
| /ja/writing/dev-notes 直近5件 | 2026-07-04〜10 | URLが認識されていません | — |

**重要な観察**: `/ja/writing/dev-notes/` 配下は公開日が2025年10月であっても2026年7月であっても、一貫して「URLが認識されていません」。つまりこれは「3月以降の新しい記事だけが問題」なのではなく、**dev-notesという記事系統がsitemap経由で一度も正しく発見されていない**ことを示す。

blog記事では明確な劣化の段階が見える:
1. 2025-09: sitemap経由で発見・クロール・インデックス(正常)
2. 2025-12: sitemap経由で発見・クロールされたがインデックス未登録
3. 2026-02: **sitemap経由ではなく内部リンク経由**で発見(この時点でsitemapに載っていなかった、または既に読まれなくなっていた可能性)
4. 2026-05以降: 完全に未発見

## 調査プロセス

### 1. 本番 `/sitemap.xml` への直接アクセス — 環境制約により未実施

このセッションの実行環境ではアウトバウンドの egress ポリシーにより `hidetaka.dev` への直接アクセス(`curl`、`WebFetch` とも)が **`403 policy denial`** でブロックされた(証跡: `curl -sS $HTTPS_PROXY/__agentproxy/status` の `recentRelayFailures` に `"host": "hidetaka.dev:443", "detail": "gateway answered 403 to CONNECT (policy denial or upstream failure)"` が記録されている)。これはサイト側の問題ではなく、このセッションの実行環境固有のネットワークポリシーによるものである。そのため本番配信中の実際のsitemap.xmlの中身は本セッションでは直接確認できていない。

### 2. ローカルビルドでの検証(代替検証)

`pnpm build` → `pnpm start` でアプリを起動し、`http://localhost:3000/sitemap.xml` を直接取得して検証した。

```
$ curl -sD - http://localhost:3000/sitemap.xml
HTTP/1.1 200 OK
x-nextjs-cache: HIT
cache-control: public, max-age=0, must-revalidate
```

内容を確認した結果、`use-gen-ai-for-onboarding-partner`、`recap-2025`、`join-cci-2026`、`import-github-repo-to-harness`、直近の dev-notes 記事(2026-07-04〜10公開分含む)まで **全て正しく含まれていた**(全227URL)。

→ **`src/app/sitemap.ts` および `loadAllThoughts` / `loadAllDevNotes` のデータ取得・ページネーションロジック自体にバグはない。** ビルド直後(=WordPress APIから最新データを取得した直後)であれば、常に正しい内容が生成される。

### 3. コードベース調査(sitemap.ts / OpenNext Cloudflare設定)

- `src/app/sitemap.ts`: `export const revalidate` の明示なし。配下の各loaderが `next: { revalidate: 1800 }` を指定しているため、Next.jsがそれを推論して30分のISRルートとしてビルドしていた(`.next/prerender-manifest.json` で確認、ビルド出力でも `○ /sitemap.xml 30m 1y` と表示)。
- `open-next.config.ts` / `wrangler.jsonc`: R2バケット(`NEXT_INC_CACHE_R2_BUCKET`)とDurable Object Queue(`NEXT_CACHE_DO_QUEUE`)が正しく構成されており、「ISR用のバインディングが欠落している」という仮説は**否定された**。
- `public/_headers`: `/sitemap.xml` に対する独自のCache-Controlルールはなし。CDNエッジ層による上書きは確認されなかった。
- Git履歴: `sitemap.ts` / `src/libs/dataSources/` は2026-01-06〜2026-06-11の間に16コミット。2026年3月前後に該当箇所への変更はなく、コード変更が3月の境界を作ったわけではない。

### 4. 結論: ISRのリクエストトリガー型再生成という構造的な問題

OpenNext Cloudflare上のISRは、revalidate期限が切れたページに対して**次にリクエストが来たタイミング**でstale-while-revalidateの再生成をトリガーする方式である。バックグラウンドの定期ジョブではない。

`/sitemap.xml` は人間のブラウザでほぼ訪問されず、アクセスはGooglebot等のクローラーに依存する。GSCの実測で見られる「sitemap経由の発見が2025年12月を最後に途絶え、2026年2月には内部リンク経由に切り替わり、5月以降は完全に途絶える」というパターンは、**Googlebotがsitemap.xmlを読みに来る頻度自体が低下・途絶えており、その結果として配信されるsitemap.xmlのキャッシュが実質的に長期間(30分をはるかに超えて)更新されないまま固定されていた**、という説明と整合する。

これは「コードのバグ」ではなく、低トラフィックなsitemap.xmlに対してISRのstale-while-revalidateモデルを適用したことによる構造的なギャップである。dev-notesが新旧問わず一貫して「未認識」なのも、dev-notesがsitemapに追加された時期(2026年1月のコミット)以降、Googlebotがそのsitemapを十分な頻度で再取得していないため、と考えれば整合する。

## 対策

`src/app/sitemap.ts` に以下を追加し、リクエスト毎に確実に最新コンテンツで再計算されるようにした:

```ts
export const dynamic = 'force-dynamic'
```

配下の `loadAllThoughts` / `loadAllDevNotes` / `loadAllProducts` などのWordPress fetchは引き続き `next: { revalidate: 1800/3600 }` を指定しているため、Data Cacheにより30分〜1時間はキャッシュされた結果が再利用される。ルート自体をdynamic化しても、WordPress APIへの実リクエスト数が増えるわけではない(Data Cacheが効くため)。変わるのは「sitemap.xmlというレスポンス全体がリクエスト毎に計算される」という点のみで、これによりアクセス頻度に関わらず常に「30分〜1時間以内の鮮度」を保証できる。

### 検証(ビルド確認)

```
# 修正前: ○ /sitemap.xml  30m  1y   (Static, ISR)
# 修正後: ƒ /sitemap.xml               (Dynamic)
```

`pnpm start` で同一URLに連続リクエストしても `x-nextjs-cache` ヘッダーが付与されなくなり(修正前は `HIT` が返っていた)、常に動的処理されることを確認した。生成内容には対象記事(`use-gen-ai-for-onboarding-partner`、`recap-2025`、`import-github-repo-to-harness` ほか直近のdev-notes)が引き続き正しく含まれることも確認済み。

### 見送った対応(別PR判断)

- **canonical末尾スラッシュの正規化**: 前セッションの副次的発見。本命修正と混ぜず、影響を単独で確認できるよう別PRとして見送る。

## 効果測定

- デプロイ後、`docs/gsc-indexing-checklist.md` の手順でサイトマップの再送信とURL検査によるインデックス登録リクエストを実施する。
- 観測日: デプロイ + サイトマップ再送信日から **21日後**(2026-07-16時点でのデプロイを想定した場合、目安 **2026-08-06**)。PDCA台帳(id=2, articleKey: `/ja/writing/dev-notes/import-github-repo-to-harness`)に登録済み。baseline: clicks=0, impressions=0。
