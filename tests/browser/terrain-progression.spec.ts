import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { newRun } from "../../src/game/core/run";
import { biomes, type BiomeId } from "../../src/game/data/biomes";
import { populate } from "../../src/game/data/world";
import type { Run } from "../../src/game/core/types";

async function fixture(page: Page, r: Run) {
  await page.goto("/");
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "匯入存檔", exact: true }).click();
  await page.locator("#import-file").setInputFiles({
    name: "terrain.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({ version: 1, revision: 0, current: r, entry: r }),
    ),
  });
  await expect(page.getByRole("status")).toContainText("匯入成功");
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
  await expect(page.locator("#hud .status")).toBeVisible();
}
async function exported(page: Page) {
  await page.keyboard.press("Escape");
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "匯出存檔", exact: true }).click();
  return JSON.parse(await readFile((await (await pending).path())!, "utf8"));
}
test("首局先手冊、兩元素與職業特色、移除重複資訊；之後新局直接選職", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "操作與製作資訊" }),
  ).toHaveCount(0);
  await expect(page.locator("#testing")).toBeHidden();
  await page.keyboard.type("wwssadadba");
  await expect(page.locator("#testing")).toBeHidden();
  await page.getByRole("button", { name: "開始新局", exact: true }).click();
  await expect(page.locator(".tutorial")).toContainText("最多覺醒兩種元素");
  await expect(page.locator('[data-action="class:sword"]')).toHaveCount(0);
  await page.getByRole("button", { name: "選擇旅人", exact: true }).click();
  await expect(page.locator('[data-action="class:sword"]')).toContainText(
    "格擋",
  );
  await expect(page.locator('[data-action="class:bow"]')).toContainText("射速");
  await expect(page.locator('[data-action="class:mage"]')).toContainText(
    "短冷卻",
  );
  await page.locator('[data-action="class:mage"]').click();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "旅人手札", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "旅人手冊", exact: true }).click();
  await expect(page.locator(".tutorial")).toContainText("Mori Fang");
  await page.getByRole("button", { name: "返回", exact: true }).click();
  await page.getByRole("button", { name: "回主選單", exact: true }).click();
  await page.getByRole("button", { name: "開始新局", exact: true }).click();
  await page.getByRole("button", { name: "確認新局", exact: true }).click();
  await expect(page.locator('[data-action="class:mage"]')).toBeVisible();
  expect(errors).toEqual([]);
});
test("密碼嚴格順序與重複鍵／輸入框不解鎖，跳關保存後可重載，31不增周目", async ({
  page,
}) => {
  const r = newRun("sword", 499);
  r.cards[3] = 2;
  r.level = 7;
  r.xp = 32;
  await fixture(page, r);
  await page.keyboard.type("wwsxsadadba");
  await expect(page.locator("#testing")).toBeHidden();
  await page.keyboard.down("w");
  await page.keyboard.down("w");
  await page.keyboard.up("w");
  await page.keyboard.type("ssadadba");
  await expect(page.locator("#testing")).toBeHidden();
  await page.keyboard.type("wwssadadba");
  await expect(page.locator("#testing")).toBeVisible();
  await page.locator("#testing").click();
  await expect(page.locator("#test-room option")).toHaveCount(31);
  await page.getByLabel("跳關目的地").selectOption("17");
  await page.getByRole("button", { name: "跳至此關", exact: true }).click();
  await expect(page.locator("#overlay")).toContainText("第 17 / 31");
  await expect(page.locator("#overlay")).not.toHaveClass(/saving/);
  const save = await exported(page);
  expect(save.current.room).toBe(17);
  expect(save.current.loop).toBe(1);
  expect(save.current.journey).toEqual(r.journey);
  expect(save.current.cards).toEqual(r.cards);
  expect(save.current.level).toBe(7);
  expect(save.current.xp).toBe(32);
  expect(save.entry.room).toBe(17);
  await page.reload();
  await expect(page.locator("#testing")).toBeHidden();
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
  await expect(page.locator("#overlay")).toContainText("第 17 / 31");
  await page.keyboard.type("wwssadadba");
  await page.locator("#testing").click();
  await page.getByLabel("跳關目的地").selectOption("31");
  await page.getByRole("button", { name: "跳至此關", exact: true }).click();
  await expect(page.locator("#overlay")).toContainText("第 31 / 31");
  await expect(page.locator('[data-action="nextLoop"]')).toHaveCount(0);
});
test("全螢幕在1024／1280／1920寬保持8:5，右側欄不蓋畫布", async ({ page }) => {
  await fixture(page, newRun("mage", 501));
  test.setTimeout(120000);
  for (const [width, height] of [
    [1024, 768],
    [1280, 720],
    [1920, 1080],
    [900, 700],
  ]) {
    await page.setViewportSize({ width, height });
    await page.locator("#fullscreen").click();
    await expect
      .poll(() => page.evaluate(() => Boolean(document.fullscreenElement)))
      .toBe(true);
    const canvas = (await page.getByLabel("Solaria 遊戲畫布").boundingBox())!;
    expect(canvas.width / canvas.height).toBeCloseTo(1.6, 2);
    expect(canvas.x).toBeGreaterThanOrEqual(-1);
    expect(canvas.x + canvas.width).toBeLessThanOrEqual(width + 1);
    expect(canvas.y + canvas.height).toBeLessThanOrEqual(height + 1);
    const sidebar = page.locator("#sidebar");
    if (await sidebar.isVisible()) {
      const side = (await sidebar.boundingBox())!;
      expect(side.x).toBeGreaterThanOrEqual(canvas.x + canvas.width - 1);
      expect(side.x + side.width).toBeLessThanOrEqual(width + 1);
    }
    await page.evaluate(() => document.exitFullscreen());
  }
});
test("舊1.2.0地形快照原樣繼續，清關少XP仍有一級與選卡，重新載入不重發", async ({
  page,
}) => {
  const r = newRun("mage", 502);
  r.room = 26;
  r.level = 18;
  r.xp = 0;
  r.phase = "SETTLEMENT";
  r.settledOnce = true;
  r.settlementEnds = 0.7;
  r.roomEntryLevel = undefined;
  r.enemies = [];
  r.reserves = [];
  r.hazards = [];
  r.event = undefined;
  r.drops = [{ id: 99111, kind: "xp", value: 12, x: 700, y: 320 }];
  await fixture(page, r);
  await expect(
    page.getByRole("heading", { name: "選擇一份力量" }),
  ).toBeVisible();
  await page.locator('[data-action^="choose:"]').first().click();
  await expect(page.locator("#overlay")).not.toHaveClass(/saving/);
  const save = await exported(page);
  expect(save.current.level).toBe(19);
  expect(save.current.obstacles).toEqual(r.obstacles);
  await page.reload();
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
  await expect(page.locator('[data-action^="choose:"]')).toHaveCount(0);
  await expect(page.locator("#hud .status")).toContainText("Lv.19");
});
for (const biome of Object.keys(biomes) as BiomeId[]) {
  test(`${biome} 新地形畫面、可辨識障礙與不同房型`, async ({ page }, info) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const r = newRun("sword", 901);
    r.room = 6;
    r.loop = 2;
    r.biome = biome;
    r.templates = [4, 1, 2, 3];
    populate(r);
    r.event = undefined;
    await fixture(page, r);
    await page
      .locator("#overlay")
      .evaluate((n) => ((n as HTMLElement).style.visibility = "hidden"));
    await page
      .getByLabel("Solaria 遊戲畫布")
      .screenshot({ path: info.outputPath(`${biome}.png`) });
    expect(errors).toEqual([]);
  });
}

test("測試版獨立存檔不覆寫正式IndexedDB，音量與旅程各自保存", async ({
  page,
}) => {
  await page.goto("/");
  test.skip(
    !(await page.title()).includes("待確認測試版"),
    "僅預覽build啟用獨立鍵",
  );
  await expect(page.locator(".menu")).toBeVisible();
  await page.evaluate(async () => {
    localStorage.setItem("solaria-volume", "0.73");
    await new Promise<void>((resolve, reject) => {
      const q = indexedDB.open("solaria-remaster", 1);
      q.onupgradeneeded = () => {
        q.result.createObjectStore("run");
        q.result.createObjectStore("profile");
      };
      q.onerror = () => reject(q.error);
      q.onsuccess = () => {
        const tx = q.result.transaction("run", "readwrite");
        tx.objectStore("run").put({ official: "keep-v1.2.0" }, "sentinel");
        tx.oncomplete = () => {
          q.result.close();
          resolve();
        };
      };
    });
  });
  await page.getByRole("button", { name: "開始新局", exact: true }).click();
  await page.getByRole("button", { name: "選擇旅人", exact: true }).click();
  await page.locator('[data-action="class:sword"]').click();
  await expect(page.locator("#overlay")).not.toHaveClass(/saving/);
  await page.locator("#volume").evaluate((node) => {
    (node as HTMLInputElement).value = "0.1";
    node.dispatchEvent(new Event("input", { bubbles: true }));
  });
  const state = await page.evaluate(async () => ({
    names: (await indexedDB.databases()).map((db) => db.name),
    officialVolume: localStorage.getItem("solaria-volume"),
    previewVolume: localStorage.getItem(
      "solaria-volume-playtest-terrain-1.3.0",
    ),
    sentinel: await new Promise<unknown>((resolve) => {
      const q = indexedDB.open("solaria-remaster", 1);
      q.onsuccess = () => {
        const req = q.result
          .transaction("run")
          .objectStore("run")
          .get("sentinel");
        req.onsuccess = () => {
          q.result.close();
          resolve(req.result);
        };
      };
    }),
  }));
  expect(state.names).toContain("solaria-remaster-playtest-terrain-1.3.0");
  expect(state.officialVolume).toBe("0.73");
  expect(state.previewVolume).toBe("0.1");
  expect(state.sentinel).toEqual({ official: "keep-v1.2.0" });
});
