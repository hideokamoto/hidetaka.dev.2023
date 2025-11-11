import Container from '@/components/tailwindui/Container'
import SimpleLayout from '@/components/tailwindui/SimpleLayout'

export default function ProjectsPageContent({ lang }: { lang: string }) {
  const title = /ja/.test(lang) ? '個人開発・プロジェクト' : 'My projects'

  return (
    <SimpleLayout title={title}>
      <section className="mt-4 sm:mt-8">
        <header className="md:grid md:grid-cols-4 md:items-baseline">
          <h2
            id="guest-posts"
            className="md:col-span-1 mb-4 sm:mb-8 text-2xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-3xl"
          >
            Guest posts
          </h2>
        </header>
        <div className="md:grid md:grid-cols-8 md:items-baseline">
          <div />
          <div className="md:col-span-7">
            {/* GuestContent component will be added here */}
          </div>
        </div>
      </section>
      <section className="mt-4 sm:mt-8">
        <header className="md:grid md:grid-cols-4 md:items-baseline">
          <h2
            id="apps"
            className="md:col-span-1 mb-4 sm:mb-8 text-2xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-3xl"
          >
            Applications / Websites
          </h2>
        </header>
        <div className="md:grid md:grid-cols-8 md:items-baseline">
          <div />
          <div className="md:col-span-7">
            {/* Applications component will be added here */}
          </div>
        </div>
      </section>
      <section className="mt-4 sm:mt-8">
        <header className="md:grid md:grid-cols-4 md:items-baseline">
          <h2
            id="books"
            className="md:col-span-1 mb-4 sm:mb-8 text-2xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-3xl"
          >
            Books
          </h2>
        </header>
        <div className="md:grid md:grid-cols-8 md:items-baseline">
          <div />
          <div className="md:col-span-7">
            {/* Books component will be added here */}
          </div>
        </div>
      </section>
    </SimpleLayout>
  )
}

