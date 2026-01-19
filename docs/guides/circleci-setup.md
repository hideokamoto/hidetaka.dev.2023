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

```text
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

**Purpose:** Deploy to production using Cloudflare Workers versions (main branch only)

**Key Steps:**
- Checkout code
- Attach workspace (restore `.open-next/` from cf-build job)
- Install npm packages
- Run `npx wrangler versions deploy`

**Branch Filter:** Only runs on `main` branch

**Dependencies:** Requires both `cf-build` and `test` jobs to pass

**Required Environment Variables:**
- `CLOUDFLARE_API_TOKEN` - API token with Workers deploy permissions
- `CLOUDFLARE_ACCOUNT_ID` - Cloudflare account ID
- `MICROCMS_API_KEY` - microCMS API key (for production runtime)
- `OG_IMAGE_GEN_AUTH_TOKEN` - OG image generation auth token

**Deployment Command:**
- `wrangler versions deploy` - Deploys the latest version to production

**Architecture:**
- Uses single worker: `hidetaka-dev`
- Version-based deployment for production traffic
- No impact on preview deployments

### 5. `deploy-branch` Job

**Purpose:** Deploy preview environments for feature branches using preview aliases

**Key Steps:**
- Checkout code
- Attach workspace (restore `.open-next/` from cf-build job)
- Install npm packages
- Generate branch alias from branch name:
  - Sanitize branch name (replace non-alphanumeric with `-`)
  - Truncate to 50 characters
  - Format: `{branch-alias}`
- Run `npx wrangler versions upload --preview-alias "${BRANCH_ALIAS}"`
- Echo preview URL: `https://{BRANCH_ALIAS}-hidetaka-dev.workers.dev`

**Branch Filter:** Runs on all branches except `main`

**Dependencies:** Requires both `cf-build` and `test` jobs to pass

**Required Environment Variables:**
- `CLOUDFLARE_API_TOKEN` - API token with Workers deploy permissions
- `CLOUDFLARE_ACCOUNT_ID` - Cloudflare account ID
- `MICROCMS_API_KEY` - microCMS API key (for preview runtime)
- `OG_IMAGE_GEN_AUTH_TOKEN` - OG image generation auth token

**Deployment Strategy:**
- Uses preview aliases feature (same as Cloudflare Workers Builds)
- Single worker with multiple versions
- Each branch gets a stable preview URL
- No separate workers created

**Architecture:**
- Uses single worker: `hidetaka-dev`
- Preview alias per branch: `{branch-alias}-hidetaka-dev.workers.dev`
- Version uploaded with `--preview-alias` flag
- No impact on production traffic

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

### CircleCI Settings Path

Navigate to: Settings → hidetaka.dev → Environment Variables

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

This CircleCI setup uses the same architecture as **Cloudflare Workers Builds** with a single worker and version-based deployments.

### Architecture Overview

```text
┌─────────────────────────────────────────────────┐
│ Single Worker: hidetaka-dev                     │
└─────────────────────────────────────────────────┘
│
├── Production Version (main branch)
│   └── URL: https://hidetaka-dev.workers.dev
│
├── Preview Version (feature/new-ui branch)
│   └── URL: https://feature-new-ui-hidetaka-dev.workers.dev
│
└── Preview Version (fix/bug-123 branch)
    └── URL: https://fix-bug-123-hidetaka-dev.workers.dev
```

### Production Deployment (main branch)

**Command:** `npx wrangler versions deploy`

**How It Works:**
- Uploads new version to the worker
- Deploys version to production (100% traffic)
- Previous versions remain available for rollback
- No impact on preview deployments

**Worker Name:** `hidetaka-dev` (single worker)

**Deployment URL:** `https://hidetaka-dev.workers.dev` or custom domain

**When It Runs:**
- Automatically on every push to `main` branch
- After both `cf-build` and `test` jobs complete successfully

**Benefits:**
- Version-based deployment with rollback capability
- Compatible with Durable Objects migrations
- No worker proliferation
- Same architecture as Workers Builds

### Branch Preview Deployments

**Command:** `npx wrangler versions upload --preview-alias "${BRANCH_ALIAS}"`

**How It Works:**
- Uploads new version with a preview alias
- Creates stable URL for the branch
- No impact on production traffic
- Reusing same branch alias updates the preview

**Preview Alias Generation:**
```bash
# Sanitize and truncate branch name to 50 chars
BRANCH_ALIAS=$(echo "${CIRCLE_BRANCH}" | sed 's/[^a-zA-Z0-9-]/-/g' | cut -c1-50)
```

**Example Preview URLs:**
- Branch: `feature/new-ui` → `https://feature-new-ui-hidetaka-dev.workers.dev`
- Branch: `fix/bug-123` → `https://fix-bug-123-hidetaka-dev.workers.dev`
- Branch: `claude/setup-circleci-config-O794P` → `https://claude-setup-circleci-config-O794P-hidetaka-dev.workers.dev`

**When It Runs:**
- Automatically on every push to non-main branches
- After both `cf-build` and `test` jobs complete successfully

**Benefits:**
- Stable URL per branch (URL doesn't change on new commits)
- No separate workers created
- Automatic cleanup when alias is no longer used
- Same architecture as Workers Builds

### Deployment Comparison

| Aspect | Production | Preview |
|--------|-----------|---------|
| Command | `wrangler versions deploy` | `wrangler versions upload --preview-alias` |
| Branch | `main` only | All except `main` |
| Worker | `hidetaka-dev` (shared) | `hidetaka-dev` (shared) |
| URL Pattern | `hidetaka-dev.workers.dev` | `{alias}-hidetaka-dev.workers.dev` |
| Traffic | 100% production | Preview only (no production impact) |
| Cleanup | Not needed | Automatic (aliases expire when unused) |
| Rollback | Version-based | Version-based |
| Migrations | Supported | Supported (same worker) |

## Preview Management

### No Manual Cleanup Required

**Great News:** Preview aliases are automatically managed by Cloudflare. You **DO NOT** need to manually clean up preview deployments.

### How Preview Aliases Work

- **Single Worker:** All deployments use the same worker (`hidetaka-dev`)
- **Version-Based:** Each deployment creates a new version with a preview alias
- **Automatic Cleanup:** Unused preview aliases are automatically cleaned up by Cloudflare
- **No Worker Proliferation:** You won't accumulate hundreds of workers

### Viewing Active Versions

To see all versions and preview aliases:

```bash
npx wrangler versions list
```

Output example:

```text
Version ID | Created On | Author | Message | Preview Aliases
-----------|-----------|--------|---------|----------------
abc123     | 2026-01-19| bot    | Deploy  | feature-new-ui
def456     | 2026-01-19| bot    | Deploy  | fix-bug-123
ghi789     | 2026-01-18| bot    | Deploy  | (production)
```

### Managing Previews (Optional)

While automatic cleanup handles most cases, you can manually manage preview aliases if needed:

**List all preview aliases:**

```bash
npx wrangler versions list
```

**Remove a specific preview alias:**

```bash
# This removes the alias but keeps the version
npx wrangler versions delete --preview-alias feature-new-ui
```

**Note:** Removing a preview alias does NOT delete the version. The version remains available for rollback and history.

### Benefits of This Approach

✅ **No Manual Cleanup Required** - Cloudflare handles it automatically

✅ **No Worker Quota Issues** - Single worker, unlimited versions

✅ **Stable Preview URLs** - Same URL for subsequent pushes to the same branch

✅ **Version History** - All versions are preserved for rollback

✅ **Same as Workers Builds** - Identical architecture to Cloudflare's official solution

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
1. Check CircleCI project setup: [https://app.circleci.com/](https://app.circleci.com/)
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

**CircleCI Status:** [https://status.circleci.com/](https://status.circleci.com/)

**CircleCI Docs:** [https://circleci.com/docs/](https://circleci.com/docs/)

**Wrangler Docs:** [https://developers.cloudflare.com/workers/wrangler/](https://developers.cloudflare.com/workers/wrangler/)

**Support Channels:**
- CircleCI Community: [https://discuss.circleci.com/](https://discuss.circleci.com/)
- Cloudflare Discord: [https://discord.gg/cloudflaredev](https://discord.gg/cloudflaredev)
- GitHub Issues: [https://github.com/hideokamoto/hidetaka.dev.2023/issues](https://github.com/hideokamoto/hidetaka.dev.2023/issues)

---

## Additional Resources

### Related Documentation

- **Main README:** `/README.md` - Project setup and deployment overview
- **CLAUDE.md:** `/CLAUDE.md` - Comprehensive development guide
- **Component System:** `/docs/guides/component-system.md` - Component architecture
- **Design Guidelines:** `/docs/guides/design-guidelines.md` - Design system specs

### External References

- **CircleCI Orbs:** [https://circleci.com/developer/orbs](https://circleci.com/developer/orbs)
- **CircleCI Node Orb:** [https://circleci.com/developer/orbs/orb/circleci/node](https://circleci.com/developer/orbs/orb/circleci/node)
- **Wrangler CLI:** [https://developers.cloudflare.com/workers/wrangler/commands/](https://developers.cloudflare.com/workers/wrangler/commands/)
- **OpenNext Cloudflare:** [https://opennext.js.org/cloudflare](https://opennext.js.org/cloudflare)
- **Next.js Deployment:** [https://nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)

---

**Last Updated:** 2026-01-19
**Document Version:** 1.0.0
