import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    include: ["tools/balance/curves.test.ts"],
    maxWorkers: 1,
    testTimeout: 1200000,
  },
});
