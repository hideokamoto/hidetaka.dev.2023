'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ReactNode } from 'react'

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M20.055 7.983c.011.174.011.347.011.523 0 5.338-3.92 11.494-11.09 11.494v-.003A10.755 10.755 0 0 1 3 18.186c.308.038.618.057.928.058a7.655 7.655 0 0 0 4.841-1.733c-1.668-.032-3.13-1.16-3.642-2.805a3.753 3.753 0 0 0 1.76-.07C5.07 13.256 3.76 11.6 3.76 9.676v-.05a3.77 3.77 0 0 0 1.77.505C3.816 8.945 3.288 6.583 4.322 4.737c1.98 2.524 4.9 4.058 8.034 4.22a4.137 4.137 0 0 1 1.128-3.86A3.807 3.807 0 0 1 19 5.274a7.657 7.657 0 0 0 2.475-.98c-.29.934-.9 1.729-1.713 2.233A7.54 7.54 0 0 0 22 5.89a8.084 8.084 0 0 1-1.945 2.093Z" />
    </svg>
  )
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.475 2 2 6.588 2 12.253c0 4.537 2.862 8.369 6.838 9.727.5.09.687-.218.687-.487 0-.243-.013-1.05-.013-1.91C7 20.059 6.35 18.957 6.15 18.38c-.113-.295-.6-1.205-1.025-1.448-.35-.192-.85-.667-.013-.68.788-.012 1.35.744 1.538 1.051.9 1.551 2.338 1.116 2.912.846.088-.666.35-1.115.638-1.371-2.225-.256-4.55-1.14-4.55-5.062 0-1.115.387-2.038 1.025-2.756-.1-.256-.45-1.307.1-2.717 0 0 .837-.269 2.75 1.051.8-.23 1.65-.346 2.5-.346.85 0 1.7.115 2.5.346 1.912-1.333 2.75-1.05 2.75-1.05.55 1.409.2 2.46.1 2.716.637.718 1.025 1.628 1.025 2.756 0 3.934-2.337 4.806-4.562 5.062.362.32.675.936.675 1.897 0 1.371-.013 2.473-.013 2.82 0 .268.188.589.688.486a10.039 10.039 0 0 0 4.932-3.74A10.447 10.447 0 0 0 22 12.253C22 6.588 17.525 2 12 2Z"
      />
    </svg>
  )
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M18.335 18.339H15.67v-4.177c0-.996-.02-2.278-1.39-2.278-1.389 0-1.601 1.084-1.601 2.205v4.25h-2.666V9.75h2.56v1.17h.035c.358-.674 1.228-1.387 2.528-1.387 2.7 0 3.2 1.778 3.2 4.091v4.715zM7.003 8.575a1.546 1.546 0 01-1.548-1.549 1.548 1.548 0 111.547 1.549zm1.336 9.764H5.666V9.75H8.34v8.589zM19.67 3H4.329C3.593 3 3 3.58 3 4.297v15.406C3 20.42 3.594 21 4.328 21h15.338C20.4 21 21 20.42 21 19.703V4.297C21 3.58 20.4 3 19.666 3h.003z" />
    </svg>
  )
}

function SocialLink({ 
  href, 
  icon: Icon, 
  children,
  className = '' 
}: { 
  href: string
  icon: ({ className }: { className?: string }) => ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <li className={`flex ${className}`}>
      <Link
        href={href}
        className="group flex text-sm font-medium text-zinc-800 transition hover:text-teal-500 dark:text-zinc-200 dark:hover:text-teal-500"
      >
        <Icon className="h-6 w-6 flex-none fill-zinc-500 transition group-hover:fill-teal-500" />
        <span className="ml-4">{children}</span>
      </Link>
    </li>
  )
}

function Profile({ lang }: { lang: string }) {
  if (lang.startsWith('ja')) {
    return (
      <>
        DigitalCubeのBizDev。EC ASPの開発やStripeのDeveloper Advocateとしての経験を元に、SaaSやECサイトの収益を増やすための方法・生成AIを使った効率化や新しい事業モデルの模索などに挑戦する。
      </>
    )
  }
  return (
    <>
      I&apos;m a Business Development professional at DigitalCube. Based on my experience in EC ASP development and as a Developer Advocate at Stripe, I&apos;m working on methods to increase revenue for SaaS and EC sites, exploring efficiency improvements using generative AI, and developing new business models.
      You can follow me on Twitter at{' '}
      <a
        className="text-underline text-indigo-600"
        href="https://twitter.com/hidetaka_dev"
      >
        @hidetaka__dev
      </a>
    </>
  )
}

function SpeakerProfile({ lang }: { lang: string }) {
  if (lang.startsWith('ja')) {
    return (
      <>
        DigitalCubeのBizDevとして、SaaSやECサイトの収益を増やすための方法・生成AIを使った効率化や新しい事業モデルの模索などに挑戦している。前職では<a className="text-underline text-indigo-600" href="https://stripe.com/docs">Stripe</a>のディベロッパーアドボケイトとして、開発者・ユーザーコミュニティとの対話やコンテンツ・サンプルの提供に取り組んだ。ECサービスやSaaSサービスの開発・運用保守の経験とコミュニティとの会話を元に、サービスの収益化戦略やテクノロジー活用方法について情報発信している。複数の開発者コミュニティに参加し、WordCamp Kansai 2024やJP_Stripes Connect 2019など、ユーザーカンファレンスの実行委員長を務めた経験を持つ。 AWS Sumurai 2017, Alexa Champions, AWS Community Builders
      </>
    )
  }
  return (
    <>
      Hide (ひで pronounced &quot;Hee-Day&quot;) is a Business Development professional at <a className="text-underline text-indigo-600" href="https://en.digitalcube.jp/">DigitalCube</a>, where he works on increasing revenue for SaaS and EC sites, exploring efficiency improvements using generative AI, and developing new business models. Previously, he was a Developer Advocate at <a className="text-underline text-indigo-600" href="https://stripe.com/docs">Stripe</a>, where he worked on writing, coding, and teaching how to integrate online payments.
      He has organized several community conferences including WordCamp Kansai 2024 and <a className="text-underline text-indigo-600" href="https://connect2019.jpstripes.com/" >JP_Stripes Connect 2019</a>, the first Stripe user conference in Japan.
      Prior to Stripe, Hide was a lead Software Engineer at DigitalCube, focused on building plugins, open source, and developing SaaS application dashboards. Hide lives in Hyogo, Japan with his family and two cats.
    </>
  )
}

export default function AboutPageContent({ lang }: { lang: string }) {
  return (
    <Container className="mt-16 sm:mt-32">
      <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-y-12">
        <div className="lg:pl-20">
          <div className="max-w-xs px-2.5 lg:max-w-none">
            <Image
              src="/images/profile.jpg"
              alt=""
              width={1024}
              height={1024}
              sizes="(min-width: 1024px) 32rem, 20rem"
              className="aspect-square rotate-3 rounded-2xl bg-zinc-100 object-cover dark:bg-zinc-800"
            />
          </div>
        </div>
        <div className="lg:order-first lg:row-span-2">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
            <span className="block text-zinc-800 dark:text-zinc-100">Hello!</span>
            <span className="block text-zinc-800 dark:text-zinc-100">
              I&apos;m <span className="text-indigo-600">Hidetaka Okamoto</span>
            </span>
          </h1>
          <div className="mt-6 space-y-7 text-base text-zinc-600 dark:text-zinc-400">
            <Profile lang={lang} />
            <SpeakerProfile lang={lang} />
          </div>
        </div>
        <div className="lg:pl-20">
          <ul role="list">
            <SocialLink href="https://twitter.com/hidetaka_dev" icon={TwitterIcon}>
              Follow on Twitter
            </SocialLink>
            <SocialLink href="https://github.com/hideokamoto" icon={GitHubIcon} className="mt-4">
              Follow on GitHub
            </SocialLink>
            <SocialLink href="https://www.linkedin.com/in/hideokamoto/" icon={LinkedInIcon} className="mt-4">
              Follow on LinkedIn
            </SocialLink>
          </ul>
        </div>
      </div>
      <section className="mt-16">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-3xl">
          Certifications
        </h2>
        <div className="mt-6 flex gap-6">
          {[
            {
              title: 'Stripe Certified Fundamentals',
              link: 'https://stripecertifications.credential.net/07672459-235c-4d15-93ac-09924b3e497e#gs.2entq2',
              src: 'https://api.accredible.com/v1/frontend/credential_website_embed_image/badge/75763824',
            },
            {
              title: 'Stripe Certified Associate Architect',
              link: 'https://stripecertifications.credential.net/aaddbb97-48a8-485b-b8fe-762f0755a983?record_view=true#gs.4ueaj3',
              src: 'https://api.accredible.com/v1/frontend/credential_website_embed_image/badge/81675136',
            },
            {
              title: 'Stripe Certified Associate Developer',
              link: 'https://stripecertifications.credential.net/a7068cdb-95a4-4c87-86ab-32a5029adf21#gs.2ekxxs',
              src: 'https://api.accredible.com/v1/frontend/credential_website_embed_image/badge/76718344',
            },
            {
              title: 'Stripe Certified Professional Developer',
              link: '',
              src: 'https://api.accredible.com/v1/frontend/credential_website_embed_image/badge/80541441',
            },
          ].map((badge) => (
            <a key={badge.title} href={badge.link || '#'} target="_blank" rel="noopener noreferrer">
              <Image 
                src={badge.src} 
                width={100}
                height={100}
                className="group flex text-sm font-medium text-zinc-800 transition hover:text-teal-500 dark:text-zinc-200 dark:hover:text-teal-500"
                alt={badge.title}
              />
            </a>
          ))}
        </div>
      </section>
    </Container>
  )
}

