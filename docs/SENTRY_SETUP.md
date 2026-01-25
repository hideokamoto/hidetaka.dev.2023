# Sentry Error Tracking Setup

This document explains how to set up and use Sentry error tracking in the Hidetaka.dev project.

## Overview

The project is configured with dual Sentry SDKs:
- **`@sentry/browser`**: Client-side (browser) error tracking
- **`@sentry/cloudflare`**: Server-side (Cloudflare Workers) error tracking

Error tracking is integrated into the existing `logger` utility, so all `logger.error()` and `logger.warn()` calls automatically send errors to Sentry in production.

## Setup Instructions

### 1. Create a Sentry Project

1. Sign up at [sentry.io](https://sentry.io)
2. Create a new project
3. Select **Browser** as the platform (we'll add Workers later)
4. Get your DSN from the project settings

### 2. Configure Environment Variables

Add the following to your `.env.local`:

```bash
# Browser-side DSN (required for client-side tracking)
NEXT_PUBLIC_SENTRY_DSN=https://your-public-key@sentry.io/your-project-id

# Server-side DSN (required for server-side tracking)
SENTRY_DSN=https://your-public-key@sentry.io/your-project-id

# Optional: Release version for tracking (recommended for production)
SENTRY_RELEASE=your-release-version

# Optional: For source map uploads (recommended for production)
SENTRY_AUTH_TOKEN=your-sentry-auth-token
SENTRY_ORG=your-sentry-organization-slug
SENTRY_PROJECT=your-sentry-project-slug
```

**Note:** You can use the same DSN for both `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_DSN`, or create separate projects for browser and server tracking.

### 3. Set Up Cloudflare Workers Environment Variables

For production deployments on Cloudflare Workers:

1. Go to your Cloudflare Workers project settings
2. Navigate to **Settings** > **Variables and Secrets**
3. Add the following variables:
   - `NEXT_PUBLIC_SENTRY_DSN` (same value as local)
   - `SENTRY_DSN` (same value as local)
   - `SENTRY_RELEASE` (optional - your release version, e.g., commit SHA)

### 4. Configure Source Map Uploads (Optional but Recommended)

Source maps allow Sentry to show you the original source code in error reports.

1. Get an auth token from [Sentry Settings > Auth Tokens](https://sentry.io/settings/account/api/auth-tokens/)
2. Create a token with `project:releases` scope
3. Add to `.env.local`:
   ```bash
   SENTRY_AUTH_TOKEN=your-token
   SENTRY_ORG=your-org-slug
   SENTRY_PROJECT=your-project-slug
   ```
4. Use the enhanced build command:
   ```bash
   npm run cf:build:sentry  # Build with source map upload
   npm run cf:deploy:sentry # Build, upload source maps, and deploy
   ```

## Testing

### Development Mode

Visit `/sentry-test` in your browser to test error tracking:

1. Start the dev server: `npm run dev`
2. Navigate to `http://localhost:3000/sentry-test`
3. Click the test buttons to trigger different error types
4. Check your browser console and Sentry dashboard

**Note:** In development mode, errors are logged to console but not sent to Sentry unless you set `NODE_ENV=production`.

### Production Mode

To test in production mode locally:

```bash
NODE_ENV=production npm run build
NODE_ENV=production npm run start
```

Then trigger errors and check your Sentry dashboard.

## Architecture

### Browser-side Tracking

**File:** `src/libs/sentry/client.ts`

- Initializes `@sentry/browser` in the browser
- Configured via `NEXT_PUBLIC_SENTRY_DSN`
- Automatically captures:
  - Unhandled exceptions
  - Promise rejections
  - Errors logged via `logger.error()`
  - Warnings logged via `logger.warn()`

**Integration:**
- `SentryProvider` component in `src/components/providers/SentryProvider.tsx`
- Added to root layout (`src/app/layout.tsx`)
- Error boundaries (`src/app/error.tsx`, `src/app/global-error.tsx`)

### Server-side Tracking

**File:** `src/libs/sentry/server.ts`

- Uses `@sentry/cloudflare` for Cloudflare Workers
- Configured via `SENTRY_DSN` and optional `SENTRY_RELEASE` environment variables
- **No automatic initialization** - `initSentry()` is a no-op function
- Captures errors when explicitly called:
  - Server-side errors via `logger.error()` → `captureException()`
  - Server-side warnings via `logger.warn()` → `captureMessage()`
  - Events only sent in production when `SENTRY_DSN` is present
  - All errors/messages also logged to console

**Cloudflare Workers Configuration:** `wrangler.jsonc`

For Sentry to work properly with Cloudflare Workers, the following configuration is required:

```jsonc
{
  "compatibility_date": "2025-08-16",
  "compatibility_flags": ["nodejs_compat"],
  "version_metadata": {
    "binding": "CF_VERSION_METADATA"
  }
}
```

**Configuration Requirements:**

1. **`compatibility_date: "2025-08-16"` or later**
   - Required for `https.request` API used by Sentry to transmit data
   - This is a Cloudflare Workers runtime feature introduced in this compatibility date

2. **`compatibility_flags: ["nodejs_compat"]`**
   - Enables Node.js APIs required by the Sentry SDK
   - Provides compatibility layer for Node.js-specific functionality

3. **`version_metadata` binding**
   - Optional but recommended for tracking deployment versions
   - Helps correlate errors with specific deployments

### Unified Abstraction

**File:** `src/libs/sentry/index.ts`

- Detects runtime context (browser vs server)
- Routes to appropriate SDK
- Prevents server code from bundling into client

### Logger Integration

**File:** `src/libs/logger.ts`

The logger is enhanced with Sentry integration:

```typescript
// Automatically sends to Sentry in production
logger.error('Something went wrong', { context: 'additional data' })
logger.warn('Potential issue detected', { context: 'additional data' })
```

**Behavior:**
- **All environments:** Logs to console
- **Production only:** Sends to Sentry (if configured)
- **Development:** Only logs to console (no Sentry calls)

## Usage Examples

### Basic Error Logging

```typescript
import { logger } from '@/libs/logger'

// This will log to console and send to Sentry in production
logger.error('API request failed', {
  endpoint: '/api/posts',
  statusCode: 500,
  response: errorResponse,
})
```

### Warning Logging

```typescript
import { logger } from '@/libs/logger'

// This will log to console and send to Sentry in production
logger.warn('Deprecated API usage detected', {
  api: 'oldMethod',
  replacement: 'newMethod',
})
```

### Error Boundaries

Error boundaries automatically capture and send errors to Sentry:

```typescript
// In error.tsx, global-error.tsx, ja/error.tsx
useEffect(() => {
  // Automatically captures to Sentry
  logger.error(`Application error: ${error.message}`, {
    stack: error.stack,
    digest: error.digest,
  })
}, [error])
```

## Server-Side Integration Details

### Cloudflare Workers Runtime Requirements

The server-side Sentry integration for Next.js on Cloudflare Workers (via OpenNext) requires specific Cloudflare Workers runtime configuration:

**Critical Requirements:**

1. **Compatibility Date: `2025-08-16` or later**
   - **Why:** This compatibility date introduces the `https.request` API to the Cloudflare Workers runtime
   - **Purpose:** Sentry SDK uses `https.request` to send error data to Sentry servers
   - **Without it:** Sentry cannot transmit errors to the Sentry backend

2. **Compatibility Flag: `nodejs_compat`**
   - **Why:** Enables Node.js APIs that the Sentry SDK depends on
   - **Purpose:** Provides a compatibility layer for Node.js-specific functionality
   - **Without it:** Sentry SDK initialization will fail due to missing Node.js APIs

**Configuration Example (`wrangler.jsonc`):**
```jsonc
{
  "compatibility_date": "2025-08-16",
  "compatibility_flags": ["nodejs_compat"],
  "version_metadata": {
    "binding": "CF_VERSION_METADATA"
  }
}
```

### Sentry Integration Pattern

Unlike traditional Cloudflare Workers where you wrap the handler with `Sentry.withSentry()`, Next.js apps deployed via OpenNext rely on the Wrangler runtime configuration for Sentry support.

**Implementation Details:**

1. **No Explicit Initialization**
   - `initSentry()` in `src/libs/sentry/server.ts` is a **no-op function** (does nothing)
   - No `Sentry.init()` is called anywhere in the application code
   - Sentry SDK is **not automatically initialized** at app startup

2. **Direct Error Capture**
   - `captureException()` and `captureMessage()` from `@sentry/cloudflare` are exposed
   - These functions work directly when called, without requiring initialization
   - Events are only sent to Sentry in production when `SENTRY_DSN` is present
   - All errors/messages are also logged to console (Cloudflare Workers logs)

3. **Runtime Requirements**
   - Wrangler configuration provides the necessary Node.js APIs
   - `compatibility_date: "2025-08-16"` enables `https.request` for Sentry transmission
   - `compatibility_flags: ["nodejs_compat"]` enables Node.js compatibility layer

### Version Metadata Binding

The `CF_VERSION_METADATA` binding enables Cloudflare's version metadata feature:

**Purpose:**
- Tracks deployment versions automatically
- Useful for correlating errors with specific deployments
- Works alongside `SENTRY_RELEASE` for version tracking

**Configuration:**
```jsonc
{
  "version_metadata": {
    "binding": "CF_VERSION_METADATA"
  }
}
```

### Known Limitations

According to Sentry's official documentation:

1. **Server-side spans display `0ms` duration**
   - This is a security measure Cloudflare Workers implements to prevent timing attacks
   - This is expected behavior, not a bug
   - Errors are still tracked correctly

2. **Requires recent Cloudflare Workers runtime**
   - Must use compatibility date `2025-08-16` or later
   - Older compatibility dates lack required APIs

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SENTRY_DSN` | Yes | Sentry Data Source Name for server-side tracking |
| `SENTRY_RELEASE` | No | Release version (e.g., git commit SHA) for tracking |
| `NEXT_PUBLIC_SENTRY_DSN` | Yes | Browser-side Sentry DSN (can be same as server DSN) |

**Best Practices:**
- Use the same DSN for both browser and server (simpler setup)
- Set `SENTRY_RELEASE` to your git commit SHA or version number
- Keep `SENTRY_AUTH_TOKEN` secure (only for build/deploy, not runtime)

## Configuration Options

### Ignored Errors

The browser SDK is configured to ignore common non-actionable errors:

- Browser extension errors
- Network errors (ChunkLoadError, Failed to fetch)
- Third-party script errors
- Mobile-specific errors

See `src/libs/sentry/client.ts` for the full list.

### Tracing

Performance tracing is **disabled** (`tracesSampleRate: 0`) to reduce overhead and focus on error tracking only.

### Debug Mode

Debug mode is enabled in development:
- Logs Sentry events to console
- Helps verify integration without sending to Sentry

## Build Scripts

| Command | Description |
|---------|-------------|
| `npm run sentry:sourcemaps` | Upload source maps to Sentry |
| `npm run cf:build` | Standard build (no source maps) |
| `npm run cf:build:sentry` | Build + upload source maps |
| `npm run cf:deploy` | Standard deploy (no source maps) |
| `npm run cf:deploy:sentry` | Build + upload source maps + deploy |

## Troubleshooting

### Errors not appearing in Sentry

1. **Check environment variables:**
   ```bash
   echo $NEXT_PUBLIC_SENTRY_DSN
   echo $SENTRY_DSN
   ```

2. **Check NODE_ENV:**
   - Sentry only sends errors in production mode
   - In development, errors are only logged to console

3. **Check browser console:**
   - Look for `[Sentry]` logs
   - Initialization messages confirm setup

4. **Verify DSN:**
   - Ensure DSN is correct (copy from Sentry dashboard)
   - Check for typos or missing characters

### Source maps not working

1. **Verify auth token:**
   - Check `SENTRY_AUTH_TOKEN` is set
   - Verify token has `project:releases` scope

2. **Check build output:**
   - Look for `sentry-cli` upload logs
   - Verify `.open-next` directory contains `.map` files

3. **Use the Sentry build command:**
   ```bash
   npm run cf:build:sentry
   ```

### Test page not accessible

The `/sentry-test` page is only available in development mode (`NODE_ENV=development`). In production, it returns a 403 Forbidden response.

## Security Notes

- **DSN is public:** The browser DSN (`NEXT_PUBLIC_SENTRY_DSN`) is exposed in client-side code. This is expected and safe.
- **Auth token is private:** Never expose `SENTRY_AUTH_TOKEN` in client-side code or public repositories.
- **Test route disabled:** The `/sentry-test` page and `/api/sentry-test` route are disabled in production for security.

## Additional Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [Sentry Browser SDK](https://docs.sentry.io/platforms/javascript/)
- [Sentry Cloudflare SDK](https://docs.sentry.io/platforms/javascript/guides/cloudflare/)
- [Source Maps Guide](https://docs.sentry.io/platforms/javascript/sourcemaps/)

## Support

If you encounter issues:
1. Check the Sentry dashboard for error details
2. Review browser console for `[Sentry]` logs
3. Verify environment variables are set correctly
4. Check this documentation for troubleshooting steps
