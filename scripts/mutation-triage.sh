#!/usr/bin/env bash
# Local mutation triage helper for chunk-testing-gaps skill.
set -euo pipefail
cd "$(dirname "$0")/.."

apply_and_test() {
  local id="$1"
  local file="$2"
  local search="$3"
  local replace="$4"
  local test_cmd="$5"

  echo "=== $id ==="
  cp "$file" "${file}.bak"
  sed -i "s|${search}|${replace}|" "$file"

  local exit_code=0
  eval "$test_cmd" >/tmp/mut-${id}.log 2>&1 || exit_code=$?

  git diff "$file" > "/tmp/mut-${id}.patch" || true
  mv "${file}.bak" "$file"

  if [ "$exit_code" -eq 0 ]; then
    echo "SURVIVOR (tests passed)"
    echo "PATCH: /tmp/mut-${id}.patch"
  else
    echo "KILLED (exit $exit_code)"
    rm -f "/tmp/mut-${id}.patch"
  fi
  echo
}

apply_and_test "MUT-001" \
  "src/libs/projectStatus.utils.ts" \
  "return status === 'active' ? 'green' : 'gray'" \
  "return status !== 'active' ? 'green' : 'gray'" \
  "pnpm vitest run src/libs/projectStatus.utils.test.ts"

apply_and_test "MUT-002" \
  "src/libs/projectStatus.utils.ts" \
  "return entry\[isJapanese ? 'ja' : 'en'\]" \
  "return entry[isJapanese ? 'en' : 'ja']" \
  "pnpm vitest run src/libs/projectStatus.utils.test.ts"

apply_and_test "MUT-003" \
  "src/libs/projectStatus.utils.ts" \
  "return lastUpdateDate >= thresholdDate ? 'active' : 'deprecated'" \
  "return lastUpdateDate > thresholdDate ? 'active' : 'deprecated'" \
  "pnpm vitest run src/libs/projectStatus.utils.test.ts"

apply_and_test "MUT-004" \
  "src/libs/projectStatus.utils.ts" \
  "return isJapanese ? 'アクティブ' : 'Active'" \
  "return isJapanese ? '非推奨' : 'Deprecated'" \
  "pnpm vitest run src/libs/projectStatus.utils.test.ts"

apply_and_test "MUT-005" \
  "src/libs/sanitize.ts" \
  "if (!str) return str" \
  "if (!str) return ''" \
  "pnpm vitest run src/libs/sanitize.test.ts"

apply_and_test "MUT-006" \
  "src/libs/stats/aggregate.ts" \
  "const name = item.dataSource?.name ?? 'Unknown'" \
  "const name = item.dataSource?.name ?? 'unknown'" \
  "pnpm vitest run src/libs/stats/aggregate.test.ts"

apply_and_test "MUT-007" \
  "src/libs/blogCard/blogCardTransformer.ts" \
  "if (!url.startsWith('http://') && !url.startsWith('https://')) {" \
  "if (false && !url.startsWith('http://') && !url.startsWith('https://')) {" \
  "pnpm vitest run src/libs/blogCard/blogCardTransformer.test.ts src/libs/blogCard/blogCardTransformer.property.test.ts"

apply_and_test "MUT-008" \
  "src/libs/translator/translator.ts" \
  "if (!text.trim()) {" \
  "if (false && !text.trim()) {" \
  "pnpm vitest run src/libs/translator/translator.test.ts"

apply_and_test "MUT-CTRL" \
  "src/libs/logger.ts" \
  "if (isDevelopment) {" \
  "if (false \&\& isDevelopment) {" \
  "pnpm vitest run src/libs/logger.test.ts"
