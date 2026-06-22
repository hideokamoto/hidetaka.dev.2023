import Container from './Container'

export default function SimpleLayout({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <Container className="mt-16 sm:mt-32">
      <header className="max-w-2xl">
        <h1
          className="text-4xl font-bold tracking-tight sm:text-5xl"
          style={{ color: 'var(--rvt-fg)' }}
        >
          {title}
        </h1>
      </header>
      {children}
    </Container>
  )
}
