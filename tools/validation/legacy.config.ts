import { defineConfig } from "vitest/config";
export default defineConfig({
  test: { include: ["tools/validation/legacy.test.ts"], maxWorkers: 1 },
});
