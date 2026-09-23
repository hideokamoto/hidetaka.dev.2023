import { logger } from '@/libs/logger'

/**
 * Content Lake Gold の消費側が読みうるファイル。
 * vibes-wp-content-enrichment の Gold tier が配信する JSON に対応する。
 */
export const GOLD_CONSUMER_FILES = [
  'index.json',
  'meta.json',
  'summary.json',
  'writing.json',
  'about.json',
  'slides.json',
] as const

export type GoldConsumerFile = (typeof GOLD_CONSUMER_FILES)[number]

/** 未設定時に使う本番の配信元。 */
export const DEFAULT_CONTENT_LAKE_GOLD_URL = 'https://lake.hidetaka.dev'

/**
 * ベース URL を呼び出し時に読む（`vi.stubEnv` で差し替えられるようモジュールスコープに置かない）。
 * 環境変数はドメインだけを持つことがあるため、スキームが無ければ https:// を補う。
 */
export function readGoldBaseUrl(): string {
  const raw = process.env.CONTENT_LAKE_GOLD_URL || DEFAULT_CONTENT_LAKE_GOLD_URL
  const withScheme = /^https?:\/\//.test(raw) ? raw : `https://${raw}`
  return withScheme.replace(/\/+$/, '')
}

export function buildGoldUrl(baseUrl: string, file: GoldConsumerFile): string {
  return `${baseUrl.replace(/\/+$/, '')}/${file}`
}

/**
 * Gold ファイルを1回 fetch で読む。絶対に throw せず、あらゆる失敗は null に畳む。
 * 取得失敗やスキーマ不一致でページを壊さないため。
 */
export async function fetchGold<T>(
  file: GoldConsumerFile,
  options: {
    revalidate: number
    timeoutMs?: number
    validate: (data: unknown) => data is T
  },
): Promise<T | null> {
  const url = buildGoldUrl(readGoldBaseUrl(), file)

  try {
    const response = await fetch(url, {
      next: { revalidate: options.revalidate },
      signal: AbortSignal.timeout(options.timeoutMs ?? 5000),
    })
    if (!response.ok) {
      logger.error('Content Lake Gold responded with an error', {
        file,
        url,
        status: response.status,
      })
      return null
    }

    const data: unknown = await response.json()
    if (!options.validate(data)) {
      logger.error('Content Lake Gold payload did not match the expected shape', { file, url })
      return null
    }

    return data
  } catch (error) {
    logger.error('Failed to fetch Content Lake Gold', { file, url, error })
    return null
  }
}
