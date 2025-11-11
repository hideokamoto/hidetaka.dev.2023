import Container from '@/components/tailwindui/Container'
import SimpleLayout from '@/components/tailwindui/SimpleLayout'
import Link from 'next/link'
import { MicroCMSAPI } from '@/lib/microCMS/apis'
import { createMicroCMSClient } from '@/lib/microCMS/client'

function formatDate(dateString: string, lang: string): string {
  return new Date(dateString).toLocaleDateString(lang === 'ja' ? 'ja-JP' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export default async function SpeakingPageContent({ lang }: { lang: string }) {
  const microCMS = new MicroCMSAPI(createMicroCMSClient())
  const events = await microCMS.listEndedEvents()
  const title = lang === 'ja' ? '登壇・講演' : 'Speaking'

  return (
    <SimpleLayout title={title}>
      <div className="flex flex-col gap-16">
        <div className="md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40">
          <div className="flex max-w-3xl flex-col space-y-16">
            {events.map((event) => (
              <article key={event.id} className="md:grid md:grid-cols-4 md:items-baseline">
                <div className="group relative flex flex-col items-start md:col-span-3">
                  <h2 className="text-base font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
                    <a href={event.url} target="_blank" rel="noopener noreferrer">
                      {event.title}
                    </a>
                  </h2>
                  <time
                    dateTime={event.date}
                    className="relative z-10 order-first mb-3 flex items-center text-sm text-zinc-400 dark:text-zinc-500 md:hidden pl-3.5"
                  >
                    <span className="absolute inset-y-0 left-0 flex items-center" aria-hidden="true">
                      <span className="h-4 w-0.5 rounded-full bg-zinc-200 dark:bg-zinc-500" />
                    </span>
                    {formatDate(event.date, lang)}
                  </time>
                  <div className="relative z-10 order-first mb-3 flex items-center text-sm text-zinc-400 dark:text-zinc-500 pl-3.5">
                    <span className="absolute inset-y-0 left-0 flex items-center" aria-hidden="true">
                      <span className="h-4 w-0.5 rounded-full bg-zinc-200 dark:bg-zinc-500" />
                    </span>
                    {event.place}
                  </div>
                  {event.session_title && (
                    <p className="relative z-10 mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                      {event.session_title}
                    </p>
                  )}
                  {event.description && (
                    <p className="relative z-10 mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                      {event.description.substring(0, 200)}
                      {event.description.length > 200 ? '...' : ''}
                    </p>
                  )}
                </div>
                <time
                  dateTime={event.date}
                  className="relative z-10 order-first mb-3 flex items-center text-sm text-zinc-400 dark:text-zinc-500 mt-1 hidden md:block"
                >
                  {formatDate(event.date, lang)}
                </time>
              </article>
            ))}
          </div>
        </div>
      </div>
    </SimpleLayout>
  )
}

