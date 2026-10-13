import { test, expect, type Page } from "@playwright/test";
import { newRun } from "../../src/game/core/run";
import { populate } from "../../src/game/data/world";
import { createHazards } from "../../src/game/systems/hazards";
import type { BiomeId } from "../../src/game/data/biomes";

async function load(page: Page, biome: BiomeId, profile: number, seed: number) {
  const r = newRun("sword", seed);
  r.room = 1;
  r.biome = biome;
  r.templates = [profile, 0, 1, 2];
  r.seenEvents = [
    "christmas",
    "bloodmoon",
    "halloween",
    "alien",
    "meteor",
    "army",
  ];
  populate(r);
  createHazards(r);
  r.enemies = [];
  r.reserves = [];
  await page.goto("/");
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "匯入存檔", exact: true }).click();
  await page.locator("#import-file").setInputFiles({
    name: "theme.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({ version: 1, revision: 0, current: r, entry: r }),
    ),
  });
  await expect(page.getByRole("status")).toContainText("匯入成功");
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "進入戰鬥", exact: true }),
  ).toBeVisible();
  return r;
}
for (const [biome, profile, name] of [
  ["meadow", 4, "四季樹庭"],
  ["meadow", 1, "碎岩之岸"],
  ["desert", 3, "三重綠洲"],
  ["icefield", 3, "三座霜庭"],
  ["volcano", 0, "熔池環岸"],
  ["jungle", 3, "三座孢林"],
  ["stars", 0, "軌道環臺"],
  ["castle", 4, "黑曜長廊"],
] as const)
  test(`房名布局 ${name}：地面、掩體、水域與裝飾`, async ({ page }, info) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const r = await load(page, biome, profile, 149);
    await expect(
      page.getByRole("heading", { name, exact: true }),
    ).toBeVisible();
    expect(r.roomTheme).toBe(name);
    await page
      .locator("#overlay")
      .evaluate((n) => ((n as HTMLElement).style.visibility = "hidden"));
    await page
      .getByLabel("Solaria 遊戲畫布")
      .screenshot({ path: info.outputPath(`${biome}-${profile}.png`) });
    expect(errors).toEqual([]);
  });
test("房名布局 地面装飾保存重載，暫停不再有成就外觀，主選單仍有", async ({
  page,
}) => {
  const r = await load(page, "stars", 0, 150);
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "成就與外觀", exact: true }),
  ).toHaveCount(0);
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "匯出存檔", exact: true }).click();
  const { readFile } = await import("node:fs/promises");
  const save = JSON.parse(
    await readFile((await (await pending).path())!, "utf8"),
  );
  expect(save.current.scenery).toEqual(r.scenery);
  expect(save.current.obstacles).toEqual(r.obstacles);
  await page.getByRole("button", { name: "回主選單", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "成就與外觀", exact: true }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "軌道環臺", exact: true }),
  ).toBeVisible();
});
