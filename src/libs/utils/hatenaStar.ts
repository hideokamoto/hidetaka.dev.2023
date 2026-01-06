/**
 * はてなスター機能の有効化判定
 * 環境変数で制御し、かつ日本語ページでのみ表示
 */
export function shouldEnableHatenaStar(lang: string): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_HATENA_STAR === 'true' && lang === 'ja'
}

