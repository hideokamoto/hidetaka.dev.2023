import type { Metadata } from 'next'
import { SITE_DESCRIPTION_JA, SITE_TITLE_JA } from '@/consts'

export const metadata: Metadata = {
  title: SITE_TITLE_JA,
  description: SITE_DESCRIPTION_JA,
  metadataBase: new URL('https://hidetaka.dev'),
  openGraph: {
    title: SITE_TITLE_JA,
    description: SITE_DESCRIPTION_JA,
    url: 'https://hidetaka.dev/ja',
    siteName: 'Hidetaka.dev',
    images: [
      {
        url: '/images/profile.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE_JA,
    description: SITE_DESCRIPTION_JA,
    images: ['/images/profile.jpg'],
  },
  icons: {
    icon: [
      { url: '/favicons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/favicons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/favicons/site.webmanifest',
}

export default function JapaneseLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
