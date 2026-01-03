'use client'

import { useState } from 'react'
import DisqusReactions from './DisqusReactions'
import HatenaStar from './HatenaStar'
import WebmentionDisplay from './WebmentionDisplay'

type BlogReactionsProps = {
  url: string
  title: string
  slug: string
  lang?: string
  className?: string
  enableHatenaStar?: boolean
  enableDisqus?: boolean
  enableWebmention?: boolean
}

type ReactionType = 'hatena' | 'disqus' | 'webmention' | 'all'

/**
 * ブログリアクション統合コンポーネント
 *
 * 以下の3つのリアクション機能を統合的に提供します：
 * 1. はてなスター (Hatena Star) - 日本語圏で人気の軽いリアクション
 * 2. Disqus Reactions - 絵文字ベースのリアクション
 * 3. Webmention - IndieWeb標準の分散型メンション
 *
 * タブで切り替えて表示するか、すべて同時に表示できます。
 */
export default function BlogReactions({
  url,
  title,
  slug,
  lang = 'ja',
  className = '',
  enableHatenaStar = true,
  enableDisqus = true,
  enableWebmention = true,
}: BlogReactionsProps) {
  const [activeTab, setActiveTab] = useState<ReactionType>('all')

  const tabLabel = {
    all: lang === 'ja' ? 'すべて' : 'All',
    hatena: lang === 'ja' ? 'はてなスター' : 'Hatena Star',
    disqus: lang === 'ja' ? 'リアクション' : 'Reactions',
    webmention: 'Webmention',
  }

  const showHatenaStar = enableHatenaStar && (activeTab === 'hatena' || activeTab === 'all')
  const showDisqus = enableDisqus && (activeTab === 'disqus' || activeTab === 'all')
  const showWebmention = enableWebmention && (activeTab === 'webmention' || activeTab === 'all')

  return (
    <div className={`blog-reactions ${className}`}>
      {/* セクションヘッダー */}
      <div className="border-b border-zinc-200 dark:border-zinc-700 mb-6">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
          {lang === 'ja' ? '💬 この記事への反応' : '💬 Reactions'}
        </h2>

        {/* タブナビゲーション */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {tabLabel.all}
          </button>

          {enableHatenaStar && (
            <button
              type="button"
              onClick={() => setActiveTab('hatena')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === 'hatena'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              ⭐ {tabLabel.hatena}
            </button>
          )}

          {enableDisqus && (
            <button
              type="button"
              onClick={() => setActiveTab('disqus')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === 'disqus'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              👍 {tabLabel.disqus}
            </button>
          )}

          {enableWebmention && (
            <button
              type="button"
              onClick={() => setActiveTab('webmention')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === 'webmention'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              🔗 {tabLabel.webmention}
            </button>
          )}
        </div>
      </div>

      {/* リアクションコンテンツ */}
      <div className="space-y-8">
        {/* はてなスター */}
        {showHatenaStar && (
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
              ⭐ {tabLabel.hatena}
            </h3>
            <HatenaStar url={url} title={title} />
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
              {lang === 'ja'
                ? 'はてなアカウントでスターを付けることができます'
                : 'You can add stars with your Hatena account'}
            </p>
          </div>
        )}

        {/* Disqus Reactions */}
        {showDisqus && (
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
              👍 {tabLabel.disqus}
            </h3>
            <DisqusReactions url={url} identifier={slug} title={title} />
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
              {lang === 'ja' ? '絵文字で記事に反応できます' : 'React to this article with emojis'}
            </p>
          </div>
        )}

        {/* Webmention */}
        {showWebmention && (
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <WebmentionDisplay url={url} />
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
              {lang === 'ja'
                ? '他のサイトからの言及がここに表示されます'
                : 'Mentions from other websites will appear here'}
            </p>
          </div>
        )}
      </div>

      {/* PoC情報 */}
      <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
          ℹ️ PoC (Proof of Concept)
        </h4>
        <p className="text-xs text-blue-800 dark:text-blue-200">
          {lang === 'ja'
            ? 'これは3つのリアクション機能（はてなスター、Disqus、Webmention）の実装サンプルです。本番環境で使用する場合は、各サービスのアカウント登録と設定が必要です。'
            : 'This is a sample implementation of three reaction features (Hatena Star, Disqus, Webmention). For production use, you need to register and configure each service.'}
        </p>
        <ul className="text-xs text-blue-800 dark:text-blue-200 mt-2 space-y-1 list-disc list-inside">
          <li>
            {lang === 'ja'
              ? 'はてなスター: 追加の設定は不要（はてなアカウント保有者のみ反応可能）'
              : 'Hatena Star: No additional setup required (only Hatena account holders can react)'}
          </li>
          <li>
            {lang === 'ja'
              ? 'Disqus: disqus.comでアカウントを作成し、shortnameを取得'
              : 'Disqus: Create an account at disqus.com and obtain a shortname'}
          </li>
          <li>
            {lang === 'ja'
              ? 'Webmention: webmention.ioでドメインを登録し、HTMLヘッダーにタグを追加'
              : 'Webmention: Register your domain at webmention.io and add tags to HTML header'}
          </li>
        </ul>
      </div>
    </div>
  )
}
