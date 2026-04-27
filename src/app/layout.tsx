import type { Metadata } from 'next'
import { Inter_Tight, JetBrains_Mono, Shippori_Mincho, Zen_Kaku_Gothic_New } from 'next/font/google'
import { SITE_DESCRIPTION, SITE_TITLE } from '@/consts'
import './globals.css'
import { ClarityAnalytics } from '@/components/ClarityAnalytics'
import { DarkModeScript } from '@/components/DarkModeScript'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import SentryProvider from '@/components/providers/SentryProvider'
import Footer from '@/components/tailwindui/Footer'
import Header from '@/components/tailwindui/Header'

const zenKaku = Zen_Kaku_Gothic_New({
  weight: ['400', '500', '700', '900'],
  subsets: ['latin'],
  variable: '--font-zen-kaku',
  display: 'swap',
})

const shipporiMincho = Shippori_Mincho({
  weight: ['500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-shippori',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

const interTight = Inter_Tight({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-inter-tight',
  display: 'swap',
})

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
    <html
      lang="en"
      className={`h-full ${zenKaku.variable} ${shipporiMincho.variable} ${jetbrainsMono.variable} ${interTight.variable}`}
    >
      <head>
        <link rel="alternate" type="application/rss+xml" title="RSS" href="/projects/rss.xml" />
      </head>
      <body className="flex h-full flex-col bg-[#f4f2ee] dark:bg-[#0d0c0b]">
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
