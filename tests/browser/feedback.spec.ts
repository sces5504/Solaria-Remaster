import { test, expect, type Page } from "@playwright/test";
import { newRun, settle } from "../../src/game/core/run";
import type { Run } from "../../src/game/core/types";
import { actor } from "../../src/game/data/world";
async function loadFixture(page: Page, r: Run) {
  await page.goto("/");
  await page.getByRole("button", { name: "匯入存檔", exact: true }).click();
  await page.locator("#import-file").setInputFiles({
    name: "fixture.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({ version: 1, revision: 0, current: r, entry: r }),
    ),
  });
  await expect(page.getByRole("status")).toContainText("匯入成功");
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
}
for (const cls of ["sword", "bow", "mage"] as const)
  test(`${cls} 清關後左鍵連射同時右鍵技能與 E 進門`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const r = newRun(cls, 122);
    r.phase = "POST_CLEAR";
    r.enemies = [];
    r.reserves = [];
    r.obstacles = [];
    r.player.x = 900;
    r.player.y = 320;
    await loadFixture(page, r);
    const box = (await page.locator("canvas").boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.5);
    await page.mouse.down({ button: "left" });
    await page.waitForTimeout(300);
    await page.mouse.down({ button: "right" });
    await page.mouse.up({ button: "right" });
    await expect(page.locator("#sidebar")).toContainText(/冷卻 \d/);
    await page.waitForTimeout(600);
    await page.screenshot({ path: `test-results/${cls}-attack.png` });
    await page.keyboard.press("Escape");
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "匯出存檔", exact: true }).click();
    const d = await download;
    const { readFile } = await import("node:fs/promises");
    const exported = JSON.parse(await readFile((await d.path())!, "utf8"));
    expect(exported.current.player.skillCast).toBeGreaterThan(0);
    expect(exported.current.player.casts).toBeGreaterThan(1);
    await page.mouse.up({ button: "left" });
    await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
    await page.waitForTimeout(200);
    await expect(page.locator("#hud")).toContainText("第 1 / 5");
    await page.keyboard.press("KeyE");
    await expect(page.locator("#hud")).toContainText("第 2 / 5");
    expect(errors).toEqual([]);
  });
test("卡片整張呈現稀有度色，1920／1366／1280 視窗不需捲動", async ({
  page,
}) => {
  const r = newRun("mage", 76);
  r.phase = "UPGRADE_CHOICE";
  r.pendingLevels = 1;
  r.enemies = [];
  r.reserves = [];
  r.choices = [1, 9, 13];
  await loadFixture(page, r);
  const backgrounds = await page
    .locator(".card")
    .evaluateAll((nodes) =>
      nodes.map((n) => getComputedStyle(n).backgroundImage),
    );
  expect(new Set(backgrounds).size).toBe(3);
  await expect(page.locator(".card .rarity")).not.toContainText([
    "藍",
    "紫",
    "黃",
  ]);
  await page.screenshot({ path: "test-results/rarity-cards.png" });
  for (const [width, height] of [
    [1920, 1080],
    [1366, 768],
    [1280, 720],
  ]) {
    await page.setViewportSize({ width, height });
    const box = (await page.locator("canvas").boundingBox())!;
    expect(box.width / box.height).toBeCloseTo(1.6, 2);
    expect(box.height).toBeGreaterThan(height * 0.8);
    expect(box.y + box.height).toBeLessThanOrEqual(height);
    expect(
      await page.evaluate(() => document.documentElement.scrollHeight),
    ).toBeLessThanOrEqual(height);
    await expect(page.locator("#sidebar")).toBeVisible();
  }
});
for (const kind of [6, 7])
  test(`草原 Boss ${kind} 與元素場景 WebGL 可見`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const r = newRun("mage", 84);
    r.room = 5;
    r.boss = kind - 5;
    r.enemies = [actor(101, kind, 750, 330)];
    r.reserves = [];
    r.phase = "ROOM_INTRO";
    r.elements = ["fire", "ice"];
    r.cards = { 19: 1, 15: 1, 20: 1, 17: 1, 39: 1 };
    r.fusion = "frostfire";
    r.player.invulnerable = 999;
    await loadFixture(page, r);
    await page.getByRole("button", { name: "進入戰鬥" }).click();
    const box = (await page.locator("canvas").boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.65, box.y + box.height * 0.5);
    await page.mouse.down();
    await page.mouse.click(box.x + box.width * 0.65, box.y + box.height * 0.5, {
      button: "right",
    });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `test-results/boss-${kind}.png` });
    await page.mouse.up();
    await expect(page.locator(".boss")).toContainText(
      kind === 6 ? "狼王" : "邪惡山羊王",
    );
    expect(errors).toEqual([]);
  });

test("清算先吸附再選卡，地面裝備與出口提示可互動", async ({ page }) => {
  const r = newRun("sword", 531);
  r.phase = "COMBAT";
  r.enemies = [];
  r.reserves = [];
  r.obstacles = [];
  r.drops = [{ id: 100, kind: "xp", value: 100, x: 820, y: 320 }];
  settle(r);
  // Extend only the presentation window so software-rendered CI can capture it.
  r.settlementEnds = r.time + 3;
  await loadFixture(page, r);
  await expect(page.locator(".settlement-note")).toBeVisible();
  await expect(page.locator(".card")).toHaveCount(0);
  await page.screenshot({ path: "test-results/settlement-flight.png" });
  await expect(page.locator(".card")).toHaveCount(3);
  await page.locator(".card").first().click();
  await expect(page.locator("#hud")).toContainText("清關");

  const loot = newRun("bow", 532);
  loot.phase = "POST_CLEAR";
  loot.enemies = [];
  loot.reserves = [];
  loot.items = [
    { id: "beam", slot: "ring", rarity: "黃", affixes: [], x: 130, y: 320 },
  ];
  page.once("dialog", (dialog) => dialog.accept());
  await loadFixture(page, loot);
  await expect(page.locator(".item-label")).toContainText("E 檢取");
  await page.screenshot({ path: "test-results/gear-beam.png" });
  await page.keyboard.press("KeyE");
  await expect(page.locator(".item-label")).toHaveCount(0);
  await expect(page.locator(".door-label")).toContainText("靠近按 E");
});
