import { expect, it } from "vitest";
import { newRun, startRoom, step, idleCommand } from "../../src/game/core/run";
import { actor } from "../../src/game/data/world";
import { castSkill, basic } from "../../src/game/systems/skills";
import { context, hit, updateAreas } from "../../src/game/systems/combat";
import { grantTestCard } from "../../src/game/systems/progression";
import { refillEnemies } from "../../src/game/systems/enemies";
import { legal } from "../../src/game/systems/geometry";
import { sceneLights, skillCooldownProgress } from "../../src/render/lighting";
import { elementColors } from "../../src/render/effects";

function target(id: number, x: number, y = 320) {
  const e = actor(id, 2, x, y);
  e.hp = e.maxHP = 10000;
  e.radius = 1;
  e.armor = 0;
  return e;
}
it("燼火爆炸給其他敵人三層，來源倍率保留且不幫自己加三層", () => {
  const r = newRun("sword", 940);
  r.cards[23] = 1;
  r.stats.crit = 0;
  const a = target(100, 300),
    b = target(101, 350),
    outside = target(102, 450);
  a.fireStacks = 4;
  r.enemies = [a, b, outside];
  hit(r, a, 1, context(r, 150, "basic", ["fire"], true, 0.2, false));
  expect(a.fireStacks).toBe(0);
  expect(b.fireStacks).toBe(3);
  expect(b.maxHP - b.hp).toBeCloseTo(8);
  expect(outside.fireStacks).toBe(0);
  expect(r.visuals.filter((v) => v.kind === "burst")).toHaveLength(1);
});
it("燼火三層可接續引爆，密集敵群同一連鎖每敵最多一次不無限互炸", () => {
  const r = newRun("sword", 941);
  r.cards[23] = 1;
  r.stats.crit = 0;
  r.enemies = Array.from({ length: 10 }, (_, i) =>
    target(100 + i, 300 + i * 5),
  );
  for (const e of r.enemies) e.fireStacks = 2;
  r.enemies[0].fireStacks = 4;
  hit(r, r.enemies[0], 1, context(r, 150, "basic", ["fire"], true, 1, false));
  expect(r.visuals.filter((v) => v.kind === "burst")).toHaveLength(10);
  expect(r.enemies.every((e) => Number.isFinite(e.hp) && e.hp > 0)).toBe(true);
  expect(r.projectiles).toHaveLength(0);
});
it("蒸氣近中遠0/.2/.4秒，各每波24傷、一次命中，非整點也不漏波", () => {
  const r = newRun("sword", 942);
  grantTestCard(r, 33);
  r.stats.crit = 0;
  r.time = 0.007;
  const a = target(100, r.player.x + 30),
    b = target(101, r.player.x + 100),
    c = target(102, r.player.x + 170);
  r.enemies = [a, b, c];
  castSkill(r, idleCommand(r));
  expect(r.areas.map((a) => a.starts)).toEqual([
    0.007, 0.20700000000000002, 0.40700000000000003,
  ]);
  for (const time of [0.024, 0.224, 0.424]) {
    r.time = time;
    updateAreas(r);
    updateAreas(r);
  }
  expect(a.maxHP - a.hp).toBe(72);
  expect(b.maxHP - b.hp).toBe(48);
  expect(c.maxHP - c.hp).toBe(24);
  expect(r.visuals.filter((v) => v.kind === "steam")).toHaveLength(3);
  expect(r.player.casts).toBe(0);
});
it("蒸氣波觸發普攻命中特效並保留技能傷害分類，不增加施放計數", () => {
  const r = newRun("bow", 943);
  grantTestCard(r, 33);
  r.cards[49] = 1;
  r.stats.crit = 0;
  r.stats.basic = 5;
  r.stats.skill = 0;
  const e = target(100, r.player.x + 30);
  r.enemies = [e];
  castSkill(r, idleCommand(r));
  const waves = r.areas.filter((a) => a.ability === 33);
  expect(
    waves.every(
      (a) => a.context?.basicHitProxy && a.context.damageKind === "skill",
    ),
  ).toBe(true);
  for (const t of [0, 0.2, 0.4]) {
    r.time = t;
    updateAreas(r);
  }
  expect(e.hits).toBe(3);
  expect(e.maxHP - e.hp).toBeCloseTo(24 + 24 + 24 * 1.6);
  expect(r.player.casts).toBe(0);
});
it("炎龍噴射傷害只保留扇形火流，不產生每tick圓形爆炸", () => {
  const r = newRun("sword", 944);
  grantTestCard(r, 20);
  r.stats.crit = 0;
  r.enemies = [target(100, r.player.x + 150)];
  basic(r, { ...idleCommand(r), pointerWorld: { x: 800, y: 320 } });
  const hp = r.enemies[0].hp;
  for (const t of [0, 0.25, 0.5]) {
    r.time = t;
    updateAreas(r);
  }
  expect(r.enemies[0].hp).toBeLessThan(hp);
  expect(r.areas.find((a) => a.ability === 20)?.shape).toBe("cone");
  expect(r.visuals.filter((v) => v.kind === "burst")).toHaveLength(0);
});
it("只稍縮冰雹/漩渦/冰火裂域，傷害圈和顯示圈一致，其他光環不縮", () => {
  const r = newRun("sword", 945);
  r.cards = { 17: 1, 18: 1, 26: 1, 39: 1 };
  castSkill(r, idleCommand(r));
  for (const [id, radius] of [
    [17, 85],
    [26, 94],
    [39, 110],
    [18, 100],
  ])
    expect(r.areas.find((a) => a.ability === id)?.radius).toBeCloseTo(
      radius * 1.15,
    );
  expect(r.visuals.find((v) => v.kind === "burst")?.radius).toBeCloseTo(126.5);
});
it("快速擊殺同幀補回4隻，保留有限怪池、落點距離/合法、1.2秒入場預警", () => {
  for (let seed = 1; seed <= 20; seed++) {
    const r = newRun("sword", seed);
    startRoom(r);
    const total = r.enemies.length + (r.reserves?.length || 0);
    const identities = new Set([...r.enemies, ...r.reserves!].map((e) => e.id));
    const excess = r.enemies.splice(1);
    r.reserves!.push(...excess);
    // Even a reserve point right on the player must not starve the queue.
    Object.assign(r.reserves![0], { x: r.player.x, y: r.player.y });
    r.enemies[0].hp = 0;
    r.reinforcementAt = 500;
    step(r, idleCommand(r));
    expect(r.enemies).toHaveLength(4);
    for (const e of r.enemies) {
      expect(identities.has(e.id)).toBe(true);
      expect(legal(r, e, e.radius)).toBe(true);
      expect(Math.hypot(e.x - r.player.x, e.y - r.player.y)).toBeGreaterThan(
        150,
      );
      expect(e.nextAttack).toBeGreaterThanOrEqual(r.time + 1.1);
    }
    expect(r.enemies.length + r.reserves!.length).toBe(total - 1);
    r.reserves = [];
    r.enemies.splice(2);
    refillEnemies(r);
    expect(r.enemies).toHaveLength(2);
  }
});
it("冷卻條在長時間可用/剛施放/跨職與冷卻變更均界於0–1", () => {
  const r = newRun("mage", 946);
  for (const [time, ready, cd, expected] of [
    [100, 0, 3, 1],
    [0, 3, 3, 0],
    [1.5, 3, 3, 0.5],
    [5, 9, 1, 0],
    [9, 9, 0, 1],
  ]) {
    r.time = time;
    r.player.skillReady = ready;
    r.stats.skillCD = cd;
    expect(skillCooldownProgress(r)).toBe(expected);
  }
});
it("藍雷/火焰/裝備的世界照明有範圍、失效光源移除且不變更遊戲狀態", () => {
  const r = newRun("mage", 947);
  grantTestCard(r, 29);
  r.enemies = [target(100, 300), target(101, 350)];
  hit(r, r.enemies[0], 1, context(r, 150, "basic", ["lightning"], true));
  const before = JSON.stringify(r);
  const lights = sceneLights(r);
  expect(lights.some((l) => l.color === 0x49baff && l.radius >= 85)).toBe(true);
  expect(elementColors.lightning).toBe(0x49baff);
  expect(JSON.stringify(r)).toBe(before);
  r.time = 30;
  expect(sceneLights(r).filter((l) => l.color === 0x49baff)).toHaveLength(1); // the held elemental staff
});
