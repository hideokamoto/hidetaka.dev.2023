import Hero from '@/components/Hero/Hero'
import Capabilities from '@/components/home/Capabilities'
import StackShowcase from '@/components/home/StackShowcase'
import FeaturedContent from '@/components/containers/FeaturedContent'

export default async function HomePage() {
  const lang = 'en'

  return (
    <>
      <Hero lang={lang} />
      <Capabilities lang={lang} />
      <StackShowcase lang={lang} />
      <FeaturedContent lang={lang} />
    </>
  )
}

