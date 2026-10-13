import { test, expect, type Page } from "@playwright/test";
import { newRun } from "../../src/game/core/run";
import { actor } from "../../src/game/data/world";
import { shoot } from "../../src/game/systems/combat";
import {
  beginBossAttack,
  placeBoss,
} from "../../src/game/systems/biome-bosses";
import { bosses } from "../../src/game/data/bosses";
import { readFile } from "node:fs/promises";
import type { Run } from "../../src/game/core/types";
async function load(page: Page, r: Run) {
  await page.goto("./");
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "匯入存檔", exact: true }).click();
  await page.locator("#import-file").setInputFiles({
    name: "balance.json",
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
}
async function exported(page: Page) {
  await page.keyboard.press("Escape");
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "匯出存檔", exact: true }).click();
  return JSON.parse(await readFile((await (await pending).path())!, "utf8"));
}
test("1.3.1 舊Boss敵彈匯入／重載只降5%一次", async ({ page }) => {
  const r = newRun("sword", 1331);
  r.enemies = [actor(99, 6, 500, 320)];
  r.obstacles = [];
  r.reserves = [];
  shoot(r, { x: 400, y: 320 }, 0, 20, 200, 1000, null, 1, true, 99, 90);
  r.projectiles[0].damage = 20;
  delete r.projectiles[0].bossDamageTuned;
  r.enemies = [];
  await load(page, r);
  const a = await exported(page);
  expect(a.current.projectiles[0].damage).toBe(19);
  await page.reload();
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "進入戰鬥", exact: true }),
  ).toBeVisible();
  const b = await exported(page);
  expect(b.current.projectiles[0].damage).toBe(19);
});
test("1.3.1 真RAF Boss遠端近戰扣10掩體耐久，角色傷害與波次保護保持", async ({
  page,
}) => {
  const r = newRun("sword", 1332);
  r.biome = "icefield";
  r.enemies = [];
  r.reserves = [];
  r.obstacles = [];
  r.hazards = [];
  const e = placeBoss(r, 6);
  e.x = 450;
  e.y = 320;
  e.nextAttack = 100;
  r.enemies = [e];
  r.obstacles = [
    {
      id: 40,
      x: 500,
      y: 288,
      w: 32,
      h: 64,
      kind: "rock",
      durability: 20,
      maxDurability: 20,
      waves: [],
    },
  ];
  r.player.x = 900;
  r.player.y = 550;
  beginBossAttack(
    r,
    e,
    bosses[6].attacks.flat().find((a) => a.pattern === "slash")!,
  );
  r.modes[0].angle = 0;
  await load(page, r);
  await page.getByRole("button", { name: "進入戰鬥", exact: true }).click();
  await expect
    .poll(
      () => page.evaluate(() => (window as any).solariaDiagnostics().core.time),
      { timeout: 60000 },
    )
    .toBeGreaterThan(1.4);
  const save = await exported(page);
  expect(save.current.obstacles[0].durability).toBe(10);
  expect(save.current.obstacles[0].waves).toHaveLength(1);
  expect(save.current.player.hp).toBe(150);
});
