/**
 * Cloudflare context utilities for API routes
 * Shared utilities for accessing Cloudflare Workers bindings and environment
 */

import { logger } from '@/libs/logger'

/**
 * Cloudflare environment type
 * Defines available bindings and environment variables
 */
export type CloudflareEnv = {
  OG_IMAGE_GENERATOR?: { fetch: typeof fetch }
  OG_IMAGE_GEN_AUTH_TOKEN?: string
}

/**
 * Cloudflare context type
 */
export type CloudflareContext = {
  env: CloudflareEnv
}

/**
 * Error message for local dev session not found
 * Used to detect when Service Binding is not available in local development
 */
export const WRANGLER_LOCAL_DEV_SESSION_ERROR = "Couldn't find a local dev session"

/**
 * Get Cloudflare context for the current request
 * Handles both production and development environments
 *
 * @param options - Configuration options
 * @returns Cloudflare context with env and bindings
 *
 * @example
 * ```ts
 * const context = await getCloudflareContext({ async: true })
 * const ogImageGenerator = context.env.OG_IMAGE_GENERATOR
 * ```
 */
export async function getCloudflareContext(
  options: { async: true } | { async?: false } = { async: false },
): Promise<CloudflareContext> {
  try {
    const { getCloudflareContext: getContext } = await import('@opennextjs/cloudflare')

    if (options.async === true) {
      return (await getContext({ async: true })) as CloudflareContext
    }
    return getContext({ async: false }) as CloudflareContext
  } catch (error) {
    logger.warn('Failed to import @opennextjs/cloudflare, using fallback', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    // Fallback: Try to get context from global scope
    const cloudflareContextSymbol = Symbol.for('__cloudflare-context__')
    const context = (
      globalThis as typeof globalThis & {
        [key: symbol]: unknown
      }
    )[cloudflareContextSymbol]

    if (context) {
      return options.async === true
        ? Promise.resolve(context as CloudflareContext)
        : (context as CloudflareContext)
    }

    throw new Error('Cloudflare context is not available')
  }
}

/**
 * Get OG image generator binding and auth token
 *
 * @returns Object with ogImageGenerator binding and authToken
 *
 * @example
 * ```ts
 * const { ogImageGenerator, authToken } = await getOGImageGeneratorBindings()
 * ```
 */
export async function getOGImageGeneratorBindings() {
  const context = await getCloudflareContext({ async: true })
  const typedEnv = context.env

  return {
    ogImageGenerator: typedEnv.OG_IMAGE_GENERATOR,
    authToken: typedEnv.OG_IMAGE_GEN_AUTH_TOKEN || process.env.OG_IMAGE_GEN_AUTH_TOKEN,
  }
}

/**
 * Generate OG image with fallback for Service Binding
 * Handles both Service Binding and direct fetch
 *
 * @param ogImageUrl - URL to OG image generator
 * @param headers - Request headers (including auth)
 * @param ogImageGenerator - Optional Service Binding
 * @returns Response from OG image generator
 *
 * @example
 * ```ts
 * const url = new URL('https://example.com/generate')
 * const headers = new Headers({ 'Authorization': 'Bearer token' })
 * const response = await generateOGImageWithFallback(url, headers)
 * ```
 */
export async function generateOGImageWithFallback(
  ogImageUrl: URL,
  headers: Headers,
  ogImageGenerator?: { fetch: typeof fetch },
): Promise<Response> {
  const fallbackFetch = () => fetch(ogImageUrl, { headers })
  let response: Response

  if (ogImageGenerator) {
    response = await ogImageGenerator.fetch(ogImageUrl, { headers })

    // Service Binding returns 503 if local dev session is not found
    // In this case, fall back to regular fetch
    if (response.status === 503) {
      const responseBodyText = await response
        .clone()
        .text()
        .catch(() => '')

      if (responseBodyText.includes(WRANGLER_LOCAL_DEV_SESSION_ERROR)) {
        logger.log('Service Binding local dev session not found, using fallback fetch')
        response = await fallbackFetch()
      }
    }
  } else {
    // Service Binding not available, use regular fetch
    response = await fallbackFetch()
  }

  return response
}
