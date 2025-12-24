import type { DefaultSession } from 'next-auth'
import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      stripeCustomerId?: string | null
      stripeSubscriptionId?: string | null
      isPremium: boolean
    } & DefaultSession['user']
  }

  interface User {
    id: string
    stripeCustomerId?: string | null
    stripeSubscriptionId?: string | null
    isPremium: boolean
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    {
      id: 'credentials',
      name: 'Credentials',
      type: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // 開発環境では簡単な認証を実装
        // 本番環境では適切な認証システムを実装してください
        if (process.env.NODE_ENV === 'development') {
          // 開発用の簡単な認証
          if (credentials?.email && credentials?.password) {
            return {
              id: '1',
              email: credentials.email as string,
              name: 'Test User',
              stripeCustomerId: undefined,
              stripeSubscriptionId: undefined,
              isPremium: false,
            }
          }
        }
        return null
      },
    },
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.stripeCustomerId = user.stripeCustomerId || null
        token.stripeSubscriptionId = user.stripeSubscriptionId || null
        token.isPremium = user.isPremium || false
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || ''
        session.user.stripeCustomerId = (token.stripeCustomerId as string | null) || null
        session.user.stripeSubscriptionId = (token.stripeSubscriptionId as string | null) || null
        session.user.isPremium = (token.isPremium as boolean) || false
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
})
