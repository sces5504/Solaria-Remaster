import { expect, it } from "vitest";
import { newRun, idleCommand, step } from "../../src/game/core/run";
import { actor } from "../../src/game/data/world";
import {
  derive,
  grantTestCard,
  chooseEquipmentSlot,
} from "../../src/game/systems/progression";
import {
  basic,
  basicDamage,
  castSkill,
  dodge,
  updateSkills,
} from "../../src/game/systems/skills";
import {
  context,
  hit,
  hurt,
  damageCover,
  updateAreas,
  updateProjectiles,
} from "../../src/game/systems/combat";
import { coverInBossTriangle } from "../../src/game/systems/cover";
import { equipmentCatalog } from "../../src/game/data/equipment";
import { grantTestEquipment } from "../../src/game/core/testing";
import { validate } from "../../src/game/persistence/checkpoint";
import { isolateProp } from "../../src/render/prop-isolation";
import { AdventureEffects } from "../../src/render/adventure-effects";
import type { Obstacle, Visual } from "../../src/game/core/types";
function setup(
  cls: "mage" | "sword" | "bow" = "sword",
  cards: Record<number, number> = {},
) {
  const r = newRun(cls, 1321);
  r.cards = { ...cards };
  r.stats = derive(r);
  r.stats.crit = 0;
  r.phase = "COMBAT";
  r.obstacles = [];
  r.hazards = [];
  r.reserves = [];
  r.player.x = 112;
  r.player.y = 320;
  r.player.invulnerable = 0;
  r.enemies = [actor(800, 1, 185, 320)];
  r.enemies[0].hp = r.enemies[0].maxHP = 10000;
  r.enemies[0].armor = 0;
  return r;
}
const wall = (x: number, y = 300): Obstacle => ({
  id: 1,
  x,
  y,
  w: 32,
  h: 40,
  kind: "rock",
  durability: 20,
  maxDurability: 20,
  waves: [],
});
it("體魄複合最大生命包含裝備，其他數值與文字要求落實", () => {
  const r = setup("mage");
  r.equipment.armor = {
    id: "hp",
    slot: "armor",
    rarity: "藍",
    affixes: [{ stat: "hp", value: 10 }],
    x: 0,
    y: 0,
  };
  r.cards[1] = 3;
  expect(derive(r).maxHP).toBeCloseTo(133.1);
  r.cards = { 3: 1, 6: 1, 8: 1, 10: 1, 13: 1, 14: 1, 27: 1 };
  const s = derive(r);
  expect(s.basic).toBe(0.15);
  expect(s.speed).toBeCloseTo(220);
  expect(s.xp).toBe(1.1);
  expect(s.crit).toBe(0.2);
  expect(s.range).toBeCloseTo(1.35);
  expect(s.global).toBe(0.15);
  expect(s.reduction).toBe(0.1);
  r.cards[66] = 1;
  r.momentum = { stacks: 10, until: 4 };
  expect(derive(r).global).toBeCloseTo(0.4);
});
it("閃避2秒、錨定減1秒守住20%邊界，遲暮完全封印", () => {
  const r = setup("mage", { 72: 1 });
  r.player.skillReady = 3;
  r.player.skillCast = 0;
  r.time = 1;
  expect(dodge(r, idleCommand(r))).toBe(true);
  expect(r.player.dashReady).toBe(3);
  expect(r.player.skillReady).toBe(2);
  r.player.dashReady = 0;
  r.player.skillReady = 0.8;
  dodge(r, idleCommand(r));
  expect(r.player.skillReady).toBeCloseTo(0.6);
  r.cards[84] = 1;
  r.player.dashReady = 0;
  expect(dodge(r, idleCommand(r))).toBe(false);
  expect(r.player.dashReady).toBe(0);
});
it("格擋斬同時吃普攻與技能乘區；炎龍與泡沫只吃半份普攻加成", () => {
  const r = setup("sword", { 3: 2, 4: 2, 44: 1 });
  r.player.counterAt = 0.01;
  r.time = 0.02;
  updateSkills(r, idleCommand(r));
  expect(10000 - r.enemies[0].hp).toBeCloseTo(120 * 1.3 * 1.3 * 1.2);
  const f = setup("mage", { 20: 1, 25: 1, 3: 2, 4: 2 });
  f.elements = ["fire", "water"];
  basic(f, idleCommand(f));
  expect(f.areas.find((a) => a.ability === 20)?.context?.basicBonusWeight).toBe(
    0.5,
  );
  const bubble = f.projectiles.find((p) => p.context?.sourceAbilityId === 25)!;
  const ctx = bubble.context!;
  expect(hit(f, f.enemies[0], 18, ctx)).toBeCloseTo(18 * 1.2 * 1.15);
});
it("劍氣等同原普攻並觸發命中效果，保持施放次數；衝鋒2倍普攻亦觸發", () => {
  const r = setup("sword", { 43: 1, 3: 1, 19: 1 });
  r.elements = ["fire"];
  r.enemies[0].x = 400;
  for (let i = 0; i < 3; i++) basic(r, idleCommand(r));
  const p = r.projectiles[0];
  expect(p.damage).toBe(basicDamage(r));
  expect(p.context?.basicHitProxy).toBe(true);
  expect(r.player.casts).toBe(3);
  updateProjectiles(r, 1);
  expect(r.enemies[0].burn.length).toBeGreaterThan(0);
  expect(10000 - r.enemies[0].hp).toBeCloseTo(30 * 1.15);
  const d = setup("sword", { 47: 1, 3: 1, 19: 1 });
  d.elements = ["fire"];
  d.enemies[0].x = 150;
  const cmd = { ...idleCommand(d), move: { x: 1, y: 0 } };
  dodge(d, cmd);
  for (let i = 0; i < 6; i++) step(d, cmd);
  expect(d.enemies[0].hp).toBeCloseTo(10000 - 60 * 1.15 - 8);
  expect(d.enemies[0].burn.length).toBeGreaterThan(0);
  expect(d.player.casts).toBe(0);
});
it.each(["bow", "mage"] as const)(
  "%s 副箭／星火保持源倍率，能帶元素與普攻效果",
  (cls) => {
    const r = setup(cls, { [cls === "bow" ? 50 : 54]: 1, 19: 1 });
    r.elements = ["fire"];
    basic(r, idleCommand(r));
    const p = r.projectiles[1];
    expect(p.context?.basicHitProxy).toBe(true);
    expect(p.context?.chainScale).toBe(cls === "bow" ? 0.2 : 0.4);
    expect(hit(r, r.enemies[0], p.damage, p.context!)).toBeCloseTo(
      (cls === "bow" ? 18 : 24) * (cls === "bow" ? 0.2 : 0.4),
    );
    expect(r.enemies[0].burn.length).toBeGreaterThan(0);
  },
);
it("吸血鬼取得／舊存檔／回復均硬限四成，玻璃不減HP而承傷翻倍，獻祭觸發受傷能力", () => {
  const r = setup("mage");
  grantTestCard(r, 79);
  expect(r.player.hp).toBe(36);
  r.player.hp = 90;
  const saved = validate({ version: 1, revision: 0, current: r, entry: r });
  expect(saved.current.player.hp).toBe(36);
  const glass = setup("mage", { 81: 1 });
  expect(glass.stats.maxHP).toBe(90);
  hurt(glass, 10.5);
  expect(glass.player.hp).toBe(70);
  const s = setup("mage", { 82: 1, 69: 1, 73: 1 });
  s.time = 1;
  s.player.hp = 90;
  s.player.invulnerable = 99;
  castSkill(s, idleCommand(s));
  expect(s.stats.skill).toBe(0.6);
  expect(s.player.hp).toBeCloseTo(82.8);
  expect(s.player.lastHurt).toBe(1);
  expect(s.player.recoveryUntil).toBe(3);
  expect(s.player.shields[0].amount).toBe(9);
});
it("三角形底邊直徑220，矩形邊緣相交算命中；遠處近戰在三角形外不再扣耐久", () => {
  const r = setup();
  r.stats.range = 1;
  r.player.x = 900;
  r.player.y = 320;
  const boss = { x: 112, y: 320 };
  expect(coverInBossTriangle(wall(400), boss, r.player, 110)).toBe(true);
  expect(coverInBossTriangle(wall(400, 180), boss, r.player, 110)).toBe(false);
  expect(coverInBossTriangle(wall(920), boss, r.player, 110)).toBe(false);
  r.obstacles = [wall(400)];
  damageCover(r, { x: 416, y: 320 }, 50, 1, "boss", undefined, false, boss);
  expect(r.obstacles[0].durability).toBe(15);
  r.obstacles = [wall(400, 180)];
  damageCover(r, { x: 416, y: 200 }, 50, 2, "boss", undefined, true, boss);
  expect(r.obstacles[0].durability).toBe(20);
  r.obstacles = [wall(700)];
  damageCover(r, { x: 716, y: 320 }, 50, 3, "boss", undefined, true, boss);
  expect(r.obstacles[0].durability).toBe(10);
  r.obstacles = [wall(400)];
  damageCover(r, { x: 416, y: 320 }, 50, 4, "monster", undefined, false, boss);
  expect(r.obstacles[0].durability).toBe(20);
});
it("測試可取得所有傳奇／紅装：真詞綴、保存、全卸代價與封印不能绕過", () => {
  const r = setup();
  for (const key of Object.keys(equipmentCatalog)) {
    expect(grantTestEquipment(r, key)).toBe(true);
    const i = [...Object.values(r.equipment), ...r.bag, ...r.items].find(
      (i) => i?.ability === key,
    )!;
    expect(i.affixes.length).toBe(
      key in equipmentCatalog &&
        equipmentCatalog[key as keyof typeof equipmentCatalog].rarity === "紅"
        ? 2
        : 3,
    );
  }
  expect(grantTestEquipment(r, "__proto__")).toBe(false);
  const v = setup();
  grantTestEquipment(v, "ghostArmor");
  grantTestCard(v, 85);
  expect(Object.keys(v.equipment)).toHaveLength(0);
  expect(v.bag).toHaveLength(1);
  grantTestEquipment(v, "timeRing");
  grantTestEquipment(v, "ghostArmor");
  expect(v.equipment.armor).toBeUndefined();
  expect(() =>
    validate({ version: 1, revision: 0, current: v, entry: v }),
  ).not.toThrow();
});
it("火山柱只清頂部冷色鄰格，暖色火尖與下方石頭保留", () => {
  const w = 100,
    data = new Uint8ClampedArray(w * w * 4);
  for (let y = 8; y < 90; y++)
    for (let x = 45; x < 65; x++) data.set([180, 90, 20, 255], (y * w + x) * 4);
  for (let x = 20; x < 85; x++) data.set([190, 210, 225, 255], (8 * w + x) * 4);
  data.set([240, 160, 30, 255], (7 * w + 55) * 4);
  isolateProp(data, w, w, "volcano-pillar");
  expect(data[(8 * w + 25) * 4 + 3]).toBe(0);
  expect(data[(7 * w + 55) * 4 + 3]).toBe(255);
  expect(data[(50 * w + 55) * 4 + 3]).toBe(255);
});
it("霜鈴只走禮物特效，沒有generic explosion／rune貼圖疊繪", () => {
  const fx = new AdventureEffects({});
  const r = setup();
  const v = {
    kind: "burst",
    sourceAbilityId: 212,
    id: 1,
    value: 0,
    radius: 1000,
    x: 400,
    y: 320,
    until: 1,
    duration: 1,
    color: 0,
    angle: 0,
  } as Visual;
  expect(fx.visual(r, v, {} as any)).toBe(true);
  expect(fx.inspect().active).toBe(0);
  const stamps: { name: string; width: number }[] = [];
  fx.stamp = (name, x, y, width) => {
    stamps.push({ name, width });
  };
  expect(fx.visual(r, { ...v, kind: "relic", value: 212 }, {} as any)).toBe(
    true,
  );
  expect(stamps[0].name).toBe("gift-impact");
  expect(stamps[0].width).toBeLessThanOrEqual(144);
  expect(fx.inspect().active).toBe(0);
});
it("舊敵彈主人死亡且沒有原點時不假造三角形；新敵彈保存的原點可繼續判定", async () => {
  const { shoot } = await import("../../src/game/systems/combat");
  const r = setup();
  r.player.x = 900;
  r.player.y = 320;
  r.stats.range = 1;
  r.enemies = [actor(9, 6, 112, 320)];
  r.obstacles = [wall(400)];
  shoot(r, r.enemies[0], 0, 20, 600, 1000, null, 1, true, 9, 10);
  expect(r.projectiles[0].coverOrigin).toEqual({ x: 112, y: 320 });
  r.enemies = [];
  updateProjectiles(r, 1);
  expect(r.obstacles[0].durability).toBe(15);
  r.obstacles = [wall(400)];
  shoot(r, { x: 112, y: 320 }, 0, 20, 600, 1000, null, 1, true, 9, 11);
  r.projectiles[0].coverSource = "boss";
  delete r.projectiles[0].coverOrigin;
  updateProjectiles(r, 1);
  expect(r.obstacles[0].durability).toBe(20);
});
