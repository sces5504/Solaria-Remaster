# Solaria Remaster

Use Traditional Chinese for discussions with the owner.

This is a clean remaster workspace. The original sces5504/Solaria is read-only reference material. Do not delete, reset, or push changes to the original repository. Do not migrate the original monolithic HTML wholesale.

The owner wants cloud execution. Run development and tests in the selected cloud environment; do not depend on the owner's laptop or a local companion service.

## Tools

Node.js 24, npm with committed package-lock.json, TypeScript, Vite, Vitest, Playwright Chromium, Prettier. Setup: `bash scripts/cloud-setup.sh`. Start preview: `npm run dev -- --port 5173 --strictPort`.

Before committing: `npm run check`, `npm run build`, `npm run test:browser`, `npm run format:check`. Run `npm test` after meaningful unit tests exist. Do not add tests that merely mirror trivial implementation.

Keep game modules under src/; add pure gameplay tests under tests/unit/ and browser tests under tests/browser/. The current page is only a startup scaffold, not the remastered game.

## Grilling skill

Matt Pocock's original skill is checked in at `.agents/skills/grilling/SKILL.md`. If skill discovery does not expose it, read that file explicitly when the owner requests grilling. Before substantial gameplay redesign, use it to agree on the remaster scope, what to preserve, what to replace, target devices, art direction, and the first playable milestone. The owner's decisions govern the design.

Environment preparation is already authorized. Do not invoke a design interview just to install dependencies. The next game-design task should begin with grilling, not silent assumptions about a complete rewrite.
