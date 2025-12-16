import { notFound } from 'next/navigation'
import DevNoteDetailPageContent from '@/components/containers/pages/DevNoteDetailPage'
import JsonLd from '@/components/JsonLd'
import {
  getAdjacentDevNotes,
  getDevNoteBySlug,
  getRelatedDevNotes,
} from '@/libs/dataSources/devnotes'
import { generateDevNoteBreadcrumbJsonLd, generateDevNoteJsonLd } from '@/libs/jsonLd'
import { generateDevNoteMetadata } from '@/libs/metadata'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const note = await getDevNoteBySlug(slug)

  if (!note) {
    return {
      title: 'Dev Notes',
    }
  }

  return generateDevNoteMetadata(note)
}

export default async function DevNoteDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const note = await getDevNoteBySlug(slug)

  if (!note) {
    notFound()
  }

  const basePath = '/ja/writing/dev-notes'

  // JSON-LDを生成
  const blogPostingJsonLd = generateDevNoteJsonLd(note, basePath)
  const breadcrumbJsonLd = generateDevNoteBreadcrumbJsonLd(note, basePath)

  // 前後の記事と関連記事を取得
  const [adjacentNotes, relatedArticles] = await Promise.all([
    getAdjacentDevNotes(note),
    getRelatedDevNotes(note, 6),
  ])

  return (
    <>
      <JsonLd data={blogPostingJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <DevNoteDetailPageContent
        note={note}
        basePath={basePath}
        previousNote={adjacentNotes.previous}
        nextNote={adjacentNotes.next}
        relatedArticles={relatedArticles}
      />
    </>
  )
}
