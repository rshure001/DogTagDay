#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BINARY="${DOGTAG_BROWSER_BINARY:-$ROOT/.work/chromium/src/out/DogTagDay/chrome}"
PROFILE="${DOGTAG_PROFILE_DIR:-$ROOT/.work/profile}"
PORT="${DOGTAG_CDP_PORT:-9222}"

mkdir -p "$PROFILE"

if [[ ! -x "$BINARY" ]]; then
  echo "Dog Tag Day Browser binary not found or not executable: $BINARY" >&2
  echo "Build Chromium first, or set DOGTAG_BROWSER_BINARY to a Chromium-compatible binary." >&2
  exit 1
fi

exec "$BINARY" \
  --user-data-dir="$PROFILE" \
  --remote-debugging-address=127.0.0.1 \
  --remote-debugging-port="$PORT" \
  --no-first-run \
  --no-default-browser-check \
  "$@"
