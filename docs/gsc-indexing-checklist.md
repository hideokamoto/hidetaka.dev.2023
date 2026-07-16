# Search Console 作業チェックリスト: 新規記事インデックス改善

`sitemap.xml` を force-dynamic 化する修正(`docs/sitemap-indexing-rca.md` 参照)をデプロイした後、
人間が Google Search Console(https://search.google.com/search-console)の UI で行う作業手順。
MCP/API では実行できない操作のみを対象とする。

対象プロパティ: `sc-domain:hidetaka.dev`

## 1. デプロイ直後

- [ ] 修正PRがマージされ、`pnpm cf:deploy` (または CI経由) で本番デプロイされたことを確認する
- [ ] デプロイ後、ブラウザで実際に https://hidetaka.dev/sitemap.xml を開き、以下を目視確認する
  - [ ] 対象記事が含まれている: `/ja/writing/dev-notes/import-github-repo-to-harness`、`/ja/blog/use-gen-ai-for-onboarding-partner`
  - [ ] 直近1週間以内に公開した記事(dev-notes含む)が含まれている
  - [ ] レスポンスヘッダの `cache-control` / `cf-cache-status` を確認し、極端に古いキャッシュでないことを確認する

## 2. サイトマップの再送信

Search Console左メニュー → **「サイトマップ」**

- [ ] 既存の `sitemap.xml` エントリの「最終読み込み日時」を確認する
  - もし直近デプロイより前の日付であれば、Googleがまだ新しいsitemapを読みに来ていない証拠
- [ ] 一度、既存のサイトマップURLを削除して再度 `https://hidetaka.dev/sitemap.xml` を送信する(削除→再送信で強制的に再取得を促す)
- [ ] 送信後、ステータスが「成功しました」になるまで数時間〜1日待つ
- [ ] 「検出されたURL数」が現在の記事数(目安: 200件以上)と近い値になっているか確認する

## 3. クロール統計の確認

Search Console左メニュー → **「設定」→「クロールの統計情報」→「詳細を開く」**

- [ ] 直近90日間の「1日あたりのクロールリクエスト数」の推移グラフを確認する
  - 2026年3〜5月頃にリクエスト数が明確に減少・途絶えていないか
- [ ] 「レスポンス別」で 5xx やタイムアウトの割合が異常に高くないか確認する
- [ ] 「ファイルタイプ別」で `sitemap.xml` 自体へのクロールリクエストの有無・頻度を確認する(可能であれば)
- [ ] 「ホスト状態」がすべて緑(正常)になっているか確認する

## 4. 対象記事のURL検査 → インデックス登録リクエスト

Search Console上部の検査バーに対象URLを貼り付けて実行。以下の記事について、
サイトマップ再送信の**成功後**(またはデプロイ後、様子を見て1〜2日後)に実施する:

- [ ] `https://hidetaka.dev/ja/writing/dev-notes/import-github-repo-to-harness`
- [ ] `https://hidetaka.dev/ja/blog/use-gen-ai-for-onboarding-partner`
- [ ] 直近のdev-notes記事のうち代表で1〜2件

各URLについて:

- [ ] 「公開URLをテスト」でクロール可能であることを確認する
- [ ] 問題なければ「インデックス登録をリクエスト」をクリックする
  - 1日あたりのリクエスト数には上限があるため、対象を絞ること
- [ ] リクエスト後は数日〜数週間、結果を待つ(即時反映されない)

## 5. 経過観察(推奨: デプロイ+サイトマップ再送信から3週間後)

- [ ] 「サイトマップ」レポートで検出URL数が増えているか再確認する
- [ ] 「ページ」レポート(旧カバレッジレポート)で「クロール済み-インデックス未登録」「検出-インデックス未登録」の件数推移を確認する
  - 改善していれば、force-dynamic化がクロール頻度回復に寄与したと判断できる
  - 変化がなければ、他の要因(サイト全体の評価・品質シグナル、手動対策など)を再調査する
- [ ] このリポジトリのPDCA台帳(`pdca_list` / cycle id=2, articleKey: `/ja/writing/dev-notes/import-github-repo-to-harness`)の観測日(目安 2026-08-06以降)に、`clicks` / `impressions` を再取得して `pdca_close` で記録する

## 参考: 今回の診断で確認済みの事項(再確認不要)

- robots.txt は正常(`Sitemap:` 明記、対象パスのブロックなし)
- 対象記事に `noindex` の指定なし
- `/ja/writing` 一覧から各記事への内部リンクは存在する
- ローカルビルドで生成される sitemap.xml の内容自体は正しい(対象記事を含む)
