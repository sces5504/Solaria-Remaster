import { expect, it } from "vitest";
import { newRun, idleCommand, step } from "../../src/game/core/run";
import { DT, distance } from "../../src/game/core/primitives";
import { bosses, type BossAttack } from "../../src/game/data/bosses";
import { actor, bossMinion } from "../../src/game/data/world";
import { enemyHPScale, biomes, monsters } from "../../src/game/data/biomes";
import {
  beginBossAttack,
  placeBoss,
  moveBossRush,
} from "../../src/game/systems/biome-bosses";
import { updateAreas, hurt } from "../../src/game/systems/combat";
import { updateModes } from "../../src/game/systems/enemies";
import { castSkill, updateSkills } from "../../src/game/systems/skills";
import { legal } from "../../src/game/systems/geometry";
import { validate } from "../../src/game/persistence/checkpoint";
function arena(id: number) {
  const r = newRun("sword", id * 99);
  r.biome = bosses[id].biome;
  r.obstacles = [];
  r.reserves = [];
  r.phase = "COMBAT";
  const e = placeBoss(r, id);
  e.x = 512;
  e.y = 320;
  e.nextAttack = 100;
  r.enemies = [e];
  r.player.x = 150;
  r.player.y = 320;
  return { r, e };
}
function launch(id: number, name: string) {
  const { r, e } = arena(id);
  const a = bosses[id].attacks.flat().find((a) => a.id === name)!;
  beginBossAttack(r, e, a);
  return { r, e, a, m: r.modes[0] };
}
it("V型熔爐兩束在各自有效時間內收攏，預警不轉、王死亡後仍自然轉完", () => {
  const { r, e, a, m } = launch(7, "furnace-ray");
  const beams = r.areas;
  const original = beams.map((b) => b.angle);
  r.time = a.warning / 2;
  updateAreas(r);
  expect(beams.map((b) => b.angle)).toEqual(original);
  e.hp = 0;
  r.modes = [];
  r.time = a.warning + a.duration / 2;
  updateAreas(r);
  expect(Math.abs(beams[1].angle - beams[0].angle)).toBeCloseTo(Math.PI / 3);
  expect(beams.every((b) => b.wave === m.id && b.coverSource === "boss")).toBe(
    true,
  );
  r.time = a.warning + a.duration - DT;
  updateAreas(r);
  expect(Math.abs(beams[1].angle - beams[0].angle)).toBeLessThan(0.02);
});
it("金字塔全周旋轉與十字、女王逐條雷射有實際不同角度與啟動時間", () => {
  const full = launch(3, "pyramid-rotate");
  full.r.time = full.a.warning + full.a.duration * 0.75;
  updateAreas(full.r);
  expect(full.r.areas[0].angle - full.m.angle).toBeCloseTo(Math.PI * 1.5);
  const cross = launch(3, "pyramid-rays");
  expect(new Set(cross.r.areas.map((b) => b.starts)).size).toBe(1);
  expect(cross.r.areas).toHaveLength(4);
  const sequential = launch(15, "queen-shifted");
  sequential.r.areas.forEach((b, i) =>
    expect(b.starts).toBeCloseTo([0.8, 1.2, 1.6][i]),
  );
  expect(sequential.m.ends).toBeCloseTo(2.8);
});
it("刺客三段衝刺在段間重新預警鎖向，實際走得更遠且不穿掩體", () => {
  const { r, e, a, m } = launch(4, "assassin-dash");
  r.player.invulnerable = 100;
  const starts = e.x;
  let bursts = 0,
    last = 0,
    furthest = 0;
  for (let i = 0; i < 240; i++) {
    step(r, idleCommand(r));
    furthest = Math.max(furthest, starts - e.x);
    if (e.rushUntil > r.time && e.rushUntil !== last) {
      bursts++;
      last = e.rushUntil;
    }
  }
  expect(bursts).toBe(3);
  expect(m.count).toBe(3);
  expect(furthest).toBeGreaterThan(250);
  const blocked = arena(4);
  blocked.r.obstacles = [
    {
      id: 88,
      x: 440,
      y: 280,
      w: 32,
      h: 80,
      kind: "pillar",
      durability: 20,
      maxDurability: 20,
      waves: [],
    },
  ];
  blocked.e.moveAngle = Math.PI;
  blocked.e.rushUntil = 2;
  for (let i = 0; i < 80; i++)
    moveBossRush(blocked.r, blocked.e, { ...m, bossAttack: a });
  expect(legal(blocked.r, blocked.e, blocked.e.radius)).toBe(true);
  expect(blocked.e.x).toBeGreaterThan(480);
});
it("火炎獸彈珠衝撞真的反彈且落點合法，普通衝刺碰牆停止", () => {
  const { r, e, m } = launch(8, "beast-firepath");
  e.x = 948;
  e.y = 320;
  e.moveAngle = 0;
  e.rushUntil = 3;
  for (let i = 0; i < 10; i++) moveBossRush(r, e, m);
  expect(Math.cos(e.moveAngle)).toBeLessThan(0);
  expect(e.x).toBeLessThan(948);
  expect(legal(r, e, e.radius)).toBe(true);
});
it.each(
  Object.entries(biomes).flatMap(([biome, b]) =>
    b.monsters.map((id) => [biome, id] as const),
  ),
)("%s 召喚怪%s 使用真實類型／精英能力與兩倍精英HP（含高周目）", (biome, id) => {
  const r = newRun("mage", 42);
  r.biome = biome as typeof r.biome;
  r.loop = 5;
  const minion = bossMinion(r, id, 500, 320);
  const natural = actor(999, monsters[id]?.archetype ?? id, 500, 320, true);
  expect(minion.hp).toBeCloseTo(natural.maxHP * enemyHPScale(r) * 2);
  expect(minion.elite && minion.summoned).toBe(true);
  expect(minion.eliteAbility).toBeDefined();
  expect(minion.xpReward).toBe(0);
});
it("實際Boss召喚符合精英規則、上限與零經驗，存檔保留", () => {
  const { r, e, a } = launch(9, "flower-minions");
  r.time = a.warning;
  updateModes(r);
  const minions = r.enemies.filter((s) => s.bossOwner === e.id);
  expect(minions).toHaveLength(3);
  expect(
    minions.every(
      (s) => s.elite && s.summoned && s.hp === 550 * enemyHPScale(r),
    ),
  ).toBe(true);
  const saved = validate(
    JSON.parse(
      JSON.stringify({ version: 1, revision: 0, current: r, entry: r }),
    ),
  );
  expect(
    saved.current.enemies.filter((s) => s.summoned).map((s) => s.hp),
  ).toEqual(minions.map((s) => s.hp));
});
it("落雷鎖在遠處玩家，地雷散布於逃跑路線，旋斬實際可傷中距離", () => {
  const mark = launch(10, "witch-thunder");
  expect(distance(mark.r.areas[0], mark.r.player)).toBe(0);
  expect(distance(mark.r.areas[0], mark.e)).toBeGreaterThan(300);
  const mines = launch(7, "furnace-mines");
  expect(mines.r.areas.some((a) => distance(a, mines.e) > 300)).toBe(true);
  const spin = launch(17, "regent-sweep");
  spin.r.player.x = spin.e.x - 170;
  spin.r.player.y = spin.e.y;
  spin.r.time = spin.a.warning;
  const hp = spin.r.player.hp;
  updateModes(spin.r);
  expect(spin.r.player.hp).toBeLessThan(hp);
});
it("花瓣與波形彈幕實際帶不同速度及可保存軌跡，沒有改600整組策略", () => {
  const flower = launch(15, "queen-spiral");
  flower.r.time = flower.a.warning;
  updateModes(flower.r);
  expect(
    new Set(flower.r.projectiles.map((p) => Math.hypot(p.vx, p.vy).toFixed(3)))
      .size,
  ).toBeGreaterThan(1);
  const sine = launch(9, "flower-seeds");
  sine.r.time = sine.a.warning;
  updateModes(sine.r);
  const saved = JSON.parse(JSON.stringify(sine.r));
  expect(saved.projectiles.every((p: { sine?: unknown }) => p.sine)).toBe(true);
});
it("劍士空擋0.9、晚擋後0.75、反擊一次與到期後恢復受傷", () => {
  const r = newRun("sword", 42);
  r.enemies = [];
  r.obstacles = [];
  const cmd = idleCommand(r);
  castSkill(r, cmd);
  r.time = 0.85;
  expect(hurt(r, 30)).toBe(false);
  expect(r.player.blockUntil).toBeCloseTo(1.6);
  r.time = 1.2;
  updateSkills(r, cmd);
  const counter = r.player.counterAt;
  expect(hurt(r, 30)).toBe(false);
  expect(r.player.counterAt).toBe(counter);
  r.time = 1.61;
  expect(hurt(r, 30)).toBe(true);
  expect(r.player.skillReady).toBe(5);
});

it("舊召喚怪current／entry按比例升精英，不重抽RNG或復活；圖騰與封印柱保持", () => {
  const r = newRun("mage", 17);
  r.biome = "jungle";
  const old = actor(900, 1, 500, 320, false, true);
  old.monsterId = 17;
  old.hp = 60;
  old.maxHP = 120;
  const dead = { ...old, id: 901, hp: 0 };
  const pillar = { ...old, id: 902, sealPillar: true };
  const totem = { ...old, id: 903, summonRole: "totem" as const };
  r.enemies = [old, dead, pillar, totem];
  const rng = r.rng;
  const saved = validate(
    JSON.parse(
      JSON.stringify({ version: 1, revision: 0, current: r, entry: r }),
    ),
  );
  for (const state of [saved.current, saved.entry]) {
    expect(state.rng).toBe(rng);
    expect(state.enemies[0].hp).toBeCloseTo(742.5);
    expect(state.enemies[0].kind).toBe(5);
    expect(state.enemies[0].eliteAbility).toBeDefined();
    expect(state.enemies[1].hp).toBe(0);
    expect(state.enemies[2].maxHP).toBe(120);
    expect(state.enemies[3].maxHP).toBe(120);
  }
});
it("交錯兩招的彈體保留自己的wave來源，不誤用另一招的美術身份", () => {
  const { r, e } = arena(15);
  const first = bosses[15].attacks[0][0];
  const second = bosses[15].attacks[1][2];
  beginBossAttack(r, e, first);
  beginBossAttack(r, e, second);
  r.time = 0.8;
  updateModes(r);
  for (const m of r.modes) {
    const shots = r.projectiles.filter((p) => p.wave === m.id);
    expect(shots.length).toBeGreaterThan(0);
    expect(shots.every((p) => p.bossAttackId === m.attackId)).toBe(true);
  }
});

it("狼王沿共用Boss入口後仍保留1.1.2落爪雷光，而非換成通用爆裂", () => {
  const r = newRun("sword", 42);
  r.obstacles = [];
  const e = actor(900, 6, 600, 320);
  r.enemies = [e];
  beginBossAttack(r, e, { ...bosses[10].attacks[0][2], id: "wolf-hunt" });
  expect(
    r.areas.every(
      (a) => a.effect === "thunder" && a.eventAbility === "wolf-hunt",
    ),
  ).toBe(true);
  r.time = 1.1;
  updateAreas(r);
  expect(
    r.visuals.some(
      (v) => v.kind === "thunder" && v.eventAbility === "wolf-hunt",
    ),
  ).toBe(true);
});

it("反彈衝撞在反射前命中玩家附近掩體一次，沿用Boss10點／同波／2秒保護", () => {
  const { r, e, m } = launch(8, "beast-firepath");
  r.player.x = 450;
  r.player.y = 340;
  e.x = 512;
  e.moveAngle = Math.PI;
  r.obstacles = [
    {
      id: 88,
      x: 440,
      y: 280,
      w: 32,
      h: 80,
      kind: "pillar",
      durability: 20,
      maxDurability: 20,
      waves: [],
    },
  ];
  moveBossRush(r, e, m);
  expect(r.obstacles[0].durability).toBe(10);
  expect(r.obstacles[0].invulnerableUntil).toBe(2);
  expect(Math.cos(e.moveAngle)).toBeGreaterThan(0);
  e.x = 512;
  e.moveAngle = Math.PI;
  moveBossRush(r, e, m);
  expect(r.obstacles[0].durability).toBe(10);
});

it("舊存檔掃射沒有beamMotion仍繼續原角速度，新編排不重複旋轉", () => {
  const { r, e, a, m } = launch(3, "pyramid-rotate");
  for (const beam of r.areas) delete beam.beamMotion;
  const initial = r.areas[0].angle;
  r.time = a.warning;
  for (let i = 0; i < 60; i++) {
    updateModes(r);
    r.time += DT;
  }
  expect(r.areas[0].angle - initial).toBeCloseTo(a.rotation / a.duration);
  const modern = launch(3, "pyramid-rotate");
  modern.r.time = modern.a.warning + 1;
  updateModes(modern.r);
  updateAreas(modern.r);
  expect(modern.r.areas[0].angle - modern.m.angle).toBeCloseTo(
    modern.a.rotation / modern.a.duration,
  );
});

it("舊狼群補上原王owner，升精英後不會再額外召三隻突破上限", () => {
  const r = newRun("mage", 42);
  r.room = 5;
  r.boss = 1;
  r.biome = "meadow";
  r.nextId = 1000;
  r.obstacles = [];
  const wolf = actor(900, 6, 600, 320);
  wolf.phase = 2;
  wolf.nextAttack = 0;
  wolf.attackOrdinal = 2;
  r.enemies = [
    wolf,
    ...[901, 902, 903].map((id) => actor(id, 1, 500, 400, false, true)),
  ];
  const saved = validate(
    JSON.parse(
      JSON.stringify({ version: 1, revision: 0, current: r, entry: r }),
    ),
  );
  const resumed = saved.current;
  expect(
    resumed.enemies.filter((e) => e.summoned).every((e) => e.bossOwner === 900),
  ).toBe(true);
  resumed.phase = "COMBAT";
  step(resumed, idleCommand(resumed));
  resumed.time = 1;
  updateModes(resumed);
  expect(resumed.enemies.filter((e) => e.summoned)).toHaveLength(3);
});
