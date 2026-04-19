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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@400;500;700;900&family=Shippori+Mincho:wght@500;600;700;800&family=JetBrains+Mono:wght@400;500&family=Inter+Tight:wght@400;500;600;700&display=swap"
        />
        <JsonLd data={generatePersonJsonLd()} />
      </head>
      <body className="flex h-full flex-col">
        <JsonLd data={generatePersonJsonLd()} />
        <SentryProvider>
          <GoogleAnalytics gaId="G-RV8PYHHYHN" />
          <DarkModeScript />
          <ClarityAnalytics />
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
