import { defineConfig } from "@playwright/test";
import { readFileSync } from "node:fs";
const policy = JSON.parse(
  readFileSync("/etc/codex/network-policy.json", "utf8"),
);
export default defineConfig({
  testDir: "../../tests/browser",
  testMatch: "health-light.spec.ts",
  workers: 1,
  timeout: 90000,
  outputDir: "results/live-browser",
  use: {
    baseURL: "https://sces5504.github.io/Solaria-Remaster/",
    launchOptions: {
      proxy: { server: policy.http_proxy },
      args: ["--enable-unsafe-swiftshader"],
    },
  },
});
