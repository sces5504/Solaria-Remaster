import { chromium } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";
import assert from "node:assert/strict";
const legacy = JSON.parse(
  readFileSync("docs/validation/fixtures/53691bf-checkpoint.json", "utf8"),
);
const policy = JSON.parse(
  readFileSync("/etc/codex/network-policy.json", "utf8"),
);
const browser = await chromium.launch({ proxy: { server: policy.http_proxy } });
try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("https://sces5504.github.io/Solaria-Remaster/");
  await page.getByRole("button", { name: "開始新局", exact: true }).waitFor();
  await page.evaluate(async (saved) => {
    const db = await new Promise((resolve) => {
      const q = indexedDB.open("solaria-remaster", 1);
      q.onsuccess = () => resolve(q.result);
    });
    await new Promise((resolve, reject) => {
      const tx = db.transaction(["run", "profile"], "readwrite");
      tx.objectStore("run").put(saved, "latest");
      tx.objectStore("profile").put(saved.discovered, "discovered");
      tx.oncomplete = resolve;
      tx.onerror = reject;
    });
    db.close();
  }, legacy);
  await page.reload();
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
  await page.getByRole("button", { name: "進入戰鬥", exact: true }).click();
  const box = await page.getByLabel("Solaria 遊戲畫布").boundingBox();
  await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.5);
  await page.keyboard.down("KeyW");
  await page.mouse.down();
  await page.waitForFunction(
    (t) => window.solariaDiagnostics().core.time >= t,
    legacy.entry.time + 1,
    { timeout: 30000 },
  );
  await page.mouse.up();
  await page.keyboard.up("KeyW");
  const diagnostics = await page.evaluate(() => window.solariaDiagnostics());
  assert(diagnostics.render.sprites > 0);
  assert(diagnostics.core.tick > 0);
  await page.screenshot({ path: "/tmp/solaria-pages-legacy-playing.png" });
  await page.keyboard.press("Escape");
  await page.waitForFunction(
    () => !document.querySelector("#overlay").className.includes("saving"),
  );
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "匯出存檔", exact: true }).click();
  const saved = JSON.parse(readFileSync(await (await download).path(), "utf8"));
  assert.equal(saved.current.classId, "bow");
  assert.deepEqual(saved.current.cards, legacy.entry.cards);
  assert(saved.current.player.y < legacy.entry.player.y);
  assert(
    saved.current.player.originalBasics >
      (legacy.entry.player.originalBasics ?? 0),
  );
  assert.deepEqual(errors, []);
  const report = {
    status: "PASS",
    url: page.url(),
    source: "53691bf original IndexedDB fixture",
    before: {
      y: legacy.entry.player.y,
      basics: legacy.entry.player.originalBasics ?? 0,
    },
    after: {
      y: saved.current.player.y,
      basics: saved.current.player.originalBasics,
      time: saved.current.time,
    },
    diagnostics,
    errors,
  };
  writeFileSync(
    "/tmp/solaria-pages-legacy-playing.json",
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(JSON.stringify(report));
} finally {
  await browser.close();
}
