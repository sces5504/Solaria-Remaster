import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { newRun } from "../../src/game/core/run";
import type { Run } from "../../src/game/core/types";
async function load(page: Page, r: Run) {
  await page.goto("/");
  await page.getByRole("button", { name: "匯入存檔", exact: true }).click();
  await page.locator("#import-file").setInputFiles({
    name: "journal-fixture.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({ version: 1, revision: 0, current: r, entry: r }),
    ),
  });
  await expect(page.getByRole("status")).toContainText("匯入成功");
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
  await expect(page.locator("#hud .status")).toBeVisible();
}
test("首局導引可跳過並重看；成就外觀重載與星典備份，下一新局無永久戰力", async ({
  page,
}, info) => {
  await page.goto("/");
  await page.getByRole("button", { name: "開始新局", exact: true }).click();
  await page.locator('[data-action="class:mage"]').click();
  await expect(page.locator(".first-tip")).toBeVisible();
  await page.getByRole("button", { name: "略過導引", exact: true }).click();
  await expect(page.locator(".first-tip")).toHaveCount(0);
  await expect(page.locator("#overlay")).not.toHaveClass(/saving/);
  await page.reload();
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
  await expect(page.locator("#hud .status")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "進入戰鬥", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".first-tip")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "旅人手冊", exact: true }).click();
  await expect(page.getByRole("heading", { name: "循光而行" })).toBeVisible();
  await expect(page.locator(".tutorial")).toContainText("兩者可同時使用");
  const r = newRun("sword", 881);
  r.room = 5;
  r.phase = "POST_CLEAR";
  r.settledOnce = true;
  r.enemies = [];
  r.reserves = [];
  page.on("dialog", (dialog) => dialog.accept());
  await load(page, r);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "成就與外觀", exact: true }).click();
  await expect(page.locator(".achievement.unlocked")).toContainText("暮光守望");
  await page.getByRole("button", { name: "琥珀之誓", exact: true }).click();
  await expect(page.locator('[data-action="cosmetic:amber"]')).toContainText(
    "✓",
  );
  await page
    .locator(".journal")
    .screenshot({ path: info.outputPath("journal.png") });
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "匯出星典備份", exact: true }).click();
  const backup = await readFile((await (await download).path())!, "utf8");
  expect(JSON.parse(backup).profile.cosmetic).toBe("amber");
  await expect(page.locator("#overlay")).not.toHaveClass(/saving/);
  await page.reload();
  await page.getByRole("button", { name: "成就與外觀", exact: true }).click();
  await expect(page.locator('[data-action="cosmetic:amber"]')).toContainText(
    "✓",
  );
  await page.getByRole("button", { name: "返回", exact: true }).click();
  await page.getByRole("button", { name: "開始新局", exact: true }).click();
  await page.getByRole("button", { name: "確認新局", exact: true }).click();
  await page.locator('[data-action="class:sword"]').click();
  await expect(page.locator("#hud .status")).toContainText("150 / 150");
  await page.keyboard.press("Escape");
  const gameDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "匯出存檔", exact: true }).click();
  const game = JSON.parse(
    await readFile((await (await gameDownload).path())!, "utf8"),
  );
  expect(game.current.cards).toEqual({});
  expect(game.current.equipment).toEqual({});
  expect(game.profile.cosmetic).toBe("amber");
});
function equipmentRun() {
  const r = newRun("mage", 551);
  r.phase = "POST_CLEAR";
  r.settledOnce = true;
  r.enemies = [];
  r.reserves = [];
  r.obstacles = [];
  r.bag = [
    { id: "one-ring", slot: "ring", rarity: "藍", affixes: [], x: 112, y: 320 },
  ];
  return r;
}
test("兩分頁換裝revision衝突保留唯一物件，錯誤可匯出目前工作備份", async ({
  page,
  context,
}) => {
  await load(page, equipmentRun());
  const other = await context.newPage();
  await other.goto("/");
  await other.getByRole("button", { name: "繼續旅程", exact: true }).click();
  await expect(other.locator("#hud .status")).toBeVisible();
  await page.keyboard.press("KeyI");
  await page.locator('[data-action="equip:one-ring"]').click();
  await expect(page.locator(".saving")).toHaveCount(0);
  await other.keyboard.press("KeyI");
  await other.locator('[data-action="equip:one-ring"]').click();
  await expect(
    other.getByRole("heading", { name: "存檔需要處理" }),
  ).toBeVisible();
  await expect(other.getByRole("status")).toContainText("另一個分頁");
  const download = other.waitForEvent("download");
  await other.getByRole("button", { name: "匯出備份", exact: true }).click();
  const backup = JSON.parse(
    await readFile((await (await download).path())!, "utf8"),
  );
  expect(backup.latest.current.equipment.ring.id).toBe("one-ring");
  expect(backup.latest.current.bag).toHaveLength(0);
  expect(backup.working.current.equipment.ring.id).toBe("one-ring");
  await other.getByRole("button", { name: "重新讀取", exact: true }).click();
  await other.getByRole("button", { name: "繼續旅程", exact: true }).click();
  await expect(other.locator("#hud .status")).toBeVisible();
  await other.keyboard.press("KeyI");
  await expect(other.locator('[data-action="equip:one-ring"]')).toHaveCount(0);
});
test("另一分頁清除旅程後，舊分頁不能復活舊局或重寫新局", async ({
  page,
  context,
}) => {
  await load(page, equipmentRun());
  const other = await context.newPage();
  await other.goto("/");
  await other.getByRole("button", { name: "繼續旅程", exact: true }).click();
  await expect(other.locator("#hud .status")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "回主選單", exact: true }).click();
  await page.getByRole("button", { name: "開始新局", exact: true }).click();
  await page.getByRole("button", { name: "確認新局", exact: true }).click();
  await other.keyboard.press("KeyI");
  await other.locator('[data-action="equip:one-ring"]').click();
  await expect(
    other.getByRole("heading", { name: "存檔需要處理" }),
  ).toBeVisible();
  const download = other.waitForEvent("download");
  await other.getByRole("button", { name: "匯出備份", exact: true }).click();
  const data = JSON.parse(
    await readFile((await (await download).path())!, "utf8"),
  );
  expect(data.latest).toBeUndefined();
  expect(data.revision).toBeGreaterThan(data.working.revision);
});
test("永久星典壞檔回退有提示、無備份則保留且可下載原始檔", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "SOLARIA", exact: true }),
  ).toBeVisible();
  await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve) => {
      const q = indexedDB.open("solaria-remaster", 1);
      q.onsuccess = () => resolve(q.result);
    });
    await new Promise<void>((resolve) => {
      const tx = db.transaction("profile", "readwrite"),
        s = tx.objectStore("profile");
      s.put({ broken: true }, "journal");
      s.put(
        {
          version: 1,
          achievements: ["firstLord"],
          clearedEvents: [],
          completedClasses: [],
          cosmetic: "amber",
          tutorialSeen: true,
        },
        "journalPrevious",
      );
      tx.oncomplete = () => resolve();
    });
    db.close();
  });
  await expect(page.locator("#overlay")).not.toHaveClass(/saving/);
  await page.reload();
  await expect(page.getByRole("status")).toContainText("已恢復上一份有效星典");
  await page.getByRole("button", { name: "成就與外觀", exact: true }).click();
  await expect(page.locator('[data-action="cosmetic:amber"]')).toContainText(
    "✓",
  );
  await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve) => {
      const q = indexedDB.open("solaria-remaster", 1);
      q.onsuccess = () => resolve(q.result);
    });
    await new Promise<void>((resolve) => {
      const tx = db.transaction("profile", "readwrite"),
        s = tx.objectStore("profile");
      s.put({ broken: "preserve" }, "journal");
      s.delete("journalPrevious");
      tx.oncomplete = () => resolve();
    });
    db.close();
  });
  await expect(page.locator("#overlay")).not.toHaveClass(/saving/);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "存檔需要處理" }),
  ).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "匯出備份", exact: true }).click();
  const raw = JSON.parse(
    await readFile((await (await download).path())!, "utf8"),
  );
  expect(raw.journal.broken).toBe("preserve");
  await page.locator("#import-file").setInputFiles({
    name: "healthy-profile.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({
        kind: "solaria-profile",
        version: 1,
        profile: {
          version: 1,
          achievements: ["firstLord"],
          clearedEvents: [],
          completedClasses: [],
          cosmetic: "amber",
          tutorialSeen: true,
        },
        discovered: [1, 20],
        records: [],
      }),
    ),
  });
  await expect(page.getByRole("status")).toContainText("匯入成功");
  await page.getByRole("button", { name: "成就與外觀", exact: true }).click();
  await expect(page.locator('[data-action="cosmetic:amber"]')).toContainText(
    "✓",
  );
  const repairedDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "匯出星典備份", exact: true }).click();
  const repaired = JSON.parse(
    await readFile((await (await repairedDownload).path())!, "utf8"),
  );
  expect(repaired.discovered).toEqual([1, 20]);
  await expect(page.locator("#overlay")).not.toHaveClass(/saving/);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "SOLARIA", exact: true }),
  ).toBeVisible();
});
test("模擬配額失敗保留交易前存檔，匯出含目前工作狀態", async ({ page }) => {
  await load(page, equipmentRun());
  await page.evaluate(() => {
    const prior = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (value, key) {
      if (this.name === "run" && key === "latest")
        throw new DOMException("full", "QuotaExceededError");
      return prior.call(this, value, key);
    };
  });
  await page.keyboard.press("KeyI");
  await page.locator('[data-action="equip:one-ring"]').click();
  await expect(
    page.getByRole("heading", { name: "存檔需要處理" }),
  ).toBeVisible();
  await expect(page.getByRole("status")).toContainText("儲存空間不足");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "匯出備份", exact: true }).click();
  const raw = JSON.parse(
    await readFile((await (await download).path())!, "utf8"),
  );
  expect(raw.latest.current.bag[0].id).toBe("one-ring");
  expect(raw.latest.current.equipment).toEqual({});
  expect(raw.working.current.equipment.ring.id).toBe("one-ring");
});
test("全螢幕保持8:5與返回尺寸、音量靜音重載後恢復原值", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "SOLARIA", exact: true }),
  ).toBeVisible();
  await page.locator("#volume").evaluate((node: HTMLInputElement) => {
    node.value = "0.6";
    node.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await page.locator("#mute").click();
  await expect(page.locator("#mute")).toHaveText("音效 關");
  await expect(page.locator("#overlay")).not.toHaveClass(/saving/);
  await page.reload();
  await page.locator("#mute").click();
  await expect(page.locator("#volume")).toHaveValue("0.6");
  await page.getByRole("button", { name: "全螢幕", exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => !!document.fullscreenElement))
    .toBe(true);
  const box = (await page.locator("canvas").boundingBox())!;
  expect(box.width / box.height).toBeCloseTo(1.6, 2);
  await page.evaluate(() => document.exitFullscreen());
  await expect
    .poll(() => page.evaluate(() => !!document.fullscreenElement))
    .toBe(false);
});
test("瀏覽器拒絕IndexedDB時顯示存檔錯誤而非WebGL，恢復存取可重試", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const native = indexedDB.open.bind(indexedDB);
    let blocked = true;
    Object.defineProperty(window, "restoreSaveAccess", {
      value: () => {
        blocked = false;
      },
    });
    indexedDB.open = ((...args: Parameters<IDBFactory["open"]>) => {
      if (!blocked) return native(...args);
      const req = {
        onerror: null as null | (() => void),
        error: new DOMException("blocked", "SecurityError"),
      };
      setTimeout(() => req.onerror?.(), 0);
      return req as unknown as IDBOpenDBRequest;
    }) as IDBFactory["open"];
  });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "存檔需要處理" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "無法載入遊戲" })).toHaveCount(
    0,
  );
  await page.evaluate(() => {
    (
      window as unknown as { restoreSaveAccess: () => void }
    ).restoreSaveAccess();
  });
  await page.getByRole("button", { name: "重新讀取", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "SOLARIA", exact: true }),
  ).toBeVisible();
});
test("美術資源失敗可重試，既有存檔保持", async ({ page }) => {
  await load(page, equipmentRun());
  await page.route("**/boss-atlas.png", (route) => route.abort());
  await expect(page.locator("#overlay")).not.toHaveClass(/saving/);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "無法載入遊戲" }),
  ).toBeVisible();
  await page.unroute("**/boss-atlas.png");
  await page.getByRole("button", { name: "重試", exact: true }).click();
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
  await expect(page.locator("#hud .status")).toBeVisible();
  await page.keyboard.press("KeyI");
  await expect(page.locator('[data-action="equip:one-ring"]')).toHaveCount(1);
});
test("選擇未保存時離頁受保護，交易完成後允許離頁", async ({ page }) => {
  await load(page, equipmentRun());
  await page.evaluate(() => {
    const original = IDBDatabase.prototype.transaction;
    const descriptor = Object.getOwnPropertyDescriptor(
      IDBTransaction.prototype,
      "oncomplete",
    )!;
    IDBDatabase.prototype.transaction = function (stores, mode, options) {
      const tx = original.call(this, stores, mode, options);
      if (
        mode === "readwrite" &&
        (Array.isArray(stores) ? stores.includes("run") : stores === "run")
      )
        Object.defineProperty(tx, "oncomplete", {
          set(fn) {
            descriptor.set!.call(tx, (event: Event) =>
              setTimeout(() => fn?.call(tx, event), 1500),
            );
          },
          get() {
            return descriptor.get!.call(tx);
          },
        });
      return tx;
    };
  });
  await page.keyboard.press("KeyI");
  await page.locator('[data-action="equip:one-ring"]').click();
  await expect(page.locator("#overlay")).toHaveClass(/saving/);
  expect(
    await page.evaluate(() => {
      const event = new Event("beforeunload", { cancelable: true });
      window.dispatchEvent(event);
      return event.defaultPrevented;
    }),
  ).toBe(true);
  await expect(page.locator("#overlay")).not.toHaveClass(/saving/);
  expect(
    await page.evaluate(() => {
      const event = new Event("beforeunload", { cancelable: true });
      window.dispatchEvent(event);
      return event.defaultPrevented;
    }),
  ).toBe(false);
  await page.reload();
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
  await expect(page.locator("#hud .status")).toBeVisible();
  await page.keyboard.press("KeyI");
  await expect(page.locator('[data-action="discard:one-ring"]')).toHaveCount(1);
});
