# AGENTS.md

## CircleCI Chunk sidecar on Cursor Cloud Agents

This project uses **CircleCI Chunk** to validate agent work on a remote sidecar VM. Cloud Agents load hooks from `.cursor/hooks.json` and install the Chunk CLI via `environment.json`.

### Harness overview

| Component | Purpose |
| --- | --- |
| `environment.json` | VM bootstrap: pnpm install + Chunk CLI + SSH key |
| `.cursor/hooks.json` | Commit gate (local) + stop hook (remote validation) |
| `.chunk/config.json` | Sidecar image, gate commands (lint, test, build) |

### Prerequisites

- **CIRCLECI_TOKEN** (or `CIRCLE_TOKEN`) set in Cloud Agent Secrets for remote sidecar validation
- **pnpm** — installed via corepack during VM setup

### How validation works

1. **Before `git commit`**: `chunk-commit-gate.sh` runs `pnpm lint:check`, `pnpm test`, and `pnpm build` locally.
2. **On agent stop**: `chunk-validate-stop.sh` runs `chunk validate --remote`, executing gate commands on the CircleCI sidecar.

Disable hooks with `CHUNK_HOOKS_DISABLED=1` or by creating `.chunk/hooks-disabled`.

### Key commands

| Task | Command |
| --- | --- |
| Remote validation | `chunk validate --remote` |
| Local gate commands | `pnpm lint:check && pnpm test && pnpm build` |

### Documentation

- `docs/guide/harnesses/chunk-sidecar.md` — Chunk sidecar harness guide
- `.chunk/config.json` — project-specific gate configuration

---

## Cursor Cloud specific instructions

### Service overview

This is a bilingual Next.js 16 portfolio site deployed to Cloudflare Workers. Content comes from microCMS and external feeds (WordPress, Dev.to, Qiita, Zenn).

### Running the dev server

```bash
pnpm dev
# → http://localhost:3000
```

### Key commands

| Task | Command |
|------|---------|
| Dev server | `pnpm dev` |
| Lint check | `pnpm lint:check` |
| Unit tests | `pnpm test` |
| Build | `pnpm build` |
| Pre-push checks | `pnpm pre-push` |

### Non-obvious caveats

- **Package manager**: Use **pnpm** (not npm). Run `corepack enable pnpm` if needed.
- **Pre-push quality gates**: Lint, test, and build must pass before push. Cloud Agent commit hooks enforce the same checks.
- **microCMS**: Set `MICROCMS_API_KEY` in `.env.local` for live content; use `MICROCMS_API_MODE=mock` for offline development.
