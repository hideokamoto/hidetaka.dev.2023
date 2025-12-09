import type { Metadata } from 'next'
import Link from 'next/link'
import Container from '@/components/tailwindui/Container'

export const metadata: Metadata = {
  title: 'プライバシーポリシー | Hidetaka.dev',
  description: 'Hidetaka.dev のプライバシーポリシー - データ収集と使用に関する情報',
}

export default function PrivacyPolicyPage() {
  return (
    <Container className="mt-16 sm:mt-32">
      <article className="max-w-3xl mx-auto">
        {/* パンくずリスト */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center space-x-2">
            <li>
              <div className="flex items-center text-sm">
                <Link
                  href="/ja"
                  className="font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
                >
                  ホーム
                </Link>
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                  className="ml-2 size-5 shrink-0 text-slate-300 dark:text-slate-600"
                >
                  <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                </svg>
              </div>
            </li>
            <li>
              <div className="flex items-center text-sm">
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  プライバシーポリシー
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* タイトル */}
        <header className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
            プライバシーポリシー
          </h1>
          <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400">
            最終更新日: 2025年12月2日
          </p>
        </header>

        {/* コンテンツ */}
        <div className="prose prose-zinc dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              1. はじめに
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
              本プライバシーポリシーは、Hidetaka.dev（以下「当サイト」）が、
              <a
                href="https://hidetaka.dev"
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                https://hidetaka.dev
              </a>
              へのアクセス時に、どのように情報を収集、使用、共有するかについて説明します。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              2. 収集する情報
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
              当サイトでは、以下のサードパーティサービスを通じて、訪問者の情報を収集しています：
            </p>

            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3 mt-6">
              2.1 Google Analytics
            </h3>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
              当サイトでは、訪問者の利用状況を把握するためにGoogle Analyticsを使用しています。
              Google Analyticsは以下のような情報を収集します：
            </p>
            <ul className="list-disc list-inside text-zinc-700 dark:text-zinc-300 mb-4 space-y-2">
              <li>訪問したページと各ページでの滞在時間</li>
              <li>ブラウザの種類とバージョン</li>
              <li>デバイスの種類（デスクトップ、モバイル、タブレット）</li>
              <li>地理的な位置情報（国、都市）</li>
              <li>リファラー（参照元のウェブサイト）</li>
            </ul>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
              Googleによるデータの使用方法については、
              <a
                href="https://policies.google.com/privacy?hl=ja"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Googleのプライバシーポリシー
              </a>
              をご覧ください。
            </p>

            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3 mt-6">
              2.2 Microsoft Clarity
            </h3>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
              当サイトでは、ユーザー行動の理解とユーザーエクスペリエンスの向上のために Microsoft
              Clarityを使用しています。Clarityは以下の情報を収集します：
            </p>
            <ul className="list-disc list-inside text-zinc-700 dark:text-zinc-300 mb-4 space-y-2">
              <li>ユーザーの操作（クリック、スクロール、マウスの動き）</li>
              <li>セッションの記録</li>
              <li>ユーザー行動のヒートマップ</li>
            </ul>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
              詳細については、
              <a
                href="https://privacy.microsoft.com/ja-jp/privacystatement"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Microsoftのプライバシーに関する声明
              </a>
              をご覧ください。
            </p>

            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3 mt-6">
              2.3 Google AdSense
            </h3>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
              当サイトでは、広告を配信するためにGoogle AdSenseを使用しています。
              GoogleおよびGoogleのパートナーは、Cookieを使用して、当サイトへの過去のアクセス情報や
              他のウェブサイトへのアクセス情報に基づいて広告を配信します。
            </p>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
              パーソナライズド広告を無効にするには、
              <a
                href="https://www.google.com/settings/ads?hl=ja"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Google広告設定
              </a>
              または
              <a
                href="http://www.aboutads.info/choices/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                www.aboutads.info
              </a>
              にアクセスしてください。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              3. Cookieとトラッキング技術
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
              当サイトでは、CookieおよびCookieに類似するトラッキング技術を使用して、
              訪問者の閲覧活動に関する情報を収集・追跡しています。
              Cookieは、デバイスに保存される小さなテキストファイルです。
            </p>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
              使用しているCookieの種類：
            </p>
            <ul className="list-disc list-inside text-zinc-700 dark:text-zinc-300 mb-4 space-y-2">
              <li>
                <strong>分析Cookie:</strong> 訪問者のサイトでの行動を理解するために使用
              </li>
              <li>
                <strong>広告Cookie:</strong> 関連性の高い広告を配信するために使用
              </li>
              <li>
                <strong>機能Cookie:</strong> テーマの設定など、特定の機能を有効にするために使用
              </li>
            </ul>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
              ブラウザの設定を通じてCookieを制御できます。ただし、Cookieを無効にすると、
              当サイトの機能に影響を与える可能性があります。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              4. 情報の使用目的
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
              収集した情報は、以下の目的で使用します：
            </p>
            <ul className="list-disc list-inside text-zinc-700 dark:text-zinc-300 mb-4 space-y-2">
              <li>当サイトのコンテンツとユーザーエクスペリエンスの分析と改善</li>
              <li>訪問者の行動と嗜好の理解</li>
              <li>関連性の高い広告の表示</li>
              <li>当サイトのセキュリティの維持と改善</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              5. サードパーティサービス
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
              当サイトは、以下のサードパーティサービスと連携しています：
            </p>
            <ul className="list-disc list-inside text-zinc-700 dark:text-zinc-300 mb-4 space-y-2">
              <li>
                <strong>Google Analytics:</strong> ウェブ解析サービス
              </li>
              <li>
                <strong>Microsoft Clarity:</strong> ユーザー行動分析
              </li>
              <li>
                <strong>Google AdSense:</strong> 広告配信サービス
              </li>
            </ul>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
              これらのサードパーティサービスは、独自のプライバシーポリシーを持っています。
              各サービスのプライバシーポリシーをご確認ください。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              6. データのセキュリティ
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
              当サイトでは、収集した情報を保護するために、合理的なセキュリティ対策を実施しています。
              ただし、インターネット上でのデータ送信や電子ストレージの方法に、
              100%安全なものはありません。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              7. 子どものプライバシー
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
              当サイトは、13歳未満の子どもを対象としていません。
              13歳未満の子どもから意図的に個人情報を収集することはありません。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              8. プライバシーポリシーの変更
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
              当サイトでは、随時プライバシーポリシーを更新する場合があります。
              変更があった場合は、このページの上部にある「最終更新日」を更新します。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              9. お問い合わせ
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">
              本プライバシーポリシーに関するご質問がございましたら、以下の方法でお問い合わせください：
            </p>
            <ul className="list-none text-zinc-700 dark:text-zinc-300 mb-4 space-y-2">
              <li>
                <strong>Twitter:</strong>{' '}
                <a
                  href="https://twitter.com/hidetaka_dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  @hidetaka_dev
                </a>
              </li>
              <li>
                <strong>GitHub:</strong>{' '}
                <a
                  href="https://github.com/hideokamoto"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  @hideokamoto
                </a>
              </li>
            </ul>
          </section>
        </div>
      </article>
    </Container>
  )
}
