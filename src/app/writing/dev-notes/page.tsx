import type { Metadata } from 'next'
import DevNotesArchivePage from '@/components/containers/pages/DevNotesArchivePage'
import JsonLd from '@/components/JsonLd'
import { loadDevNotes } from '@/libs/dataSources/devnotes'
import { generateBlogListJsonLd } from '@/libs/jsonLd'

export const metadata: Metadata = {
  title: 'Development Notes | Hidetaka.dev',
  description: 'A collection of notes and learnings from daily development work.',
  openGraph: {
    title: 'Development Notes | Hidetaka.dev',
    description: 'A collection of notes and learnings from daily development work.',
    type: 'website',
    url: 'https://hidetaka.dev/writing/dev-notes',
    siteName: 'Hidetaka.dev',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Development Notes | Hidetaka.dev',
    description: 'A collection of notes and learnings from daily development work.',
  },
}

// ISR: 30分ごとにページを再検証（WordPressから毎日1〜2記事更新）
export const revalidate = 1800

export default async function DevNotesArchive() {
  const result = await loadDevNotes(1, 100)

  const jsonLd = generateBlogListJsonLd(
    result.items,
    'en',
    '/writing/dev-notes',
    result.currentPage,
    result.totalPages,
  )

  return (
    <>
      <JsonLd data={jsonLd} />
      <DevNotesArchivePage lang="en" items={result.items} />
    </>
  )
}
