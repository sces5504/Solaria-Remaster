import { chromium } from "playwright";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve, relative } from "node:path";
import assert from "node:assert/strict";
const root = "https://sces5504.github.io/Solaria-Remaster/";
const preview = root;
const officialDir =
  process.env.OFFICIAL_DIST || "/workspace/solaria-official-preview/dist";
const policy = JSON.parse(
  await readFile("/etc/codex/network-policy.json", "utf8"),
);
const browser = await chromium.launch({
  proxy: { server: policy.http_proxy },
  args: ["--enable-unsafe-swiftshader"],
});
const checks = [];
const resultsDir = process.env.RESULTS_DIR || "docs/releases-1.3.3/results";
try {
  const context = await browser.newContext();
  async function compare(dir, url) {
    const files = [];
    async function list(at) {
      for (const entry of await readdir(at, { withFileTypes: true })) {
        const file = resolve(at, entry.name);
        if (entry.isDirectory()) await list(file);
        else if (
          /\.(js|css|png)$/.test(entry.name) ||
          entry.name.endsWith(".html")
        )
          files.push(file);
      }
    }
    await list(resolve(dir));
    for (let i = 0; i < files.length; i += 5)
      await Promise.all(
        files.slice(i, i + 5).map(async (file) => {
          const path = relative(resolve(dir), file);
          const expected = createHash("sha256")
            .update(await readFile(file))
            .digest("hex");
          const response = await context.request.get(url + path, {
            timeout: 90000,
          });
          assert.equal(response.status(), 200, url + path);
          const actual = createHash("sha256")
            .update(await response.body())
            .digest("hex");
          assert.equal(actual, expected, url + path);
          checks.push({ url: url + path, sha256: actual });
        }),
      );
  }

  await compare("/tmp/solaria-133-final-dist", root);
  const result = {
    checkedAt: new Date().toISOString(),
    releaseSource: process.env.RELEASE_SOURCE,
    checks,
  };
  await writeFile(
    `${resultsDir}/live-integrity.json`,
    JSON.stringify(result, null, 2) + "\n",
  );
  console.log(
    `${checks.length} release source files match; official published source integrity PASS.`,
  );
} finally {
  await browser.close();
}
