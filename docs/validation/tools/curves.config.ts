import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    include: ["docs/validation/tools/curves.test.ts"],
    maxWorkers: 1,
    testTimeout: 1200000,
  },
});
