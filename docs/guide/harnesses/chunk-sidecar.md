# Running CircleCI Chunk sidecar on Cursor Cloud Agents

This project validates Cloud Agent work on a **CircleCI Chunk sidecar** — a remote VM that runs the same quality gates as local pre-push checks.

## Prerequisites

- **Cursor Cloud Agent** with repo access
- **CIRCLECI_TOKEN** in Cloud Agent Secrets (enables `chunk validate --remote`)
- **pnpm** (installed by `environment.json` via corepack)

## Layout

```text
project/
├── .chunk/
│   └── config.json       # Sidecar image, gate commands, VCS binding
├── .cursor/
│   ├── hooks.json        # Commit gate + stop-hook remote validation
│   ├── hooks/
│   │   ├── chunk-commit-gate.sh
│   │   └── chunk-validate-stop.sh
│   └── setup-chunk.sh    # Installs Chunk CLI + SSH identity
├── AGENTS.md             # Cursor primary instructions
└── environment.json      # Cloud Agent install script
```

## Gate commands

Configured in `.chunk/config.json`:

| Command | Run | Role |
| --- | --- | --- |
| `install` | `pnpm install --frozen-lockfile` | Dependency install on sidecar |
| `lint` | `pnpm lint:check` | Gate (remote) |
| `test` | `pnpm test` | Gate (remote) |
| `build` | `pnpm build` | Gate (remote) |

## How hooks work

| Cursor hook | Script | When | What |
| --- | --- | --- | --- |
| `beforeShellExecution` (matcher: `git commit`) | `chunk-commit-gate.sh` | Before commit | Local lint + test + build |
| `stop` | `chunk-validate-stop.sh` | Agent turn end | `chunk validate --remote` on sidecar |

**Cloud Agents:** Only `.cursor/hooks.json` in the repo applies. User-level `~/.cursor/hooks.json` is unavailable.

## Usage

After the Cloud Agent VM boots:

```bash
# Manual remote validation
chunk validate --remote

# Disable hooks temporarily
export CHUNK_HOOKS_DISABLED=1
# or: touch .chunk/hooks-disabled
```

## Setup details

`setup-chunk.sh` installs a pinned Chunk CLI release from [CircleCI-Public/chunk-cli](https://github.com/CircleCI-Public/chunk-cli) with checksum verification, generates `~/.ssh/chunk_ai` if missing, and adds `~/.local/bin` to PATH.

## Sidecar configuration

- **VCS**: `hideokamoto/hidetaka.dev.2023`
- **Sidecar image**: see `validation.sidecarImage` in `.chunk/config.json`
- **Runtime tracking**: `.chunk/sidecar.json` (gitignored)

## Troubleshooting

| Issue | Fix |
| --- | --- |
| `chunk: command not found` | Run `bash .cursor/setup-chunk.sh` |
| Remote validation auth failure | Set `CIRCLECI_TOKEN` in Cloud Agent Secrets |
| Hooks skipped | Check `CHUNK_HOOKS_DISABLED` or `.chunk/hooks-disabled` |
| Commit blocked | Fix lint/test/build failures reported by `chunk-commit-gate.sh` |
