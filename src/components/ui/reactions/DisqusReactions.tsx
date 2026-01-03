'use client'

import Script from 'next/script'

type DisqusReactionsProps = {
  url: string
  identifier: string
  title: string
  shortname?: string
  className?: string
}

declare global {
  interface Window {
    disqus_config?: () => void
    DISQUS?: {
      reset: (options: { reload: boolean }) => void
    }
  }
}

/**
 * Disqus Reactions コンポーネント
 *
 * 記事に対して絵文字リアクション（👍❤️😂など）を付けられる機能を提供します。
 * Disqusのコメントシステムに付属するReactions機能を使用します。
 * Next.jsの<Script>コンポーネントを使用して最適化された読み込みを実現します。
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
  const handleScriptLoad = () => {
    // Disqus設定をwindowオブジェクトに追加
    if (typeof window !== 'undefined') {
      window.disqus_config = function () {
        // @ts-expect-error - Disqus API
        this.page.url = url
        // @ts-expect-error - Disqus API
        this.page.identifier = identifier
        // @ts-expect-error - Disqus API
        this.page.title = title
      }

      // 既にロードされている場合はリセット
      if (window.DISQUS) {
        window.DISQUS.reset({
          reload: true,
        })
      }
    }
  }

  return (
    <div className={className}>
      <Script
        src={`https://${shortname}.disqus.com/embed.js`}
        strategy="lazyOnload"
        onLoad={handleScriptLoad}
        data-timestamp={String(+new Date())}
      />
      <div id="disqus_thread">
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
