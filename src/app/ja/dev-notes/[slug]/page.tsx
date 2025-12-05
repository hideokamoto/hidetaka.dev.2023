import { notFound } from 'next/navigation'
import BlogDetailPageContent from '@/components/containers/pages/BlogDetailPage'
import JsonLd from '@/components/JsonLd'
import {
  getAdjacentDevNotes,
  getDevNoteBySlug,
  getRelatedDevNotes,
} from '@/libs/dataSources/devNotes'
import type { WPThought } from '@/libs/dataSources/types'
import { generateBlogBreadcrumbJsonLd, generateBlogPostingJsonLd } from '@/libs/jsonLd'
import { generateBlogPostMetadata } from '@/libs/metadata'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const devNote = await getDevNoteBySlug(slug, 'ja')

  if (!devNote) {
    return {
      title: '開発ノート',
    }
  }

  // WPDevNote を WPThought として扱う（構造は同じ）
  return generateBlogPostMetadata(devNote as WPThought)
}

export default async function DevNoteDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const devNote = await getDevNoteBySlug(slug, 'ja')

  if (!devNote) {
    notFound()
  }

  // JSON-LDを生成
  const blogPostingJsonLd = generateBlogPostingJsonLd(devNote as WPThought, 'ja', '/ja/dev-notes')
  const breadcrumbJsonLd = generateBlogBreadcrumbJsonLd(devNote as WPThought, 'ja', '/ja/dev-notes')

  // 前後の記事と関連記事を取得
  const [adjacentDevNotes, relatedArticles] = await Promise.all([
    getAdjacentDevNotes(devNote, 'ja'),
    getRelatedDevNotes(devNote, 4, 'ja'),
  ])

  return (
    <>
      <JsonLd data={blogPostingJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <BlogDetailPageContent
        thought={devNote as WPThought}
        lang="ja"
        basePath="/ja/dev-notes"
        previousThought={adjacentDevNotes.previous as WPThought | null}
        nextThought={adjacentDevNotes.next as WPThought | null}
        relatedArticles={relatedArticles}
        thumbnailApiPath="dev-notes"
      />
    </>
  )
}
