import type { Metadata } from 'next'
import type { WPDevNote, WPThought } from './dataSources/types'

export function generateBlogPostMetadata(thought: WPThought): Metadata {
  // セキュリティ強化: post_idからWordPress APIで記事を取得してタイトルを使用
  // これにより、任意の文字列で画像を生成することを防止
  const ogImageUrl = new URL(
    `/api/thumbnail/thoughts/${thought.id}`,
    process.env.NEXT_PUBLIC_SITE_URL || 'https://hidetaka.dev',
  )

  return {
    title: thought.title.rendered,
    openGraph: {
      title: thought.title.rendered,
      type: 'article',
      publishedTime: thought.date,
      images: [
        {
          url: ogImageUrl.toString(),
          width: 1200,
          height: 630,
          alt: thought.title.rendered,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: thought.title.rendered,
      images: [ogImageUrl.toString()],
    },
  }
}

export function generateDevNoteMetadata(devNote: WPDevNote): Metadata {
  // セキュリティ強化: post_idからWordPress APIで記事を取得してタイトルを使用
  // これにより、任意の文字列で画像を生成することを防止
  const ogImageUrl = new URL(
    `/api/thumbnail/dev-notes/${devNote.id}`,
    process.env.NEXT_PUBLIC_SITE_URL || 'https://hidetaka.dev',
  )

  return {
    title: devNote.title.rendered,
    openGraph: {
      title: devNote.title.rendered,
      type: 'article',
      publishedTime: devNote.date,
      images: [
        {
          url: ogImageUrl.toString(),
          width: 1200,
          height: 630,
          alt: devNote.title.rendered,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: devNote.title.rendered,
      images: [ogImageUrl.toString()],
    },
  }
}
