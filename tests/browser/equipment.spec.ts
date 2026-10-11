import { castSkill } from "../../src/game/systems/skills";
import { idleCommand } from "../../src/game/core/run";
import { readFile } from "node:fs/promises";
import { test, expect, type Page } from "@playwright/test";
import { newRun } from "../../src/game/core/run";
import { actor } from "../../src/game/data/world";
import {
  equipmentCatalog,
  type EquipmentAbility,
} from "../../src/game/data/equipment";
import { derive } from "../../src/game/systems/progression";
import type { Run } from "../../src/game/core/types";
async function load(page: Page, r: Run) {
  await page.goto("/");
  await page.getByRole("button", { name: "匯入存檔", exact: true }).click();
  await page.locator("#import-file").setInputFiles({
    name: "equipment.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({ version: 1, revision: 0, current: r, entry: r }),
    ),
  });
  await expect(page.getByRole("status")).toContainText("匯入成功");
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
  await expect(page.locator("#hud .status")).toBeVisible();
}
function item(ability: EquipmentAbility) {
  const d = equipmentCatalog[ability];
  return {
    id: ability,
    ability,
    name: d.name,
    slot: d.slot,
    rarity: d.rarity,
    affixes: [{ stat: "lifesteal", value: 0.002 }],
    x: 150,
    y: 320,
  };
}
test("17特殊裝備存檔、完整能力文案、整理後重載不複製", async ({ page }) => {
  const r = newRun("mage", 933);
  r.phase = "POST_CLEAR";
  r.settledOnce = true;
  r.enemies = [];
  r.reserves = [];
  r.obstacles = [];
  const items = (Object.keys(equipmentCatalog) as EquipmentAbility[]).map(item);
  for (const ability of ["molten", "riftRing", "starSeal"] as const) {
    const i = items.find((i) => i.ability === ability)!;
    r.equipment[i.slot] = i;
  }
  const spare = items.filter(
    (i) => !["molten", "riftRing", "starSeal"].includes(i.ability),
  );
  r.bag = spare.slice(0, 12);
  r.items = spare.slice(12);
  r.stats = derive(r);
  await load(page, r);
  await page.keyboard.press("KeyI");
  await expect(
    page.getByRole("heading", { name: "背包 12 / 12" }),
  ).toBeVisible();
  await expect(page.locator(".equipment")).toContainText("熔光外骨骼");
  await expect(page.locator(".equipment")).toContainText("職技獲得");
  await expect(page.locator(".bag")).toContainText("南瓜夥伴");
  await page.locator('[data-action="equip:ghostArmor"]').click();
  await expect(page.locator(".equipment")).toContainText("寂夜鬼甲");
  await expect(page.locator("#overlay")).not.toHaveClass(/saving/);
  await page.reload();
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
  await expect(page.locator("#hud .status")).toBeVisible();
  await page.keyboard.press("KeyI");
  await expect(page.locator(".equipment")).toContainText("寂夜鬼甲");
  await expect(
    page.getByRole("heading", { name: "背包 12 / 12" }),
  ).toBeVisible();
});
for (const build of [
  ["ghostArmor", "starFlow", "redMoon"],
  ["molten", "moonString", "frostBell"],
  ["starArmor", "timeRing", "fallingStar"],
] as EquipmentAbility[][])
  test(`特殊裝備 ${build.join("／")} 實際WebGL能力與夥伴畫面`, async ({
    page,
  }, info) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const r = newRun("mage", 935);
    r.enemies = [
      actor(7, 1, 240, 320),
      actor(8, 1, 260, 350),
      actor(9, 1, 280, 300),
      actor(10, 1, 310, 340),
    ];
    r.reserves = [];
    r.obstacles = [];
    r.modifiers = [];
    r.player.invulnerable = 100;
    for (const e of r.enemies) {
      e.hp = e.maxHP = 100000;
      e.nextAttack = 100;
    }
    for (const a of build) {
      const i = item(a);
      r.equipment[i.slot] = i;
    }
    r.stats = derive(r);
    r.cards[10] = 20;
    r.phase = "ROOM_INTRO";
    await load(page, r);
    await page.getByRole("button", { name: "進入戰鬥", exact: true }).click();
    const box = (await page.locator("canvas").boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.35, box.y + box.height * 0.5);
    await page.mouse.down();
    await page.mouse.down({ button: "right" });
    await page.waitForTimeout(3650);
    await page.mouse.up({ button: "right" });
    await page.mouse.up();
    await page.keyboard.press("Escape");
    await page
      .locator("#overlay")
      .evaluate((el) => (el.style.visibility = "hidden"));
    await page
      .getByLabel("Solaria 遊戲畫布")
      .screenshot({ path: info.outputPath(`${build[0]}.png`) });
    expect(errors).toEqual([]);
  });

test("短冷卻雙重術式排隊能匯入並各執行，沒有重扣代價或改動職技CD", async ({
  page,
}) => {
  const r = newRun("mage", 441);
  r.obstacles = [];
  r.reserves = [];
  r.enemies = [
    actor(5, 1, 300, 320),
    actor(6, 1, 350, 320),
    actor(7, 1, 300, 360),
    actor(8, 1, 350, 360),
  ];
  for (const e of r.enemies) {
    e.hp = e.maxHP = 10000;
    e.controlUntil = 100;
    e.nextAttack = 100;
  }
  r.cards[71] = 1;
  r.cards[82] = 1;
  r.cards[37] = 1;
  r.cards[9] = 200;
  r.elements = ["water", "lightning"];
  r.fusion = "storm";
  r.player.invulnerable = 100;
  r.stats = derive(r);
  r.stats.skillCD = 0.65;
  r.player.capacitor = 5;
  castSkill(r, idleCommand(r));
  r.time = 0.65;
  r.player.capacitor = 2;
  castSkill(r, idleCommand(r));
  const hp = r.player.hp,
    ready = r.player.skillReady;
  expect(r.player.pendingEchoes).toHaveLength(2);
  r.phase = "ROOM_INTRO";
  await load(page, r);
  await page.getByRole("button", { name: "進入戰鬥", exact: true }).click();
  await page.waitForTimeout(2500);
  await page.keyboard.press("Escape");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "匯出存檔", exact: true }).click();
  const d = await download;
  const data = JSON.parse(await readFile((await d.path())!, "utf8"));
  expect(data.current.player.pendingEchoes).toHaveLength(0);
  expect(data.current.player.hp).toBeCloseTo(hp);
  expect(data.current.player.skillReady).toBe(ready);
  expect(data.current.player.capacitor).toBe(0);
});
