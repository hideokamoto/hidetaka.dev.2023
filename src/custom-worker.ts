/**
 * Cloudflare Workers のエントリポイント（wrangler.jsonc の `main`）。
 *
 * OpenNext が生成する `.open-next/worker.js` は fetch ハンドラしか持たないため、
 * それを包んで cron 用の `scheduled` ハンドラを足している。
 * https://opennext.js.org/cloudflare/howtos/custom-worker
 *
 * `.open-next/worker.js` は `opennextjs-cloudflare build` で生成されるファイルで、
 * `next build` の時点では存在しないため、import には型エラーの抑制が必要。
 */

// biome-ignore lint/suspicious/noTsIgnore: 生成物のためビルド前後で解決可否が変わる（expect-error は使えない）
// @ts-ignore
import { default as openNextWorker } from '../.open-next/worker.js'
import { type JanitorEnv, runR2Janitor } from './libs/r2Janitor'

// wrangler.jsonc の durable_objects / migrations が参照するクラスを、生成物から再エクスポートする
// biome-ignore lint/suspicious/noTsIgnore: 同上
// @ts-ignore
export { DOQueueHandler } from '../.open-next/worker.js'

export default {
  fetch: openNextWorker.fetch,

  scheduled(
    _controller: { cron: string },
    env: JanitorEnv,
    ctx: { waitUntil(promise: Promise<unknown>): void },
  ) {
    ctx.waitUntil(runR2Janitor(env))
  },
}
