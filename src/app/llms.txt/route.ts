import { NextResponse } from 'next/server'
import { buildLlmsTxt } from '@/libs/llmsTxt'

// 頻繁には変わらない静的な誘導文なので、記事系エンドポイントと同じ1日サイクルで揃える
export const revalidate = 86400

/** `/llms.txt` を返す。 */
export function GET(): Response {
  return new NextResponse(buildLlmsTxt(), {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  })
}
