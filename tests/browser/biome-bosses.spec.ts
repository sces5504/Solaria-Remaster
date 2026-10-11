import { test, expect } from "@playwright/test";
import { newRun } from "../../src/game/core/run";
import { populate } from "../../src/game/data/world";
import { createHazards } from "../../src/game/systems/hazards";
import { bosses } from "../../src/game/data/bosses";
for (const b of Object.values(bosses))
  test(`BOSS-${b.id} ${b.name} 專屬布局與兩階段原創畫面`, async ({
    page,
  }, info) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("dialog", (d) => d.accept());
    await page.goto("/");
    for (const phase of [1, 2] as const) {
      const r = newRun("mage", 800 + b.id);
      r.biome = b.biome;
      r.room = 5;
      r.boss = b.id;
      populate(r);
      createHazards(r);
      r.enemies[0].phase = phase;
      r.enemies[0].nextAttack = 0.1;
      r.player.invulnerable = 100;
      await page.getByRole("button", { name: "匯入存檔", exact: true }).click();
      await page.locator("#import-file").setInputFiles({
        name: `boss${b.id}-${phase}.json`,
        mimeType: "application/json",
        buffer: Buffer.from(
          JSON.stringify({ version: 1, revision: 0, current: r, entry: r }),
        ),
      });
      await expect(page.getByRole("status")).toContainText("匯入成功");
      await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
      await page.getByRole("button", { name: "進入戰鬥", exact: true }).click();
      await page.waitForTimeout(1500);
      await page.keyboard.press("Escape");
      await page.locator("#overlay").evaluate((el) => {
        el.style.visibility = "hidden";
      });
      await page
        .getByLabel("Solaria 遊戲畫布")
        .screenshot({ path: info.outputPath(`boss-${b.id}-${phase}.png`) });
      await page.locator("#overlay").evaluate((el) => {
        el.style.visibility = "";
      });
      await page.getByRole("button", { name: "回主選單", exact: true }).click();
    }
    expect(errors).toEqual([]);
  });
