import Hero from '@/components/Hero/Hero'
import FeaturedContent from '@/components/containers/FeaturedContent'

export default async function HomePage() {
  const lang = 'ja'

  return (
    <>
      <Hero lang={lang} />
      <FeaturedContent lang={lang} />
    </>
  )
}

