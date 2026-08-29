#!/usr/bin/env bash
# Builds a Chrome Web Store upload zip in dist/.
set -euo pipefail
cd "$(dirname "$0")/.."

version=$(python3 -c "import json;print(json.load(open('manifest.json'))['version'])")
out="dist/openmusicin-${version}.zip"

mkdir -p dist
rm -f "$out"

zip -r -q "$out" manifest.json icons _locales src \
  -x '*.DS_Store' -x '__MACOSX/*'

echo "$out"
unzip -l "$out" | tail -1
