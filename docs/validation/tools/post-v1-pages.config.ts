import { defineConfig } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import config from "../../../playwright.config";
const policy = JSON.parse(
  readFileSync("/etc/codex/network-policy.json", "utf8"),
);
export default defineConfig({
  ...config,
  testDir: resolve("tests/browser"),
  testMatch: "post-v1-feedback.spec.ts",
  webServer: undefined,
  workers: 1,
  retries: 0,
  timeout: 120000,
  outputDir: "/tmp/solaria-post-v1-pages-results",
  use: {
    ...config.use,
    baseURL: "https://sces5504.github.io/Solaria-Remaster/",
    proxy: { server: policy.http_proxy },
  },
});
