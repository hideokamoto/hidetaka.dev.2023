import type { Metadata } from 'next'
import type { WPThought } from './dataSources/types'

export function generateBlogPostMetadata(thought: WPThought): Metadata {
  const ogImageUrl = new URL(
    '/api/og',
    process.env.NEXT_PUBLIC_SITE_URL || 'https://hidetaka.dev'
  )
  ogImageUrl.searchParams.set('title', thought.title.rendered)
  ogImageUrl.searchParams.set('date', thought.date)

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
