import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "../../tests/browser",
  testMatch: ["boss-feedback.spec.ts", "health-light.spec.ts"],
  workers: 1,
  timeout: 90000,
  expect: { timeout: 15000 },
  outputDir: "../../test-results/boss-feedback",
  use: {
    baseURL: "http://127.0.0.1:4173",
    launchOptions: { args: ["--enable-unsafe-swiftshader"] },
  },
  webServer: {
    command: "npm run preview -- --port 4173 --strictPort",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: true,
  },
});
