#!/usr/bin/env bash
set -e

# Claude Code pre-tool-use hook matcher
# Intercepts git push commands to run quality checks

# Read stdin (JSON payload from Claude Code)
input=$(cat)

# Extract the command using jq
command=$(echo "$input" | jq -r '.command // empty')

# Check if this is a git push command
if echo "$command" | grep -q "git push"; then
  # Check for bypass flag
  if [ "${SKIP_PREPUSH_CHECKS}" = "1" ]; then
    echo "{\"shouldIntercept\": false, \"message\": \"⚠️  Pre-push checks bypassed via SKIP_PREPUSH_CHECKS=1\"}"
    exit 0
  fi

  # Intercept and delegate to pre-push.sh
  if bash "$(dirname "$0")/pre-push.sh"; then
    echo "{\"shouldIntercept\": false, \"message\": \"✅ Pre-push quality checks passed\"}"
  else
    echo "{\"shouldIntercept\": true, \"message\": \"❌ Pre-push quality checks failed. Fix issues or bypass with: SKIP_PREPUSH_CHECKS=1 git push\"}"
    exit 1
  fi
else
  # Not a git push command, allow through
  echo "{\"shouldIntercept\": false}"
fi
