import { chromium } from "playwright";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve, relative } from "node:path";
import assert from "node:assert/strict";
const root = "https://sces5504.github.io/Solaria-Remaster/";
const preview = root + "preview/terrain-1.3.0/";
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
  await compare(officialDir, root);
  await compare("dist", preview);
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(preview, { timeout: 90000 });
  await page
    .getByRole("button", { name: "開始新局", exact: true })
    .waitFor({ timeout: 90000 });
  assert.equal(await page.locator("#testing").isVisible(), false);
  await page.getByRole("button", { name: "開始新局", exact: true }).click();
  await page
    .getByRole("button", { name: "選擇旅人", exact: true })
    .waitFor({ timeout: 30000 });
  assert.match(await page.locator(".tutorial").innerText(), /最多覺醒兩種元素/);
  await page.getByRole("button", { name: "選擇旅人", exact: true }).click();
  await page.locator('[data-action="class:sword"]').click();
  await page
    .getByRole("button", { name: "進入戰鬥", exact: true })
    .waitFor({ timeout: 30000 });
  await page.keyboard.type("wwssadadba");
  await page.locator("#testing").waitFor({ timeout: 30000 });
  await page.locator("#testing").click();
  await page.getByLabel("跳關目的地").selectOption("21");
  await page.getByRole("button", { name: "跳至此關", exact: true }).click();
  await page
    .getByRole("button", { name: "進入戰鬥", exact: true })
    .waitFor({ timeout: 30000 });
  assert.match(await page.locator("#overlay").innerText(), /第 21 \/ 31/);
  await page.reload();
  await page
    .getByRole("button", { name: "繼續旅程", exact: true })
    .waitFor({ timeout: 90000 });
  assert.equal(await page.locator("#testing").isVisible(), false);
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
  await page
    .getByRole("button", { name: "進入戰鬥", exact: true })
    .waitFor({ timeout: 30000 });
  assert.match(await page.locator("#overlay").innerText(), /第 21 \/ 31/);
  await page.keyboard.type("wwssadadba");
  await page.locator("#testing").click();
  await page.getByLabel("跳關目的地").selectOption("31");
  await page.getByRole("button", { name: "跳至此關", exact: true }).click();
  await page
    .getByRole("button", { name: "進入戰鬥", exact: true })
    .waitFor({ timeout: 30000 });
  assert.match(await page.locator("#overlay").innerText(), /第 31 \/ 31/);
  assert.equal(await page.locator('[data-action="nextLoop"]').count(), 0);
  assert.deepEqual(errors, []);
  const names = await page.evaluate(async () =>
    (await indexedDB.databases()).map((db) => db.name),
  );
  assert(names.includes("solaria-remaster-playtest-terrain-1.3.0"));
  assert(!names.includes("solaria-remaster"));
  await page.screenshot({
    path: "docs/gameplay-1.3.0/results/live-preview.png",
  });
  const result = {
    checkedAt: new Date().toISOString(),
    officialSHA: "8df5e347cc1a5bc977e848478378c35f672cc5a7",
    previewSource: "f37dc464c7e0c90f6aec33932a365f782173054a",
    checks,
    journeyAndReload: "PASS",
    lockedButtonAfterReload: "PASS",
    solarisGate: "PASS",
    isolatedDB: "PASS",
    pageErrors: errors,
  };
  await writeFile(
    "docs/gameplay-1.3.0/results/live-integrity.json",
    JSON.stringify(result, null, 2) + "\n",
  );
  console.log(
    `${checks.length} source files match; preview unlock/jump/reload/31 gate/storage PASS; official root unchanged.`,
  );
} finally {
  await browser.close();
}
