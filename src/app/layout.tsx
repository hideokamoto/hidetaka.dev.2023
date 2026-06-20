import type { Metadata } from 'next'
import { SITE_DESCRIPTION, SITE_TITLE } from '@/consts'
import './globals.css'
import { ClarityAnalytics } from '@/components/ClarityAnalytics'
import { DarkModeScript } from '@/components/DarkModeScript'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import JsonLd from '@/components/JsonLd'
import SentryProvider from '@/components/providers/SentryProvider'
import Footer from '@/components/tailwindui/Footer'
import Header from '@/components/tailwindui/Header'
import { generatePersonJsonLd } from '@/libs/jsonLd'

export const metadata: Metadata = {
  title: {
    default: SITE_TITLE,
    template: '%s | Hidetaka Okamoto',
  },
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
        <JsonLd data={generatePersonJsonLd()} />
      </head>
      <body
        className="flex h-full flex-col"
        style={{ background: 'var(--rvt-bg)', color: 'var(--rvt-fg)' }}
      >
        <SentryProvider>
          <GoogleAnalytics gaId="G-RV8PYHHYHN" />
          <DarkModeScript />
          <ClarityAnalytics />
          <div className="fixed inset-0 flex justify-center sm:px-8">
            <div className="flex w-full max-w-7xl lg:px-4">
              <div
                className="w-full"
                style={{ background: 'var(--rvt-bg)', outline: '1px solid var(--rvt-border)' }}
              />
            </div>
          </div>
          <div className="relative">
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-[var(--rvt-bg)] focus:px-4 focus:py-2 focus:text-[var(--rvt-accent)] focus:shadow-lg"
            >
              Skip to content
            </a>
            <Header />
            <main id="main-content" tabIndex={-1} className="focus:outline-none">
              {children}
            </main>
            <Footer />
          </div>
        </SentryProvider>
      </body>
    </html>
  )
}
