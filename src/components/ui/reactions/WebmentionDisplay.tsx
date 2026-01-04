'use client'

import { useEffect, useState } from 'react'

type Webmention = {
  type: 'entry'
  author: {
    type: 'card'
    name: string
    photo?: string
    url?: string
  }
  url: string
  published?: string
  'wm-received': string
  'wm-id': number
  'wm-source': string
  'wm-target': string
  'wm-property': 'in-reply-to' | 'like-of' | 'repost-of' | 'bookmark-of' | 'mention-of' | 'rsvp'
  content?: {
    text?: string
    html?: string
  }
}

type WebmentionDisplayProps = {
  url: string
  domain?: string
  className?: string
}

/**
 * Webmention 表示コンポーネント
 *
 * 他のウェブサイトからの言及（メンション）を表示します。
 * webmention.io APIを使用して、記事へのリンクや反応を取得します。
 *
 * @see https://webmention.io/
 * @see https://indieweb.org/Webmention
 *
 * 注意: 実際に使用する場合は、webmention.ioでドメインを登録する必要があります。
 * このPoCでは、デモ用のプレースホルダーを使用しています。
 */
export default function WebmentionDisplay({
  url,
  domain = 'hidetaka.dev',
  className = '',
}: WebmentionDisplayProps) {
  const [mentions, setMentions] = useState<Webmention[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWebmentions = async () => {
      try {
        setLoading(true)
        setError(null)

        // webmention.io APIを呼び出す
        // 注意: 実際にはドメイン認証が必要です
        const apiUrl = `https://webmention.io/api/mentions.jf2?target=${encodeURIComponent(url)}`

        const response = await fetch(apiUrl)

        if (!response.ok) {
          throw new Error(`Failed to fetch webmentions: ${response.statusText}`)
        }

        const data = await response.json()
        setMentions(data.children || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchWebmentions()
  }, [url])

  const getMentionTypeLabel = (type: Webmention['wm-property']) => {
    switch (type) {
      case 'in-reply-to':
        return '💬 返信'
      case 'like-of':
        return '❤️ いいね'
      case 'repost-of':
        return '🔄 リポスト'
      case 'bookmark-of':
        return '🔖 ブックマーク'
      case 'mention-of':
        return '🔗 言及'
      default:
        return '📝 反応'
    }
  }

  if (loading) {
    return (
      <div className={`webmention-display ${className}`}>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Webmentions</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">読み込み中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`webmention-display ${className}`}>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Webmentions</h3>
        <div className="text-xs text-slate-500 dark:text-slate-400 italic">
          ℹ️ PoC: webmention.ioのドメイン認証が必要です。
          <br />
          本番環境では、webmention.ioでドメインを登録し、以下のタグをHTMLのheadに追加してください：
          <pre className="mt-2 p-2 bg-slate-100 dark:bg-slate-800 rounded text-xs overflow-x-auto">
            {`<link rel="webmention" href="https://webmention.io/${domain}/webmention" />`}
          </pre>
        </div>
      </div>
    )
  }

  if (mentions.length === 0) {
    return (
      <div className={`webmention-display ${className}`}>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Webmentions</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          まだ言及がありません。この記事をシェアしてみましょう！
        </p>
        <div className="text-xs text-slate-500 dark:text-slate-400 italic mt-2">
          ℹ️ PoC: webmention.ioのドメイン認証が必要です。
        </div>
      </div>
    )
  }

  return (
    <div className={`webmention-display ${className}`}>
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
        Webmentions ({mentions.length})
      </h3>

      <ul className="space-y-4">
        {mentions.map((mention) => (
          <li
            key={mention['wm-id']}
            className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50"
          >
            <div className="flex items-start gap-3">
              {mention.author.photo && (
                <img
                  src={mention.author.photo}
                  alt={mention.author.name}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {mention.author.name}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {getMentionTypeLabel(mention['wm-property'])}
                  </span>
                </div>
                {mention.content?.text && (
                  <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3">
                    {mention.content.text}
                  </p>
                )}
                <a
                  href={mention.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-1 inline-block"
                >
                  元の投稿を見る →
                </a>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
