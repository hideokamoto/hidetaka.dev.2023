import { NextResponse } from 'next/server'
import { buildRobotsTxt } from '@/libs/robotsTxt'

// ルール自体はほぼ変わらないため、他の静的テキスト系エンドポイントと同じ1日サイクルで揃える
export const revalidate = 86400

/** `/robots.txt` を返す。 */
export function GET(): Response {
  return new NextResponse(buildRobotsTxt(), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
