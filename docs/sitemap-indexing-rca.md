# RCA: 新規記事がGoogleにインデックスされない問題

## 概要

**確認日**: 2026-07-16
**症状**: 2026年3月以降に公開した記事(特に `/ja/writing/dev-notes/` 配下は公開日の新旧を問わず)が Google に発見・クロールされない
**結論(訂正版)**: `sitemap.xml` の生成・配信は本番でも正常に最新化されており、コード側に原因はない。原因は Google 側のクロール・インデックス処理(クロール予算、品質シグナルなど)にあると考えられ、コード修正では解決できない。デプロイ後の対応として `docs/gsc-indexing-checklist.md` の手順(サイトマップ再送信・URL検査によるインデックス登録リクエスト)を人間が実施する必要がある。

> **本ドキュメントには調査過程での誤った仮説とその反証の記録を含む。** 最初に立てた「sitemap.xmlがISRキャッシュにより古いまま配信されている」という仮説は、本番の `sitemap.xml` を直接確認した結果、明確に反証された。調査の透明性のため経緯をそのまま残す。

---

## 観測された症状(Search Console URL Inspection API、2026-07-16実測)

| 記事 | 公開日 | coverageState | 発見元 |
|---|---|---|---|
| /ja/blog/1459 | 2025-09-17 | PASS(送信して登録されました) | — |
| /ja/blog/recap-2025 | 2025-12-31 | クロール済み・インデックス未登録 | sitemap.xml |
| /ja/blog/join-cci-2026 | 2026-02-24 | クロール済み・インデックス未登録 | 内部リンク(sitemapではない) |
| /ja/blog/use-gen-ai-for-onboarding-partner | 2026-05-06 | URLが認識されていません | — |
| /ja/writing/dev-notes/try-claude-code-auto-fix | 2026-03-27 | URLが認識されていません | — |
| /ja/writing/dev-notes/resolve-npm-ci-error-via-npmrc | 2026-03-11 | URLが認識されていません | — |
| /ja/writing/dev-notes/deploy-static-html-to-cloudflare-workers-as-a-static-assets | 2025-10-12 | URLが認識されていません | — |
| /ja/writing/dev-notes 直近5件 | 2026-07-04〜10 | URLが認識されていません | — |

**重要な観察**: `/ja/writing/dev-notes/` 配下は公開日が2025年10月であっても2026年7月であっても、一貫して「URLが認識されていません」。つまり「3月以降の新しい記事だけが問題」なのではなく、**dev-notesという記事系統がGoogleのクロールにおいて一貫して優先度が低い(または未処理)** ことを示している。

blog記事では段階的な劣化が見える: 2025-09(インデックス済み)→2025-12(sitemap経由でクロールされたが未登録)→2026-02(内部リンク経由で発見・未登録)→2026-05以降(完全未発見)。

## 調査プロセス

### 1. 本番 `/sitemap.xml` への直接アクセス — セッション環境の制約

このセッションの実行環境ではアウトバウンドのegressポリシーにより `hidetaka.dev` への直接アクセス(`curl`、`WebFetch` とも)が `403 policy denial` でブロックされた(証跡: `curl -sS $HTTPS_PROXY/__agentproxy/status` の `recentRelayFailures` に `"host": "hidetaka.dev:443", "detail": "gateway answered 403 to CONNECT (policy denial or upstream failure)"`)。これはサイト側の問題ではなく、セッション環境固有のネットワークポリシーによるもの。

### 2. ローカルビルドでの代替検証 → 誤った仮説の形成

`pnpm build` → `pnpm start` でアプリを起動し、`http://localhost:3000/sitemap.xml` を取得したところ、対象記事は全て正しく含まれていた。これ自体は正しい観測だったが、「ローカルではビルド直後だから正しいが、本番はISRキャッシュに依存しているので古いままかもしれない」という**未検証の推測**を重ねてしまった。

`open-next.config.ts` / `wrangler.jsonc` でR2/Durable Objectによる ISR インフラは正しく構成されていることを確認したが、「バインディングはあるが、アクセス頻度が低いsitemap.xmlはISRのリクエストトリガー型revalidateの恩恵を受けられず、本番では古いまま配信され続けているのではないか」という仮説を立て、これを検証せずに `export const dynamic = 'force-dynamic'` という修正PRを一度作成した。

### 3. 本番sitemap.xmlの実物確認による反証

ユーザーがブラウザで実際に `https://hidetaka.dev/sitemap.xml` を開き、その内容をそのまま共有してくれたことで、直接的な証跡が得られた。確認した結果:

- `/ja/blog/use-gen-ai-for-onboarding-partner`(公開2026-05-06)は **sitemap.xmlに含まれていた**(`lastmod: 2026-05-06T10:04:25.000Z`)
- `/ja/blog/join-cci-2026`(公開2026-02-24)も **含まれていた**(`lastmod: 2026-02-24T13:16:45.000Z`)
- `/ja/blog/recap-2025` も含まれていた
- `/ja/writing/dev-notes/import-github-repo-to-harness` も含まれていた(`lastmod: 2026-07-04T09:00:00.000Z`)
- sitemap内の最新エントリは `/ja/writing/dev-notes/add-github-pr-datasource-to-grafana-cloud-with-github-app`(`lastmod: 2026-07-10T16:11:02.000Z`)— **確認時点(2026-07-16)から6日前の記事まで正しく反映されている**

これは「sitemap.xmlがISRキャッシュにより古いまま配信されている」という仮説を **明確に反証する** 直接証拠である。本番のsitemap.xmlは実際には十分新しい状態で配信されており、対象記事はすべて正しく載っている。

→ **`export const dynamic = 'force-dynamic'` の修正コミットは取り消した。** コード側に原因はない。

## 訂正後の結論

sitemap.xmlの生成・配信経路(`sitemap.ts`のデータ取得ロジック、OpenNext CloudflareのISR、R2/DOキャッシュ)はすべて正常に機能しており、対象記事は公開後遅くとも数日以内にsitemap.xmlへ反映されている。にもかかわらずGoogleが「URLが認識されていません」と報告し続けているということは、**問題はサイト側の技術的な配信経路ではなく、Google側のクロール・インデックス処理(クロール予算の配分、サイト全体の品質シグナルによるクロール優先度低下など)にある** と考えられる。

これはコード修正で解決できる性質の問題ではない。有効な対応は、Search Console上でサイトマップを明示的に再送信してGoogleに再取得を促すこと、および個別URLに対してインデックス登録をリクエストすることである。手順は `docs/gsc-indexing-checklist.md` にまとめた。

dev-notes配下が新旧問わず一貫して未認識である点については、この記事系統がsitemap.tsに追加されたのが2026年1月のコミット以降であるため(Git履歴で確認)、Googleがまだこのセクションを十分にクロールしきれていない可能性がある。sitemap再送信後の追跡が必要。

## 見送った対応

- **canonical末尾スラッシュの正規化**: 前セッションで見つかった副次的な問題。今回の調査の本題ではないため別途判断とする。

## 今後のアクション

1. `docs/gsc-indexing-checklist.md` の手順に沿って、Search Console上でサイトマップの再送信と対象URLのインデックス登録リクエストを人間が実施する
2. 3週間後(目安: 再送信日+21日)を目処に、対象記事の `coverageState` の変化を再確認する
3. 改善が見られない場合は、サイト全体の品質シグナル(低品質コンテンツ判定、クロール予算そのものの低さ)を疑い、Search Consoleの「ページ」レポートやcrawl statsをさらに調査する

コード変更を伴わないため、本件用に開いていたPDCAサイクル(id=2)は `inconclusive` としてクローズ済み。有効な対策(サイトマップ再送信等)が人間によって実施された後、改めてPDCAサイクルを起票することを推奨する。
