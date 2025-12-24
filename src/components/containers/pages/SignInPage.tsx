'use client'

import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import Container from '@/components/tailwindui/Container'
import PageHeader from '@/components/ui/PageHeader'

type SignInPageProps = {
  lang: string
}

export default function SignInPageContent({ lang }: SignInPageProps) {
  const isJapanese = lang === 'ja'
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(isJapanese ? 'ログインに失敗しました' : 'Failed to sign in')
      } else {
        const redirectPath = isJapanese ? '/ja/premium' : '/premium'
        router.push(redirectPath)
        router.refresh()
      }
    } catch (_err) {
      setError(isJapanese ? 'エラーが発生しました' : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const title = isJapanese ? 'ログイン' : 'Sign In'
  const description = isJapanese
    ? 'プレミアムコンテンツにアクセスするにはログインしてください'
    : 'Sign in to access premium content'

  return (
    <section className="pt-12 sm:pt-16 pb-8 sm:pb-12 bg-white dark:bg-zinc-900">
      <Container>
        <div className="max-w-md mx-auto">
          <PageHeader title={title} description={description} />

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                {isJapanese ? 'メールアドレス' : 'Email'}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
                placeholder={isJapanese ? 'your@email.com' : 'your@email.com'}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                {isJapanese ? 'パスワード' : 'Password'}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
                placeholder={isJapanese ? '••••••••' : '••••••••'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              {loading
                ? isJapanese
                  ? 'ログイン中...'
                  : 'Signing in...'
                : isJapanese
                  ? 'ログイン'
                  : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {isJapanese
                ? '開発環境では任意のメールアドレスとパスワードでログインできます。'
                : 'In development mode, you can sign in with any email and password.'}
            </p>
          </div>
        </div>
      </Container>
    </section>
  )
}
