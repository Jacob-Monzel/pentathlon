#!/usr/bin/env bash
# ============================================================
#  Bump the app version everywhere it has to match.
#  One string, four homes — they MUST stay in lockstep, because a cached
#  app.js against fresh HTML is what produces "undefined" chips and blank pages.
#    app.js  APP_VERSION            → what Backup → Version reports on the device
#    sw.js   CACHE_VERSION          → wipes old SW caches on activate
#    *.html  app.js?v= styles.css?v= → busts the HTTP cache for code + styles
#
#  Usage:  ./bump.sh                 auto — today's date, next -N
#          ./bump.sh 2026.08.12-3    explicit
#          ./bump.sh --check         verify only, change nothing (exit 1 on drift)
#  Format: YYYY.MM.DD-N   (N restarts at 1 each day)
# ============================================================
set -euo pipefail
cd "$(dirname "$0")"

VER_RE='[0-9]{4}\.[0-9]{2}\.[0-9]{2}-[0-9]+'
cur=$(perl -ne "print \$1 if /APP_VERSION\s*=\s*'($VER_RE)'/" app.js || true)
[ -n "$cur" ] || { echo "✗ could not read APP_VERSION from app.js"; exit 1; }

check() {
  local bad=0
  echo "  app.js     APP_VERSION   $cur"
  local sw
  sw=$(perl -ne "print \$1 if /CACHE_VERSION\s*=\s*'($VER_RE)'/" sw.js || true)
  echo "  sw.js      CACHE_VERSION $sw"
  [ "$sw" = "$cur" ] || { echo "  ✗ sw.js is out of step"; bad=1; }
  for f in *.html; do
    local a s
    a=$(perl -ne "if (/src=.app\.js\?v=($VER_RE)/) { print \$1; last }" "$f" || true)
    s=$(perl -ne "if (/href=.styles\.css\?v=($VER_RE)/) { print \$1; last }" "$f" || true)
    if [ "$a" != "$cur" ] || [ "$s" != "$cur" ]; then
      echo "  ✗ $f  app.js?v=${a:-MISSING}  styles.css?v=${s:-MISSING}"; bad=1
    fi
  done
  return $bad
}

if [ "${1:-}" = "--check" ]; then
  echo "Checking version consistency…"
  if check; then echo "✓ all files on $cur"; else echo "✗ drift — run ./bump.sh to fix"; exit 1; fi
  exit 0
fi

if [ $# -ge 1 ]; then
  new="$1"
  echo "$new" | grep -qE "^$VER_RE$" || { echo "✗ '$new' is not YYYY.MM.DD-N"; exit 1; }
else
  today=$(date +%Y.%m.%d)
  case "$cur" in
    "$today"-*) new="$today-$(( ${cur##*-} + 1 ))" ;;
    *)          new="$today-1" ;;
  esac
fi

perl -pi -e "s/(APP_VERSION\s*=\s*')$VER_RE(')/\${1}$new\${2}/" app.js
perl -pi -e "s/(CACHE_VERSION\s*=\s*')$VER_RE(')/\${1}$new\${2}/" sw.js
for f in *.html; do
  # Only ever touch the src=/href= attributes. Bare "app.js" also appears in
  # comments and warning strings — rewriting those was a real bug once.
  perl -pi -e "s/(src=[\"'])app\.js(\?v=[^\"']*)?/\${1}app.js?v=$new/g"          "$f"
  perl -pi -e "s/(href=[\"'])styles\.css(\?v=[^\"']*)?/\${1}styles.css?v=$new/g" "$f"
done

echo "Bumped $cur → $new"
cur="$new"; check && echo "✓ all files on $new"
echo
echo "Next: node --check app.js, then upload changed files + sw.js + all *.html."
