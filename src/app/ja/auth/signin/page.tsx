import type { Metadata } from 'next'
import SignInPageContent from '@/components/containers/pages/SignInPage'

export const metadata: Metadata = {
  title: 'ログイン | Hidetaka.dev',
  description: 'プレミアムコンテンツにアクセスするにはログインしてください',
}

export default function SignInPage() {
  return <SignInPageContent lang="ja" />
}
