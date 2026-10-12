import { defineConfig } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
const policy = JSON.parse(
  readFileSync("/etc/codex/network-policy.json", "utf8"),
);
export default defineConfig({
  testDir: resolve("."),
  testMatch: [
    "tools/validation/pages.spec.ts",
    "tests/browser/boss-rework.spec.ts",
  ],
  timeout: 120000,
  workers: 1,
  retries: 0,
  outputDir: "/tmp/solaria-1.2.0-production",
  use: {
    baseURL: "https://sces5504.github.io/Solaria-Remaster/",
    viewport: { width: 1280, height: 900 },
    proxy: { server: policy.http_proxy },
    launchOptions: { args: ["--enable-unsafe-swiftshader"] },
    trace: "retain-on-failure",
  },
});
