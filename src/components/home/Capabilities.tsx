type Service = {
  no: string
  category: string
  categoryLabel: string
  title: string
  titleAccent: string
  description: string
  bullets: string[]
}

export default function Capabilities({ lang }: { lang: string }) {
  const isJa = lang.startsWith('ja')

  const sectionNo = '§01 / SERVICES'
  const sectionTitle = isJa ? '何ができるか' : 'What I can do'
  const sectionSub = 'FOUR DISCIPLINES'
  const sectionDesc = isJa
    ? 'すべて単独の案件として、あるいは既存チームへのエンジニアリングパートナーとして。長期運用を前提に、現場の言葉と IaC で設計します。'
    : 'As a standalone engagement or as an engineering partner embedded in your team — designed for long-term operations.'

  const services: Service[] = isJa
    ? [
        {
          no: '01 / Stripe',
          category: 'Stripe',
          categoryLabel: 'Monetize',
          title: '決済を、',
          titleAccent: '収益の武器',
          description:
            '従量・年額・トライアル。複雑化する課金体系を、Billing / Connect / Radar で運用に耐える形にする。Revenue Recognition まで見据えた請求自動化。',
          bullets: ['従量・年額プランの設計', 'SaaS メトリクス可視化', 'Revenue Recognition 運用'],
        },
        {
          no: '02 / AWS · CF',
          category: 'AWS · CF',
          categoryLabel: 'Scale',
          title: '境界なき',
          titleAccent: 'サーバーレス基盤',
          description:
            'Lambda・Step Functions と Cloudflare Workers を組み合わせ、マルチリージョン API と非同期ジョブパイプラインを構築。観測性・セキュリティは標準装備。',
          bullets: [
            'マルチリージョン API 設計',
            'IaC による CI/CD',
            'ランタイム監視・アラート設計',
          ],
        },
        {
          no: '03 / WordPress',
          category: 'WordPress',
          categoryLabel: 'Publish',
          title: '編集を、',
          titleAccent: '開発と並走',
          description:
            'WordPress / Headless WP / Cloudflare Pages の運用。MicroCMS や既存 SaaS とのハイブリッドで、編集 UX と速度を両立します。',
          bullets: ['Headless 構成への移行支援', '編集フロー・権限設計', 'リード獲得と計測基盤'],
        },
        {
          no: '04 / Arch.',
          category: 'Architecture',
          categoryLabel: 'Design',
          title: '長く育つ',
          titleAccent: 'システム設計',
          description:
            'マイクロサービス、イベント駆動、データベース最適化、フェイルオーバー戦略。成長に追従する設計を、チームに根付く形で渡します。',
          bullets: ['サービス分割・境界設計', 'イベント駆動と整合性', '障害復旧の運用設計'],
        },
      ]
    : [
        {
          no: '01 / Stripe',
          category: 'Stripe',
          categoryLabel: 'Monetize',
          title: 'Turn payments into',
          titleAccent: 'revenue weapons',
          description:
            'Usage-based, annual, and trial billing. Tame complex billing with Billing / Connect / Radar — built to last. Billing automation through Revenue Recognition.',
          bullets: [
            'Usage-based & annual plan design',
            'SaaS metrics dashboards',
            'Revenue Recognition operations',
          ],
        },
        {
          no: '02 / AWS · CF',
          category: 'AWS · CF',
          categoryLabel: 'Scale',
          title: 'Boundless',
          titleAccent: 'serverless infra',
          description:
            'Combine Lambda, Step Functions, and Cloudflare Workers to build multi-region APIs and async pipelines. Observability and security built-in.',
          bullets: ['Multi-region API design', 'IaC-driven CI/CD', 'Runtime monitoring & alerting'],
        },
        {
          no: '03 / WordPress',
          category: 'WordPress',
          categoryLabel: 'Publish',
          title: 'Let editing',
          titleAccent: 'keep pace with dev',
          description:
            'WordPress / Headless WP / Cloudflare Pages. Hybrid integrations with MicroCMS and existing SaaS — editorial UX and performance in balance.',
          bullets: [
            'Migration to headless architecture',
            'Editorial flow & permission design',
            'Lead gen & analytics foundation',
          ],
        },
        {
          no: '04 / Arch.',
          category: 'Architecture',
          categoryLabel: 'Design',
          title: 'Systems designed',
          titleAccent: 'to grow with you',
          description:
            'Microservices, event-driven architecture, database optimization, failover strategies. Scalable design handed to your team to own.',
          bullets: [
            'Service boundary design',
            'Event-driven & data consistency',
            'Failure recovery & operations',
          ],
        },
      ]

  return (
    <section className="pt-24 pb-0 mx-auto max-w-[1440px] px-16">
      {/* Section header */}
      <header className="grid grid-cols-12 gap-6 pb-5 border-b-2 border-stone-900/20 dark:border-stone-100/20 mb-10 items-baseline">
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

      {/* 2x2 grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-stone-900/20 dark:bg-stone-100/20 border border-stone-900/20 dark:border-stone-100/20">
        {services.map((svc) => (
          <article
            key={svc.no}
            className="bg-[#f4f2ee] dark:bg-[#0d0c0b] p-9 grid grid-rows-[auto_auto_1fr_auto] gap-4 min-h-[300px]"
          >
            <div className="flex justify-between font-mono text-[10px] tracking-[0.16em] uppercase text-stone-500">
              <span>{svc.no}</span>
              <span>{svc.categoryLabel}</span>
            </div>
            <h3 className="font-sans font-bold text-[28px] leading-[1.2] tracking-[-0.01em] text-stone-950 dark:text-stone-50">
              {svc.title}
              <em className="not-italic text-vermilion">{svc.titleAccent}</em>
              {isJa ? 'にする。' : '.'}
            </h3>
            <p className="text-[13px] leading-[1.85] text-stone-700 dark:text-stone-300 max-w-[32em]">
              {svc.description}
            </p>
            <ul className="flex flex-col gap-1.5 pt-4 border-t border-stone-900/10 dark:border-stone-100/10">
              {svc.bullets.map((b) => (
                <li
                  key={b}
                  className="font-mono text-[11px] tracking-[0.04em] text-stone-500 grid grid-cols-[20px_1fr] gap-2"
                >
                  <span className="text-vermilion">&#8594;</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}
