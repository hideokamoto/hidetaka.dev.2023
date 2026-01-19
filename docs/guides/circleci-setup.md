# CircleCI Setup Guide

This document provides comprehensive documentation for the CircleCI CI/CD pipeline configured for Hidetaka.dev.

## Table of Contents

- [Workflow Overview](#workflow-overview)
- [Job Descriptions](#job-descriptions)
- [Free Plan Optimizations](#free-plan-optimizations)
- [Environment Variables](#environment-variables)
- [Deployment Strategy](#deployment-strategy)
- [Manual Cleanup](#manual-cleanup)
- [Troubleshooting](#troubleshooting)

## Workflow Overview

The CircleCI pipeline implements a sequential build-test-deploy workflow with the following job dependency structure:

```
┌──────┐
│ lint │
└───┬──┘
    │
    ├─────────┬─────────┐
    │         │         │
    ▼         ▼         │
┌──────┐  ┌──────────┐ │
│ test │  │ cf-build │ │
└──────┘  └────┬─────┘ │
               │       │
               ├───────┘
               │
               ▼
          ┌─────────────────┐
          │   Deploy Jobs   │
          ├─────────────────┤
          │ • production    │ (main branch only)
          │ • branch        │ (all except main)
          └─────────────────┘
```

**Workflow Name:** `build-test-deploy`

**Job Execution Order:**
1. **lint** - Code quality checks (entry point)
2. **test** & **cf-build** - Run in parallel after lint passes
3. **deploy-production** OR **deploy-branch** - Based on branch filter

## Job Descriptions

### 1. `lint` Job

**Purpose:** Run Biome linter checks to ensure code quality and consistency

**Key Steps:**
- Checkout code
- Install npm packages (via `circleci/node@5` orb with automatic caching)
- Run `npm run lint:check` (Biome check without auto-fix)

**Timeout:** 5 minutes

**Dependencies:** None (entry point)

**Why This Matters:**
- Catches code quality issues early
- Ensures accessibility compliance
- Validates TypeScript correctness
- Prevents merge of poorly formatted code

### 2. `test` Job

**Purpose:** Run unit tests with coverage reporting using Vitest

**Key Steps:**
- Checkout code
- Install npm packages
- Run `npm run test:coverage` (Vitest with @vitest/coverage-v8)
- Store coverage artifacts for viewing in CircleCI UI

**Timeout:** 10 minutes

**Dependencies:** Requires `lint` job to pass

**Artifacts:**
- Coverage reports stored at `coverage/` directory
- Viewable in CircleCI UI under "Artifacts" tab

### 3. `cf-build` Job

**Purpose:** Build the Next.js application for Cloudflare Workers deployment using OpenNext

**Key Steps:**
- Checkout code
- Install npm packages
- Set `MICROCMS_API_MODE=mock` environment variable (avoids API calls during build)
- Run `npm run cf:build` (converts Next.js to OpenNext Cloudflare format)
- Persist `.open-next/` directory to workspace (1-day retention)
- Store build artifacts for inspection

**Timeout:** 10 minutes

**Dependencies:** Requires `lint` job to pass

**Environment Variables:**
- `MICROCMS_API_MODE=mock` - Uses mock data instead of real API

**Workspace Persistence:**
- Root: `.` (project root)
- Paths: `.open-next` (build output)
- Retention: 1 day (Free plan optimization)

**Why Mock Mode:**
- Avoids consuming microCMS API quota during builds
- Faster builds (no network requests)
- Enables builds without production API keys

### 4. `deploy-production` Job

**Purpose:** Deploy to production Cloudflare Worker (main branch only)

**Key Steps:**
- Checkout code
- Attach workspace (restore `.open-next/` from cf-build job)
- Install npm packages
- Export `WORKER_NAME="hidetaka-dev"`
- Run `npx wrangler deploy`

**Branch Filter:** Only runs on `main` branch

**Dependencies:** Requires `cf-build` job to pass

**Required Environment Variables:**
- `CLOUDFLARE_API_TOKEN` - API token with Workers deploy permissions
- `CLOUDFLARE_ACCOUNT_ID` - Cloudflare account ID
- `MICROCMS_API_KEY` - microCMS API key (for production runtime)
- `OG_IMAGE_GEN_AUTH_TOKEN` - OG image generation auth token

**Deployment Command:**
- `wrangler deploy` - Supports Durable Objects migrations and production deployment

### 5. `deploy-branch` Job

**Purpose:** Deploy preview environments for feature branches

**Key Steps:**
- Checkout code
- Attach workspace (restore `.open-next/` from cf-build job)
- Install npm packages
- Generate unique worker name from branch name:
  - Sanitize branch name (replace non-alphanumeric with `-`)
  - Truncate to 50 characters
  - Format: `hidetaka-dev-preview-{branch}`
- Export `WORKER_NAME` environment variable
- Run `npx wrangler versions upload` (upload new version)
- Run `npx wrangler versions deploy` (deploy version)
- Echo preview URL: `https://{WORKER_NAME}.workers.dev`

**Branch Filter:** Runs on all branches except `main`

**Dependencies:** Requires `cf-build` job to pass

**Required Environment Variables:**
- `CLOUDFLARE_API_TOKEN` - API token with Workers deploy permissions
- `CLOUDFLARE_ACCOUNT_ID` - Cloudflare account ID
- `MICROCMS_API_KEY` - microCMS API key (for preview runtime)
- `OG_IMAGE_GEN_AUTH_TOKEN` - OG image generation auth token

**Deployment Strategy:**
- Uses `wrangler versions` API for preview deployments
- Each branch gets a unique worker name
- Preview URL printed to console after deployment

## Free Plan Optimizations

CircleCI Free plan provides **6,000 build minutes/month** for open-source projects. This configuration is optimized for minimal resource consumption:

### 1. Small Resource Class

```yaml
executors:
  default:
    docker:
      - image: cimg/node:22.1
    resource_class: small
```

- **Resource Class:** `small` (1 vCPU, 2GB RAM)
- **Cost:** Lower credit consumption vs medium/large
- **Performance:** Sufficient for Next.js builds and tests

### 2. Automatic Caching via Node Orb

```yaml
- node/install-packages:
    pkg-manager: npm
```

The `circleci/node@5` orb automatically:
- Caches `node_modules/` based on `package-lock.json` checksum
- Restores cache on subsequent builds
- Reduces npm install time from ~30s to ~5s

### 3. Workspace Retention

```yaml
- persist_to_workspace:
    root: .
    paths:
      - .open-next
```

- **Retention:** 1 day (default)
- **Purpose:** Share build output between jobs without re-building
- **Benefit:** Avoids redundant builds in deploy jobs

### 4. Strategic Timeouts

- **lint:** 5 minutes (typically completes in <1 min)
- **test:** 10 minutes (typically completes in <2 min)
- **cf-build:** 10 minutes (typically completes in <3 min)

Timeouts prevent runaway jobs from consuming credits.

### 5. Parallel Test/Build Execution

```yaml
- test:
    requires:
      - lint
- cf-build:
    requires:
      - lint
```

Both `test` and `cf-build` run in parallel after `lint` passes, reducing total workflow time.

## Environment Variables

Environment variables must be configured in CircleCI project settings:

**Settings → hidetaka.dev → Environment Variables**

### Required Variables

| Variable | Purpose | Where to Get |
|----------|---------|--------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare Workers deployment authentication | Cloudflare Dashboard → My Profile → API Tokens → Create Token (Edit Cloudflare Workers template) |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account identifier | Cloudflare Dashboard → Workers & Pages → Overview → Account ID (right sidebar) |
| `MICROCMS_API_KEY` | microCMS API key for content fetching | microCMS Dashboard → API Settings → API Key |
| `OG_IMAGE_GEN_AUTH_TOKEN` | OG image generation authentication token | Custom service or leave blank if not used |

### Creating Cloudflare API Token

1. Go to Cloudflare Dashboard → My Profile → API Tokens
2. Click "Create Token"
3. Use "Edit Cloudflare Workers" template
4. Configure permissions:
   - **Account** → **Workers Scripts** → **Edit**
   - **Account** → **Workers KV Storage** → **Edit** (if using KV)
   - **Zone** → **Workers Routes** → **Edit** (if using custom domains)
5. Set Account Resources: Include your account
6. Create token and copy (shown only once!)
7. Add to CircleCI as `CLOUDFLARE_API_TOKEN`

### Getting Cloudflare Account ID

1. Go to Cloudflare Dashboard
2. Navigate to Workers & Pages
3. Look for "Account ID" in the right sidebar
4. Copy and add to CircleCI as `CLOUDFLARE_ACCOUNT_ID`

### Optional Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `MICROCMS_API_MODE` | (none) | Set to `mock` to use mock data instead of API |

**Note:** `MICROCMS_API_MODE=mock` is set in the `cf-build` job by default to avoid API calls during builds.

## Deployment Strategy

### Production Deployment (main branch)

**Command:** `npx wrangler deploy`

**Why `wrangler deploy`:**
- Full deployment with migrations support
- Handles Durable Objects migrations automatically
- Updates production worker in-place
- Supports custom domains and routes
- Production-grade deployment

**Worker Name:** `hidetaka-dev` (hardcoded)

**Deployment URL:** `https://hidetaka-dev.workers.dev` or custom domain

**When It Runs:**
- Automatically on every push to `main` branch
- After `cf-build` job completes successfully

### Branch Preview Deployments

**Commands:**
1. `npx wrangler versions upload` - Upload new version
2. `npx wrangler versions deploy` - Deploy version

**Why `wrangler versions`:**
- Gradual rollouts (though we deploy at 100%)
- Version management
- Easier rollback capability
- Suitable for preview environments

**Worker Name Generation:**
```bash
BRANCH_NAME=$(echo "${CIRCLE_BRANCH}" | sed 's/[^a-zA-Z0-9-]/-/g' | cut -c1-50)
export WORKER_NAME="hidetaka-dev-preview-${BRANCH_NAME}"
```

**Example Worker Names:**
- Branch: `claude/setup-circleci-config-O794P`
- Worker: `hidetaka-dev-preview-claude-setup-circleci-config-O794P`
- URL: `https://hidetaka-dev-preview-claude-setup-circleci-config-O794P.workers.dev`

**When It Runs:**
- Automatically on every push to non-main branches
- After `cf-build` job completes successfully

### Deployment Differences

| Aspect | Production (`wrangler deploy`) | Preview (`wrangler versions`) |
|--------|-------------------------------|-------------------------------|
| Command | `wrangler deploy` | `wrangler versions upload/deploy` |
| Branch | `main` only | All except `main` |
| Worker Name | `hidetaka-dev` | `hidetaka-dev-preview-{branch}` |
| Migrations | Supported | Limited support |
| Rollback | Manual revert | Version-based |
| Custom Domains | Supported | Not configured |

## Manual Cleanup

**Important:** Preview workers are **NOT automatically deleted** when branches are deleted or merged.

### Why Manual Cleanup Is Needed

- Each preview deployment creates a new Cloudflare Worker
- Workers persist even after branch deletion
- Cloudflare Free plan has limits on number of workers
- Old preview workers consume account quota

### Cleanup Process

**1. List All Workers**

```bash
npx wrangler list
```

Output:
```
hidetaka-dev
hidetaka-dev-preview-claude-feature-a
hidetaka-dev-preview-claude-feature-b
```

**2. Delete Preview Worker**

```bash
npx wrangler delete --name hidetaka-dev-preview-claude-feature-a
```

Or with environment variable:

```bash
WORKER_NAME="hidetaka-dev-preview-claude-feature-a" npx wrangler delete
```

**3. Verify Deletion**

```bash
npx wrangler list
```

### Recommended Cleanup Schedule

- **Weekly:** Review and delete merged branch previews
- **Monthly:** Audit all preview workers and remove unused ones
- **After PR merge:** Delete corresponding preview worker

### Bulk Cleanup Script

Create a script to delete all preview workers:

```bash
#!/bin/bash
# cleanup-previews.sh

# List all preview workers
PREVIEW_WORKERS=$(npx wrangler list | grep "hidetaka-dev-preview-" | awk '{print $1}')

# Delete each preview worker
for WORKER in $PREVIEW_WORKERS; do
  echo "Deleting ${WORKER}..."
  npx wrangler delete --name "${WORKER}"
done

echo "Cleanup complete"
```

Usage:

```bash
chmod +x cleanup-previews.sh
./cleanup-previews.sh
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Lint Job Fails

**Error:** `npm run lint:check` exits with code 1

**Cause:** Code quality issues, formatting errors, or accessibility violations

**Solution:**
```bash
# Run locally with auto-fix
npm run lint

# Review and fix remaining issues
npm run lint:check
```

**Prevention:** Always run `npm run lint` before committing

---

#### 2. Test Job Fails

**Error:** One or more tests fail

**Cause:** Broken unit tests, incorrect assertions, or missing dependencies

**Solution:**
```bash
# Run tests locally
npm run test

# Run tests in watch mode for debugging
npm run test:watch

# Run with UI for detailed output
npm run test:ui
```

**Common Causes:**
- Changed function signatures without updating tests
- Missing mock data
- Incorrect TypeScript types

---

#### 3. cf-build Job Fails

**Error:** `npm run cf:build` exits with errors

**Cause:** TypeScript compilation errors, missing dependencies, or OpenNext conversion issues

**Solution:**
```bash
# Verify TypeScript builds
npm run build

# Try Cloudflare build locally
npm run cf:build

# Check for TypeScript errors
npx tsc --noEmit
```

**Common Causes:**
- TypeScript type errors
- Missing environment variables (should use `MICROCMS_API_MODE=mock`)
- Incompatible Next.js configuration

---

#### 4. Deploy Job Fails - Missing Workspace

**Error:** `.open-next` directory not found

**Cause:** `attach_workspace` failed or `cf-build` didn't persist workspace

**Solution:**
1. Check if `cf-build` job completed successfully
2. Verify workspace persistence configuration in `cf-build` job
3. Ensure workspace retention hasn't expired (1 day default)

**Fix:**
- Re-run `cf-build` job
- Check CircleCI workflow for failed jobs

---

#### 5. Deploy Job Fails - Authentication Error

**Error:** `Wrangler authentication failed`

**Cause:** Missing or invalid `CLOUDFLARE_API_TOKEN`

**Solution:**
1. Verify token exists: CircleCI → Project Settings → Environment Variables
2. Check token permissions: Must have "Edit Cloudflare Workers" permissions
3. Regenerate token if expired:
   - Cloudflare Dashboard → My Profile → API Tokens
   - Revoke old token
   - Create new token with same permissions
   - Update `CLOUDFLARE_API_TOKEN` in CircleCI

---

#### 6. Deploy Job Fails - Account ID Error

**Error:** `Account ID not found`

**Cause:** Missing or invalid `CLOUDFLARE_ACCOUNT_ID`

**Solution:**
1. Get Account ID from Cloudflare Dashboard → Workers & Pages → Overview
2. Update `CLOUDFLARE_ACCOUNT_ID` in CircleCI Environment Variables
3. Ensure Account ID matches the account where workers should be deployed

---

#### 7. Preview Deployment - Worker Name Too Long

**Error:** `Worker name exceeds maximum length`

**Cause:** Branch name is extremely long, causing truncated name to still exceed limits

**Solution:**
- Use shorter branch names (recommended: <30 characters)
- Modify truncation logic in `deploy-branch` job (reduce from 50 to 30)

```yaml
# In .circleci/config.yml
BRANCH_NAME=$(echo "${CIRCLE_BRANCH}" | sed 's/[^a-zA-Z0-9-]/-/g' | cut -c1-30)
```

---

#### 8. Workflow Not Triggering

**Error:** Push to branch doesn't trigger CircleCI

**Cause:** CircleCI not connected to repository or workflow disabled

**Solution:**
1. Check CircleCI project setup: https://app.circleci.com/
2. Verify repository connection: Project Settings → Overview
3. Check if workflows are enabled: Project Settings → Advanced
4. Ensure `.circleci/config.yml` exists in repository root

---

#### 9. Resource Class Error

**Error:** `Resource class 'small' not available`

**Cause:** Free plan restrictions or account limits

**Solution:**
- Verify Free plan includes `small` resource class
- Check if account is in good standing
- Contact CircleCI support if persists

**Workaround:**
```yaml
# Use medium (consumes more credits)
resource_class: medium
```

---

#### 10. Node Orb Caching Issues

**Error:** Cache not restoring or corrupted cache

**Cause:** Cache key collision or corrupted cache data

**Solution:**
```bash
# In CircleCI UI
# Project Settings → Build Settings → Advanced → Clear Cache
```

Or modify `package-lock.json` to force new cache:

```bash
# Add comment to package.json
npm install --package-lock-only
```

---

### Getting Help

**CircleCI Status:** https://status.circleci.com/

**CircleCI Docs:** https://circleci.com/docs/

**Wrangler Docs:** https://developers.cloudflare.com/workers/wrangler/

**Support Channels:**
- CircleCI Community: https://discuss.circleci.com/
- Cloudflare Discord: https://discord.gg/cloudflaredev
- GitHub Issues: https://github.com/hideokamoto/hidetaka.dev.2023/issues

---

## Additional Resources

### Related Documentation

- **Main README:** `/README.md` - Project setup and deployment overview
- **CLAUDE.md:** `/CLAUDE.md` - Comprehensive development guide
- **Component System:** `/docs/guides/component-system.md` - Component architecture
- **Design Guidelines:** `/docs/guides/design-guidelines.md` - Design system specs

### External References

- **CircleCI Orbs:** https://circleci.com/developer/orbs
- **CircleCI Node Orb:** https://circleci.com/developer/orbs/orb/circleci/node
- **Wrangler CLI:** https://developers.cloudflare.com/workers/wrangler/commands/
- **OpenNext Cloudflare:** https://opennext.js.org/cloudflare
- **Next.js Deployment:** https://nextjs.org/docs/deployment

---

**Last Updated:** 2026-01-19
**Document Version:** 1.0.0
