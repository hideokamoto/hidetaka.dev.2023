import type { Metadata } from 'next'
import type { WPPostBase } from './dataSources/types'

export function generateBlogPostMetadata(
  post: WPPostBase,
  postType: 'thoughs' | 'dev-notes' = 'thoughs',
): Metadata {
  // セキュリティ強化: post_idからWordPress APIで記事を取得してタイトルを使用
  // これにより、任意の文字列で画像を生成することを防止
  const ogImageUrl = new URL(
    `/api/thumbnail/wp/${post.id}?type=${postType}`,
    process.env.NEXT_PUBLIC_SITE_URL || 'https://hidetaka.dev',
  )

  return {
    title: post.title.rendered,
    openGraph: {
      title: post.title.rendered,
      type: 'article',
      publishedTime: post.date,
      images: [
        {
          url: ogImageUrl.toString(),
          width: 1200,
          height: 630,
          alt: post.title.rendered,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title.rendered,
      images: [ogImageUrl.toString()],
    },
  }
}
