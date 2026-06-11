import AboutPageContent from '@/components/containers/pages/AboutPage'
import { buildAlternates } from '@/libs/metadata'

export const metadata = {
  alternates: buildAlternates('/ja/about'),
  title: 'About',
}

export default function AboutPage() {
  return <AboutPageContent lang="ja" />
}
