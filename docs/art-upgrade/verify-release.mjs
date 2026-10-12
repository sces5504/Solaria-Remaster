import { chromium } from "/workspace/solaria-art/node_modules/playwright/index.mjs";
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
const root = "https://sces5504.github.io/Solaria-Remaster/";
const policy = JSON.parse(
  await readFile("/etc/codex/network-policy.json", "utf8"),
);
const expected = JSON.parse(
  await readFile(
    "/workspace/solaria-art/public/assets/adventure/manifest.json",
    "utf8",
  ),
);
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  proxy: { server: policy.http_proxy },
  args: [
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--enable-unsafe-swiftshader",
  ],
});
try {
  const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
    }),
    errors = [],
    requests = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => requests.push(r.url()));
  const response = await page.goto(root + "?v=1.1.0", { timeout: 120000 });
  assert.equal(response.status(), 200);
  await page
    .getByRole("button", { name: "開始新局", exact: true })
    .waitFor({ timeout: 120000 });
  const menu = await page
    .locator(".menu")
    .evaluate((n) => getComputedStyle(n).backgroundImage);
  assert.ok(menu.includes("adventure/menu.png"));
  const manifestResponse = await page.request.get(
    root + "assets/adventure/manifest.json",
  );
  assert.equal(manifestResponse.status(), 200);
  const liveManifest = await manifestResponse.json();
  assert.equal(liveManifest.version, "1.1.0");
  assert.deepEqual(liveManifest.assets, expected.assets);
  const hashes = [];
  for (const asset of expected.assets) {
    const r = await page.request.get(root + "assets/adventure/" + asset.name, {
      timeout: 90000,
    });
    assert.equal(r.status(), 200);
    const hash = createHash("sha256")
      .update(await r.body())
      .digest("hex");
    assert.equal(hash, asset.sha256, asset.name);
    hashes.push({ name: asset.name, sha256: hash });
  }
  await page.screenshot({
    path: "/workspace/art-qa/published-art-menu.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "開始新局", exact: true }).click();
  const confirm = page.getByRole("button", { name: "確認新局", exact: true });
  if (await confirm.count()) await confirm.click();
  await page.waitForFunction(
    () =>
      [...document.querySelectorAll(".class-card img")].length === 3 &&
      [...document.querySelectorAll(".class-card img")].every(
        (im) => im.complete && im.naturalWidth === 128,
      ),
  );
  await page.screenshot({
    path: "/workspace/art-qa/published-art-portraits.png",
    fullPage: true,
  });
  await page.locator('[data-action="class:mage"]').click();
  const skip = page.getByRole("button", { name: "略過導引", exact: true });
  if (await skip.count()) await skip.click();
  await page.getByRole("button", { name: "進入戰鬥", exact: true }).click();
  await page.waitForFunction(() =>
    document.querySelector("#overlay").classList.contains("hidden"),
  );
  await page.waitForFunction(() => window.solariaDiagnostics().core.time > 0.5);
  const before = await page.evaluate(() => window.solariaDiagnostics());
  assert.equal(before.render.artStyle, "精雕冒險像素");
  assert.ok(before.render.artIdentities >= 112);
  assert.match(before.render.renderer.toLowerCase(), /webgl/);
  const box = await page.getByLabel("Solaria 遊戲畫布").boundingBox();
  assert.ok(Math.abs(box.width / box.height - 1.6) < 0.01);
  await page.keyboard.down("KeyD");
  await page.waitForTimeout(350);
  await page.keyboard.up("KeyD");
  await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.5);
  await page.mouse.down();
  await page.waitForFunction(
    (n) => window.solariaDiagnostics().core.originalBasics > n,
    before.core.originalBasics,
    { timeout: 15000 },
  );
  await page.mouse.up();
  await page.keyboard.press("Escape");
  await page
    .locator("#overlay")
    .evaluate((n) => (n.style.visibility = "hidden"));
  await page
    .getByLabel("Solaria 遊戲畫布")
    .screenshot({ path: "/workspace/art-qa/published-art-game.png" });
  const after = await page.evaluate(() => window.solariaDiagnostics());
  await page.locator("#overlay").evaluate((n) => (n.style.visibility = ""));
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "匯出存檔", exact: true }).click();
  const saved = JSON.parse(
    await readFile(await (await downloaded).path(), "utf8"),
  );
  assert.ok(saved.current.player.x > 113);
  assert.ok(after.core.tick > before.core.tick);
  assert.ok(after.render.sprites > 0);
  assert.deepEqual(errors, []);
  const oldAssets = requests.filter((u) =>
    /\/(solaria|biome|boss|event)-atlas\.png/.test(u),
  );
  assert.deepEqual(oldAssets, []);
  await writeFile(
    "/workspace/art-qa/published-art-report.json",
    JSON.stringify(
      {
        result: "PASS",
        verifiedAt: new Date().toISOString(),
        url: root,
        version: liveManifest.version,
        hashes,
        errors,
        oldAssets,
        movedPlayer: saved.current.player,
        before,
        after,
      },
      null,
      2,
    ),
  );
  console.log(
    "PASS: live selected art, all18PNG hashes, pixel menu and armed portraits, WebGL play/input,8:5, zero legacy atlases and no page errors.",
  );
} finally {
  await browser.close();
}
