import { describe, it, expect } from "vitest";
import { newRun, startRoom, idleCommand, step } from "../../src/game/core/run";
import { actor } from "../../src/game/data/world";
import { cards } from "../../src/game/data/cards";
import { derive } from "../../src/game/systems/progression";
import {
  basic,
  castSkill,
  updateSkills,
  dodge,
} from "../../src/game/systems/skills";
import { context, hit, hurt } from "../../src/game/systems/combat";
function setup(id: number) {
  const c = cards[id - 1];
  const r = newRun(c.classId ?? "mage", 123);
  startRoom(r);
  r.obstacles = [];
  r.enemies = [
    actor(9, 1, 200, 320),
    actor(10, 1, 230, 350),
    actor(11, 1, 260, 320),
  ];
  for (const e of r.enemies) e.hp = e.maxHP = 10000;
  r.cards[id] = 1;
  r.stats = derive(r);
  r.stats.crit = 0;
  r.elements =
    id <= 18
      ? ["ice"]
      : id <= 23
        ? ["fire"]
        : id <= 27
          ? ["water"]
          : id <= 31
            ? ["lightning"]
            : id <= 34
              ? ["water", "fire"]
              : id <= 37
                ? ["water", "lightning"]
                : id <= 40
                  ? ["ice", "fire"]
                  : [];
  return r;
}
describe("CARD-01..59 每卡實際條件／無条件对照", () => {
  const stats: Record<number, string> = {
    1: "maxHP",
    2: "armor",
    3: "basic",
    4: "skill",
    5: "attackRate",
    6: "speed",
    7: "projectile",
    8: "xp",
    9: "skillCD",
    10: "crit",
    11: "critMult",
    12: "elemental",
    13: "range",
    14: "global",
  };
  for (let id = 1; id <= 14; id++)
    it(`${id} ${cards[id - 1].name} 改变实际数值`, () => {
      const r = setup(id),
        base = newRun("mage", 123).stats;
      r.stats = derive(r);
      const key = stats[id] as keyof typeof base;
      expect(
        id === 9 ? r.stats[key] < base[key] : r.stats[key] > base[key],
      ).toBe(true);
    });
  for (const id of [15, 19, 24, 28])
    it(`${id} ${cards[id - 1].name} 普攻附状态`, () => {
      const r = setup(id),
        e = r.enemies[0];
      hit(r, e, 1, context(r, id, "basic", r.elements, true));
      if (id === 15) expect(e.frost).toBe(15);
      if (id === 19) expect(e.burn[0].until).toBe(3);
      if (id === 24) expect(e.wetUntil).toBe(3);
      if (id === 28) expect(e.hp).toBeLessThan(9999);
    });
  for (const id of [16, 20, 25, 32, 35, 38])
    it(`${id} ${cards[id - 1].name} 左触发产生专属来源`, () => {
      const r = setup(id);
      for (let i = 0; i < 3; i++) basic(r, idleCommand(r));
      expect([
        ...r.projectiles.map((p) => p.context?.sourceAbilityId),
        ...r.areas.map((a) => a.ability),
      ]).toContain(id);
      if (id !== 16) {
        const count = r.projectiles.filter(
          (p) => p.context?.sourceAbilityId === id,
        ).length;
        basic(r, idleCommand(r));
        expect(
          r.projectiles.filter((p) => p.context?.sourceAbilityId === id),
        ).toHaveLength(count);
      }
    });
  for (const id of [17, 18, 21, 22, 26, 30, 31, 33, 34, 36, 37, 39])
    it(`${id} ${cards[id - 1].name} 右触发一次且遵守职业CD`, () => {
      const r = setup(id);
      r.player.capacitor = 5;
      expect(castSkill(r, idleCommand(r))).toBe(true);
      if (id === 34) {
        expect(r.player.shields[0].amount).toBeCloseTo(18);
        expect(r.player.engineUntil).toBe(3);
      } else if (id === 37) {
        expect(r.player.capacitor).toBe(0);
        expect(r.enemies[0].hp).toBeLessThan(10000);
      } else
        expect([
          ...r.projectiles.map((p) => p.context?.sourceAbilityId),
          ...r.areas.map((a) => a.ability),
        ]).toContain(id);
      const areas = r.areas.length;
      expect(castSkill(r, idleCommand(r))).toBe(false);
      expect(r.areas).toHaveLength(areas);
    });
  it("23 燼火引爆 5層消耗、不自加层、保留副源", () => {
    const r = setup(23),
      e = r.enemies[0];
    for (let i = 0; i < 5; i++)
      hit(r, e, 1, context(r, 50, "basic", ["fire"], true, 0.2));
    expect(e.fireStacks).toBe(0);
    expect(e.hp).toBeCloseTo(9991);
  });
  it("27 水盾是一般减伤而非消耗盾", () => {
    const r = setup(27);
    hurt(r, 105);
    expect(r.player.hp).toBeCloseTo(0);
    expect(r.player.shields).toHaveLength(0);
    const a = setup(27);
    hurt(a, 10.5);
    expect(a.player.hp).toBeCloseTo(80.8);
  });
  it("29 連鎖不同目标、无循环、派生源20%", () => {
    const r = setup(29);
    hit(r, r.enemies[0], 10, context(r, 50, "basic", [], true, 0.2));
    expect(r.enemies[1].hp).toBeCloseTo(9996.4);
    expect(r.enemies[2].hp).toBeCloseTo(9996.4);
    expect(r.visuals.filter((v) => v.kind === "arc")).toHaveLength(2);
  });
  it("40 热冷共振独立计时、可暴击、无补射", () => {
    const r = setup(40),
      e = r.enemies[0];
    e.burn = [{ until: 3, damage: 8, scale: 0.2 }];
    e.iceUntil = 3;
    updateSkills(r, idleCommand(r));
    const p = r.projectiles.find((p) => p.context?.sourceAbilityId === 40)!;
    expect(p.context?.canCrit).toBe(true);
    expect(p.context?.chainScale).toBe(0.2);
    updateSkills(r, idleCommand(r));
    expect(
      r.projectiles.filter((p) => p.context?.sourceAbilityId === 40),
    ).toHaveLength(1);
  });
  it("41 横扫扩至120度，区别于90度", () => {
    const r = setup(41);
    r.enemies = [actor(9, 1, 160, 377)];
    basic(r, idleCommand(r));
    expect(r.enemies[0].hp).toBeLessThan(120);
    delete r.cards[41];
    r.enemies[0].hp = 120;
    basic(r, idleCommand(r));
    expect(r.enemies[0].hp).toBe(120);
  });
  it("42 贴身45内 +30%，外不增", () => {
    const r = setup(42),
      e = r.enemies[0];
    e.x = 140;
    expect(hit(r, e, 100, context(r, 41, "basic", [], true))).toBe(130);
    e.x = 200;
    expect(hit(r, e, 100, context(r, 41, "basic", [], true))).toBe(100);
  });
  it("43 剑气每三次、5级每次，纯追加", () => {
    const r = setup(43);
    basic(r, idleCommand(r));
    basic(r, idleCommand(r));
    expect(r.projectiles).toHaveLength(0);
    basic(r, idleCommand(r));
    expect(r.projectiles[0].context?.canCrit).toBe(false);
    r.cards[43] = 5;
    basic(r, idleCommand(r));
    expect(r.projectiles).toHaveLength(2);
  });
  for (const id of [44, 45, 46])
    it(`${id} ${cards[id - 1].name} 成功格挡后专属效果`, () => {
      const r = setup(id);
      r.enemies[0].x = 200;
      castSkill(r, idleCommand(r));
      hurt(r, 10);
      r.time = 0.31;
      updateSkills(r, idleCommand(r));
      const loss = 10000 - r.enemies[0].hp;
      if (id === 44) expect(loss).toBeCloseTo(144);
      if (id === 45) expect(loss).toBeCloseTo(180);
      if (id === 46) expect(r.player.shields[0].amount).toBeCloseTo(22.5);
    });
  it("47 冲锋沿途仅一次且不无敌", () => {
    const r = setup(47),
      cmd = idleCommand(r);
    r.enemies = [actor(9, 1, 140, 320)];
    // Isolate the per-dash hit count from map generation random draws.
    r.rng = 123456789;
    dodge(r, cmd);
    for (let i = 0; i < 8; i++) step(r, cmd);
    expect(r.enemies[0].hp).toBe(80);
    expect(r.player.invulnerable).toBe(0);
  });
  it("48 猎首只对满HP目标", () => {
    const r = setup(48),
      e = r.enemies[0];
    expect(hit(r, e, 100, context(r, 50, "basic", [], true))).toBe(140);
    expect(hit(r, e, 100, context(r, 50, "basic", [], true))).toBe(100);
  });
  it("49 每敌第三次命中不受换目标重置", () => {
    const r = setup(49),
      [a, b] = r.enemies;
    const ctx = () => context(r, 50, "basic", [], true);
    hit(r, a, 10, ctx());
    hit(r, b, 10, ctx());
    hit(r, a, 10, ctx());
    expect(hit(r, a, 10, ctx())).toBe(16);
  });
  it("50 分裂2→4且 .2→.15", () => {
    const r = setup(50);
    basic(r, idleCommand(r));
    expect(r.projectiles.map((p) => p.context?.chainScale)).toEqual([
      1, 0.2, 0.2,
    ]);
    r.projectiles = [];
    r.cards[50] = 5;
    basic(r, idleCommand(r));
    expect(r.projectiles.map((p) => p.context?.chainScale)).toEqual([
      1, 0.15, 0.15, 0.15, 0.15,
    ]);
  });
  it("51 穿透升级命中上限，实体仍阻", () => {
    const r = setup(51);
    basic(r, idleCommand(r));
    expect(r.projectiles[0].pierce).toBe(3);
    r.cards[51] = 5;
    basic(r, idleCommand(r));
    expect(r.projectiles[1].pierce).toBe(5);
  });
  it("52 快射8→10箭，1秒均匀", () => {
    const r = setup(52);
    castSkill(r, idleCommand(r));
    expect(r.player.rapid.remaining).toBe(8);
    expect(r.player.rapid.interval).toBeCloseTo(1 / 7);
  });
  it("53 快射结束三秒攻速buff", () => {
    const r = setup(53);
    castSkill(r, idleCommand(r));
    for (let i = 0; i <= 61; i++) {
      r.time = i / 60;
      updateSkills(r, idleCommand(r));
    }
    r.stats = derive(r);
    expect(r.player.buffUntil).toBe(4);
    expect(r.stats.attackRate).toBeGreaterThan(3);
  });
  it("54 双星副40%、同施放一次", () => {
    const r = setup(54);
    basic(r, idleCommand(r));
    expect(r.projectiles.map((p) => p.context?.chainScale)).toEqual([1, 0.4]);
    expect(r.player.casts).toBe(1);
  });
  it("55 远距300以上才 +40%", () => {
    const r = setup(55),
      e = r.enemies[0];
    e.x = 450;
    expect(hit(r, e, 100, context(r, 54, "basic", [], true))).toBe(140);
    e.x = 200;
    expect(hit(r, e, 100, context(r, 54, "basic", [], true))).toBe(100);
  });
  it("56 爆裂追加不暴击不续触发", () => {
    const r = setup(56),
      e = r.enemies[0];
    hit(r, e, 1, context(r, 54, "basic", [], true));
    expect(e.hp).toBe(9987);
    expect(r.enemies[1].hp).toBe(9988);
  });
  it("57 折射不增加施放且升级次数", () => {
    const r = setup(57);
    basic(r, idleCommand(r));
    expect(r.projectiles[0].bounce).toBe(2);
    expect(r.player.casts).toBe(1);
    r.cards[57] = 5;
    basic(r, idleCommand(r));
    expect(r.projectiles[1].bounce).toBe(4);
  });
  it("58 回响 .6秒后基准50%且不暴击", () => {
    const r = setup(58);
    castSkill(r, idleCommand(r));
    const a = r.areas.find((a) => a.ability === 58)!;
    expect(a.starts).toBe(0.9);
    expect(a.damage).toBe(48);
    expect(a.context?.canCrit).toBe(false);
  });
  it("59 星环三秒周期纯技能，可暴击", () => {
    const r = setup(59);
    castSkill(r, idleCommand(r));
    const a = r.areas.find((a) => a.ability === 59)!;
    expect(a.damage).toBe(20);
    expect(a.follow).toBe(true);
    expect(a.context?.elementMask).toHaveLength(0);
    expect(a.context?.canCrit).toBe(true);
  });
});
it("分裂箭对同敌多箭命中只推一次连射专注", () => {
  const r = setup(49);
  r.cards[50] = 1;
  basic(r, idleCommand(r));
  const e = r.enemies[0];
  for (const p of r.projectiles) hit(r, e, 1, p.context!);
  expect(e.hits).toBe(1);
});
