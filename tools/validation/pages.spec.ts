import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const legacy = JSON.parse(
  readFileSync("docs/validation/fixtures/53691bf-checkpoint.json", "utf8"),
);
test("正式Pages：子路徑資源、正常新局、同時普攻職技、保存與繼續", async ({
  page,
}, info) => {
  const errors: string[] = [],
    failures: string[] = [],
    resources: { url: string; status: number }[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("requestfailed", (q) => failures.push(q.url()));
  page.on("response", (q) => {
    resources.push({ url: q.url(), status: q.status() });
    if (q.status() >= 400) failures.push(`${q.status()} ${q.url()}`);
  });
  await page.goto("./");
  await expect(
    page.getByRole("button", { name: "開始新局", exact: true }),
  ).toBeEnabled();
  for (const path of [
    "solaria-atlas.png",
    "biome-atlas.png",
    "boss-atlas.png",
    "event-atlas.png",
    "manifest.json",
  ]) {
    const q = await page.request.get(`./assets/${path}`);
    expect(q.status()).toBe(200);
    const local = readFileSync(`public/assets/${path}`);
    expect(
      createHash("sha256")
        .update(await q.body())
        .digest("hex"),
    ).toBe(createHash("sha256").update(local).digest("hex"));
  }
  const modulePath = await page
    .locator('script[type="module"]')
    .getAttribute("src");
  const moduleResponse = await page.request.get(modulePath!);
  expect(moduleResponse.status()).toBe(200);
  const localModule = readFileSync(
    `dist/assets/${modulePath!.split("/").pop()}`,
  );
  expect(
    createHash("sha256")
      .update(await moduleResponse.body())
      .digest("hex"),
  ).toBe(createHash("sha256").update(localModule).digest("hex"));
  await page.getByRole("button", { name: "開始新局", exact: true }).click();
  await page.getByRole("button", { name: /法師/ }).click();
  await page.getByRole("button", { name: "進入戰鬥", exact: true }).click();
  const canvas = page.getByLabel("Solaria 遊戲畫布");
  const box = (await canvas.boundingBox())!;
  expect(box.width / box.height).toBeCloseTo(1.6, 2);
  await page.mouse.move(box.x + box.width * 0.65, box.y + box.height * 0.5);
  await page.mouse.down();
  await page.mouse.click(box.x + box.width * 0.65, box.y + box.height * 0.5, {
    button: "right",
  });
  await page.waitForTimeout(450);
  await page.mouse.up();
  const snapshot = await page.evaluate(() =>
    (window as any).solariaDiagnostics(),
  );
  expect(snapshot.core.originalBasics).toBeGreaterThan(0);
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("heading", { name: "日光，等你歸來" }),
  ).toBeVisible();
  await expect(page.locator("#overlay")).not.toHaveClass(/saving/);
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "匯出存檔", exact: true }).click();
  const saved = JSON.parse(
    readFileSync((await (await download).path())!, "utf8"),
  );
  expect(saved.current.player.originalBasics).toBeGreaterThan(0);
  expect(saved.current.player.skillCast).toBeGreaterThan(0);
  await page.reload();
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "進入戰鬥", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
  expect(failures).toEqual([]);
  await page.screenshot({ path: info.outputPath("pages-newgame.png") });
  await info.attach("requests", {
    body: JSON.stringify({ resources, errors, failures, snapshot }, null, 2),
    contentType: "application/json",
  });
});
test("正式Pages：直接繼續53691bf舊IndexedDB快照，保留構築及再次保存", async ({
  page,
}, info) => {
  await page.goto("./");
  await expect(
    page.getByRole("button", { name: "開始新局", exact: true }),
  ).toBeEnabled();
  await page.evaluate(async (saved) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const q = indexedDB.open("solaria-remaster", 1);
      q.onsuccess = () => resolve(q.result);
      q.onerror = () => reject(q.error);
    });
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(["run", "profile"], "readwrite");
      tx.objectStore("run").put(saved, "latest");
      tx.objectStore("profile").put(saved.discovered, "discovered");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  }, legacy);
  await page.reload();
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "進入戰鬥", exact: true }),
  ).toBeVisible();
  const stored = await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve) => {
      const q = indexedDB.open("solaria-remaster", 1);
      q.onsuccess = () => resolve(q.result);
    });
    const s = await new Promise<any>((resolve) => {
      const q = db.transaction("run").objectStore("run").get("latest");
      q.onsuccess = () => resolve(q.result);
    });
    db.close();
    return s;
  });
  expect(stored.entry.cards).toEqual(legacy.entry.cards);
  expect(stored.entry.classId).toBe("bow");
  expect(stored.entry.elements).toEqual(legacy.entry.elements);
  expect(stored.entry.room).toBe(1);
  await page.getByRole("button", { name: "進入戰鬥", exact: true }).click();
  await page.waitForTimeout(250);
  await page.keyboard.press("Escape");
  await expect(page.locator("#overlay")).not.toHaveClass(/saving/);
  await page.reload();
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "進入戰鬥", exact: true }),
  ).toBeVisible();
  await page.screenshot({ path: info.outputPath("pages-legacy.png") });
});
