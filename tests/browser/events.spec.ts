import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { newRun } from "../../src/game/core/run";
import { populate } from "../../src/game/data/world";
import { selectEvent, beginEventWave } from "../../src/game/systems/events";
import { eventDefinitions, type EventId } from "../../src/game/data/events";
import type { Run } from "../../src/game/core/types";
test.beforeEach(({ page }) => {
  page.on("dialog", (dialog) => dialog.accept());
});
async function load(page: Page, r: Run) {
  await page.goto("/");
  await page.getByRole("button", { name: "匯入存檔", exact: true }).click();
  await page.locator("#import-file").setInputFiles({
    name: "event.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({ version: 1, revision: 0, current: r, entry: r }),
    ),
  });
  await expect(page.getByRole("status")).toContainText("匯入成功");
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
  await expect(page.locator("#hud .status")).toBeVisible();
}
function fixture(id: EventId) {
  const r = newRun("mage", 941);
  r.room = 2;
  selectEvent(r, id);
  populate(r);
  r.player.invulnerable = 1000;
  return r;
}
for (const id of Object.keys(eventDefinitions) as EventId[])
  test(`${id} 專屬事件族群、場景、波次與讀檔`, async ({ page }, info) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const r = fixture(id);
    await load(page, r);
    await expect(page.locator("#hud .room")).toContainText(
      eventDefinitions[id].name,
    );
    await expect(page.locator("#hud .room")).toContainText("第 1 波");
    await page.getByRole("button", { name: "進入戰鬥", exact: true }).click();
    await page.waitForTimeout(3500);
    await page.keyboard.press("Escape");
    await page
      .locator("#overlay")
      .evaluate((el) => (el.style.visibility = "hidden"));
    await page
      .getByLabel("Solaria 遊戲畫布")
      .screenshot({ path: info.outputPath(`${id}.png`) });
    await expect(page.locator("#overlay")).not.toHaveClass(/saving/);
    await page.reload();
    await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
    await expect(page.locator("#hud .room")).toContainText(
      eventDefinitions[id].name,
    );
    await expect(page.locator("#hud .room")).toContainText("第 1 波");
    expect(errors).toEqual([]);
  });
for (const id of ["christmas", "halloween"] as EventId[])
  test(`${id} 事件王兩階段各三招實際場景`, async ({ page }, info) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    test.setTimeout(180000);
    for (const phase of [1, 2] as const) {
      const r = fixture(id);
      r.event!.wave = 3;
      beginEventWave(r);
      r.enemies[0].phase = phase;
      if (phase === 2) r.enemies[0].hp = r.enemies[0].maxHP * 0.49;
      await load(page, r);
      await page.getByRole("button", { name: "進入戰鬥", exact: true }).click();
      // A slow software renderer can spend 9.5s wall time advancing fewer
      // simulation ticks. Wait for the actual core clock, keeping all three
      // real AI attack assertions and the normal render loop intact.
      await expect
        .poll(
          () =>
            page.evaluate(
              () =>
                (
                  window as unknown as {
                    solariaDiagnostics: () => { core: { time: number } };
                  }
                ).solariaDiagnostics().core.time,
            ),
          { timeout: 60000 },
        )
        .toBeGreaterThanOrEqual(r.time + 9.5);
      await page.keyboard.press("Escape");
      const download = page.waitForEvent("download");
      await page.getByRole("button", { name: "匯出存檔", exact: true }).click();
      const saved = JSON.parse(
        await readFile((await (await download).path())!, "utf8"),
      );
      const prefix = id === "christmas" ? "santa" : "pumpkin";
      expect(
        new Set(
          saved.current.attackLog.filter((v: string) => v.startsWith(prefix)),
        ).size,
      ).toBe(3);
      await page
        .locator("#overlay")
        .evaluate((el) => (el.style.visibility = "hidden"));
      await page
        .getByLabel("Solaria 遊戲畫布")
        .screenshot({ path: info.outputPath(`${id}-phase${phase}.png`) });
    }
    expect(errors).toEqual([]);
  });
test("事件完成存檔匯入、E拾專屬紅裝，重載不重發，已遇集合保留", async ({
  page,
}) => {
  const r = fixture("army");
  r.event!.completed = r.event!.rewarded = true;
  r.event!.wave = 2;
  r.phase = "POST_CLEAR";
  r.settledOnce = true;
  r.enemies = [];
  r.reserves = [];
  r.obstacles = [];
  r.items = [
    {
      id: "army-reward",
      name: "軍團號令",
      ability: "legion",
      slot: "ring",
      rarity: "紅",
      affixes: [],
      x: 112,
      y: 320,
    },
  ];
  await load(page, r);
  await page.keyboard.press("KeyE");
  await page.keyboard.press("KeyI");
  await expect(page.locator(".bag")).toContainText("軍團號令");
  await expect(page.locator("#overlay")).not.toHaveClass(/saving/);
  await page.reload();
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
  await expect(page.locator("#hud .status")).toBeVisible();
  await page.keyboard.press("KeyI");
  await expect(page.locator('[data-action="equip:army-reward"]')).toHaveCount(
    1,
  );
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "匯出存檔", exact: true }).click();
  const saved = JSON.parse(
    await readFile((await (await download).path())!, "utf8"),
  );
  expect(saved.current.seenEvents).toEqual(["army"]);
  expect(saved.current.items).toHaveLength(0);
  expect(
    saved.current.bag.filter(
      (i: { ability: string }) => i.ability === "legion",
    ),
  ).toHaveLength(1);
});
