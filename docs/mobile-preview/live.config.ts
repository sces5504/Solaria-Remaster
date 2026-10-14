import { defineConfig } from "@playwright/test";
import { readFileSync } from "node:fs";
const policy = JSON.parse(
  readFileSync("/etc/codex/network-policy.json", "utf8"),
);
export default defineConfig({
  testDir: "../../tests/browser",
  testMatch: "mobile.spec.ts",
  workers: 1,
  timeout: 90000,
  expect: { timeout: 15000 },
  outputDir: "../../test-results/mobile-live",
  use: {
    baseURL: "https://sces5504.github.io/Solaria-Remaster/preview/mobile/",
    browserName: "chromium",
    viewport: { width: 844, height: 390 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 1,
    userAgent:
      "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36",
    launchOptions: {
      proxy: { server: policy.http_proxy },
      args: ["--enable-unsafe-swiftshader"],
    },
  },
  projects: [{ name: "android" }],
});
