'use client'

import { useEffect, useRef } from 'react'

type DisqusReactionsProps = {
  url: string
  identifier: string
  title: string
  shortname?: string
  className?: string
}

/**
 * Disqus Reactions コンポーネント
 *
 * 記事に対して絵文字リアクション（👍❤️😂など）を付けられる機能を提供します。
 * Disqusのコメントシステムに付属するReactions機能を使用します。
 *
 * @see https://disqus.com/
 *
 * 注意: 実際に使用する場合は、Disqusアカウントを作成し、shortnameを取得する必要があります。
 * このPoCでは、デモ用のプレースホルダーを使用しています。
 */
export default function DisqusReactions({
  url,
  identifier,
  title,
  shortname = 'hidetaka-dev-poc', // PoC用のプレースホルダー
  className = '',
}: DisqusReactionsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scriptLoadedRef = useRef(false)

  useEffect(() => {
    // スクリプトが既に読み込まれている場合はスキップ
    if (scriptLoadedRef.current) {
      return
    }

    // Disqus設定をwindowオブジェクトに追加
    if (typeof window !== 'undefined') {
      ;(window as any).disqus_config = function () {
        this.page.url = url
        this.page.identifier = identifier
        this.page.title = title
      }
    }

    // Disqusスクリプトを動的に読み込む
    const script = document.createElement('script')
    script.src = `https://${shortname}.disqus.com/embed.js`
    script.async = true
    script.setAttribute('data-timestamp', String(+new Date()))

    script.onload = () => {
      scriptLoadedRef.current = true
    }

    // スクリプトを読み込む前にコンテナが存在することを確認
    if (containerRef.current) {
      document.head.appendChild(script)
    }

    return () => {
      // クリーンアップ: スクリプトを削除
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [url, identifier, title, shortname])

  return (
    <div className={className}>
      <div id="disqus_thread" ref={containerRef}>
        {/* Disqusが読み込まれない場合のフォールバック */}
        <noscript>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Please enable JavaScript to view reactions powered by Disqus.
          </p>
        </noscript>
        {/* PoC用の注意書き */}
        <div className="text-xs text-slate-500 dark:text-slate-400 italic mt-2">
          ℹ️ PoC: Disqus shortnameが設定されていないため、実際のリアクションは表示されません。
          本番環境では、Disqusアカウントを作成し、正しいshortnameを設定してください。
        </div>
      </div>
    </div>
  )
}
