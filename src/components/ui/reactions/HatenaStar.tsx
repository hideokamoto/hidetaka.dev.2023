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
      Star: {
        SiteConfig?: Record<string, unknown>
        EntryLoader?: {
          loadEntries(): void
        }
      }
    }
  }
}

/**
 * はてなスター (Hatena Star) コンポーネント
 *
 * 記事に対してはてなスターを付けられる機能を提供します。
 * Next.js の Script コンポーネントを使用してスクリプトを読み込みます。
 *
 * @see https://developer.hatena.ne.jp/ja/documents/star/embed
 */
export default function HatenaStar({ url, title, className = '' }: HatenaStarProps) {
  const handleScriptLoad = () => {
    // スクリプト読み込み後にはてなスターを初期化
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
      if (
        window.Hatena.Star.EntryLoader &&
        typeof window.Hatena.Star.EntryLoader.loadEntries === 'function'
      ) {
        window.Hatena.Star.EntryLoader.loadEntries()
      }
    }
  }

  return (
    <>
      {/* はてなスタースクリプトを Next.js の Script コンポーネントで読み込む */}
      <Script
        src="https://s.hatena.ne.jp/js/HatenaStar.js"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
      />

      <div className={className}>
        <div className="hatena-star-container">
          <span className="hatena-star-uri hidden">{url}</span>
          <span className="hatena-star-title hidden">{title}</span>
          <span className="hatena-star-star" />
        </div>
      </div>
    </>
  )
}
