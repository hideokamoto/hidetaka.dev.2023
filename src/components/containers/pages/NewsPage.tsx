import Link from 'next/link'
import SimpleLayout from '@/components/tailwindui/SimpleLayout'
import { MicroCMSAPI } from '@/libs/microCMS/apis'
import { createMicroCMSClient } from '@/libs/microCMS/client'

function formatDate(dateString: string, lang: string): string {
  return new Date(dateString).toLocaleDateString(lang === 'ja' ? 'ja-JP' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export default async function NewsPageContent({ lang }: { lang: string }) {
  const microCMS = new MicroCMSAPI(createMicroCMSClient())
  const posts = await microCMS.listPosts({ lang: lang === 'ja' ? 'japanese' : 'english' })
  const title = lang === 'ja' ? 'ニュース' : 'News'

  return (
    <SimpleLayout title={title}>
      <div className="flex flex-col gap-16">
        <div className="md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40">
          <div className="flex max-w-3xl flex-col space-y-16">
            {posts.map((post) => {
              const href = lang === 'ja' ? `/ja/news/${post.id}` : `/news/${post.id}`
              return (
                <article key={post.id} className="md:grid md:grid-cols-4 md:items-baseline">
                  <div className="group relative flex flex-col items-start md:col-span-3">
                    <h2 className="text-base font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
                      <Link href={href}>{post.title}</Link>
                    </h2>
                    <time
                      dateTime={post.publishedAt}
                      className="relative z-10 order-first mb-3 flex items-center text-sm text-zinc-400 dark:text-zinc-500 md:hidden pl-3.5"
                    >
                      <span
                        className="absolute inset-y-0 left-0 flex items-center"
                        aria-hidden="true"
                      >
                        <span className="h-4 w-0.5 rounded-full bg-zinc-200 dark:bg-zinc-500" />
                      </span>
                      {formatDate(post.publishedAt, lang)}
                    </time>
                    <p className="relative z-10 mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                      {post.content.replace(/<[^>]*>/g, '').substring(0, 200)}
                      {post.content.replace(/<[^>]*>/g, '').length > 200 ? '...' : ''}
                    </p>
                    <div
                      aria-hidden="true"
                      className="relative z-10 mt-4 flex items-center text-sm font-medium text-teal-500"
                    >
                      Read more
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        aria-hidden="true"
                        className="ml-1 h-4 w-4 stroke-current"
                      >
                        <path
                          d="M6.75 5.75 9.25 8l-2.5 2.25"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                  <time
                    dateTime={post.publishedAt}
                    className="relative z-10 order-first mb-3 flex items-center text-sm text-zinc-400 dark:text-zinc-500 mt-1 hidden md:block"
                  >
                    {formatDate(post.publishedAt, lang)}
                  </time>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </SimpleLayout>
  )
}
