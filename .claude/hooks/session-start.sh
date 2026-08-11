#!/usr/bin/env bash
set -e

# Claude Code session-start hook
# Runs on session initialization to prepare development environment

echo "🚀 Starting Claude Code session..."

# Check if running in Claude Code remote environment
if [ -n "$CLAUDE_CODE_REMOTE" ]; then
  echo "📦 Installing dependencies..."
  corepack enable
  pnpm install --frozen-lockfile

  echo "🔨 Building project..."
  pnpm run build

  echo "✅ Session setup complete!"
else
  echo "ℹ️  Running in local environment, skipping setup"
fi
