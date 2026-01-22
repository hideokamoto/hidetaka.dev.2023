import type { Metadata } from 'next'
import DevNotesArchivePage from '@/components/containers/pages/DevNotesArchivePage'
import JsonLd from '@/components/JsonLd'
import { loadDevNotes } from '@/libs/dataSources/devnotes'
import { generateBlogListJsonLd } from '@/libs/jsonLd'

const title = '開発メモ | Hidetaka.dev';
const description = '日々の開発で気づいたことや学んだことを記録しています。';

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: 'website',
    url: 'https://hidetaka.dev/ja/writing/dev-notes',
    siteName: 'Hidetaka.dev',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
}

// ISR: 30分ごとにページを再検証（WordPressから毎日1〜2記事更新）
export const revalidate = 1800

export default async function DevNotesArchive() {
  const result = await loadDevNotes(1, 100)

  const jsonLd = generateBlogListJsonLd(
    result.items,
    'ja',
    '/ja/writing/dev-notes',
    result.currentPage,
    result.totalPages,
  )

  return (
    <>
      <JsonLd data={jsonLd} />
      <DevNotesArchivePage lang="ja" items={result.items} />
    </>
  )
}
