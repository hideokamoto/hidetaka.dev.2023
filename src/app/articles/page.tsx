import Container from '@/components/tailwindui/Container'

export const metadata = {
  title: 'Articles',
}

export default function ArticlesPage() {
  return (
    <Container className="mt-16 sm:mt-32">
      <h1 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
        Articles
      </h1>
      {/* Articles content will be added here */}
    </Container>
  )
}

