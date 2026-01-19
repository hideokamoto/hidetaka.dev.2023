# Sentry Error Tracking Setup

This guide explains how Sentry error tracking is configured in this project for both browser and Cloudflare Workers environments.

## Overview

The project uses dual Sentry SDKs to provide error tracking across different runtime environments:

- **Browser**: `@sentry/browser` for client-side error tracking
- **Cloudflare Workers**: `@sentry/cloudflare` for server-side error tracking

## Architecture

```
src/libs/sentry/
├── client.ts        # Browser SDK (@sentry/browser)
├── server.ts        # Workers SDK (@sentry/cloudflare)
├── index.ts         # Unified abstraction layer
├── client.test.ts   # Browser SDK tests
└── server.test.ts   # Workers SDK tests
```

### Key Features

1. **Automatic Runtime Detection**: The unified abstraction (`index.ts`) automatically routes to the appropriate SDK
2. **Production-Only Sending**: Errors are only sent to Sentry in production mode
3. **Logger Integration**: The existing logger (`src/libs/logger.ts`) automatically sends errors to Sentry
4. **Error Boundary Integration**: All error boundaries use the logger, which integrates with Sentry
5. **Source Map Support**: Production builds include source maps for proper error debugging

## Environment Variables

### Required for Browser Tracking

Add to `.env.local`:

```bash
# Browser-side DSN (must be prefixed with NEXT_PUBLIC_)
NEXT_PUBLIC_SENTRY_DSN=https://your-public-key@sentry.io/your-project-id
```

### Required for Server Tracking (Cloudflare Workers)

Set in Cloudflare Pages environment variables:

```bash
# Server-side DSN for Cloudflare Workers
SENTRY_DSN=https://your-public-key@sentry.io/your-project-id
```

### Required for Source Map Uploads

Add to `.env.local` (for CI/CD):

```bash
# Sentry CLI configuration for source map uploads
SENTRY_AUTH_TOKEN=your-sentry-auth-token
SENTRY_ORG=your-sentry-organization-slug
SENTRY_PROJECT=your-sentry-project-slug
```

## Getting Your Sentry DSN

1. Sign up at [sentry.io](https://sentry.io)
2. Create a new project (choose "Next.js" as the platform)
3. Copy the DSN from: **Settings > Projects > [Your Project] > Client Keys (DSN)**
4. The DSN format: `https://[public-key]@[sentry-host]/[project-id]`

## Usage

### Automatic Error Capture

All error boundaries automatically capture errors:

```tsx
// src/app/error.tsx
// Errors are automatically sent to Sentry via logger.error()
```

### Manual Error Capture via Logger

```typescript
import { logger } from '@/libs/logger'

// Capture an error with context
logger.error('Payment processing failed', {
  userId: user.id,
  amount: order.total,
  orderId: order.id,
})

// Capture a warning with context
logger.warn('API rate limit approaching', {
  endpoint: '/api/posts',
  remainingRequests: 10,
})
```

### Direct Sentry SDK Usage (Advanced)

```typescript
// Browser context
import { captureException, captureMessage } from '@/libs/sentry/client'

try {
  // some code
} catch (error) {
  captureException(error, {
    extra: {
      component: 'PaymentForm',
      action: 'submit',
    },
  })
}

// Server context (Cloudflare Workers)
import { captureException, captureMessage } from '@/libs/sentry/server'

export async function GET(request: Request) {
  try {
    // some code
  } catch (error) {
    captureException(error, {
      extra: {
        url: request.url,
        method: request.method,
      },
    })
    throw error
  }
}
```

### Unified Abstraction (Runtime Agnostic)

```typescript
import { captureException } from '@/libs/sentry'

// Automatically routes to browser or server SDK
captureException(error, { userId: '123' })
```

## Testing Sentry Integration

### Development Testing Page

Visit `/test-sentry` in development mode to access the test UI:

```bash
npm run dev
# Visit http://localhost:3000/test-sentry
```

The test page provides buttons to:
- Trigger browser errors (thrown exceptions)
- Log browser errors/warnings via logger
- Trigger server errors/warnings via API route
- Test server exceptions

### API Route Testing

Test the API route directly:

```bash
# Test server error
curl http://localhost:3000/api/test-sentry?type=error

# Test server warning
curl http://localhost:3000/api/test-sentry?type=warning

# Test server exception
curl http://localhost:3000/api/test-sentry?type=exception
```

### Verification Checklist

- [ ] Browser errors appear in console (development mode)
- [ ] Browser errors appear in Sentry dashboard (production mode)
- [ ] Server errors appear in console (development mode)
- [ ] Server errors are attempted to be sent to Sentry (production mode, requires OpenNext integration)
- [ ] Error context includes custom tags (`source: 'logger'`)
- [ ] Error context includes extra data (context object)
- [ ] Source maps are uploaded and errors show correct file/line numbers
- [ ] Error boundaries capture and report errors

## Source Map Upload

### Manual Upload

After building for Cloudflare:

```bash
npm run cf:build:sentry
```

This runs:
1. `npm run cf:build` - Build the project
2. `npm run sentry:sourcemaps` - Upload source maps to Sentry

### Production Deployment

Use the combined script that builds and uploads source maps:

```bash
npm run cf:deploy:sentry
```

This ensures source maps are uploaded before deployment.

### CI/CD Integration

In your CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
- name: Build and deploy with source maps
  env:
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
    SENTRY_ORG: ${{ secrets.SENTRY_ORG }}
    SENTRY_PROJECT: ${{ secrets.SENTRY_PROJECT }}
  run: npm run cf:deploy:sentry
```

## Configuration Details

### Browser SDK Configuration

Location: `src/libs/sentry/client.ts`

Key settings:
- `tracesSampleRate: 0` - Disable performance tracing (errors only)
- `ignoreErrors` - Filter out common browser extension errors
- `beforeSend` - Add runtime tag (`runtime: 'browser'`)

### Workers SDK Configuration

Location: `src/libs/sentry/server.ts`

Key settings:
- `tracesSampleRate: 0` - Disable performance tracing (errors only)
- `beforeSend` - Add runtime tag (`runtime: 'cloudflare-workers'`)

### Next.js Configuration

Location: `next.config.ts`

```typescript
{
  // Enable source maps for production builds
  productionBrowserSourceMaps: true
}
```

## Behavior in Different Environments

### Development Mode (`NODE_ENV=development`)

- ✅ Errors logged to console
- ❌ Errors **NOT** sent to Sentry
- ✅ Warnings logged to console
- ❌ Warnings **NOT** sent to Sentry
- 🎯 Reason: Avoid noise in Sentry from local development

### Production Mode (`NODE_ENV=production`)

- ✅ Errors logged to console
- ✅ Errors **SENT** to Sentry
- ✅ Warnings logged to console
- ✅ Warnings **SENT** to Sentry
- 🎯 Reason: Track real user errors in production

## Troubleshooting

### Errors not appearing in Sentry (Production)

1. **Check DSN Configuration**
   - Browser: Verify `NEXT_PUBLIC_SENTRY_DSN` is set
   - Server: Verify `SENTRY_DSN` is set in Cloudflare environment
   - DSN format must be: `https://[key]@[host]/[project-id]`

2. **Check Environment Mode**
   - Sentry only sends in `NODE_ENV=production`
   - Development mode only logs to console

3. **Check Browser Console**
   - Look for Sentry initialization messages:
     - `[Sentry] Browser SDK initialized`
     - `[Sentry] Cloudflare Workers SDK initialized`
   - Look for Sentry warnings:
     - `[Sentry] Browser DSN not configured`

4. **Check Sentry Dashboard**
   - Go to: Issues > [Select Time Range]
   - Filter by environment: `production`
   - Check if project is receiving any events

### Source maps not working

1. **Verify Source Maps are Generated**
   ```bash
   npm run build
   # Check .next/static/chunks/*.map files exist
   ```

2. **Verify Source Maps are Uploaded**
   ```bash
   npm run cf:build:sentry
   # Check for Sentry CLI output
   ```

3. **Verify Sentry CLI Configuration**
   - `SENTRY_AUTH_TOKEN` is set
   - `SENTRY_ORG` matches your organization slug
   - `SENTRY_PROJECT` matches your project slug

4. **Check Sentry Release**
   - Go to: Releases > [Latest Release]
   - Verify source maps are attached

### "Sentry not initialized" warnings

This is normal in these scenarios:
- Development mode (DSN not configured)
- Server-side rendering (before client hydration)
- First render before SentryProvider mounts

The warning is informational and won't affect functionality.

## Best Practices

1. **Always use logger for error reporting**
   ```typescript
   // ✅ Good: Uses logger (automatically sends to Sentry)
   logger.error('Failed to load user', { userId })

   // ❌ Bad: Direct console.error (not sent to Sentry)
   console.error('Failed to load user', userId)
   ```

2. **Include meaningful context**
   ```typescript
   // ✅ Good: Rich context for debugging
   logger.error('API request failed', {
     endpoint: '/api/users',
     statusCode: 500,
     userId: user.id,
     timestamp: new Date().toISOString(),
   })

   // ❌ Bad: Minimal context
   logger.error('API request failed')
   ```

3. **Use appropriate severity levels**
   ```typescript
   // Errors: Actual failures that need investigation
   logger.error('Payment processing failed', context)

   // Warnings: Potential issues or deprecated usage
   logger.warn('API rate limit approaching', context)

   // Logs: Development-only debugging (not sent to Sentry)
   logger.log('User clicked button', context)
   ```

4. **Don't log sensitive data**
   ```typescript
   // ❌ Bad: Includes sensitive data
   logger.error('Auth failed', {
     password: user.password, // NEVER log passwords
     token: authToken,        // NEVER log tokens
   })

   // ✅ Good: Safe context
   logger.error('Auth failed', {
     userId: user.id,
     reason: 'invalid_credentials',
   })
   ```

## Additional Resources

- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Cloudflare Workers Documentation](https://docs.sentry.io/platforms/javascript/guides/cloudflare/)
- [Sentry CLI Documentation](https://docs.sentry.io/cli/)

## Summary

This project's Sentry setup provides:
- ✅ Browser error tracking with `@sentry/browser`
- ✅ Server error tracking with `@sentry/cloudflare`
- ✅ Unified abstraction for runtime-agnostic error capture
- ✅ Automatic integration via logger
- ✅ Error boundary integration
- ✅ Source map support for production debugging
- ✅ Development testing tools
- ✅ Production-only error sending

All errors and warnings are automatically captured in production mode when DSN is configured.
