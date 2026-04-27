import FeaturedContent from '@/components/containers/FeaturedContent'
import Hero from '@/components/Hero/Hero'
import Capabilities from '@/components/home/Capabilities'
import HomeCTA from '@/components/home/HomeCTA'
import SpeakingSection from '@/components/home/SpeakingSection'
import StackShowcase from '@/components/home/StackShowcase'

export default async function HomePage() {
  const lang = 'en'
  return (
    <>
      <Hero lang={lang} />
      <Capabilities lang={lang} />
      <StackShowcase lang={lang} />
      <FeaturedContent lang={lang} />
      <SpeakingSection lang={lang} />
      <HomeCTA lang={lang} />
    </>
  )
}
