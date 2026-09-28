#!/usr/bin/env bash
set -euo pipefail

PROFILE="${DOGTAG_PROFILE_DIR:-/data/profile}"
PORT="${DOGTAG_CDP_PORT:-9222}"
CONNECTOR="${DOGTAG_CONNECTOR_URL:-https://dog-tag-day-browser-connector-rtpz8q.v2.appdeploy.ai}"

mkdir -p "$PROFILE"

cleanup() {
  if [[ -n "${CHROMIUM_PID:-}" ]] && kill -0 "$CHROMIUM_PID" 2>/dev/null; then
    kill "$CHROMIUM_PID" 2>/dev/null || true
    wait "$CHROMIUM_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

chromium \
  --headless=new \
  --no-sandbox \
  --disable-dev-shm-usage \
  --user-data-dir="$PROFILE" \
  --remote-debugging-address=127.0.0.1 \
  --remote-debugging-port="$PORT" \
  --no-first-run \
  --no-default-browser-check \
  about:blank &
CHROMIUM_PID=$!

for _ in $(seq 1 30); do
  if curl -fsS "http://127.0.0.1:${PORT}/json/version" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! curl -fsS "http://127.0.0.1:${PORT}/json/version" >/dev/null 2>&1; then
  echo "Dog Tag Day Browser: Chromium did not become ready" >&2
  exit 1
fi

export DOGTAG_CONNECTOR_URL="$CONNECTOR"
export DOGTAG_CDP_URL="http://127.0.0.1:${PORT}"

cd /opt/dogtag-browser/runtime-worker
exec npm start
