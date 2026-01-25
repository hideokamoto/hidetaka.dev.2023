import { env } from '@/env'

/**
 * はてなスター機能の有効化判定
 * 環境変数で制御し、かつ日本語ページでのみ表示
 *
 * Type-safe environment variable is automatically converted to boolean
 */
export function shouldEnableHatenaStar(lang: string): boolean {
  return env.NEXT_PUBLIC_ENABLE_HATENA_STAR && lang === 'ja'
}
