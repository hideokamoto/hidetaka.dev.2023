import type { Metadata } from 'next'
import SignInPageContent from '@/components/containers/pages/SignInPage'

export const metadata: Metadata = {
  title: 'Sign In | Hidetaka.dev',
  description: 'Sign in to access premium content',
}

export default function SignInPage() {
  return <SignInPageContent lang="en" />
}
