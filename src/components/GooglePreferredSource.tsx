import Script from 'next/script'

type GooglePreferredSourceProps = {
  lang: string
}

export default function GooglePreferredSource({ lang }: GooglePreferredSourceProps) {
  return (
    <>
      <Script
        async
        src="https://news.google.com/swg/js/v1/publisher.js"
        strategy="afterInteractive"
      />
      <div google-add-preferred-source-btn="" data-lang={lang} />
    </>
  )
}
