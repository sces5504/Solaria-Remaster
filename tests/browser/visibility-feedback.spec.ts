import { test, expect, type Page } from "@playwright/test";
import { newRun, idleCommand } from "../../src/game/core/run";
import { actor } from "../../src/game/data/world";
import { castSkill } from "../../src/game/systems/skills";
import { shoot } from "../../src/game/systems/combat";
import { selectEvent } from "../../src/game/systems/events";
import { eventDefinitions, type EventId } from "../../src/game/data/events";
import type { Run } from "../../src/game/core/types";
async function load(page: Page, r: Run) {
  page.removeAllListeners("dialog");
  page.on("dialog", (d) => d.accept());
  await page.goto("./");
  await page.getByRole("button", { name: "匯入存檔", exact: true }).click();
  await page.locator("#import-file").setInputFiles({
    name: "visibility.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({ version: 1, revision: 0, current: r, entry: r }),
    ),
  });
  await expect(
    page.getByRole("status").filter({ hasText: "匯入成功" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
}

test("殘片清理：砂柱／火山障礙及施法怪物保持完整本體", async ({
  page,
}, info) => {
  for (const biome of ["desert", "volcano"] as const) {
    const r = newRun("mage", 876);
    r.phase = "ROOM_INTRO";
    r.biome = biome;
    r.reserves = [];
    r.enemies = [actor(900, 5, 620, 400)];
    r.enemies[0].monsterId = biome === "desert" ? 8 : 14;
    r.obstacles = [0, 1, 2, 3].map((i) => ({
      id: 100 + i,
      kind: i === 3 ? "lake" : biome === "desert" ? "pillar" : "rock",
      x: 280 + (i % 2) * 140,
      y: 230 + Math.floor(i / 2) * 150,
      w: 48,
      h: 64,
      durability: 45,
      maxDurability: 45,
      waves: [],
    }));
    await load(page, r);
    const removed = await page.evaluate(
      () => (window as any).solariaDiagnostics().render.isolatedPixels,
    );
    expect(removed["desert-pillar"]).toBeGreaterThan(0);
    expect(removed.mon08).toBeGreaterThan(0);
    await page
      .locator("#overlay")
      .evaluate((el) => (el.style.visibility = "hidden"));
    await page
      .getByLabel("Solaria 遊戲畫布")
      .screenshot({ path: info.outputPath(`${biome}-clean.png`) });
  }
});

test("光環主角與敵彈：主角在光環前，敵彈在主角前，三地形可辨", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const biome of ["desert", "volcano", "icefield"] as const) {
    const r = newRun("mage", 877);
    r.phase = "ROOM_INTRO";
    r.biome = biome;
    r.enemies = [];
    r.reserves = [];
    r.obstacles = [];
    r.player.x = 500;
    r.player.y = 330;
    r.player.invulnerable = 0;
    r.cards = { 30: 1 };
    castSkill(r, idleCommand(r));
    r.time = 0.5;
    r.visuals = [];
    for (let i = 0; i < 7; i++) {
      shoot(r, { x: 340 + i * 50, y: 365 }, 0, 10, 0, 650, null, 1, true);
      r.projectiles.at(-1)!.enemyElement = "fire";
      r.projectiles.at(-1)!.enemyTheme = biome;
    }
    await load(page, r);
    await expect
      .poll(() =>
        page.evaluate(
          () => (window as any).solariaDiagnostics().render.heroForeground,
        ),
      )
      .toBe(true);
    expect(
      await page.evaluate(
        () => (window as any).solariaDiagnostics().render.hostileMarkers,
      ),
    ).toBe(7);
    await page
      .locator("#overlay")
      .evaluate((el) => (el.style.visibility = "hidden"));
    await page
      .getByLabel("Solaria 遊戲畫布")
      .screenshot({ path: info.outputPath(`${biome}-aura-bullets.png`) });
  }
  expect(errors).toEqual([]);
});

test("事件提示：六事件名稱與短句、兩秒後淡出，保持戰鬥輸入", async ({
  page,
}) => {
  for (const id of Object.keys(eventDefinitions) as EventId[]) {
    const r = newRun("sword", 878);
    r.room = 2;
    r.phase = "ROOM_INTRO";
    selectEvent(r, id);
    r.player.invulnerable = 100;
    await load(page, r);
    await page.getByRole("button", { name: "進入戰鬥", exact: true }).click();
    const arrival = page.locator("#event-arrival");
    await expect(arrival).toContainText(eventDefinitions[id].name);
    expect(await arrival.locator("p").textContent()).toBeTruthy();
    await expect(arrival).toBeVisible();
    await page.keyboard.down("KeyD");
    await page.waitForTimeout(200);
    await page.keyboard.up("KeyD");
    await expect
      .poll(() =>
        page.evaluate(() => (window as any).solariaDiagnostics().core.tick),
      )
      .toBeGreaterThan(0);
    await expect(arrival).toBeHidden({ timeout: 6000 });
  }
});

test("日光重臨：勝利動畫配字→捲動感謝字幕→原下一周目流程", async ({
  page,
}, info) => {
  const r = newRun("mage", 879);
  r.room = 31;
  r.phase = "RUN_END";
  r.enemies = [];
  r.reserves = [];
  r.obstacles = [];
  await load(page, r);
  await expect(page.locator(".ending.cinematic")).toBeVisible();
  await expect(page.locator(".line-one")).toContainText("索拉里斯神");
  await page.screenshot({ path: info.outputPath("ending-cinematic.png") });
  await expect(page.locator(".ending.credits")).toBeVisible({ timeout: 10000 });
  await expect(page.locator(".credits-window")).toContainText("感謝遊玩");
  const frozen = await page.evaluate(
    () => (window as any).solariaDiagnostics().core.tick,
  );
  await page.screenshot({ path: info.outputPath("ending-credits.png") });
  expect(
    await page.evaluate(() => (window as any).solariaDiagnostics().core.tick),
  ).toBe(frozen);
  await expect(
    page.getByRole("button", { name: "下一周目", exact: true }),
  ).toBeVisible({ timeout: 22000 });
  await page.getByRole("button", { name: "下一周目", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "進入戰鬥", exact: true }),
  ).toBeVisible();
  const second = newRun("sword", 880);
  second.room = 31;
  second.phase = "RUN_END";
  second.enemies = [];
  second.reserves = [];
  await load(page, second);
  await page
    .getByRole("button", { name: "略過動畫與字幕", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "完成本局", exact: true }),
  ).toBeVisible();
});
