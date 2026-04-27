export default function StackShowcase({ lang }: { lang: string }) {
  const isJa = lang.startsWith('ja')

  const sectionNo = '§02 / STACK'
  const sectionTitle = isJa ? '選ぶ道具' : 'Trusted stack'
  const sectionSub = 'TRUSTED PLATFORM STACK'
  const sectionDesc = isJa
    ? '実戦で枯れているものだけ。新しい API や機能はまず自分の手で動かし、本番に出すまでに失敗を終わらせます。'
    : 'Proven in production. New APIs are battle-tested personally before shipping to clients.'

  const items = [
    {
      no: '01 · Primary',
      name: 'Stripe',
      desc: 'Billing · Connect · Radar · Meter Events · V2 API',
    },
    { no: '02 · Infra', name: 'AWS', desc: 'Lambda · Step Functions · DynamoDB · CDK · S3' },
    { no: '03 · Edge', name: 'Cloudflare', desc: 'Workers · Pages · Zero Trust · R2 · D1' },
    { no: '04 · CMS', name: 'WordPress', desc: 'Enterprise · Headless · VIP · MicroCMS' },
    { no: '05 · Front', name: 'Next.js', desc: 'App Router · ISR · Edge · Vercel AI SDK' },
  ]

  return (
    <section className="mt-30 mx-auto max-w-[1440px] px-16">
      {/* Section header */}
      <header className="grid grid-cols-12 gap-6 pb-5 border-b-2 border-stone-900/20 dark:border-stone-100/20 mb-6 items-baseline">
        <div className="col-span-2 font-mono text-[11px] tracking-[0.2em] uppercase text-stone-500">
          {sectionNo}
        </div>
        <div className="col-span-6">
          <h2 className="font-sans font-black text-[48px] tracking-[-0.02em] leading-none text-stone-950 dark:text-stone-50">
            {sectionTitle}
            <small className="block font-mono text-[12px] tracking-[0.24em] uppercase text-stone-500 font-normal mt-2.5">
              {sectionSub}
            </small>
          </h2>
        </div>
        <p className="col-span-4 text-[13px] leading-[1.8] text-stone-500 dark:text-stone-400">
          {sectionDesc}
        </p>
      </header>

      {/* 5-col row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-stone-900/20 dark:bg-stone-100/20 border border-stone-900/20 dark:border-stone-100/20">
        {items.map((item) => (
          <div
            key={item.name}
            className="bg-[#f4f2ee] dark:bg-[#0d0c0b] p-5 flex flex-col justify-between min-h-[140px]"
          >
            <div>
              <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-stone-500 mb-2">
                {item.no}
              </div>
              <h3 className="font-sans font-bold text-[18px] text-stone-950 dark:text-stone-50">
                {item.name}
              </h3>
            </div>
            <p className="font-mono text-[10px] tracking-[0.08em] text-stone-500 leading-[1.7] mt-2">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
