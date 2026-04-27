import Link from 'next/link'

type Talk = {
  label: string
  labelType: string
  title: string
  event: string
  date: string
}

export default function SpeakingSection({ lang }: { lang: string }) {
  const isJa = lang.startsWith('ja')

  const talks: Talk[] = [
    {
      label: 'KEYNOTE',
      labelType: 'KEYNOTE',
      title: isJa
        ? 'Stripe Billing で月額から従量へ — AI 時代の課金設計'
        : 'From subscription to usage-based — billing design for the AI era',
      event: 'Stripe Tour Tokyo 2026',
      date: '2026.05.23',
    },
    {
      label: isJa ? 'SESSION · 40min' : 'SESSION · 40min',
      labelType: 'SESSION',
      title: isJa
        ? 'サーバーレスで LINE Bot を最小コストで運用する'
        : 'Running LINE bots serverless at minimal cost',
      event: 'JAWS DAYS 2026',
      date: '2026.03.11',
    },
    {
      label: 'WORKSHOP',
      labelType: 'WORKSHOP',
      title: isJa
        ? 'Headless WordPress で編集と開発を分離する勘所'
        : 'Decoupling editing from dev with Headless WordPress',
      event: 'WordCamp Asia 2025',
      date: '2025.11.28',
    },
  ]

  return (
    <section className="mt-30 mx-auto max-w-[1440px] px-16 pt-14 border-t-2 border-stone-900/20 dark:border-stone-100/20">
      <div className="flex justify-between items-baseline mb-8">
        <h2 className="font-sans font-black text-[48px] tracking-[-0.02em] leading-none text-stone-950 dark:text-stone-50">
          {isJa ? '登壇' : 'Speaking'}
          <small className="block font-mono text-[12px] tracking-[0.22em] uppercase text-stone-500 font-normal mt-2.5">
            §03 / 2025–2026 HIGHLIGHTS
          </small>
        </h2>
        <Link
          href={isJa ? '/ja/speaking' : '/speaking'}
          className="font-mono text-[11px] tracking-[0.14em] uppercase text-stone-400 hover:text-vermilion transition-colors"
        >
          {isJa ? '全登壇 →' : 'All talks →'}
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-stone-900/20 dark:bg-stone-100/20 border border-stone-900/20 dark:border-stone-100/20">
        {talks.map((talk) => (
          <div key={talk.title} className="bg-[#f4f2ee] dark:bg-[#0d0c0b] p-6">
            <span className="inline-block bg-vermilion text-white font-mono text-[10px] px-1.5 py-0.5 tracking-[0.14em] uppercase mb-3">
              {talk.label}
            </span>
            <h3 className="font-sans font-bold text-[18px] leading-[1.35] text-stone-950 dark:text-stone-50 mb-3">
              {talk.title}
            </h3>
            <p className="font-mono text-[11px] tracking-[0.1em] text-stone-500">
              {talk.event} · {talk.date}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
