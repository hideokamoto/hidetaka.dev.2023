#!/usr/bin/env bash
# Fast local gate before git commit on Cloud Agent VMs.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

payload=""
if [ ! -t 0 ]; then
  payload="$(cat || true)"
fi

command=""
if [ -n "$payload" ] && command -v jq >/dev/null 2>&1; then
  command="$(printf '%s' "$payload" | jq -r '.command // empty' 2>/dev/null || true)"
fi

case "${command}" in
  "git commit"* | *" git commit"*) ;;
  *)
    printf '{"permission":"allow"}\n'
    exit 0
    ;;
esac

cd "$REPO_ROOT"
corepack enable pnpm
pnpm install --frozen-lockfile
if ! (CI=true pnpm lint:check && CI=true pnpm test && CI=true pnpm build); then
  printf '{"permission":"deny","user_message":"Commit blocked: lint, test, or build failed.","agent_message":"Fix lint/test/build failures before committing."}\n'
  exit 2
fi

printf '{"permission":"allow","user_message":"Pre-commit checks passed."}\n'
exit 0
