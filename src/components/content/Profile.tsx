export default function Profile({ lang }: { lang: string }) {
  if (lang.startsWith('ja')) {
    return (
      <>
        DigitalCubeのBizDev。EC ASPの開発やStripeのDeveloper
        Advocateとしての経験を元に、SaaSやECサイトの収益を増やすための方法・生成AIを使った効率化や新しい事業モデルの模索などに挑戦する。
      </>
    )
  }
  return (
    <>
      I&apos;m a Business Development professional at DigitalCube. Based on my experience in EC ASP
      development and as a Developer Advocate at Stripe, I&apos;m working on methods to increase
      revenue for SaaS and EC sites, exploring efficiency improvements using generative AI, and
      developing new business models. You can follow me on Twitter at{' '}
      <a
        className="text-underline text-indigo-600 dark:text-sky-300"
        href="https://twitter.com/hidetaka_dev"
      >
        @hidetaka__dev
      </a>
    </>
  )
}
