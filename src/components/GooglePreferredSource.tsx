import Script from 'next/script'

export default function GooglePreferredSource() {
  return (
    <>
      <Script
        async
        src="https://news.google.com/swg/js/v1/publisher.js"
        strategy="afterInteractive"
      />
      <div google-add-preferred-source-btn="" />
    </>
  )
}
