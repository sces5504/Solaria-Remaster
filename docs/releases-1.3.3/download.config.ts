import { defineConfig } from "@playwright/test";
process.env.SOLARIA_DOWNLOAD ||=
  "/tmp/solaria-release-1.3.3/Solaria-Remaster-v1.3.3.html";
export default defineConfig({
  testDir: "../../tests/browser",
  testMatch: "download.spec.ts",
  workers: 1,
  timeout: 90000,
  expect: { timeout: 20000 },
  outputDir: "../../test-results/download",
  use: { launchOptions: { args: ["--enable-unsafe-swiftshader"] } },
});
