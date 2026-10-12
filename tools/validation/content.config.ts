import { defineConfig } from "vitest/config";
export default defineConfig({
  test: { include: ["tools/validation/content.test.ts"], maxWorkers: 1 },
});
