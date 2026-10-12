import { defineConfig } from "vitest/config";
export default defineConfig({
  test: { include: ["docs/validation/tools/boss-pool-probe.test.ts"] },
});
