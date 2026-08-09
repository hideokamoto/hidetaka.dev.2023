#!/usr/bin/env bash
# Cursor stop-hook wrapper: drain stdin, then run chunk validate on the sidecar.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
export PATH="${HOME}/.local/bin:${PATH}"

payload=""
if [ ! -t 0 ]; then
  payload="$(cat || true)"
fi

if [ -n "${CHUNK_HOOKS_DISABLED:-}" ] || [ -f "${REPO_ROOT}/.chunk/hooks-disabled" ]; then
  echo "chunk validate: hooks disabled — skipping" >&2
  exit 0
fi

if ! command -v chunk >/dev/null 2>&1; then
  echo "chunk: command not found — run: bash .cursor/setup-chunk.sh" >&2
  exit 2
fi

session_id=""
loop_count=0
if [ -n "$payload" ] && command -v jq >/dev/null 2>&1; then
  session_id="$(printf '%s' "$payload" | jq -r '.session_id // empty' 2>/dev/null || true)"
  loop_count="$(printf '%s' "$payload" | jq -r '.loop_count // 0' 2>/dev/null || echo 0)"
fi
if [ -z "$session_id" ]; then
  session_id="${CURSOR_SESSION_ID:-cursor-stop-$$}"
fi

stop_active="false"
if [ "${loop_count:-0}" -gt 0 ] 2>/dev/null; then
  stop_active="true"
fi

cd "$REPO_ROOT"

hook_json="$(printf '{"session_id":"%s","stop_hook_active":%s}' "$session_id" "$stop_active")"
printf '%s\n' "$hook_json" | chunk validate --remote
status=$?

if [ "$status" -ne 0 ]; then
  exit 2
fi
exit 0
