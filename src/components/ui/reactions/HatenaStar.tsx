'use client'

import { useEffect, useRef } from 'react'

type HatenaStarProps = {
  url: string
  title: string
  className?: string
}

/**
 * はてなスター (Hatena Star) コンポーネント
 *
 * 記事に対してはてなスターを付けられる機能を提供します。
 *
 * @see https://developer.hatena.ne.jp/ja/documents/star/embed
 */
export default function HatenaStar({ url, title, className = '' }: HatenaStarProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scriptLoadedRef = useRef(false)

  useEffect(() => {
    // スクリプトが既に読み込まれている場合はスキップ
    if (scriptLoadedRef.current) {
      return
    }

    // はてなスタースクリプトを動的に読み込む
    const script = document.createElement('script')
    script.src = 'https://s.hatena.ne.jp/js/HatenaStar.js'
    script.async = true
    script.type = 'text/javascript'

    script.onload = () => {
      scriptLoadedRef.current = true

      // スクリプト読み込み後にHatena.Star.SiteConfigを設定
      if (typeof window !== 'undefined' && (window as any).Hatena?.Star) {
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
    }

    document.head.appendChild(script)

    return () => {
      // クリーンアップ: スクリプトを削除
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  return (
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
  )
}
