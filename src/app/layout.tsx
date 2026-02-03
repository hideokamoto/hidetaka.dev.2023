import type { Metadata } from 'next'
import { SITE_DESCRIPTION, SITE_TITLE } from '@/consts'
import './globals.css'
import { ClarityAnalytics } from '@/components/ClarityAnalytics'
import { DarkModeScript } from '@/components/DarkModeScript'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import SentryProvider from '@/components/providers/SentryProvider'
import Footer from '@/components/tailwindui/Footer'
import Header from '@/components/tailwindui/Header'

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  metadataBase: new URL('https://hidetaka.dev'),
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: 'https://hidetaka.dev',
    siteName: 'Hidetaka.dev',
    images: [
      {
        url: '/images/profile.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="alternate" type="application/rss+xml" title="RSS" href="/projects/rss.xml" />
      </head>
      <body className="flex h-full flex-col bg-zinc-50 dark:bg-black">
        <SentryProvider>
          <GoogleAnalytics gaId="G-RV8PYHHYHN" />
          <DarkModeScript />
          <ClarityAnalytics />
          <div className="fixed inset-0 flex justify-center sm:px-8">
            <div className="flex w-full max-w-7xl lg:px-4">
              <div className="w-full bg-white ring-1 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-300/20" />
            </div>
          </div>
          <div className="relative">
            <Header />
            <main>{children}</main>
            <Footer />
          </div>
        </SentryProvider>
      </body>
    </html>
  )
}
