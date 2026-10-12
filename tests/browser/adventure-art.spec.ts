import { test, expect, type Page } from "@playwright/test";
import { castSkill, updateSkills } from "../../src/game/systems/skills";
import { actor } from "../../src/game/data/world";
import { newRun, idleCommand } from "../../src/game/core/run";
import { populate } from "../../src/game/data/world";
import { createHazards } from "../../src/game/systems/hazards";
import { biomes, type BiomeId } from "../../src/game/data/biomes";
import type { Run } from "../../src/game/core/types";

async function load(page: Page, r: Run) {
  page.removeAllListeners("dialog");
  page.on("dialog", (d) => d.accept());
  await page.goto("./");
  await page.getByRole("button", { name: "匯入存檔", exact: true }).click();
  await page.locator("#import-file").setInputFiles({
    name: "art.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({ version: 1, revision: 0, current: r, entry: r }),
    ),
  });
  await expect(page.getByRole("status")).toContainText("匯入成功");
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
}
for (const id of Object.keys(biomes) as BiomeId[]) {
  test(`精雕冒險 ${id}：明亮地面、完整角色、較大障礙與光源`, async ({
    page,
  }, info) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const r = newRun("mage", 2026);
    r.biome = id;
    r.templates = [3, 0, 4, 2];
    populate(r);
    createHazards(r);
    r.phase = "ROOM_INTRO";
    r.player.invulnerable = 0;
    await load(page, r);
    await page.getByRole("button", { name: "進入戰鬥", exact: true }).click();
    await expect
      .poll(() =>
        page.evaluate(() => (window as any).solariaDiagnostics().core.time),
      )
      .toBeGreaterThan(1);
    await page.keyboard.press("Escape");
    await page
      .locator("#overlay")
      .evaluate((el) => (el.style.visibility = "hidden"));
    const data = await page.evaluate(() =>
      (window as any).solariaDiagnostics(),
    );
    expect(data.render.artStyle).toBe("精雕冒險像素");
    expect(data.render.artIdentities).toBeGreaterThanOrEqual(112);
    expect(data.render.artEffects.active).toBeLessThanOrEqual(
      data.render.artEffects.retained,
    );
    const canvas = page.getByLabel("Solaria 遊戲畫布");
    const bounds = await canvas.boundingBox();
    expect(bounds!.width / bounds!.height).toBeCloseTo(1.6, 2);
    await canvas.screenshot({ path: info.outputPath(`${id}.png`) });
    expect(errors).toEqual([]);
  });
}

for (const mode of ["planet", "lightning", "burn"] as const) {
  test(`精雕冒險短FX ${mode}：原核心觸發、繪製粒子與到期清理`, async ({
    page,
  }, info) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const r = newRun("mage", 155);
    populate(r);
    r.obstacles = [];
    r.reserves = [];
    r.player.x = 300;
    r.player.y = 320;
    r.player.invulnerable = 0;
    r.player.controlUntil = 0;
    const enemy = actor(999, 3, 540, 320);
    enemy.hp = enemy.maxHP = 10000;
    enemy.controlUntil = 100;
    r.enemies = [enemy];
    r.phase = "ROOM_INTRO";
    r.cards =
      mode === "planet"
        ? { 58: 1 }
        : mode === "lightning"
          ? { 31: 1 }
          : { 19: 1 };
    r.elements =
      mode === "lightning" ? ["lightning"] : mode === "burn" ? ["fire"] : [];
    if (mode === "burn") enemy.burn = [{ until: 2, damage: 1, scale: 1 }];
    else castSkill(r, { ...idleCommand(r), pointerWorld: { x: 540, y: 320 } });
    await load(page, r);
    await expect
      .poll(() =>
        page.evaluate(
          () => (window as any).solariaDiagnostics().render.artEffects.names,
        ),
      )
      .toContain(
        mode === "lightning"
          ? "electric-orb"
          : mode === "burn"
            ? "flame"
            : "weapon-mage",
      );
    await page
      .locator("#overlay")
      .evaluate((el) => (el.style.visibility = "hidden"));
    await page
      .getByLabel("Solaria 遊戲畫布")
      .screenshot({ path: info.outputPath(`${mode}-ready.png`) });
    await page.locator("#overlay").evaluate((el) => (el.style.visibility = ""));
    await page.getByRole("button", { name: "進入戰鬥", exact: true }).click();
    await expect(page.locator("#overlay")).toHaveClass(/hidden/);
    if (mode !== "burn")
      await expect
        .poll(
          () =>
            page.evaluate(
              () =>
                (window as any).solariaDiagnostics().render.artEffects.names,
            ),
          { intervals: [10, 20, 30] },
        )
        .toEqual(
          expect.arrayContaining([
            expect.stringMatching(
              mode === "lightning" ? /^ability-electric$/ : /^explosion-/,
            ),
          ]),
        );
    await page.keyboard.press("Escape");
    await expect(page.locator('[data-action="resume"]')).toBeVisible();
    await page
      .locator("#overlay")
      .evaluate((el) => (el.style.visibility = "hidden"));
    if (mode !== "burn")
      expect(
        await page.evaluate(
          () => (window as any).solariaDiagnostics().render.artEffects.names,
        ),
      ).toEqual(
        expect.arrayContaining([
          expect.stringMatching(
            mode === "lightning" ? /^ability-electric$/ : /^explosion-/,
          ),
        ]),
      );
    await page
      .getByLabel("Solaria 遊戲畫布")
      .screenshot({ path: info.outputPath(`${mode}-active.png`) });
    await page.locator("#overlay").evaluate((el) => (el.style.visibility = ""));
    await page.keyboard.press("Escape");
    await expect
      .poll(() =>
        page.evaluate(() => (window as any).solariaDiagnostics().core.time),
      )
      .toBeGreaterThan(3);
    await page.keyboard.press("Escape");
    const ended = await page.evaluate(
      () => (window as any).solariaDiagnostics().render.artEffects,
    );
    expect(
      ended.names.some(
        (name: string) =>
          name.startsWith("explosion-") ||
          ["flame", "flame-small"].includes(name),
      ),
    ).toBe(false);
    expect(ended.active).toBeLessThanOrEqual(ended.retained);
    expect(errors).toEqual([]);
  });
}

// Frozen snapshots from real skill execution isolate meaning and readability.
test("美術回饋：元素領域按招式呈現，不再每次跳爆炸", async ({ page }, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const [label, ids, names] of [
    [
      "ice-electric",
      [17, 18, 30],
      [
        "ability-hail",
        "ability-snow",
        "ability-electric",
        "snowflake",
        "electric-ring",
      ],
    ],
    [
      "water-fire",
      [22, 26, 36],
      [
        "ability-fire-ring",
        "ability-vortex",
        "ability-storm-vortex",
        "water-swirl",
      ],
    ],
    ["frostfire-arcane", [39, 59], ["ability-frostfire", "frostfire-ring"]],
  ] as const) {
    const r = newRun("mage", 987);
    r.phase = "ROOM_INTRO";
    r.enemies = [];
    r.reserves = [];
    r.obstacles = [];
    r.cards = Object.fromEntries(ids.map((id) => [id, 1]));
    castSkill(r, { ...idleCommand(r), pointerWorld: { x: 720, y: 330 } });
    r.time = 1.2;
    r.visuals = [];
    r.areas = r.areas.filter((a) => a.ends > r.time);
    r.areas.forEach((a, i) => {
      a.follow = false;
      a.x = 240 + i * 270;
      a.y = 350;
    });
    await load(page, r);
    await expect
      .poll(() =>
        page.evaluate(
          () => (window as any).solariaDiagnostics().render.artEffects.names,
        ),
      )
      .toEqual(expect.arrayContaining([...names]));
    const active = await page.evaluate(
      () => (window as any).solariaDiagnostics().render.artEffects.names,
    );
    expect(active.some((n: string) => n.startsWith("explosion-"))).toBe(false);
    await page
      .locator("#overlay")
      .evaluate((el) => (el.style.visibility = "hidden"));
    await page
      .getByLabel("Solaria 遊戲畫布")
      .screenshot({ path: info.outputPath(`${label}.png`) });
  }
  expect(errors).toEqual([]);
});

test("美術回饋：成功格擋反擊使用藍色專用斬擊", async ({ page }, info) => {
  const r = newRun("sword", 988);
  r.phase = "ROOM_INTRO";
  r.enemies = [];
  r.reserves = [];
  r.obstacles = [];
  r.player.x = 480;
  r.player.y = 330;
  r.time = 1;
  r.player.counterAt = 0.5;
  updateSkills(r, { ...idleCommand(r), pointerWorld: { x: 700, y: 330 } });
  await load(page, r);
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as any).solariaDiagnostics().render.artEffects.names,
      ),
    )
    .toEqual(expect.arrayContaining(["blue-slash", "counter-slash-blue"]));
  await page
    .locator("#overlay")
    .evaluate((el) => (el.style.visibility = "hidden"));
  await page
    .getByLabel("Solaria 遊戲畫布")
    .screenshot({ path: info.outputPath("blue-counter.png") });
});
