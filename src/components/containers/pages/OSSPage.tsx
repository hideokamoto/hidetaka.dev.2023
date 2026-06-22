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
            className="md:col-span-1 mb-4 sm:mb-8 text-2xl font-bold tracking-tight sm:text-3xl"
            style={{ color: 'var(--rvt-fg)' }}
          >
            NPM Packages
          </h2>
        </header>
        <div className="md:grid md:grid-cols-8 md:items-baseline">
          <div />
          <div className="md:col-span-7">
            <div className="flex flex-col gap-16">
              <div className="md:border-l md:md:pl-6" style={{ borderColor: 'var(--rvt-border)' }}>
                <div className="flex max-w-3xl flex-col space-y-16">
                  {npmPackages.map((pkg) => (
                    <article
                      key={pkg.package.name}
                      className="md:grid md:grid-cols-4 md:items-baseline"
                    >
                      <div className="group relative flex flex-col items-start md:col-span-3">
                        <h2
                          className="text-base font-semibold tracking-tight"
                          style={{ color: 'var(--rvt-fg)' }}
                        >
                          <a href={pkg.package.links.npm} target="_blank" rel="noopener noreferrer">
                            {pkg.package.name}
                          </a>
                        </h2>
                        <time
                          dateTime={pkg.package.date}
                          className="relative z-10 order-first mb-3 flex items-center text-sm md:hidden pl-3.5"
                          style={{ color: 'var(--rvt-fg2)' }}
                        >
                          <span
                            className="absolute inset-y-0 left-0 flex items-center"
                            aria-hidden="true"
                          >
                            <span
                              className="h-4 w-0.5 rounded-full"
                              style={{ background: 'var(--rvt-border)' }}
                            />
                          </span>
                          {formatDate(pkg.package.date, lang)}
                        </time>
                        <p
                          className="relative z-10 mt-2 text-sm"
                          style={{ color: 'var(--rvt-fg2)' }}
                        >
                          {pkg.package.description}
                        </p>
                      </div>
                      <time
                        dateTime={pkg.package.date}
                        className="relative z-10 order-first mb-3 flex items-center text-sm mt-1 hidden md:block"
                        style={{ color: 'var(--rvt-fg2)' }}
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
            className="md:col-span-1 mb-4 sm:mb-8 text-2xl font-bold tracking-tight sm:text-3xl"
            style={{ color: 'var(--rvt-fg)' }}
          >
            WordPress Plugins
          </h2>
        </header>
        <div className="md:grid md:grid-cols-8 md:items-baseline">
          <div />
          <div className="md:col-span-7">
            <div className="flex flex-col gap-16">
              <div className="md:border-l md:md:pl-6" style={{ borderColor: 'var(--rvt-border)' }}>
                <div className="flex max-w-3xl flex-col space-y-16">
                  {wpPlugins.map((plugin) => (
                    <article key={plugin.slug} className="md:grid md:grid-cols-4 md:items-baseline">
                      <div className="group relative flex flex-col items-start md:col-span-3">
                        <h2
                          className="text-base font-semibold tracking-tight"
                          style={{ color: 'var(--rvt-fg)' }}
                        >
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
                          className="relative z-10 order-first mb-3 flex items-center text-sm md:hidden pl-3.5"
                          style={{ color: 'var(--rvt-fg2)' }}
                        >
                          <span
                            className="absolute inset-y-0 left-0 flex items-center"
                            aria-hidden="true"
                          >
                            <span
                              className="h-4 w-0.5 rounded-full"
                              style={{ background: 'var(--rvt-border)' }}
                            />
                          </span>
                          {formatDate(plugin.added, lang)}
                        </time>
                        <p
                          className="relative z-10 mt-2 text-sm"
                          style={{ color: 'var(--rvt-fg2)' }}
                        >
                          {plugin.short_description}
                        </p>
                      </div>
                      <time
                        dateTime={plugin.added}
                        className="relative z-10 order-first mb-3 flex items-center text-sm mt-1 hidden md:block"
                        style={{ color: 'var(--rvt-fg2)' }}
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
