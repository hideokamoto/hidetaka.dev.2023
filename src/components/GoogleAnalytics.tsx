import Script from 'next/script'
import { logger } from '@/libs/logger'

type GoogleAnalyticsProps = {
  gaId: string
}

export default function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  // Validate gaId format to prevent XSS attacks
  if (!gaId || !/^G-[A-Z0-9]{10}$/.test(gaId)) {
    if (process.env.NODE_ENV === 'development' && gaId) {
      logger.error('Invalid Google Analytics ID format', { gaId })
    }
    return null
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Required for Google Analytics script injection
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}');
          `,
        }}
      />
    </>
  )
}
