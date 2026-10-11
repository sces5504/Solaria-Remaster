import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: ".",
  testMatch: "pages.spec.ts",
  timeout: 120000,
  workers: 1,
  outputDir: "/tmp/solaria-pages-results",
  use: {
    baseURL:
      process.env.SOLARIA_VERIFY_URL ??
      "https://sces5504.github.io/Solaria-Remaster/",
    viewport: { width: 1280, height: 900 },
    trace: "retain-on-failure",
  },
});
