import type { Metadata } from 'next'
import FeaturedContent from '@/components/containers/FeaturedContent'
import Hero from '@/components/Hero/Hero'
import Highlights from '@/components/home/Highlights'
import StackShowcase from '@/components/home/StackShowcase'
import FollowCTA from '@/components/ui/FollowCTA'
import { buildAlternates } from '@/libs/metadata'

export const metadata: Metadata = {
  alternates: buildAlternates('/ja'),
}

export default async function HomePage() {
  const lang = 'ja'

  return (
    <>
      <Hero lang={lang} />
      <Highlights lang={lang} />
      <StackShowcase lang={lang} />
      <FeaturedContent lang={lang} />
      <div className="pb-24 sm:pb-32">
        <FollowCTA lang={lang} />
      </div>
    </>
  )
}
