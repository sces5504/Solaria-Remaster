#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
node -e 'if (Number(process.versions.node.split(".")[0]) !== 24) throw new Error("Select Node.js 24 in this cloud environment before setup")'
npm ci
if [ "$(id -u)" -eq 0 ] || (command -v sudo >/dev/null && sudo -n true 2>/dev/null); then
  npx playwright install --with-deps chromium
else
  # Managed image already supplies browser libraries; no interactive root prompt.
  npx playwright install chromium
fi
npm run check
npm run build
npm run test:browser
if [ -n "$(find tests/unit -name '*.test.ts' -print -quit 2>/dev/null)" ]; then npm test; fi
test -s .agents/skills/grilling/SKILL.md
