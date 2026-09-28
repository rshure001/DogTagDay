#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORK="$ROOT/.work"
DEPOT="$WORK/depot_tools"
CHROMIUM="$WORK/chromium"

mkdir -p "$WORK"

if [[ ! -d "$DEPOT/.git" ]]; then
  git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git "$DEPOT"
fi

export PATH="$DEPOT:$PATH"
mkdir -p "$CHROMIUM"
cd "$CHROMIUM"

if [[ ! -f .gclient ]]; then
  fetch --nohooks --no-history chromium
fi

cd src
./build/install-build-deps.sh
gclient runhooks

echo "Chromium source is ready at: $CHROMIUM/src"
echo "Next: gn gen out/DogTagDay --args=\"$(cat "$ROOT/build/args.gn")\""
echo "Then: autoninja -C out/DogTagDay chrome"
