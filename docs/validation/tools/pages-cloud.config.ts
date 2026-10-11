import { defineConfig } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import config from "../../../tools/validation/pages.config";
// Cloud APIRequestContext does not inherit HTTP_PROXY. Use the documented
// session proxy explicitly, with normal TLS verification and configured CA.
const policy = JSON.parse(
  readFileSync("/etc/codex/network-policy.json", "utf8"),
);
export default defineConfig({
  ...config,
  testDir: resolve("tools/validation"),
  use: { ...config.use, proxy: { server: policy.http_proxy } },
});
