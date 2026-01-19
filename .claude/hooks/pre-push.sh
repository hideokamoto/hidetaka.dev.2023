#!/usr/bin/env bash

# Claude Code pre-push quality gate
# Runs test, lint, and format checks before allowing git push

# Support bypass via environment variable
if [ "${SKIP_PREPUSH_CHECKS}" = "1" ]; then
  echo "⚠️  Pre-push checks bypassed via SKIP_PREPUSH_CHECKS=1"
  exit 0
fi

# Color output variables
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🛡️  Running pre-push quality checks..."
echo ""

# Track overall status
all_passed=true

# Run tests
echo "📝 Running tests..."
if npm run test; then
  echo -e "${GREEN}✅ Tests passed${NC}"
else
  echo -e "${RED}❌ Tests failed${NC}"
  all_passed=false
fi
echo ""

# Run lint check
echo "🔍 Running lint check..."
if npm run lint:check; then
  echo -e "${GREEN}✅ Lint check passed${NC}"
else
  echo -e "${RED}❌ Lint check failed${NC}"
  echo -e "${YELLOW}💡 Run 'npm run lint' to auto-fix issues${NC}"
  all_passed=false
fi
echo ""

# Run format check
echo "💅 Running format check..."
if npm run format:check; then
  echo -e "${GREEN}✅ Format check passed${NC}"
else
  echo -e "${RED}❌ Format check failed${NC}"
  echo -e "${YELLOW}💡 Run 'npm run format' to auto-fix issues${NC}"
  all_passed=false
fi
echo ""

# Final result
if [ "$all_passed" = true ]; then
  echo -e "${GREEN}🎉 All quality checks passed! Safe to push.${NC}"
  exit 0
else
  echo -e "${RED}❌ Quality checks failed. Please fix the issues above.${NC}"
  echo ""
  echo -e "${YELLOW}💡 To bypass checks (NOT RECOMMENDED):${NC}"
  echo -e "${YELLOW}   SKIP_PREPUSH_CHECKS=1 git push${NC}"
  exit 1
fi
