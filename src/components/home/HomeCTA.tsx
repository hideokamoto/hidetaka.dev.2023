import Link from 'next/link'

export default function HomeCTA({ lang }: { lang: string }) {
  const isJa = lang.startsWith('ja')

  return (
    <section className="mt-35 mx-auto max-w-[1440px] px-16 py-30 text-center border-t-2 border-b border-stone-900/20 dark:border-stone-100/20">
      <div className="font-mono text-[11px] tracking-[0.3em] uppercase text-stone-500 mb-6">
        § 04 / CONTACT · Q2 2026 · 2 SLOTS
      </div>
      <h2 className="font-sans font-black text-[clamp(44px,5.2vw,72px)] leading-[1.15] max-w-[22ch] mx-auto tracking-[-0.02em] text-stone-950 dark:text-stone-50">
        {isJa ? (
          <>
            貴社の <em className="not-italic text-vermilion">収益導線</em>、<br />
            一緒に設計しませんか。
          </>
        ) : (
          <>
            Ready to design your <em className="not-italic text-vermilion">revenue experience</em>{' '}
            together?
          </>
        )}
      </h2>
      <div className="mt-12 flex gap-4 justify-center flex-wrap">
        <a
          href="mailto:hello@hidetaka.dev"
          className="inline-flex items-center gap-3 px-8 py-5 bg-stone-950 dark:bg-stone-50 text-stone-50 dark:text-stone-950 font-sans font-bold text-[14px] tracking-[0.04em] after:content-['→']"
        >
          {isJa ? '相談する · hello@hidetaka.dev' : 'Get in touch · hello@hidetaka.dev'}
        </a>
        <Link
          href={isJa ? '/ja/work' : '/work'}
          className="inline-flex items-center gap-3 px-8 py-5 border border-stone-900 dark:border-stone-100 bg-transparent text-stone-900 dark:text-stone-100 font-sans font-bold text-[14px] tracking-[0.04em]"
        >
          {isJa ? 'プロジェクトを見る' : 'View projects'}
        </Link>
      </div>
    </section>
  )
}
