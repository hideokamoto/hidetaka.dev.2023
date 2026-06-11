import AboutPageContent from '@/components/containers/pages/AboutPage'
import { buildAlternates } from '@/libs/metadata'

export const metadata = {
  alternates: buildAlternates('/about'),
  title: 'About',
}

export default function AboutPage() {
  return <AboutPageContent lang="en" />
}
