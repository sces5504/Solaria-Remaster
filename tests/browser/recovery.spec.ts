import { test, expect } from "@playwright/test";
import { newRun } from "../../src/game/core/run";

test("M01 最新壞檔自動回退，提示並繼續保存，不清圖鑑", async ({ page }) => {
  const r = newRun("mage", 7721);
  r.cards[1] = 1;
  const saved = { version: 1, revision: 4, current: r, entry: r };
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "SOLARIA", exact: true }),
  ).toBeVisible();
  await page.evaluate(async (backup) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open("solaria-remaster", 1);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(["run", "profile"], "readwrite");
      tx.objectStore("run").put(backup, "previous");
      tx.objectStore("run").put(
        { version: 1, revision: 5, current: { broken: true } },
        "latest",
      );
      tx.objectStore("profile").put([15, 19], "discovered");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  }, saved);
  await page.reload();
  await expect(page.getByRole("status")).toContainText("已恢復上一份有效紀錄");
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
  await expect(page.locator("#hud .status")).toBeVisible();
  await page.getByRole("button", { name: "進入戰鬥" }).click();
  await expect(page.locator(".saving")).toHaveCount(0);
  const result = await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve) => {
      const req = indexedDB.open("solaria-remaster", 1);
      req.onsuccess = () => resolve(req.result);
    });
    const read = (store: string, key: string) =>
      new Promise<any>((resolve) => {
        const req = db.transaction(store).objectStore(store).get(key);
        req.onsuccess = () => resolve(req.result);
      });
    const latest = await read("run", "latest");
    const damaged = await read("run", "damaged");
    const profile = await read("profile", "discovered");
    db.close();
    return { latest, damaged, profile };
  });
  expect(result.latest.revision).toBeGreaterThan(6);
  expect(result.latest.current.seed).toBe(7721);
  expect(result.damaged.current.broken).toBe(true);
  expect(result.profile).toEqual([1, 15, 19]);
  await page.reload();
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
  await expect(page.getByRole("button", { name: "進入戰鬥" })).toBeVisible();
});
