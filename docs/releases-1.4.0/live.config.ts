import { defineConfig } from "@playwright/test";
import { readFileSync } from "node:fs";
const policy = JSON.parse(
  readFileSync("/etc/codex/network-policy.json", "utf8"),
);
export default defineConfig({
  testDir: "../../tests/browser",
  testMatch: "release-140.spec.ts",
  workers: 1,
  retries: 0,
  timeout: 90000,
  expect: { timeout: 20000 },
  outputDir: "../../test-results/release-140-live",
  use: {
    baseURL: "https://sces5504.github.io/Solaria-Remaster/",
    launchOptions: {
      proxy: { server: policy.http_proxy },
      args: ["--enable-unsafe-swiftshader"],
    },
  },
});
