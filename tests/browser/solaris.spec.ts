import { test, expect } from "@playwright/test";
import { newRun } from "../../src/game/core/run";
import { populate } from "../../src/game/data/world";
import { hit, context } from "../../src/game/systems/combat";
for (const state of ["first", "sealed", "second", "third"] as const)
  test(`索拉里斯 ${state} 血條、四柱與招式畫面可保存重載`, async ({
    page,
  }, info) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("dialog", (d) => d.accept());
    const r = newRun("mage", 491);
    r.room = 31;
    r.biome = "castle";
    populate(r);
    r.player.invulnerable = 100;
    const e = r.enemies[0];
    if (state !== "first") hit(r, e, 1e6, context(r, 0));
    if (state === "second" || state === "third") {
      r.enemies = r.enemies.filter((e) => !e.sealPillar);
      r.solaris!.sealed = false;
      e.transition = 0;
    }
    if (state === "third") {
      hit(r, e, 1e6, context(r, 0));
      e.transition = 0;
    }
    e.nextAttack = 0.1;
    await page.goto("/");
    await page.getByRole("button", { name: "匯入存檔", exact: true }).click();
    await page.locator("#import-file").setInputFiles({
      name: `solaris-${state}.json`,
      mimeType: "application/json",
      buffer: Buffer.from(
        JSON.stringify({ version: 1, revision: 0, current: r, entry: r }),
      ),
    });
    await expect(page.getByRole("status")).toContainText("匯入成功");
    await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
    await expect(page.locator("#hud")).toContainText("索拉里斯神");
    await page.getByRole("button", { name: "進入戰鬥", exact: true }).click();
    await page.waitForTimeout(2500);
    await page.keyboard.press("Escape");
    await page
      .locator("#overlay")
      .evaluate((el) => (el.style.visibility = "hidden"));
    await page
      .getByLabel("Solaria 遊戲畫布")
      .screenshot({ path: info.outputPath(`${state}.png`) });
    expect(errors).toEqual([]);
    await expect(page.locator("#overlay")).not.toHaveClass(/saving/);
    await page.reload();
    await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "進入戰鬥", exact: true }),
    ).toBeVisible();
    await expect(page.locator("#hud")).toContainText("第 31 / 31");
  });
