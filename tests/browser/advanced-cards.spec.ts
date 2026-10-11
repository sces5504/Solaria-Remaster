import { test, expect, type Page } from "@playwright/test";
import { newRun } from "../../src/game/core/run";
import { choose, grantTestCard } from "../../src/game/systems/progression";
import type { Run } from "../../src/game/core/types";
async function load(page: Page, r: Run) {
  await page.goto("/");
  await page.getByRole("button", { name: "匯入存檔", exact: true }).click();
  await page.locator("#import-file").setInputFiles({
    name: "choice.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({ version: 1, revision: 0, current: r, entry: r }),
    ),
  });
  await expect(page.getByRole("status")).toContainText("匯入成功");
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
}
test("元素使三元素的強制融合選擇重載後仍保留、卡片圖鑑85張", async ({
  page,
}) => {
  const r = newRun("mage", 181);
  grantTestCard(r, 80);
  grantTestCard(r, 15);
  grantTestCard(r, 24);
  r.phase = "UPGRADE_CHOICE";
  r.pendingLevels = 1;
  r.choices = [19, 1, 2];
  r.settledOnce = true;
  r.enemies = [];
  choose(r, 19);
  await load(page, r);
  await expect(
    page.getByRole("heading", { name: "定下你的共鳴" }),
  ).toBeVisible();
  await expect(page.locator("#overlay")).not.toHaveClass(/saving/);
  await page.reload();
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
  await page.locator('[data-action="fusion:frostfire"]').click();
  await expect(page.locator("#sidebar")).toContainText("冰火奧術");
  await expect(page.locator("#overlay")).not.toHaveClass(/saving/);
  await page.reload();
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
  await expect(page.locator("#sidebar")).toContainText("冰火奧術");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "回主選單", exact: true }).click();
  await page.getByRole("button", { name: "卡片圖鑑 · 85" }).click();
  await expect(page.locator(".catalog article")).toHaveCount(85);
});
test("命運賭徒選欄成本持續顯示，卸裝不複製且被封欄無法穿戴", async ({
  page,
}) => {
  const r = newRun("mage", 182);
  r.phase = "UPGRADE_CHOICE";
  r.pendingLevels = 1;
  r.choices = [85, 1, 2];
  r.settledOnce = true;
  r.enemies = [];
  for (const slot of ["armor", "ring", "amulet"] as const)
    r.equipment[slot] = {
      id: slot,
      slot,
      rarity: "藍",
      affixes: [{ stat: "armor", value: 2 }],
      x: 100,
      y: 100,
    };
  choose(r, 85);
  await load(page, r);
  await expect(
    page.getByRole("heading", { name: "留下一件信物" }),
  ).toBeVisible();
  await page.locator('[data-action="slot:ring"]').click();
  await expect(page.locator(".red-traits")).toContainText("僅留一裝備欄");
  await expect(page.locator("#hud .status")).toBeVisible();
  await page.keyboard.press("KeyI");
  await expect(
    page.getByRole("heading", { name: "背包 2 / 12" }),
  ).toBeVisible();
  await expect(page.locator('button[data-action^="equip:"]')).toHaveCount(2);
  for (const btn of await page.locator('button[data-action^="equip:"]').all())
    await expect(btn).toBeDisabled();
  await expect(page.locator("#overlay")).not.toHaveClass(/saving/);
  await page.reload();
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
  await expect(page.locator("#hud .status")).toBeVisible();
  await page.keyboard.press("KeyI");
  await expect(
    page.getByRole("heading", { name: "背包 2 / 12" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "卸下至地面" })).toHaveCount(1);
});

test("吸血鬼以灰色標明不可回復區，保留真實七成生命與四成上限", async ({
  page,
}) => {
  const r = newRun("mage", 799);
  grantTestCard(r, 79);
  r.player.hp = r.stats.maxHP * 0.7;
  await load(page, r);
  const cap = page.locator(".hp .healing-limit");
  await expect(cap).toBeVisible();
  const widths = await page.evaluate(() => {
    const node = document.querySelector("#hud .hp")!;
    const whole = node.getBoundingClientRect(),
      cap = node.querySelector(".healing-limit")!.getBoundingClientRect(),
      hp = node.querySelector("i")!.getBoundingClientRect();
    return {
      left: (cap.x - whole.x) / whole.width,
      cap: cap.width / whole.width,
      hp: hp.width / whole.width,
    };
  });
  expect(widths.left).toBeCloseTo(0.4, 2);
  expect(widths.cap).toBeCloseTo(0.6, 2);
  expect(widths.hp).toBeCloseTo(0.7, 2);
  await expect(page.locator(".hp")).toHaveAttribute("title", /回復上限40%/);
});
