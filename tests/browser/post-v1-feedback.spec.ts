import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { newRun, idleCommand } from "../../src/game/core/run";
import { actor, populate } from "../../src/game/data/world";
import { createHazards } from "../../src/game/systems/hazards";
import { legal } from "../../src/game/systems/geometry";
import { cards, eligible } from "../../src/game/data/cards";
import { equipmentCatalog } from "../../src/game/data/equipment";
import { syncPumpkin, pumpkin } from "../../src/game/systems/companion";
import type { Run, Item } from "../../src/game/core/types";
const color: Record<string, string> = {
  藍: "rgb(153, 198, 219)",
  紫: "rgb(195, 169, 222)",
  黃: "rgb(234, 208, 132)",
  青: "rgb(147, 216, 218)",
  橘: "rgb(233, 174, 105)",
  紅: "rgb(239, 135, 153)",
};
test.beforeEach(({ page }) => page.on("dialog", (d) => d.accept()));
async function load(page: Page, r: Run, discovered: number[] = []) {
  await page.goto("./");
  await page.getByRole("button", { name: "匯入存檔", exact: true }).click();
  await page.locator("#import-file").setInputFiles({
    name: "feedback.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({
        version: 1,
        revision: 0,
        current: r,
        entry: r,
        discovered,
      }),
    ),
  });
  await expect(page.getByRole("status")).toContainText("匯入成功");
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
  await expect(page.locator("#hud .status")).toBeVisible();
}
async function exportRun(page: Page) {
  await expect(page.locator("#overlay")).not.toHaveClass(/saving/);
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "匯出存檔", exact: true }).click();
  return JSON.parse(await readFile((await (await download).path())!, "utf8"));
}
function special(ability: keyof typeof equipmentCatalog): Item {
  const d = equipmentCatalog[ability];
  return {
    id: ability,
    ability,
    name: d.name,
    slot: d.slot,
    rarity: d.rarity,
    affixes: [],
    x: 0,
    y: 0,
  };
}
test("五色裝備背包／側欄名稱、六色構築與已知圖鑑，不揭未知卡名", async ({
  page,
}, info) => {
  const r = newRun("mage", 707);
  r.phase = "POST_CLEAR";
  r.settledOnce = true;
  r.enemies = [];
  r.reserves = [];
  r.equipment = {
    armor: { id: "blue", slot: "armor", rarity: "藍", affixes: [], x: 0, y: 0 },
    ring: special("starFlow"),
    amulet: special("frostBell"),
  };
  r.bag = [
    { id: "bag-blue", slot: "armor", rarity: "藍", affixes: [], x: 0, y: 0 },
    { id: "bag-purple", slot: "ring", rarity: "紫", affixes: [], x: 0, y: 0 },
    { id: "bag-yellow", slot: "amulet", rarity: "黃", affixes: [], x: 0, y: 0 },
    special("molten"),
    special("ghostArmor"),
  ];
  r.cards = { 1: 1, 9: 1, 13: 1, 15: 1, 70: 1, 78: 1 };
  r.elements = ["ice"];
  await load(page, r, [1, 9, 13, 15, 70, 78]);
  for (const rarity of ["藍", "橘", "紅"])
    await expect(
      page.locator(`#sidebar .equipment-mini.${rarity} .rarity`),
    ).toHaveCSS("color", color[rarity]);
  await expect(page.locator("#sidebar")).toContainText("星流環");
  await expect(page.locator("#sidebar")).toContainText("霜鈴災厄");
  await page.keyboard.press("KeyI");
  for (const rarity of ["藍", "紫", "黃", "橘", "紅"])
    await expect(page.locator(`.bag .rarity.${rarity}`)).toHaveCSS(
      "color",
      color[rarity],
    );
  await page.screenshot({ path: info.outputPath("rarity-inventory.png") });
  await page.keyboard.press("KeyC");
  for (const rarity of ["藍", "紫", "青", "黃", "橘", "紅"])
    await expect(page.locator(`.owned-card.${rarity}`)).toHaveCSS(
      "color",
      color[rarity],
    );
  await page.getByRole("button", { name: "返回戰場", exact: true }).click();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "光的記憶", exact: true }).click();
  const orange = await page
    .locator('.catalog-card[data-card="70"]')
    .evaluate((el) => getComputedStyle(el).backgroundImage);
  expect(orange).toContain("rgb(165, 106, 54)");
  const red = await page
    .locator('.catalog-card[data-card="78"]')
    .evaluate((el) => getComputedStyle(el).backgroundImage);
  expect(red).toContain("rgb(150, 62, 84)");
  const unknown = page.locator('.catalog-card[data-card="71"]');
  await expect(unknown).toHaveClass(/locked/);
  await expect(unknown).toContainText("未曾相遇");
  await expect(unknown).not.toContainText(cards.find((c) => c.id === 71)!.name);
  await page.screenshot({ path: info.outputPath("rarity-catalog.png") });
});
test("橘紅選卡整張／hover亮光對應稀有度，圖案保留能力主題", async ({
  page,
}, info) => {
  const r = newRun("mage", 713);
  r.phase = "UPGRADE_CHOICE";
  r.level = 26;
  r.pendingLevels = 1;
  r.elements = ["ice", "fire"];
  r.cards = { 15: 1, 19: 1 };
  r.choices = [1, 70, 79];
  for (const id of r.choices)
    expect(
      eligible(
        r,
        cards.find((c) => c.id === id)!,
      ),
    ).toBe(true);
  await load(page, r);
  expect(
    await page
      .locator(".card.橘")
      .evaluate((el) => getComputedStyle(el).getPropertyValue("--card").trim()),
  ).toBe("#ffba72");
  expect(
    await page
      .locator(".card.紅")
      .evaluate((el) => getComputedStyle(el).getPropertyValue("--card").trim()),
  ).toBe("#ff9aaa");
  // Ability illustrations keep their accepted family colours, independently
  // of whole-card rarity backgrounds and hover illumination.
  await expect(page.locator(".card.橘 .card-art")).toHaveCSS(
    "color",
    "rgb(213, 216, 170)",
  );
  await page.locator(".card.橘").hover();
  expect(
    await page
      .locator(".card.橘")
      .evaluate((el) => getComputedStyle(el).backgroundImage),
  ).toContain("rgb(165, 106, 54)");
  await page.screenshot({ path: info.outputPath("rarity-choice.png") });
});
test("魔王城雷射機關呈地面印記且可跨越，真石柱仍碰撞", async ({
  page,
}, info) => {
  const r = newRun("mage", 719);
  r.room = 26;
  r.biome = "castle";
  populate(r);
  createHazards(r);
  r.player.invulnerable = 1000;
  const h = r.hazards!.find((h) => legal(r, { x: h.x - 48, y: h.y }, 12));
  expect(h).toBeDefined();
  for (const o of r.obstacles.filter((o) => o.kind !== "lake"))
    expect(legal(r, { x: o.x + o.w / 2, y: o.y + o.h / 2 }, 0)).toBe(false);
  r.player.x = h!.x - 48;
  r.player.y = h!.y;
  await load(page, r);
  await page.getByRole("button", { name: "進入戰鬥", exact: true }).click();
  const before = await page.evaluate(
    () => (window as any).solariaDiagnostics().core.time,
  );
  await page.keyboard.down("KeyD");
  await expect
    .poll(
      () => page.evaluate(() => (window as any).solariaDiagnostics().core.time),
      { timeout: 30000 },
    )
    .toBeGreaterThanOrEqual(before + 0.4);
  await page.keyboard.up("KeyD");
  await page.keyboard.press("Escape");
  const saved = await exportRun(page);
  expect(saved.current.player.x).toBeGreaterThan(h!.x + 12);
  await page
    .locator("#overlay")
    .evaluate((el) => (el.style.visibility = "hidden"));
  await page
    .getByLabel("Solaria 遊戲畫布")
    .screenshot({ path: info.outputPath("castle-ground-markers.png") });
});
test("舊鬼甲快照的南瓜250上限，玩家生命強化不再放大", async ({ page }) => {
  const r = newRun("mage", 727);
  r.equipment.armor = special("ghostArmor");
  r.cards[1] = 20;
  r.level = 21;
  r.loop = 2;
  syncPumpkin(r);
  pumpkin(r)!.maximum = 810;
  pumpkin(r)!.hp = 810;
  r.player.invulnerable = 1000;
  r.enemies = [actor(9, 1, 900, 500)];
  r.enemies[0].nextAttack = 1000;
  r.reserves = [];
  await load(page, r);
  await page.getByRole("button", { name: "進入戰鬥", exact: true }).click();
  await expect
    .poll(
      () => page.evaluate(() => (window as any).solariaDiagnostics().core.tick),
      { timeout: 30000 },
    )
    .toBeGreaterThan(0);
  await page.keyboard.press("Escape");
  const saved = await exportRun(page);
  expect(saved.current.companion.maximum).toBe(250);
  expect(saved.current.companion.hp).toBeLessThanOrEqual(250);
  expect(saved.current.stats.maxHP).toBeGreaterThan(250);
});
