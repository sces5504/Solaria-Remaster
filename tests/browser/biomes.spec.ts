import { test, expect } from "@playwright/test";
import { newRun } from "../../src/game/core/run";
import { populate } from "../../src/game/data/world";
import { createHazards } from "../../src/game/systems/hazards";
import { biomes, type BiomeId } from "../../src/game/data/biomes";
for (const id of Object.keys(biomes).filter(
  (id) => id !== "meadow",
) as BiomeId[]) {
  test(`${id} 原創地形、怪物、機關與預警 WebGL 畫面`, async ({
    page,
  }, info) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const r = newRun("mage", 350 + Object.keys(biomes).indexOf(id));
    r.biome = id;
    r.templates = [3, 0, 4, 2];
    populate(r);
    createHazards(r);
    r.phase = "ROOM_INTRO";
    r.player.invulnerable = 60;
    page.on("dialog", (dialog) => dialog.accept());
    await page.goto("/");
    await page.getByRole("button", { name: "匯入存檔", exact: true }).click();
    await page.locator("#import-file").setInputFiles({
      name: `${id}.json`,
      mimeType: "application/json",
      buffer: Buffer.from(
        JSON.stringify({ version: 1, revision: 0, current: r, entry: r }),
      ),
    });
    await expect(page.getByRole("status")).toContainText("匯入成功");
    await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
    await expect(page.locator("#hud .status")).toBeVisible();
    await page.getByRole("button", { name: "進入戰鬥", exact: true }).click();
    await page.waitForTimeout(2500);
    await page.keyboard.press("Escape");
    await page.locator("#overlay").evaluate((el) => {
      el.style.visibility = "hidden";
    });
    await page
      .getByLabel("Solaria 遊戲畫布")
      .screenshot({ path: info.outputPath(`${id}.png`) });
    expect(errors).toEqual([]);
  });
}
