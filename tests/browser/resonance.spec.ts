import { test, expect, type Page } from "@playwright/test";
import { newRun } from "../../src/game/core/run";
import { actor, populate } from "../../src/game/data/world";
import { area, context, visual } from "../../src/game/systems/combat";
import type { Run } from "../../src/game/core/types";
async function fixture(page: Page, r: Run) {
  await page.goto("/");
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "匯入存檔", exact: true }).click();
  await page.locator("#import-file").setInputFiles({
    name: "resonance.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({ version: 1, revision: 0, current: r, entry: r }),
    ),
  });
  await expect(page.getByRole("status")).toContainText("匯入成功");
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
  await expect(page.locator("#hud .status")).toBeVisible();
}
test("背景與持武器肖像、圖鑑取卡解鎖跨新局、刷新讀檔不能重用", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".menu")).toBeVisible();
  expect(
    await page
      .locator(".menu")
      .evaluate((n) => getComputedStyle(n).backgroundImage),
  ).toContain("twilight.svg");
  await page.screenshot({ path: "test-results/dusk-menu.png" });
  await page.getByRole("button", { name: "卡片圖鑑 · 59" }).click();
  await expect(page.locator(".catalog-card.locked")).toHaveCount(59);
  await expect(page.locator(".catalog")).not.toContainText("衝鋒斬");
  await page.getByRole("button", { name: "返回", exact: true }).click();
  await page.getByRole("button", { name: "開始新局", exact: true }).click();
  await page.screenshot({ path: "test-results/armed-portraits.png" });
  const r = newRun("sword", 754);
  r.phase = "UPGRADE_CHOICE";
  r.level = 3;
  r.pendingLevels = 2;
  r.enemies = [];
  r.reserves = [];
  r.choices = [41, 45, 47];
  await fixture(page, r);
  await expect(page.locator(".card-art")).toHaveCount(3);
  await page.screenshot({ path: "test-results/illustrated-choice.png" });
  await page.locator('[data-action="choose:47"]').click();
  await page.getByRole("button", { name: "刷新 · 1 次" }).click();
  await expect(page.getByRole("button", { name: "本次已刷新" })).toBeDisabled();
  await expect(page.locator("#overlay")).not.toHaveClass(/saving/);
  const offers = await page
    .locator(".card")
    .evaluateAll((ns) => ns.map((n) => (n as HTMLElement).dataset.action));
  await page.reload();
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
  await expect(page.getByRole("button", { name: "本次已刷新" })).toBeDisabled();
  expect(
    await page
      .locator(".card")
      .evaluateAll((ns) => ns.map((n) => (n as HTMLElement).dataset.action)),
  ).toEqual(offers);
  await page.locator(".card").first().click();
  await expect(page.locator("#overlay")).toHaveClass(/hidden/);
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("heading", { name: "日光，等你歸來" }),
  ).toBeVisible();
  await page.screenshot({ path: "test-results/dusk-pause.png" });
  await page.getByRole("button", { name: "光的記憶", exact: true }).click();
  await expect(page.locator('[data-card="47"]')).not.toHaveClass(/locked/);
  await expect(page.locator('[data-card="47"]')).toContainText("衝鋒斬");
  await page.getByRole("button", { name: "返回", exact: true }).click();
  await page.getByRole("button", { name: "回主選單", exact: true }).click();
  await page.getByRole("button", { name: "開始新局", exact: true }).click();
  await page.getByRole("button", { name: "確認新局", exact: true }).click();
  await page.reload();
  await page.getByRole("button", { name: "卡片圖鑑 · 59" }).click();
  await expect(page.locator('[data-card="47"]')).not.toHaveClass(/locked/);
});
test("戰鬥可 E 收裝備到背包，裝備整理仍需清關", async ({ page }) => {
  const r = newRun("sword", 755);
  r.phase = "ROOM_INTRO";
  r.enemies = [actor(100, 2, 820, 320)];
  r.enemies[0].controlUntil = 999;
  r.reserves = [];
  r.items = [
    {
      id: "combat-loot",
      slot: "ring",
      rarity: "黃",
      affixes: [],
      x: 125,
      y: 320,
    },
  ];
  await fixture(page, r);
  await page.getByRole("button", { name: "進入戰鬥" }).click();
  await expect(page.locator(".item-label")).toContainText("檢取");
  await page.keyboard.press("KeyE");
  await expect(page.locator(".item-label")).toHaveCount(0);
  await page.keyboard.press("KeyI");
  await expect(page.getByRole("status")).toContainText("需要先清關");
  await page.keyboard.press("Escape");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "匯出存檔", exact: true }).click();
  const d = await download;
  const { readFile } = await import("node:fs/promises");
  const saved = JSON.parse(await readFile((await d.path())!, "utf8"));
  expect(saved.current.bag[0].id).toBe("combat-loot");
  expect(saved.current.phase).toBe("COMBAT");
});
test("爆炸、雷柱、冰火場及衝鋒拖尾在 WebGL 可呈現", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const r = newRun("sword", 756);
  r.room = 5;
  r.boss = 2;
  populate(r);
  r.phase = "POST_CLEAR";
  r.enemies = [];
  r.reserves = [];
  r.player.x = 430;
  r.player.y = 320;
  r.cards[47] = 1;
  // Freeze a representative animation frame at the room briefing for a stable visual inspection.
  r.phase = "ROOM_INTRO";
  area(
    r,
    { x: 300, y: 400 },
    85,
    0,
    0,
    4,
    0.5,
    context(r, 22, "skill", ["fire"]),
  );
  area(
    r,
    { x: 700, y: 400 },
    85,
    0,
    0,
    4,
    0.5,
    context(r, 18, "skill", ["ice"]),
  );
  visual(r, "thunder", { x: 540, y: 210 }, 0, 0xffdba5, 65, 0, { enemy: true });
  visual(r, "burst", { x: 610, y: 320 }, 0, 0xffae67, 80, 0, {
    elements: ["fire"],
  });
  visual(r, "charge", { x: 430, y: 320 }, 0, 0xffd988, 40, 0);
  r.time = 0.07;
  await fixture(page, r);
  await page
    .locator("#overlay")
    .evaluate((n) => ((n as HTMLElement).style.visibility = "hidden"));
  await page.screenshot({ path: "test-results/impact-elements.png" });
  expect(errors).toEqual([]);
});
test("音量左側測試面板可搜尋給卡、換職業補覺醒，保留待選與刷新並讀檔", async ({
  page,
}) => {
  const r = newRun("sword", 879);
  r.phase = "UPGRADE_CHOICE";
  r.pendingLevels = 1;
  r.level = 2;
  r.choices = [1, 9, 13];
  r.rerollUsed = true;
  await fixture(page, r);
  const testBox = await page.locator("#testing").boundingBox();
  const volumeBox = await page.locator("#volume").boundingBox();
  expect(testBox!.x + testBox!.width).toBeLessThan(volumeBox!.x);
  await page.getByRole("button", { name: "測試", exact: true }).click();
  await expect(page.locator(".test-card")).toHaveCount(59);
  await page.getByRole("searchbox", { name: "搜尋測試卡片" }).fill("連鎖閃電");
  await expect(page.locator(".test-card:visible")).toHaveCount(1);
  await page.locator('[data-action="grant:29"]').click();
  await expect(page.locator("#overlay")).not.toHaveClass(/saving/);
  await expect(page.locator(".test-summary")).toContainText("雷");
  await expect(page.locator(".test-card:visible small")).toContainText("Lv.1");
  await expect(page.getByRole("searchbox")).toHaveValue("連鎖閃電");
  await page.getByRole("searchbox").fill("行星回響");
  await page.locator('[data-action="grant:58"]').click();
  await expect(page.locator("#overlay")).not.toHaveClass(/saving/);
  await expect(page.locator(".test-summary")).toContainText("法師");
  await expect(page.locator(".test-summary")).toContainText("3.0 秒");
  await page.screenshot({ path: "test-results/test-grants.png" });
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "本次已刷新" })).toBeDisabled();
  await page.reload();
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
  await expect(page.getByRole("button", { name: "本次已刷新" })).toBeDisabled();
  await page.getByRole("button", { name: "測試", exact: true }).click();
  await expect(
    page.locator('[data-action="grant:58"]').locator(".."),
  ).toContainText("Lv.1");
  await expect(
    page.locator('[data-action="grant:28"]').locator(".."),
  ).toContainText("Lv.1");
});
test("冰緩速、冰凍、電麻痺與粗連鎖分開呈現，遺跡柱與門没有切圖底框", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const r = newRun("mage", 880);
  r.templates[0] = 5;
  populate(r);
  r.phase = "ROOM_INTRO";
  r.enemies = [
    actor(200, 2, 280, 310),
    actor(201, 2, 460, 310),
    actor(202, 2, 650, 310),
  ];
  r.reserves = [];
  r.enemies[0].iceUntil = 3;
  r.enemies[1].iceUntil = 3;
  r.enemies[1].freezeUntil = 3;
  r.enemies[1].controlUntil = 3;
  r.enemies[2].stunUntil = 3;
  r.enemies[2].controlUntil = 3;
  visual(r, "arc", { x: 460, y: 310 }, 190, 0xffde72, 8, 0);
  visual(r, "thunder", { x: 810, y: 420 }, 0, 0xffdba5, 65, 0, { enemy: true });
  visual(r, "burst", { x: 420, y: 470 }, 0, 0xffaf65, 100, 0, {
    elements: ["fire"],
  });
  r.time = 0.12;
  await fixture(page, r);
  await page
    .locator("#overlay")
    .evaluate((n) => ((n as HTMLElement).style.visibility = "hidden"));
  await page.screenshot({ path: "test-results/radiance-status-cutouts.png" });
  expect(errors).toEqual([]);
});
