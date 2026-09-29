#!/usr/bin/env bash
# check-bot-access.sh — hidetaka.dev が検索エンジンクローラーを遮断していないか検証する。
# Cloudflare エッジ (WAF/Bot管理/redirect rules) はアプリより前に403を返し得るため、
# 外部から実際のUAで叩いて確認する。認証不要・curlのみ。
#
# Usage: ./scripts/check-bot-access.sh
# Env:   BASE_URL (default: https://hidetaka.dev), WWW_URL (default: https://www.hidetaka.dev)

set -uo pipefail

BASE_URL="${BASE_URL:-https://hidetaka.dev}"
WWW_URL="${WWW_URL:-https://www.hidetaka.dev}"
CURL_OPTS=(-sS -o /dev/null --max-time 20)

UA_GOOGLEBOT_SP="Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.69 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
UA_GOOGLEBOT_DT="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.69 Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"

failures=0
pass() { printf '  OK    %-62s %s\n' "$1" "$2"; }
fail() { printf '  FAIL  %-62s %s\n' "$1" "$2"; failures=$((failures + 1)); }
warn() { printf '  WARN  %-62s %s\n' "$1" "$2"; }

# fetch_code <url> <user-agent> -> http status (000 on curl error)
fetch_code() {
  curl "${CURL_OPTS[@]}" -w '%{http_code}' -A "$2" "$1" 2>/dev/null || echo "000"
}

# expect_status <name> <url> <ua> <want>
expect_status() {
  local code
  code=$(fetch_code "$2" "$3")
  if [[ "$code" == "$4" ]]; then pass "$1" "$code"; else fail "$1" "expected $4, got $code"; fi
}

# expect_allowed <name> <url> <ua> — リダイレクト追跡後の最終レスポンスが200なら許容。
expect_allowed() {
  local code
  code=$(curl "${CURL_OPTS[@]}" -L -w '%{http_code}' -A "$3" "$2" 2>/dev/null || echo "000")
  case "$code" in
    200) pass "$1" "$code" ;;
    *)   fail "$1" "blocked? status=$code" ;;
  esac
}

# expect_normal_body <name> <url> <ua>
expect_normal_body() {
  local body
  if ! body=$(curl -sS --max-time 20 -A "$3" "$2" 2>/dev/null); then
    fail "$1" "failed to fetch response body"
    return
  fi
  if printf '%s' "$body" | grep -qiE 'cf-chl|challenge-platform|Attention Required|cf-error-details|Your request was blocked|error code: 10[0-9]{2}'; then
    fail "$1" "body looks like a Cloudflare challenge/block page"
  else
    pass "$1" "normal page body"
  fi
}

echo "== Googlebot: main pages must return 200 =="
for path in / /ja /about /blog /work /writing /speaking; do
  expect_status "GET $path (Googlebot)" "$BASE_URL$path" "$UA_GOOGLEBOT_SP" 200
  expect_normal_body "$path" "$BASE_URL$path" "$UA_GOOGLEBOT_SP"
done

echo "== Googlebot: feed/discovery files =="
expect_status "GET /robots.txt"  "$BASE_URL/robots.txt"  "$UA_GOOGLEBOT_SP" 200
expect_status "GET /sitemap.xml" "$BASE_URL/sitemap.xml" "$UA_GOOGLEBOT_SP" 200

echo "== Other Google crawlers on / (must not be 403) =="
expect_allowed "Googlebot (desktop)"        "$BASE_URL/" "$UA_GOOGLEBOT_DT"
expect_allowed "Googlebot-Image"            "$BASE_URL/" "Mozilla/5.0 (compatible; Googlebot-Image/1.0; +http://www.google.com/bot.html)"
expect_allowed "Google-InspectionTool"      "$BASE_URL/" "Mozilla/5.0 (compatible; Google-InspectionTool/1.0;)"
expect_allowed "Storebot-Google"            "$BASE_URL/" "Mozilla/5.0 (compatible; Storebot-Google/1.0; +http://www.google.com/bot.html)"
expect_allowed "AdsBot-Google"              "$BASE_URL/" "Mozilla/5.0 (compatible; AdsBot-Google; +http://www.google.com/adsbot.html)"
expect_allowed "Mediapartners-Google"       "$BASE_URL/" "Mediapartners-Google"
expect_allowed "APIs-Google"                "$BASE_URL/" "APIs-Google"
expect_allowed "FeedFetcher-Google"         "$BASE_URL/" "FeedFetcher-Google; (+http://www.google.com/feedfetcher.html)"
expect_allowed "Google-Read-Aloud"          "$BASE_URL/" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.118 Safari/537.36 Google-Read-Aloud"
expect_allowed "GoogleOther"                "$BASE_URL/" "GoogleOther/1.0"
expect_allowed "Google-Extended"            "$BASE_URL/" "Mozilla/5.0 (compatible; Google-Extended; +http://www.google.com/bot.html)"
expect_allowed "PageSpeed/Lighthouse"       "$BASE_URL/" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Chrome-Lighthouse"
expect_allowed "DuplexWeb-Google"           "$BASE_URL/" "Mozilla/5.0 (Linux; Android 11; Pixel 2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36 (compatible; DuplexWeb-Google/1.0; +http://www.google.com/bot.html)"

echo "== www must redirect to apex (path/query preserved) =="
loc=$(curl -sS -o /dev/null -w '%{http_code} %{redirect_url}' --max-time 20 "$WWW_URL/some/path?q=1" 2>/dev/null || echo "000")
if [[ "$loc" =~ ^30[178]\ https://hidetaka\.dev/some/path\?q=1$ ]]; then
  pass "www -> apex" "$loc"
else
  fail "www -> apex" "expected 301/308 to https://hidetaka.dev/some/path?q=1, got: $loc"
fi

echo "== Negative control: AI crawler still blocked at edge (info only) =="
code=$(fetch_code "$BASE_URL/" "GPTBot/1.0")
if [[ "$code" == "403" ]]; then
  pass "GPTBot -> 403" "$code (ai_bots_protection active)"
else
  warn "GPTBot" "expected 403, got $code — AI bot block may have been disabled"
fi

echo
if (( failures > 0 )); then
  echo "RESULT: $failures check(s) FAILED"
  exit 1
fi
echo "RESULT: all checks passed"
