#!/usr/bin/env bash
# Build + run the Interview Prep Tracker locally on macOS / Linux with the
# Notebook editor ENABLED (read-only OFF). Opens the browser when ready.
#
#   ./run.sh            build (editable) then serve
#   ./run.sh --dev      fast dev mode (hot reload, editable) instead of a build
#
# A shell-exported NEXT_PUBLIC_* var takes precedence over .env files, so this
# forces the editable build even if .env.local sets NEXT_PUBLIC_NOTES_READONLY=1.

set -euo pipefail
cd "$(dirname "$0")"

export NEXT_PUBLIC_NOTES_READONLY=0
PORT=7373
URL="http://localhost:${PORT}/"

if [ ! -d node_modules ]; then
  echo "Installing dependencies…"
  npm install
fi

open_browser() {
  ( for _ in $(seq 1 90); do
      if curl -fs -o /dev/null "http://localhost:${PORT}"; then break; fi
      sleep 0.5
    done
    if command -v open >/dev/null 2>&1; then open "$URL"
    elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$URL"
    else echo "Open ${URL} in your browser."; fi ) &
}

if [ "${1:-}" = "--dev" ]; then
  echo "Starting dev server (editable) on ${URL} …"
  open_browser
  exec npm run dev
fi

echo "Building (Notebook editor enabled)…"
npm run build
echo "Starting on ${URL} — keep this open while you work (Ctrl+C to stop)."
open_browser
exec npm run start
