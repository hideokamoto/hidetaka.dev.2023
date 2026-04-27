import Image from 'next/image'
import { SITE_CONFIG } from '@/config'

type StatusRow = { key: string; value: string; live?: boolean }

function StatusTable({ rows }: { rows: StatusRow[] }) {
  return (
    <div className="border border-stone-900/20 dark:border-stone-100/20">
      {rows.map((row) => (
        <div
          key={row.key}
          className="grid grid-cols-[110px_1fr_auto] items-center gap-4 px-3.5 py-3 border-b last:border-b-0 border-stone-900/10 dark:border-stone-100/10"
        >
          <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-stone-500 dark:text-stone-400">
            {row.key}
          </span>
          <span className="font-sans text-[13px] font-medium text-stone-900 dark:text-stone-100">
            {row.value}
          </span>
          {row.live && (
            <span className="w-1.5 h-1.5 rounded-full bg-vermilion shadow-[0_0_0_3px_rgba(255,91,41,0.22)]" />
          )}
        </div>
      ))}
    </div>
  )
}

export default function Hero({ lang }: { lang: string }) {
  const isJa = lang.startsWith('ja')

  const statusRows: StatusRow[] = [
    { key: 'Status', value: isJa ? '受付中 / Q2 2026' : 'Available / Q2 2026', live: true },
    { key: 'Role', value: 'Eng. Partner' },
    { key: 'Base', value: 'Kyoto · JP' },
    { key: 'Lang', value: 'JP / EN' },
  ]

  const metricsItems = [
    { label: 'Years of Experience', value: '12', unit: '+ years' },
    { label: 'Production Projects', value: '80', unit: '+ shipped' },
    { label: 'Talks & Workshops', value: '60', unit: '+ sessions' },
    { label: 'Open-source Pkgs', value: '14', unit: 'on npm' },
  ]

  return (
    <section className="border-b border-stone-900/20 dark:border-stone-100/20">
      <div className="mx-auto max-w-[1440px] px-16">
        {/* Top bar */}
        <div className="grid grid-cols-3 py-3 border-b border-stone-900/10 dark:border-stone-100/10">
          <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-stone-500">
            Hidetaka.dev / INDEX
          </span>
          <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-stone-500 text-center hidden sm:block">
            DEVELOPER EXPERIENCE ENGINEER · KYOTO, JP
          </span>
          <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-stone-500 text-right">
            REV. 2026 / JA · EN
          </span>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-8 pb-16">
          {/* Left: content */}
          <div className="lg:col-span-8">
            <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-stone-500 mb-4">
              &#9675; Hidetaka Okamoto / 岡本 秀高
            </div>
            <h1 className="font-sans font-black text-[clamp(64px,10.5vw,156px)] leading-[0.88] tracking-[-0.04em] text-stone-950 dark:text-stone-50">
              {isJa ? (
                <>
                  開発者体験を、
                  <br />
                  事業にする。
                </>
              ) : (
                <>
                  Design developer
                  <br />
                  experience.
                </>
              )}
            </h1>
            <div className="font-mono text-[12px] tracking-[0.28em] uppercase text-stone-500 mt-6">
              DESIGNING DEVELOPER EXPERIENCE · FOR SAAS &amp; COMMERCE
            </div>
            <p className="font-serif text-[20px] leading-[1.55] mt-8 max-w-[22em] tracking-[-0.005em] text-stone-800 dark:text-stone-200">
              {isJa ? (
                <>
                  Stripe・AWS Serverless・WordPress を軸に、
                  <mark className="bg-vermilion text-white px-1.5">SaaS と EC の収益導線</mark>
                  を設計・実装するエンジニアリングパートナーです。
                </>
              ) : (
                <>
                  Engineering partner specializing in Stripe, AWS Serverless &amp; WordPress,
                  designing{' '}
                  <mark className="bg-vermilion text-white px-1.5">
                    revenue-driving developer experiences
                  </mark>{' '}
                  for SaaS and commerce.
                </>
              )}
            </p>
          </div>

          {/* Right: portrait + status */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="relative aspect-[3/4] border border-stone-900/20 dark:border-stone-100/20 overflow-hidden">
              <Image
                src="/images/profile.jpg"
                alt={SITE_CONFIG.author.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
              <div className="absolute top-3 left-3 bg-stone-950 dark:bg-stone-50 text-stone-50 dark:text-stone-950 font-mono text-[10px] px-2 py-1.5 tracking-[0.1em]">
                PORTRAIT / 2026
              </div>
            </div>
            <StatusTable rows={statusRows} />
          </div>
        </div>

        {/* Metrics bar */}
        <dl className="grid grid-cols-2 lg:grid-cols-4 border-t border-b border-stone-900/20 dark:border-stone-100/20">
          {metricsItems.map((m, i) => (
            <div
              key={m.label}
              className={`px-6 py-5 ${i < metricsItems.length - 1 ? 'border-r border-stone-900/10 dark:border-stone-100/10' : ''}`}
            >
              <dt className="font-mono text-[10px] tracking-[0.16em] uppercase text-stone-500 mb-2.5">
                {m.label}
              </dt>
              <dd className="flex items-baseline gap-1.5 font-sans font-bold text-[40px] leading-none tracking-[-0.02em] text-stone-950 dark:text-stone-50">
                {m.value}
                <small className="text-[13px] font-medium text-stone-500 tracking-normal">
                  {m.unit}
                </small>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
