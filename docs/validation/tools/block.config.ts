import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    include: ["docs/validation/tools/block-fixture.test.ts"],
    maxWorkers: 1,
    testTimeout: 1200000,
  },
});
