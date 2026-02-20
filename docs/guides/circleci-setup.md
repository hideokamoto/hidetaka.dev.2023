# CircleCI Setup Guide

This document provides documentation for the CircleCI CI/CD pipeline configured for Hidetaka.dev.

## Architecture

This project uses CircleCI's **path-filtering pattern** with setup and continuation workflows for optimal efficiency.

### Two-Config Pattern

**`.circleci/config.yml`** (Setup Workflow):
- Always runs first on every push
- Uses `circleci/path-filtering@1.1.0` orb to detect file changes
- Determines which workflows to trigger based on changed files
- Sets pipeline parameters (`run-lint`, `run-test`, `run-build`, `run-cf-build`, `run-all`)

**`.circleci/continue.yml`** (Continuation Workflows):
- Contains all CI/CD jobs (lint, test, build, cf-build, deploy)
- Workflows execute conditionally based on parameters from setup workflow
- Only runs jobs relevant to the files that changed

### Dynamic Base Revision

The setup workflow uses intelligent base revision detection:

```yaml
base-revision: << pipeline.git.base_revision || (branch == main ? HEAD~1 : HEAD~1) >>
```

**Logic:**
1. **PR builds**: Uses `pipeline.git.base_revision` (merge base with target branch)
2. **First build / API triggers**: Falls back to `HEAD~1` when `base_revision` is empty
3. **Main branch**: Always uses `HEAD~1` to avoid empty diffs (main-vs-main comparison)

This ensures path-filtering always has a valid comparison point.

## Workflows

### Conditional Execution

| Changed Files | Triggered Parameters | Workflows Executed |
|--------------|---------------------|-------------------|
| `src/**/*.ts`, `*.tsx`, `*.js`, `*.jsx` | `run-lint`, `run-test`, `run-build`, `run-cf-build` | lint → test → build/cf-build → deploy |
| `package.json`, `package-lock.json` | `run-lint`, `run-test`, `run-build`, `run-cf-build` | lint → test → build/cf-build → deploy |
| `biome.json`, `tsconfig.json`, `vitest.config.ts` | `run-lint`, `run-test`, `run-build`, `run-cf-build` | lint → test → build/cf-build → deploy |
| `next.config.ts`, `tailwind.config.cjs` | `run-build`, `run-cf-build` | build/cf-build only |
| `wrangler.jsonc` | `run-cf-build` | cf-build only |
| `.circleci/**` | `run-all` | All workflows |
| Documentation (`*.md`) | None | Setup only (~10 seconds) |

### Workflow Dependencies

**lint-workflow:**
- Runs when: `run-lint` or `run-all` is true
- Jobs: `lint`

**test-workflow:**
- Runs when: `run-test` or `run-all` is true
- Jobs: `lint` → `test` (test requires lint to pass)

**build-workflow:**
- Runs when: `run-build` or `run-all` is true
- Jobs: `lint` → `test` → `build` (build requires both lint and test to pass)

**cf-build-workflow:**
- Runs when: `run-cf-build` or `run-all` is true
- Jobs: `lint` → `test` → `cf-build` (cf-build requires both lint and test to pass)

**deploy-workflow:**
- Runs when: `run-all` is true
- Jobs:
  - `lint` → `test` → `cf-build` → `deploy-production` (main branch only)
  - `lint` → `test` → `cf-build` → `deploy-branch` (all other branches)

## Jobs

### lint
- **Executor:** `node/default` (tag: 22.1) with `resource_class: small`
- **Purpose:** Run Biome linter checks
- **Command:** `npm run lint:check`
- **Timeout:** 5 minutes

### test
- **Executor:** `node/default` (tag: 22.1) with `resource_class: small`
- **Purpose:** Run unit tests with coverage
- **Command:** `npm run test:coverage`
- **Timeout:** 10 minutes
- **Artifacts:** Coverage reports at `coverage/`
- **Dependencies:** Requires `lint` to pass

### build
- **Executor:** `node/default` (tag: 22.1) with `resource_class: small`
- **Purpose:** Build standard Next.js application
- **Command:** `npm run build`
- **Timeout:** 10 minutes
- **Environment:** `MICROCMS_API_MODE=mock`
- **Dependencies:** Requires both `lint` and `test` to pass

### cf-build
- **Executor:** `node/default` (tag: 22.1) with `resource_class: small`
- **Purpose:** Build for Cloudflare Workers deployment
- **Command:** `npm run cf:build`
- **Timeout:** 10 minutes
- **Environment:** `MICROCMS_API_MODE=mock`
- **Workspace:** Persists `.open-next/` directory for 1 day (Free plan optimization)
- **Dependencies:** Requires both `lint` and `test` to pass

### deploy-production
- **Executor:** `node/default` (tag: 22.1) with `resource_class: small`
- **Purpose:** Deploy to production (main branch only)
- **Command:** `npx wrangler versions deploy --yes --message "..."`
- **Dependencies:** Requires `cf-build` to pass
- **Branch Filter:** Only runs on `main` branch

### deploy-branch
- **Executor:** `node/default` (tag: 22.1) with `resource_class: small`
- **Purpose:** Upload version for testing (Durable Objects compatible)
- **Command:** `npx wrangler versions upload --message "..."`
- **Output:** Version ID and testing instructions with Version Override header
- **Dependencies:** Requires `cf-build` to pass
- **Branch Filter:** Runs on all branches except `main`

## Durable Objects Constraints

This project uses Durable Objects, which prevents independent preview URL generation for branch deployments.

**Deployment Strategy:**

**Main Branch (Production):**
- Command: `wrangler versions deploy --yes`
- Deploys to: `https://hidetaka-dev-workers.workers.dev`
- 100% production traffic

**Other Branches (Preview):**
- Command: `wrangler versions upload` (without `--preview-alias`)
- No independent preview URL generated
- Test using Version Override header:

```bash
curl https://hidetaka-dev-workers.workers.dev \
  -H 'Cloudflare-Workers-Version-Overrides: hidetaka-dev-workers="<VERSION_ID>"'
```

**Browser Testing:**
1. Install browser extension (e.g., ModHeader)
2. Add header:
   - Name: `Cloudflare-Workers-Version-Overrides`
   - Value: `hidetaka-dev-workers="<VERSION_ID>"`
3. Navigate to `https://hidetaka-dev-workers.workers.dev`

## Free Plan Optimizations

CircleCI Free plan provides **6,000 build minutes/month**. This configuration is optimized for minimal resource consumption:

1. **Path-Filtering** - Only runs jobs when relevant files change (60-80% time savings)
2. **Node Orb Default Executor** - `node/default` with automatic caching
3. **Resource Class** - `small` (1 vCPU, 2GB RAM) for all jobs
4. **Workspace Retention** - 1 day (`days: 1`) to reduce storage costs
5. **Sequential Dependencies** - cf-build requires both lint AND test to pass (prevents wasted builds)
6. **No Branch Filters in Setup** - All feature branches can trigger CI (filters only in deploy jobs)

## Environment Variables

Configure in CircleCI project settings (Settings → Environment Variables):

| Variable | Purpose |
|----------|---------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare Workers deployment authentication |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account identifier |
| `MICROCMS_API_KEY` | microCMS API key for content |
| `OG_IMAGE_GEN_AUTH_TOKEN` | OG image generation auth token |

## Troubleshooting

**Issue:** Path filtering doesn't trigger expected workflows
**Solution:** Check file patterns in `.circleci/config.yml` mapping

**Issue:** Deploy jobs don't run
**Solution:** Verify `run-all` parameter is set (triggered by `.circleci/**` changes)

**Issue:** cf-build fails even though lint/test pass
**Solution:** Both lint AND test must pass for cf-build to run

**Issue:** Feature branch CI doesn't run
**Solution:** Setup workflow has no branch filters - all branches should trigger CI. Check CircleCI dashboard for errors.
