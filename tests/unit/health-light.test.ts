import { expect, it } from "vitest";
import { newRun, idleCommand, step } from "../../src/game/core/run";
import {
  derive,
  levelHealthFactor,
  choose,
} from "../../src/game/systems/progression";
import { validate } from "../../src/game/persistence/checkpoint";
import { sceneLights } from "../../src/render/lighting";
import {
  glowExposureScales,
  GLOW_EXPOSURE_LIMIT,
} from "../../src/render/glow-exposure";

it.each(["sword", "bow", "mage"] as const)(
  "%s 等級曲線31為2.5倍，卡片與固定裝備不改比例",
  (cls) => {
    const r = newRun(cls, 13301);
    r.cards = { 1: 3, 84: 1 };
    r.equipment.armor = {
      id: "hp",
      slot: "armor",
      rarity: "藍",
      affixes: [{ stat: "hp", value: 30 }],
      x: 0,
      y: 0,
    };
    const base = derive(r).maxHP;
    let prior = base;
    for (let level = 2; level <= 61; level++) {
      r.level = level;
      const hp = derive(r).maxHP;
      expect(hp).toBeGreaterThan(prior);
      prior = hp;
      if (level === 31) expect(hp / base).toBeCloseTo(2.5);
    }
    expect(levelHealthFactor(1)).toBe(1);
    expect(levelHealthFactor(11)).toBeCloseTo(1.558, 2);
  },
);
it("真正清算升級立刻增加生命，不等選卡；多級獎勵只補一次且維持受傷差值", () => {
  const r = newRun("sword", 13302);
  r.phase = "SETTLEMENT";
  r.settledOnce = true;
  r.settlementEnds = 0;
  r.enemies = [];
  r.reserves = [];
  r.hazards = [];
  r.drops = [];
  r.player.hp = 80;
  r.xp = 300;
  step(r, idleCommand(r));
  expect(r.level).toBe(3);
  expect(r.stats.maxHP).toBeCloseTo(150 * levelHealthFactor(3));
  expect(r.stats.maxHP - r.player.hp).toBeCloseTo(70);
  const hp = r.player.hp;
  r.choices = [3];
  choose(r, 3);
  expect(r.player.hp).toBe(hp);
});
it("舊Lv31保存一次移轉、保留受傷生命差，不重抽地圖且重載不再回血", () => {
  const r = newRun("sword", 13303);
  delete r.healthGrowthVersion;
  r.level = 31;
  r.player.hp = 70;
  const original = structuredClone(r);
  const a = validate({ version: 1, revision: 0, current: r, entry: r });
  expect(a.current.stats.maxHP).toBe(375);
  expect(a.current.player.hp).toBe(295);
  expect(a.current.healthGrowthVersion).toBe(1);
  expect(a.current.obstacles).toEqual(original.obstacles);
  expect(a.current.journey).toEqual(original.journey);
  a.current.player.hp = 200;
  const b = validate(a);
  expect(b.current.player.hp).toBe(200);
  expect(b.entry.player.hp).toBe(295);
  const crown = newRun("sword", 13307);
  delete crown.healthGrowthVersion;
  crown.level = 31;
  crown.cards[73] = 1;
  const c = validate({ version: 1, revision: 0, current: crown, entry: crown });
  expect(c.current.player.hp).toBe(375);
  expect(c.current.stats.armor).toBe(65);
});
it("吸血鬼成長及舊保存補血不能超四成，滿血角色升級仍補到新最大值", () => {
  const r = newRun("mage", 13304);
  delete r.healthGrowthVersion;
  r.cards[79] = 1;
  r.level = 31;
  r.player.hp = 36;
  const saved = validate({ version: 1, revision: 0, current: r, entry: r });
  expect(saved.current.stats.maxHP).toBe(225);
  expect(saved.current.player.hp).toBe(90);
  const f = newRun("bow", 13305);
  f.phase = "SETTLEMENT";
  f.settlementEnds = 0;
  f.settledOnce = true;
  f.enemies = [];
  f.reserves = [];
  f.hazards = [];
  f.drops = [];
  step(f, idleCommand(f));
  expect(f.player.hp).toBe(f.stats.maxHP);
});
it("遠距吸血連線不再成為巨型光源，禮物範圍僅限裝飾亮光，遊戲事件不變", () => {
  const r = newRun("mage", 13306);
  r.visuals = [
    {
      id: 1,
      kind: "relic",
      value: 218,
      x: 400,
      y: 320,
      radius: 800,
      color: 0xffaacb,
      angle: 0,
      until: 1,
      duration: 1,
    },
    {
      id: 2,
      kind: "relic",
      value: 212,
      x: 600,
      y: 320,
      radius: 2000,
      color: 0xffdebd,
      angle: 0,
      until: 1,
      duration: 1,
    },
  ];
  const before = JSON.stringify(r);
  const lights = sceneLights(r);
  expect(lights.find((l) => l.x === 400)?.radius).toBe(110);
  expect(lights.find((l) => l.x === 600)?.radius).toBe(240);
  expect(JSON.stringify(r)).toBe(before);
});
it("單獨與分散光暈維持原亮度，同點連鎖／禮物／傳奇爆發的加色不超局部上限", () => {
  const solo = [
    { x: 112, y: 320, radius: 40, alpha: 0.6 },
    { x: 900, y: 320, radius: 60, alpha: 0.7 },
  ];
  expect(glowExposureScales(solo).scales).toEqual([1, 1]);
  const dense = Array.from({ length: 40 }, (_, i) => ({
    x: 512 + (i % 3),
    y: 320 + (i % 5),
    radius: 150,
    alpha: 0.65,
  }));
  const before = JSON.stringify(dense);
  const limited = glowExposureScales(dense);
  expect(limited.peak).toBeGreaterThan(10);
  expect(limited.scales.every((s) => s < 1)).toBe(true);
  const after = glowExposureScales(
    dense.map((g, i) => ({ ...g, alpha: g.alpha * limited.scales[i] })),
  );
  expect(after.peak).toBeLessThanOrEqual(GLOW_EXPOSURE_LIMIT + 1e-6);
  expect(JSON.stringify(dense)).toBe(before);
});
it("曝亮保護對錯位、離畫面邊緣及不同半徑重疊仍成立，色光不影響模擬", () => {
  const dense = Array.from({ length: 80 }, (_, i) => ({
    x: 16 + (i % 12) * 6,
    y: 32 + (i % 8) * 7,
    radius: 30 + (i % 9) * 24,
    alpha: 0.7,
  }));
  const out = glowExposureScales(dense);
  const after = glowExposureScales(
    dense.map((g, i) => ({ ...g, alpha: g.alpha * out.scales[i] })),
  );
  expect(after.peak).toBeLessThanOrEqual(GLOW_EXPOSURE_LIMIT + 1e-6);
});
it("死亡保存與清算最後燃燒致死不得因成長補血復活，進房快照仍可獲得成長", () => {
  const dead = newRun("sword", 13308);
  delete dead.healthGrowthVersion;
  dead.level = 31;
  dead.phase = "DEAD";
  dead.player.hp = 0;
  const entry = {
    ...structuredClone(dead),
    phase: "ROOM_INTRO" as const,
    player: { ...dead.player, hp: 150 },
  };
  const saved = validate({ version: 1, revision: 0, current: dead, entry });
  expect(saved.current.player.hp).toBe(0);
  expect(saved.current.stats.maxHP).toBe(375);
  expect(saved.entry.player.hp).toBe(375);
  const r = newRun("sword", 13309);
  r.phase = "SETTLEMENT";
  r.settlementEnds = 0;
  r.settledOnce = true;
  r.player.hp = 1;
  r.player.burnUntil = 1;
  r.player.burnTick = 0;
  r.enemies = [];
  r.reserves = [];
  r.hazards = [];
  r.drops = [];
  step(r, idleCommand(r));
  expect(r.player.hp).toBe(0);
  expect(r.phase).toBe("DEAD");
});
