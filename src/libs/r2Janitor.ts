import type { CleanupReport, R2BucketLike } from 'opennext-r2-janitor'
import { cleanupOpenNextR2Cache, resolveBuildIdFromWorker } from 'opennext-r2-janitor'

/**
 * OpenNext の R2 incremental cache に残る古いビルドのキャッシュを掃除する。
 * cron（`scheduled`）から呼ばれる。詳細は docs/guides/r2-cache-janitor.md を参照。
 */

const LOG_PREFIX = '[r2-janitor]'
const DEFAULT_KEEP_DAYS = 14

/** `scheduled` ハンドラが受け取る env のうち、このモジュールが使う分だけ */
export type JanitorEnv = {
  NEXT_INC_CACHE_R2_BUCKET?: R2BucketLike
  ASSETS?: { fetch(input: string): Promise<Response> }
  /** 厳密に "false" のときだけ実削除する。それ以外（未設定・誤記を含む）はすべてドライラン */
  JANITOR_DRY_RUN?: string
  /** 直近何日以内に使われた/書き込まれたビルドを残すか。不正な値は 14 に戻す */
  JANITOR_KEEP_DAYS?: string
}

export type JanitorOptions = {
  dryRun: boolean
  keepDays: number
  warnings: string[]
}

export function parseJanitorOptions(
  env: Pick<JanitorEnv, 'JANITOR_DRY_RUN' | 'JANITOR_KEEP_DAYS'>,
): JanitorOptions {
  const warnings: string[] = []

  // 誤設定で意図せず削除が始まらないよう、実削除は明示的な "false" のみ
  const dryRun = env.JANITOR_DRY_RUN !== 'false'

  let keepDays = DEFAULT_KEEP_DAYS
  const raw = env.JANITOR_KEEP_DAYS
  if (raw !== undefined) {
    const parsed = Number(raw)
    if (raw.trim() !== '' && Number.isFinite(parsed) && parsed >= 0) {
      keepDays = parsed
    } else {
      warnings.push(`JANITOR_KEEP_DAYS="${raw}" is invalid; using ${DEFAULT_KEEP_DAYS}`)
    }
  }

  return { dryRun, keepDays, warnings }
}

/**
 * 掃除を1回実行する。前提が欠けている場合は何も削除せず null を返す。
 * 失敗はログに残したうえで再送出する（cron の失敗として Workers のメトリクスに現れる）。
 */
export async function runR2Janitor(env: JanitorEnv): Promise<CleanupReport | null> {
  const { dryRun, keepDays, warnings } = parseJanitorOptions(env)
  for (const warning of warnings) console.warn(`${LOG_PREFIX} ${warning}`)

  const bucket = env.NEXT_INC_CACHE_R2_BUCKET
  if (!bucket) {
    console.error(`${LOG_PREFIX} skipped: NEXT_INC_CACHE_R2_BUCKET binding is missing`)
    return null
  }

  try {
    const currentBuildId = await resolveBuildIdFromWorker({ assets: env.ASSETS })
    if (!currentBuildId) {
      console.error(`${LOG_PREFIX} skipped: could not determine the current build ID`)
      return null
    }

    const report = await cleanupOpenNextR2Cache({ bucket, currentBuildId, dryRun, keepDays })
    const log = report.aborted ? console.error : console.log
    log(`${LOG_PREFIX} ${JSON.stringify(report)}`)
    return report
  } catch (error) {
    console.error(
      `${LOG_PREFIX} failed: ${error instanceof Error ? `${error.name}: ${error.message}` : String(error)}`,
    )
    throw error
  }
}
