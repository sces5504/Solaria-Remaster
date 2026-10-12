import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { newRun } from "../../src/game/core/run";
import {
  beginBossAttack,
  placeBoss,
} from "../../src/game/systems/biome-bosses";
import { bosses } from "../../src/game/data/bosses";
import type { Run } from "../../src/game/core/types";
async function load(page: Page, r: Run) {
  page.on("dialog", (d) => d.accept());
  await page.goto("./");
  await page.getByRole("button", { name: "匯入存檔", exact: true }).click();
  await page.locator("#import-file").setInputFiles({
    name: "boss-1.2.0.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({ version: 1, revision: 0, current: r, entry: r }),
    ),
  });
  await expect(
    page.getByRole("status").filter({ hasText: "匯入成功" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
  await page.getByRole("button", { name: "進入戰鬥", exact: true }).click();
}
async function elapsed(page: Page, time: number) {
  await expect
    .poll(
      () => page.evaluate(() => (window as any).solariaDiagnostics().core.time),
      { timeout: 60000 },
    )
    .toBeGreaterThan(time);
}
async function exported(page: Page) {
  await page.keyboard.press("Escape");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "匯出存檔", exact: true }).click();
  return JSON.parse(await readFile((await (await download).path())!, "utf8"));
}
function arena(id: number) {
  const r = newRun("sword", 1200 + id);
  r.biome = bosses[id].biome;
  r.room = 5;
  r.boss = id;
  r.obstacles = [];
  r.reserves = [];
  r.hazards = [];
  const e = placeBoss(r, id);
  e.x = 620;
  e.nextAttack = 100;
  r.enemies = [e];
  r.player.invulnerable = 100;
  return { r, e };
}
test("1.2.0 V型雷射在正式RAF旋轉且存檔保留幾何，既有素材與WebGL正常", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const { r, e } = arena(7);
  const a = bosses[7].attacks[1][0];
  beginBossAttack(r, e, { ...a, duration: 5 });
  await load(page, r);
  await elapsed(page, 2);
  const saved = await exported(page);
  const beams = saved.current.areas.filter((a: any) => a.shape === "beam");
  expect(beams).toHaveLength(2);
  const progress = (saved.current.time - 0.8) / 5;
  expect(beams[1].angle - beams[0].angle).toBeCloseTo(
    ((Math.PI * 2) / 3) * (1 - progress),
    1,
  );
  expect(
    beams.every((a: any) => a.beamMotion && a.eventAbility === "furnace-ray"),
  ).toBe(true);
  await page
    .locator("#overlay")
    .evaluate((el) => (el.style.visibility = "hidden"));
  await page
    .getByLabel("Solaria 遊戲畫布")
    .screenshot({ path: info.outputPath("v-laser.png") });
  expect(errors).toEqual([]);
});
test("1.2.0 正式Boss AI召喚兩倍精英HP、可保存與再次讀入", async ({ page }) => {
  const { r, e } = arena(9);
  e.nextAttack = 0.1;
  e.attackOrdinal = 2;
  await load(page, r);
  await elapsed(page, 1.5);
  const saved = await exported(page);
  const minions = saved.current.enemies.filter(
    (s: any) => s.bossOwner === e.id,
  );
  expect(minions).toHaveLength(3);
  expect(
    minions.every(
      (s: any) =>
        s.elite &&
        s.summoned &&
        s.maxHP === 1485 &&
        s.eliteAbility &&
        s.xpReward === 0,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "回主選單", exact: true }).click();
  await page.getByRole("button", { name: "匯入存檔", exact: true }).click();
  await page.locator("#import-file").setInputFiles({
    name: "summons.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(saved)),
  });
  await expect(
    page.getByRole("status").filter({ hasText: "匯入成功" }),
  ).toBeVisible();
});
test("1.2.0 劍士真實右鍵格擋連續落擊，成功後保護與單次反擊", async ({
  page,
}) => {
  const { r, e } = arena(10);
  r.player.invulnerable = 0;
  // Repeated low-damage strikes tolerate real input latency; exact boundaries are tested in core.
  const a = { ...bosses[10].attacks[0][2], groups: 1, warning: 0.4, damage: 1 };
  beginBossAttack(r, e, a);
  r.areas[0].ends = 4;
  r.areas[0].interval = 0.1;
  await load(page, r);
  await elapsed(page, 0.5);
  await page.getByLabel("Solaria 遊戲畫布").click({ button: "right" });
  await elapsed(page, 2.2);
  const saved = await exported(page),
    p = saved.current.player;
  expect(p.blockHit).toBe(true);
  expect(p.hp).toBeGreaterThanOrEqual(145);
  expect(p.blockUntil).toBeGreaterThanOrEqual(p.skillCast + 0.9);
  expect(p.counterAt).toBe(0);
});

test("1.2.0 舊實驗存檔中的無beamMotion掃射仍以正式RAF繼續", async ({
  page,
}) => {
  const { r, e } = arena(3);
  const a = { ...bosses[3].attacks[0][0], rotation: Math.PI / 2, duration: 5 };
  beginBossAttack(r, e, a);
  for (const beam of r.areas) delete beam.beamMotion;
  const initial = r.areas[0].angle;
  await load(page, r);
  await elapsed(page, 2);
  const saved = await exported(page);
  const beam = saved.current.areas.find((a: any) => a.shape === "beam");
  expect(beam.angle - initial).toBeCloseTo(
    ((saved.current.time - 0.8) * Math.PI) / 10,
    1,
  );
});
