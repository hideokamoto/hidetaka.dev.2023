'use client'

import Script from 'next/script'

type HatenaStarProps = {
  url: string
  title: string
  className?: string
}

declare global {
  interface Window {
    Hatena?: {
      Star?: {
        SiteConfig?: {
          entryNodes: Record<string, { uri: string; title: string; container: string }>
        }
        EntryLoader?: {
          loadEntries: () => void
        }
      }
    }
  }
}

/**
 * はてなスター (Hatena Star) コンポーネント
 *
 * 記事に対してはてなスターを付けられる機能を提供します。
 * Next.jsの<Script>コンポーネントを使用して最適化された読み込みを実現します。
 *
 * @see https://developer.hatena.ne.jp/ja/documents/star/embed
 */
export default function HatenaStar({ url, title, className = '' }: HatenaStarProps) {
  const handleScriptLoad = () => {
    // スクリプト読み込み後にHatena.Star.SiteConfigを設定
    if (typeof window !== 'undefined' && window.Hatena?.Star) {
      window.Hatena.Star.SiteConfig = {
        entryNodes: {
          'div.hatena-star-container': {
            uri: 'span.hatena-star-uri',
            title: 'span.hatena-star-title',
            container: 'span.hatena-star-star',
          },
        },
      }

      // スターを初期化
      if (window.Hatena.Star.EntryLoader) {
        window.Hatena.Star.EntryLoader.loadEntries()
      }
    }
  }

  return (
    <>
      <Script
        src="https://s.hatena.ne.jp/js/HatenaStar.js"
        strategy="lazyOnload"
        onLoad={handleScriptLoad}
      />
      <div className={`hatena-star-wrapper ${className}`}>
        <div className="hatena-star-container">
          <span className="hatena-star-uri" style={{ display: 'none' }}>
            {url}
          </span>
          <span className="hatena-star-title" style={{ display: 'none' }}>
            {title}
          </span>
          <span className="hatena-star-star" />
        </div>
      </div>
    </>
  )
}
