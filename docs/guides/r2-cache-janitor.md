# R2 キャッシュの掃除（opennext-r2-janitor）

## なぜ必要か

OpenNext の R2 incremental cache は、キャッシュを `incremental-cache/<BUILD_ID>/<hash>.<種別>` に保存する。
デプロイのたびに新しい BUILD_ID の配下へ全ページ分が書き込まれるが、古い BUILD_ID の配下は誰も消さない
（R2 にはオブジェクト単位の TTL がなく、OpenNext も削除しない）。放置すると、二度と読まれないキャッシュが増え続ける。

2026-10-14 時点の `hidetaka-dev-cache` は、BUILD_ID のフォルダが 143 個、約 79,000 オブジェクト、約 10.8 GiB。
このうち現在のビルドは約 0.3 GiB だった。

## 仕組み

- `wrangler.jsonc` の `main` は `src/custom-worker.ts`。OpenNext が生成する `.open-next/worker.js` を包み、
  fetch はそのまま委譲し、cron 用の `scheduled` ハンドラを足している。
- `scheduled` は `src/libs/r2Janitor.ts` を呼び、[opennext-r2-janitor](https://github.com/hideokamoto/opennext-r2-janitor) の
  `cleanupOpenNextR2Cache()` を実行する。判定ロジック自体はそのライブラリ側にある。
- 現在の BUILD_ID は `process.env.OPEN_NEXT_BUILD_ID`（OpenNext がキャッシュキーに使う値と同じ）から取得し、
  取れなければ静的アセットの `BUILD_ID` を読む。
- フォルダごとに独立して判定する。**現在のビルド**、**直近 `JANITOR_KEEP_DAYS` 日以内に現在のビルドだったもの**、
  **直近 `JANITOR_KEEP_DAYS` 日以内に書き込みのあるもの**は残し、それ以外を削除する。
  削除に入る前にフォルダ内を最後まで確認するので、最近書き込まれたオブジェクトが1つでもあるビルドは手を付けない。
  ただし削除そのものは複数回の実行にまたがることがあり（サブリクエスト上限のため）、途中の回や、削除中に新しい書き込みが見つかって止まった場合は、
  一部だけ削除されたビルドが残りうる。そのビルドは現行でも直近の利用でもないが、半分消えた状態であることは承知しておく。
- 1回の実行で使う R2 の呼び出しは最大 40 回（無料プランのサブリクエスト上限 50 回の内側）。
  途中で打ち切っても進捗を `opennext-r2-janitor/state.json` に保存し、次回の実行が続きから処理する。

### 安全装置

- `JANITOR_DRY_RUN` は**文字列の `"false"` に一致したときだけ**実削除になる。未設定、`"False"`、空文字、誤字はすべてドライラン。
- 現在の BUILD_ID のフォルダが R2 に存在しない場合（プレフィックスや BUILD_ID の取得元がずれている）は、何も削除せず中止する。
- `incremental-cache/` の直下に `<BUILD_ID>/` 以外のオブジェクトがある場合（OpenNext のキー形式が変わった兆候）も、何も削除せず中止する。
- 状態ファイルが壊れている場合も、何も削除せず中止する。

## 設定

`wrangler.jsonc` の `vars`（この Worker は `keep_vars` が既定のため、**ダッシュボードでの編集は次回デプロイで消える**。変更は PR で行う）。

| 変数 | 既定 | 意味 |
|---|---|---|
| `JANITOR_DRY_RUN` | `"true"` | `"false"` にすると実際に削除する |
| `JANITOR_KEEP_DAYS` | `"14"` | この日数以内に使われた/書き込まれたビルドを残す（ロールバック先の保護期間）。不正な値は 14 に戻る |

cron は `triggers.crons`（現在は毎時 17 分）。cron は本番にデプロイされた Worker でだけ動き、ブランチプレビュー（`wrangler versions upload`）では動かない。

## ログの見方

Workers Logs で `[r2-janitor]` を検索する。1回の実行につき、次の JSON が1行出る（失敗や中止は error レベル）。

```text
[r2-janitor] {"dryRun":true,"currentBuildId":"…","prefix":"incremental-cache/","buildIds":143,
  "kept":[{"buildId":"…","reason":"current"}, …],
  "deleted":[{"buildId":"…","objects":123}, …],   // ドライランでは「削除する予定」
  "pending":true,"partial":{"buildId":"…","phase":"scan","objects":2000},"subrequests":40}
```

- `deleted` … 削除した（ドライランでは削除予定の）ビルドと、そのオブジェクト数。大きなビルドは複数回の実行にまたがるが、完了した回に合計が出る。
- `pending: true` … 予算を使い切った。次の実行が続きを処理する。
- `aborted` … 何も削除せず中止した。`reason` は `invalid-build-id` / `current-build-not-found` / `unexpected-layout` / `unreadable-state`。

## 導入手順（段階）

| 段階 | 変更 | cron | 確認すること |
|---|---|---|---|
| 1. ドライラン | `JANITOR_DRY_RUN="true"` で導入 | 毎時 | `aborted` がない。`currentBuildId` が `https://hidetaka.dev/BUILD_ID` と一致する。`deleted` に現在のビルドや最近書き込みのあるビルドが含まれない。サイトの応答とエラー率が変わらない |
| 2. 実削除 | `JANITOR_DRY_RUN="false"` に変更する PR | 毎時 | 実行ごとにバケットのビルド数・サイズが減り、現在のビルドは無傷。ISR のページが再生成されて R2 に書き込まれる |
| 3. 定常運用 | cron を1日1回（例: `17 3 * * *`）に変更する PR | 毎日 | バケットの容量が現在のビルド分（約 0.3 GiB 前後）で安定する |

## 止めたいとき・戻したいとき

- **削除を止める**: `JANITOR_DRY_RUN` を `"true"` に戻した PR をデプロイする（次の実行からドライラン）。
- **掃除自体をやめる**: `wrangler.jsonc` の `triggers.crons` を `[]` にする（fetch の挙動は変わらない）。
  **`triggers` やその中の `crons` を消す・コメントアウトするだけでは、すでに登録された cron は止まらない**
  （Cloudflare の公式ドキュメント: "To disable a Cron Trigger, set `crons = []`. Commenting out the `crons` key will not disable a Cron Trigger."）。
- **完全に元の構成へ戻す**: 同じ変更の中で `triggers.crons` を `[]` にし、`main` を `.open-next/worker.js` に戻す。
  `main` だけ戻すと、登録済みの cron が毎時起動し、生成された Worker に `scheduled` がないため失敗し続ける。
- 状態ファイルを作り直したい場合は `opennext-r2-janitor/state.json` を削除する。ただし「最近まで本番だったビルド」の履歴が消えるので、しばらくドライランで様子を見る。

## 制約

- OpenNext のキー形式（`<prefix>/<buildId>/…`）は `@opennextjs/cloudflare` の内部実装で、公開 API ではない（1.19.11 で確認）。変わった場合は、上記の中止条件により何も削除せずに止まる。
- 保護されるのは、現在のビルドと、直近 `JANITOR_KEEP_DAYS` 日以内に使われた/書き込まれたビルド。それより古いビルドへ Worker をロールバックすると、そのビルドのキャッシュは空になっている。
