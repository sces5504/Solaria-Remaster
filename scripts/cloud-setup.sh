#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
node -e 'if (Number(process.versions.node.split(".")[0]) !== 24) throw new Error("Select Node.js 24 in this cloud environment before setup")'
npm ci
npx playwright install --with-deps chromium
npm run check
npm run build
npm run test:browser
test -s .agents/skills/grilling/SKILL.md
