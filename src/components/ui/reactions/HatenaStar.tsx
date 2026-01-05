'use client'

import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'

type HatenaStarProps = {
  url: string
  title: string
  className?: string
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
  const containerRef = useRef<HTMLDivElement>(null)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)

  useEffect(() => {
    // スクリプトが読み込まれた後に設定を初期化
    if (isScriptLoaded && typeof window !== 'undefined' && (window as any).Hatena?.Star) {
      ;(window as any).Hatena.Star.SiteConfig = {
        entryNodes: {
          'div.hatena-star-container': {
            uri: 'span.hatena-star-uri',
            title: 'span.hatena-star-title',
            container: 'span.hatena-star-star',
          },
        },
      }

      // スターを初期化
      if ((window as any).Hatena.Star.EntryLoader) {
        ;(window as any).Hatena.Star.EntryLoader.loadEntries()
      }
    }
  }, [isScriptLoaded])

  return (
    <>
      {/* はてなスタースクリプトを Next.js の Script コンポーネントで読み込む */}
      <Script
        src="https://s.hatena.ne.jp/js/HatenaStar.js"
        strategy="lazyOnload"
        onLoad={() => setIsScriptLoaded(true)}
      />

      <div className={`hatena-star-wrapper ${className}`}>
        <div className="hatena-star-container" ref={containerRef}>
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
