import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    include: ["tools/balance/probe.test.ts"],
    testTimeout: 1200000,
    maxWorkers: 1,
  },
});
