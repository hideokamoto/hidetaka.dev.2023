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
import { shouldEnableHatenaStar } from '@/libs/utils/hatenaStar'

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

  const basePath = '/writing/dev-notes'
  const lang = 'en'

  // はてなスター機能の有効化判定
  const enableHatenaStar = shouldEnableHatenaStar(lang)

  // JSON-LDを生成
  const blogPostingJsonLd = generateDevNoteJsonLd(note, basePath)
  const breadcrumbJsonLd = generateDevNoteBreadcrumbJsonLd(note, basePath)

  // 前後の記事と関連記事を取得
  const [adjacentNotes, relatedArticles] = await Promise.all([
    getAdjacentDevNotes(note),
    getRelatedDevNotes(note, 4, 'en'),
  ])

  return (
    <>
      <JsonLd data={blogPostingJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <DevNoteDetailPageContent
        note={note}
        basePath={basePath}
        lang={lang}
        previousNote={adjacentNotes.previous}
        nextNote={adjacentNotes.next}
        relatedArticles={relatedArticles}
        enableHatenaStar={enableHatenaStar}
      />
    </>
  )
}
