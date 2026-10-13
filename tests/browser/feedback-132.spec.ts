import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { newRun } from "../../src/game/core/run";
import { placeBoss } from "../../src/game/systems/biome-bosses";
import { equipmentCatalog } from "../../src/game/data/equipment";
import type { Run } from "../../src/game/core/types";
async function load(page: Page, r: Run) {
  await page.goto("./");
  page.removeAllListeners("dialog");
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "匯入存檔", exact: true }).click();
  await page.locator("#import-file").setInputFiles({
    name: "feedback.json",
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
const fixture = (seed: number) => {
  const r = newRun("sword", seed);
  r.enemies = [];
  r.reserves = [];
  r.obstacles = [];
  r.hazards = [];
  r.scenery = [];
  return r;
};
async function shot(page: Page, path: string) {
  await page
    .locator("#overlay")
    .evaluate((n) => ((n as HTMLElement).style.visibility = "hidden"));
  await page.getByLabel("Solaria 遊戲畫布").screenshot({ path });
}
test("1.3.2 圖集修正：聖誕老人站姿完整頭帽、火山柱頂部無雪色殘片", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const santa = fixture(13201);
  santa.biome = "icefield";
  const e = placeBoss(santa, 20);
  e.x = 512;
  e.y = 320;
  e.nextAttack = 100;
  santa.enemies = [e];
  await load(page, santa);
  await shot(page, info.outputPath("santa-ready.png"));
  const pillar = fixture(13202);
  pillar.biome = "volcano";
  pillar.obstacles = [
    {
      id: 1,
      x: 480,
      y: 288,
      w: 64,
      h: 48,
      kind: "pillar",
      durability: 20,
      maxDurability: 20,
      waves: [],
    },
  ];
  await load(page, pillar);
  await shot(page, info.outputPath("volcano-pillar-clean.png"));
  expect(errors).toEqual([]);
});
test("1.3.2 霜鈴禮物爆裂不疊通用爆炸／符紋，大範圍仍保持有限視覺", async ({
  page,
}, info) => {
  const r = fixture(13203);
  r.time = 0.2;
  r.visuals = [
    {
      id: 991,
      kind: "relic",
      value: 212,
      x: 512,
      y: 320,
      radius: 7200,
      color: 0,
      angle: 0,
      duration: 0.65,
      until: 0.65,
    },
    {
      id: 992,
      kind: "burst",
      value: 0,
      x: 512,
      y: 320,
      radius: 7200,
      color: 0,
      angle: 0,
      sourceAbilityId: 212,
      duration: 0.65,
      until: 0.65,
    },
  ];
  await load(page, r);
  await expect
    .poll(() =>
      page.evaluate(() =>
        (window as any)
          .solariaDiagnostics()
          .render.artEffects.names.filter(
            (name: string) => name === "rune" || name.startsWith("explosion-"),
          ),
      ),
    )
    .toEqual([]);
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as any).solariaDiagnostics().render.artEffects.names,
      ),
    )
    .toContain("gift-impact");
  await shot(page, info.outputPath("frost-bell-bounded-gift.png"));
});
test("1.3.2 嚴格密碼後取得所有傳奇紅裝、保留存檔與新卡文案", async ({
  page,
}) => {
  const r = fixture(13204);
  await load(page, r);
  await expect(page.locator("#testing")).toBeHidden();
  await page.keyboard.type("wwssadadba");
  await page.locator("#testing").click();
  expect(await page.locator('[data-action^="gearGrant:"]').count()).toBe(
    Object.keys(equipmentCatalog).length,
  );
  await expect(
    page.locator('[data-action="grant:10"]').locator(".."),
  ).toContainText("15% → 20%");
  await page.locator('[data-action="gearGrant:frostBell"]').click();
  await page.locator('[data-action="gearGrant:molten"]').click();
  await page.locator('[data-action="testBack"]').click();
  await page.keyboard.press("Escape");
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "匯出存檔", exact: true }).click();
  const save = JSON.parse(
    await readFile((await (await pending).path())!, "utf8"),
  );
  expect(save.current.equipment.amulet.ability).toBe("frostBell");
  expect(save.current.equipment.armor.ability).toBe("molten");
  expect(save.current.testing).toBe(true);
  await page.reload();
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
  await expect(page.locator("#sidebar")).toContainText("霜鈴災厄");
  await expect(page.locator("#testing")).toBeHidden();
});

test("1.3.2 舊命運賭徒選欄與吸血鬼存檔移轉保留裝備並解除舊選欄", async ({
  page,
}) => {
  const r = fixture(13205);
  r.cards = { 85: 1, 79: 1 };
  r.phase = "EQUIPMENT_SLOT_CHOICE";
  r.specialResumePhase = "ROOM_INTRO";
  r.equipment.armor = {
    id: "legacy",
    slot: "armor",
    rarity: "紅",
    ability: "ghostArmor",
    name: "寂夜鬼甲",
    affixes: [],
    x: 0,
    y: 0,
  };
  await load(page, r);
  await expect(page.locator("#hud")).toContainText("60 / 150");
  await page.keyboard.press("Escape");
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "匯出存檔", exact: true }).click();
  const saved = JSON.parse(
    await readFile((await (await pending).path())!, "utf8"),
  );
  expect(saved.current.player.hp).toBe(60);
  expect(saved.current.equipment).toEqual({});
  expect(saved.current.bag[0].id).toBe("legacy");
  expect(saved.current.phase).toBe("ROOM_INTRO");
});
