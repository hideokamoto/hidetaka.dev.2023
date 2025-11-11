import Container from '@/components/tailwindui/Container'

export const metadata = {
  title: 'Speaking',
}

export default function SpeakingPage() {
  return (
    <Container className="mt-16 sm:mt-32">
      <h1 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
        Speaking
      </h1>
      {/* Speaking content will be added here */}
    </Container>
  )
}

