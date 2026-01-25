/**
 * Environment variable validation and type-safe access
 *
 * This file provides centralized, type-safe environment variable management using Zod.
 * All environment variables are validated at build time and startup, preventing
 * runtime errors from missing or invalid configuration.
 *
 * Usage:
 * ```typescript
 * import { env } from '@/env'
 *
 * // Type-safe access to environment variables
 * const apiKey = env.MICROCMS_API_KEY  // string (guaranteed to exist)
 * const gaId = env.NEXT_PUBLIC_GA_ID    // string | undefined
 * ```
 *
 * Benefits:
 * - Early error detection at startup instead of runtime
 * - Type-safe access with full TypeScript support
 * - Automatic IDE autocomplete for all environment variables
 * - Centralized documentation of all required/optional variables
 * - Validation and transformation (e.g., string to boolean)
 */

import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  /**
   * Server-side environment variables
   * These are only available on the server and never exposed to the client
   */
  server: {
    // microCMS API - Required for content management
    MICROCMS_API_KEY: z.string().min(1, 'MICROCMS_API_KEY is required'),

    // OG Image Generation - Required for thumbnail API authentication
    OG_IMAGE_GEN_AUTH_TOKEN: z.string().min(1, 'OG_IMAGE_GEN_AUTH_TOKEN is required'),

    // Sentry Error Tracking - Server-side (Cloudflare Workers)
    SENTRY_DSN: z.string().url().optional(),

    // Sentry CLI - Build time configuration (optional, for source map uploads)
    SENTRY_AUTH_TOKEN: z.string().optional(),
    SENTRY_ORG: z.string().optional(),
    SENTRY_PROJECT: z.string().optional(),

    // Node.js Environment
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  },

  /**
   * Client-side environment variables
   * These MUST be prefixed with NEXT_PUBLIC_ to be exposed to the browser
   */
  client: {
    // Google Analytics 4 - Optional, defaults to G-RV8PYHHYHN if not set
    NEXT_PUBLIC_GA_ID: z
      .string()
      .regex(/^G-[A-Z0-9]{10}$/, 'Invalid Google Analytics ID format')
      .default('G-RV8PYHHYHN'),

    // Hatena Star - Feature flag for enabling Hatena Star on Japanese blog pages
    // Accepts "true" or "false" string, transforms to boolean
    NEXT_PUBLIC_ENABLE_HATENA_STAR: z
      .enum(['true', 'false'])
      .transform((val) => val === 'true')
      .default('false'),

    // Sentry Error Tracking - Client-side (browser)
    NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  },

  /**
   * Runtime environment variable mapping
   * Maps environment variables from process.env to the schema
   *
   * Note: This is required because Next.js may optimize away process.env
   * in certain build configurations. Explicit mapping ensures all variables
   * are properly captured.
   */
  runtimeEnv: {
    // Server
    MICROCMS_API_KEY: process.env.MICROCMS_API_KEY,
    OG_IMAGE_GEN_AUTH_TOKEN: process.env.OG_IMAGE_GEN_AUTH_TOKEN,
    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
    NODE_ENV: process.env.NODE_ENV,

    // Client
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
    NEXT_PUBLIC_ENABLE_HATENA_STAR: process.env.NEXT_PUBLIC_ENABLE_HATENA_STAR,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  },

  /**
   * Validation error handler
   * Provides clear error messages when environment variables are missing or invalid
   */
  onValidationError: (error) => {
    console.error('❌ Invalid environment variables:')
    console.error(error)
    throw new Error('Invalid environment variables - see error details above')
  },

  /**
   * Invalid access error handler
   * Throws when trying to access server variables on client or vice versa
   */
  onInvalidAccess: (variable) => {
    throw new Error(
      `❌ Attempted to access server-side environment variable "${variable}" on the client. ` +
        'Server variables cannot be accessed from client code for security reasons.',
    )
  },

  /**
   * Treat empty strings as undefined
   * This prevents empty string values from passing validation when a value is required
   */
  emptyStringAsUndefined: true,

  /**
   * Skip validation during build and tests
   * Set to true to skip validation during the build process or in test environment
   * Useful for:
   * - CI/CD environments where some variables may not be available at build time
   * - Test environments where env vars are set dynamically
   */
  skipValidation: process.env.NODE_ENV === 'test' || process.env.SKIP_ENV_VALIDATION === 'true',
})
