import type { Metadata } from 'next'
import type { WPThought } from './dataSources/types'
import type { MicroCMSProjectsRecord } from './microCMS/types'
import { removeHtmlTags } from './sanitize'

const MAX_DESCRIPTION_LENGTH = 120

/**
 * WordPressのexcerpt/contentからmeta description用のプレーンテキストを生成する。
 * HTMLタグを除去し、空白を正規化したうえで最大120文字程度に切り詰める。
 * excerpt・contentが空の場合はtitleにフォールバックし、空文字を返さない。
 */
function buildDescription(thought: WPThought): string {
  const candidates = [thought.excerpt?.rendered, thought.content?.rendered, thought.title.rendered]

  for (const candidate of candidates) {
    const text = (removeHtmlTags(candidate ?? '') ?? '').replace(/\s+/g, ' ').trim()
    if (!text) continue

    if (text.length <= MAX_DESCRIPTION_LENGTH) {
      return text
    }
    return `${text.slice(0, MAX_DESCRIPTION_LENGTH).trimEnd()}...`
  }

  return thought.title.rendered
}

export function generateDevNoteMetadata(note: WPThought): Metadata {
  const ogImageUrl = new URL(
    `/api/thumbnail/dev-notes/${note.id}`,
    process.env.NEXT_PUBLIC_SITE_URL || 'https://hidetaka.dev',
  )

  const description = buildDescription(note)

  return {
    title: note.title.rendered,
    description,
    openGraph: {
      title: note.title.rendered,
      description,
      type: 'article',
      publishedTime: note.date,
      images: [
        {
          url: ogImageUrl.toString(),
          width: 1200,
          height: 630,
          alt: note.title.rendered,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: note.title.rendered,
      description,
      images: [ogImageUrl.toString()],
    },
  }
}

export function generateBlogPostMetadata(thought: WPThought): Metadata {
  // セキュリティ強化: post_idからWordPress APIで記事を取得してタイトルを使用
  // これにより、任意の文字列で画像を生成することを防止
  const ogImageUrl = new URL(
    `/api/thumbnail/thoughts/${thought.id}`,
    process.env.NEXT_PUBLIC_SITE_URL || 'https://hidetaka.dev',
  )

  const description = buildDescription(thought)

  return {
    title: thought.title.rendered,
    description,
    openGraph: {
      title: thought.title.rendered,
      description,
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
      description,
      images: [ogImageUrl.toString()],
    },
  }
}

const PROJECT_DESCRIPTION_MAX_LENGTH = 120

export function generateProjectMetadata(
  project: MicroCMSProjectsRecord,
  _lang: 'ja' | 'en',
): Metadata {
  // aboutからHTMLタグを除去し、空白を正規化して説明文を生成する
  // aboutが無ければtitleをフォールバックとして使用する
  const rawDescription = project.about
    ? project.about
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim()
    : ''
  const baseDescription = rawDescription.length > 0 ? rawDescription : project.title
  const description =
    baseDescription.length > PROJECT_DESCRIPTION_MAX_LENGTH
      ? baseDescription.slice(0, PROJECT_DESCRIPTION_MAX_LENGTH)
      : baseDescription

  return {
    title: project.title,
    description,
    openGraph: {
      title: project.title,
      description,
      type: 'website',
      ...(project.image
        ? {
            images: [
              {
                url: project.image.url,
                width: project.image.width,
                height: project.image.height,
                alt: project.title,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description,
      ...(project.image ? { images: [project.image.url] } : {}),
    },
  }
}
