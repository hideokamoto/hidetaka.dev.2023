import { createWPClient } from 'node-wp-api-client'

/**
 * WordPress REST API クライアント（共通インスタンス）
 * wp-kyoto.net の WordPress REST API へアクセスするための共有クライアント。
 * namespace は wp/v2 がデフォルト。
 */
export const wpClient = createWPClient({
  baseUrl: 'https://wp-api.wp-kyoto.net',
})
