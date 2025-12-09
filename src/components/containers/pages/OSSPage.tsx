import SimpleLayout from '@/components/tailwindui/SimpleLayout'
import { listMyNPMPackages } from '@/libs/dataSources/npmjs'
import { listMyWordPressPlugins } from '@/libs/dataSources/wporg'

function formatDate(dateString: string, lang: string): string {
  return new Date(dateString).toLocaleDateString(lang === 'ja' ? 'ja-JP' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export default async function OSSPageContent({ lang }: { lang: string }) {
  const npmPackages = await listMyNPMPackages()
  const wpPlugins = await listMyWordPressPlugins()
  const title = lang === 'ja' ? 'オープンソース' : 'OSS'

  return (
    <SimpleLayout title={title}>
      <section className="mt-4 sm:mt-8">
        <header className="md:grid md:grid-cols-4 md:items-baseline">
          <h2
            id="npm-packages"
            className="md:col-span-1 mb-4 sm:mb-8 text-2xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-3xl"
          >
            NPM Packages
          </h2>
        </header>
        <div className="md:grid md:grid-cols-8 md:items-baseline">
          <div />
          <div className="md:col-span-7">
            <div className="flex flex-col gap-16">
              <div className="md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40">
                <div className="flex max-w-3xl flex-col space-y-16">
                  {npmPackages.map((pkg) => (
                    <article
                      key={pkg.package.name}
                      className="md:grid md:grid-cols-4 md:items-baseline"
                    >
                      <div className="group relative flex flex-col items-start md:col-span-3">
                        <h2 className="text-base font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
                          <a href={pkg.package.links.npm} target="_blank" rel="noopener noreferrer">
                            {pkg.package.name}
                          </a>
                        </h2>
                        <time
                          dateTime={pkg.package.date}
                          className="relative z-10 order-first mb-3 flex items-center text-sm text-zinc-400 dark:text-zinc-500 md:hidden pl-3.5"
                        >
                          <span
                            className="absolute inset-y-0 left-0 flex items-center"
                            aria-hidden="true"
                          >
                            <span className="h-4 w-0.5 rounded-full bg-zinc-200 dark:bg-zinc-500" />
                          </span>
                          {formatDate(pkg.package.date, lang)}
                        </time>
                        <p className="relative z-10 mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                          {pkg.package.description}
                        </p>
                      </div>
                      <time
                        dateTime={pkg.package.date}
                        className="relative z-10 order-first mb-3 flex items-center text-sm text-zinc-400 dark:text-zinc-500 mt-1 hidden md:block"
                      >
                        {formatDate(pkg.package.date, lang)}
                      </time>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="mt-4 sm:mt-8">
        <header className="md:grid md:grid-cols-4 md:items-baseline">
          <h2
            id="wordpress-plugins"
            className="md:col-span-1 mb-4 sm:mb-8 text-2xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-3xl"
          >
            WordPress Plugins
          </h2>
        </header>
        <div className="md:grid md:grid-cols-8 md:items-baseline">
          <div />
          <div className="md:col-span-7">
            <div className="flex flex-col gap-16">
              <div className="md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40">
                <div className="flex max-w-3xl flex-col space-y-16">
                  {wpPlugins.map((plugin) => (
                    <article key={plugin.slug} className="md:grid md:grid-cols-4 md:items-baseline">
                      <div className="group relative flex flex-col items-start md:col-span-3">
                        <h2 className="text-base font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
                          <a
                            href={`https://wordpress.org/plugins/${plugin.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {plugin.name}
                          </a>
                        </h2>
                        <time
                          dateTime={plugin.added}
                          className="relative z-10 order-first mb-3 flex items-center text-sm text-zinc-400 dark:text-zinc-500 md:hidden pl-3.5"
                        >
                          <span
                            className="absolute inset-y-0 left-0 flex items-center"
                            aria-hidden="true"
                          >
                            <span className="h-4 w-0.5 rounded-full bg-zinc-200 dark:bg-zinc-500" />
                          </span>
                          {formatDate(plugin.added, lang)}
                        </time>
                        <p className="relative z-10 mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                          {plugin.short_description}
                        </p>
                      </div>
                      <time
                        dateTime={plugin.added}
                        className="relative z-10 order-first mb-3 flex items-center text-sm text-zinc-400 dark:text-zinc-500 mt-1 hidden md:block"
                      >
                        {formatDate(plugin.added, lang)}
                      </time>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SimpleLayout>
  )
}
