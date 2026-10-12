import { chromium } from "playwright";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import { resolve, relative } from "node:path";
const root = "https://sces5504.github.io/Solaria-Remaster/";
const policy = JSON.parse(
  await readFile("/etc/codex/network-policy.json", "utf8"),
);
const browser = await chromium.launch({
  proxy: { server: policy.http_proxy },
  args: ["--enable-unsafe-swiftshader"],
});
try {
  const page = await browser.newPage();
  const response = await page.goto(root + "?v=1.2.0", { timeout: 90000 });
  assert.equal(response.status(), 200);
  await page
    .getByRole("button", { name: "開始新局", exact: true })
    .waitFor({ timeout: 90000 });
  const files = [];
  async function list(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const file = resolve(dir, entry.name);
      if (entry.isDirectory()) await list(file);
      else if (
        /\.(js|css)$/.test(entry.name) ||
        /(?:^|\/)index\.html$/.test(file)
      )
        files.push(file);
    }
  }
  await list(resolve("dist"));
  const frozen = JSON.parse(
    await readFile("docs/gameplay-1.2.0/results/frozen-art.json", "utf8"),
  );
  const checks = [];
  for (const file of files) {
    const path = relative(resolve("dist"), file);
    const expected = createHash("sha256")
      .update(await readFile(file))
      .digest("hex");
    const r = await page.request.get(root + path, { timeout: 90000 });
    assert.equal(r.status(), 200, path);
    const actual = createHash("sha256")
      .update(await r.body())
      .digest("hex");
    assert.equal(actual, expected, path);
    checks.push({ path, sha256: actual });
  }
  for (const asset of frozen.assets) {
    const path = asset.path.replace(/^public\//, "");
    const r = await page.request.get(root + path, { timeout: 90000 });
    assert.equal(r.status(), 200, path);
    const actual = createHash("sha256")
      .update(await r.body())
      .digest("hex");
    assert.equal(actual, asset.sha256, path);
    checks.push({ path, sha256: actual });
  }
  await writeFile(
    "docs/gameplay-1.2.0/results/production-integrity.json",
    JSON.stringify(
      { verifiedAt: new Date().toISOString(), version: "1.2.0", checks },
      null,
      2,
    ) + "\n",
  );
  process.stdout.write(
    `PASS: ${files.length} HTML/JS/CSS and ${frozen.assets.length} frozen art PNGs match.\n`,
  );
} finally {
  await browser.close();
}
