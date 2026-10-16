import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { newRun } from "../../src/game/core/run";
import { derive, levelHealthFactor } from "../../src/game/systems/progression";
import { syncPumpkin } from "../../src/game/systems/companion";

test("1.4.0 正式保存：多周目巨量經驗僅升一級、舊卡替換、高等生命及南瓜移轉重載", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("dialog", (d) => d.accept());
  const r = newRun("sword", 14010);
  r.level = 63;
  r.loop = 3;
  r.room = 21;
  r.healthGrowthVersion = 1;
  r.cards = { 8: 4 };
  r.stats = derive(r);
  r.stats.maxHP = 150 * (1 + 1.5 * (62 / 30) ** 0.9);
  r.player.hp = r.stats.maxHP * 0.6;
  r.phase = "SETTLEMENT";
  r.settledOnce = true;
  r.settlementEnds = 0.25;
  r.enemies = [];
  r.reserves = [];
  r.hazards = [];
  r.event = undefined;
  r.drops = [{ id: 9000, x: 600, y: 320, kind: "xp", value: 1000 }];
  r.xp = 1000000;
  r.equipment.armor = {
    id: "ghost",
    slot: "armor",
    rarity: "紅",
    ability: "ghostArmor",
    affixes: [],
    x: 0,
    y: 0,
  };
  syncPumpkin(r);
  r.companion!.maximum = 250;
  r.companion!.hp = 250;
  delete r.companion!.balanceVersion;
  await page.goto("./");
  await page.getByRole("button", { name: "匯入存檔", exact: true }).click();
  await page.locator("#import-file").setInputFiles({
    name: "legacy.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({
        version: 1,
        revision: 0,
        current: r,
        entry: r,
        discovered: [1, 8],
      }),
    ),
  });
  await expect(page.getByRole("status")).toContainText("匯入成功");
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
  await expect(page.locator("#hud")).toContainText("Lv.64");
  await expect(page.locator("#overlay")).toContainText("選擇一份力量");
  await expect(page.locator("#hud")).toContainText("過關升一級");
  await expect(page.locator("#overlay")).not.toHaveClass(/saving/);
  await page.reload();
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
  await expect(page.locator("#hud")).toContainText("Lv.64");
  await page.keyboard.press("Escape");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "匯出存檔", exact: true }).click();
  const a = JSON.parse(
    await readFile((await (await download).path())!, "utf8"),
  );
  expect(a.current.level).toBe(64);
  expect(a.current.pendingLevels).toBe(1);
  expect(a.current.xp).toBe(1001000);
  expect(a.current.stats.maxHP).toBeCloseTo(150 * levelHealthFactor(64));
  expect(a.current.player.hp).toBeCloseTo(
    150 * levelHealthFactor(63) * 0.6 +
      150 * (levelHealthFactor(64) - levelHealthFactor(63)),
  );
  expect(a.current.cards[8]).toBeUndefined();
  expect(a.current.choices).not.toContain(8);
  expect(a.current.companion.maximum).toBe(125);
  expect(a.current.companion.hp).toBe(125);
  expect(a.current.healthGrowthVersion).toBe(2);
  expect(a.current.obstacles).toEqual(r.obstacles);
  expect(a.current.journey).toEqual(r.journey);
  expect(errors).toEqual([]);
});
