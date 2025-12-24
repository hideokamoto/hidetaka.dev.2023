/// <reference types="next" />
/// <reference types="next/image-types/global" />

declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?: string
    CLERK_SECRET_KEY?: string
    NEXT_PUBLIC_CLERK_SIGN_IN_URL?: string
    NEXT_PUBLIC_CLERK_SIGN_UP_URL?: string
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL?: string
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL?: string
    STRIPE_SECRET_KEY?: string
    STRIPE_PUBLISHABLE_KEY?: string
    STRIPE_WEBHOOK_SECRET?: string
    STRIPE_PRICE_ID?: string
  }
}
