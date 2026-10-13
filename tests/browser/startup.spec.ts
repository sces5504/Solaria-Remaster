import { cards } from "../../src/game/data/cards";
import { test, expect } from "@playwright/test";
test("WebGL 主選單、三職業、輸入、暫停與入口重載", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "SOLARIA", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Solaria 遊戲畫布")).toBeVisible();
  await page.getByRole("button", { name: "開始新局", exact: true }).click();
  if (await page.getByRole("button", { name: "選擇旅人", exact: true }).count())
    await page.getByRole("button", { name: "選擇旅人", exact: true }).click();
  await expect(page.getByRole("button", { name: /劍士/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /弓箭手/ })).toBeVisible();
  await page.getByRole("button", { name: /法師/ }).click();
  await page.getByRole("button", { name: "進入戰鬥" }).click();
  const canvas = page.getByLabel("Solaria 遊戲畫布");
  const rect = (await canvas.boundingBox())!;
  expect(rect.width / rect.height).toBeCloseTo(1.6, 2);
  await page.mouse.move(rect.x + rect.width * 0.65, rect.y + rect.height * 0.5);
  await page.mouse.down();
  await page.waitForTimeout(600);
  await page.mouse.up();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("heading", { name: "日光，等你歸來" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
  await expect(page.locator("#hud .status")).toBeVisible();
  await page.keyboard.press("KeyI");
  await expect(page.getByRole("status")).toContainText("需要先清關");
  await expect(page.locator("#overlay")).not.toHaveClass(/saving/);
  await page.reload();
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
  await expect(page.locator("#hud .status")).toBeVisible();
  await expect(page.getByRole("button", { name: "進入戰鬥" })).toBeVisible();
  expect(errors).toEqual([]);
});
test("圖鑑完整、音效設定持續", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: `卡片圖鑑 · ${cards.length}` })
    .click();
  await expect(page.locator(".catalog article")).toHaveCount(cards.length);
  await page.locator("#mute").click();
  await expect(page.locator("#mute")).toHaveText("音效 關");
  await expect(page.locator("#overlay")).not.toHaveClass(/saving/);
  await page.reload();
  await expect(page.locator("#mute")).toHaveText("音效 關");
});

test("真實 IndexedDB 選卡不重抽、清關穿戴保存與匯入損壞保護", async ({
  page,
}) => {
  const { newRun } = await import("../../src/game/core/run");
  const { drawChoices, itemFor } =
    await import("../../src/game/systems/progression");
  const r = newRun("bow", 55);
  r.phase = "UPGRADE_CHOICE";
  r.enemies = [];
  r.pendingLevels = 1;
  drawChoices(r);
  const original = [...r.choices];
  const item = itemFor(r, 9, 0)!;
  r.bag = [item];
  r.settledOnce = true;
  await page.goto("/");
  await page.getByRole("button", { name: "匯入存檔", exact: true }).click();
  await page.locator("#import-file").setInputFiles({
    name: "checkpoint.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({ version: 1, revision: 0, current: r, entry: r }),
    ),
  });
  await expect(page.getByRole("status")).toContainText("匯入成功");
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
  await expect(page.locator("#hud .status")).toBeVisible();
  await expect(page.locator(".card")).toHaveCount(3);
  const shown = await page
    .locator('button[data-action^="choose:"]')
    .evaluateAll((elements) =>
      elements.map((e) =>
        Number((e as HTMLElement).dataset.action!.split(":")[1]),
      ),
    );
  expect(shown).toEqual(original);
  await expect(page.locator("#overlay")).not.toHaveClass(/saving/);
  await page.reload();
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
  await expect(page.locator("#hud .status")).toBeVisible();
  await expect(page.locator('button[data-action^="choose:"]')).toHaveCount(3);
  await page.locator('button[data-action^="choose:"]').first().click();
  await expect(page.locator("#overlay")).toHaveClass(/hidden/);
  await page.keyboard.press("KeyI");
  await expect(page.getByRole("heading", { name: "裝備與背包" })).toBeVisible();
  await page.getByRole("button", { name: "穿戴", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "背包 0 / 12" }),
  ).toBeVisible();
  await expect(page.locator("#overlay")).not.toHaveClass(/saving/);
  await page.reload();
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
  await expect(page.locator("#hud .status")).toBeVisible();
  await page.keyboard.press("KeyI");
  await expect(
    page.getByRole("heading", { name: "背包 0 / 12" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "卸下至地面" })).toHaveCount(1);
});
