/// <reference types="next" />
/// <reference types="next/image-types/global" />

declare namespace NodeJS {
  interface ProcessEnv {
    NEXTAUTH_URL?: string
    NEXTAUTH_SECRET?: string
    STRIPE_SECRET_KEY?: string
    STRIPE_PUBLISHABLE_KEY?: string
    STRIPE_WEBHOOK_SECRET?: string
    STRIPE_PRICE_ID?: string
  }
}
