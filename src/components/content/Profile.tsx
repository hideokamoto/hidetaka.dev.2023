interface ProfileProps {
  lang: 'ja' | 'en'
}

export default function Profile({ lang }: ProfileProps) {
  const isJapanese = lang === 'ja'

  return (
    <section>
      <p>
        {isJapanese ? (
          <>
            Developer Experience
            Engineer。AWSやCloudflare上へのサーバーレスなアプリ開発を得意とする開発者。元Stripe
            Developer Advocate / AWS Samurai
            2017など、サービスの使い方や活用Tipsを紹介するコンテンツ作成や登壇などを得意とする。
          </>
        ) : (
          <>
            Developer Experience Engineer. A developer specialized in serverless application
            development on AWS and Cloudflare. Former Stripe Developer Advocate / AWS Samurai 2017.
            Skilled in creating content and presentations that introduce service usage and best
            practices. You can follow me on Twitter at{' '}
            <a
              className="underline text-indigo-600 dark:text-sky-300"
              href="https://x.com/hidetaka_dev"
              aria-label="Hidetaka Okamoto on X (formerly Twitter)"
            >
              @hidetaka_dev
            </a>
          </>
        )}
      </p>
    </section>
  )
}
