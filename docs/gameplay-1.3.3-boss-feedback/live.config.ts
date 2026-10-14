import { defineConfig } from "@playwright/test";
import { readFileSync } from "node:fs";
const policy = JSON.parse(
  readFileSync("/etc/codex/network-policy.json", "utf8"),
);
export default defineConfig({
  testDir: "../../tests/browser",
  testMatch: "boss-feedback.spec.ts",
  workers: 1,
  timeout: 90000,
  outputDir: "../../test-results/boss-feedback-live",
  use: {
    baseURL:
      "https://sces5504.github.io/Solaria-Remaster/preview/terrain-1.3.0/",
    launchOptions: {
      proxy: { server: policy.http_proxy },
      args: ["--enable-unsafe-swiftshader"],
    },
  },
});
