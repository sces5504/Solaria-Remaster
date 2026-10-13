import { expect, it } from "vitest";
import {
  biomes,
  biomeLayout,
  monsters,
  type BiomeId,
} from "../../src/game/data/biomes";
import { newRun, startRoom, idleCommand, step } from "../../src/game/core/run";
import { populate, actor, assignElite } from "../../src/game/data/world";
import { legal } from "../../src/game/systems/geometry";
import { createHazards, updateHazards } from "../../src/game/systems/hazards";
import { context, hit } from "../../src/game/systems/combat";

const ids = Object.keys(biomes).filter((id) => id !== "meadow") as Exclude<
  BiomeId,
  "meadow"
>[];
it.each(ids)("%s 六程序房型保留通路、掩體及合法原生怪", (id) => {
  for (let profile = 0; profile < 6; profile++)
    for (let seed = 1; seed <= 20; seed++) {
      const r = newRun("sword", seed);
      r.biome = id;
      r.templates = [profile];
      populate(r);
      expect(
        r.obstacles.filter((o) => o.kind !== "lake").length,
        `${id}/${profile}/${seed}`,
      ).toBeGreaterThanOrEqual(4);
      expect(
        r.obstacles.filter((o) => o.kind !== "lake").every((o) => o.w >= 64),
      ).toBe(true);
      expect(r.obstacles.length).toBeLessThanOrEqual(14);
      expect(legal(r, r.player, 18)).toBe(true);
      expect(legal(r, { x: 928, y: 320 }, 18)).toBe(true);
      for (const e of [...r.enemies, ...(r.reserves ?? [])])
        expect(legal(r, e, e.radius)).toBe(true);
      const seen = new Set<number>();
      const queue = [323];
      seen.add(323);
      for (let i = 0; i < queue.length; i++)
        for (const p of [
          queue[i] - 1,
          queue[i] + 1,
          queue[i] - 32,
          queue[i] + 32,
        ]) {
          const x = p % 32,
            y = Math.floor(p / 32);
          if (
            x < 2 ||
            x > 29 ||
            y < 3 ||
            y > 17 ||
            seen.has(p) ||
            !legal(r, { x: x * 32 + 16, y: y * 32 + 16 }, 18)
          )
            continue;
          seen.add(p);
          queue.push(p);
        }
      expect(seen.has(348)).toBe(true);
      for (let y = 3; y <= 17; y++)
        for (let x = 2; x <= 29; x++)
          if (legal(r, { x: x * 32 + 16, y: y * 32 + 16 }, 18))
            expect(seen.has(y * 32 + x)).toBe(true);
    }
});
it.each(Object.values(monsters))(
  "MON-$id $name 觀察各原生招式及預警",
  (definition) => {
    const r = newRun("sword", definition.id * 21);
    r.enemies = [];
    r.reserves = [];
    r.obstacles = [];
    r.biome = ids.find((id) => biomes[id].monsters.includes(definition.id));
    const e = actor(999, definition.archetype, 220, 320);
    e.monsterId = definition.id;
    e.nextAttack = 0;
    e.hp = e.maxHP = 100000;
    r.enemies = [e];
    startRoom(r);
    r.player.invulnerable = 100;
    for (let i = 0; i < 900; i++) step(r, idleCommand(r));
    for (const attack of definition.attacks)
      expect(r.attackLog).toContain(`mon-${definition.id}-${attack}`);
    expect(
      r.projectiles.every(
        (p) => Number.isFinite(p.vx) && Number.isFinite(p.vy),
      ),
    ).toBe(true);
  },
);
it("M03 地形危害週期乘 .8，清關停止新攻擊，慢區不改閃避", () => {
  for (const modifier of [false, true]) {
    const r = newRun("mage", 1);
    r.biome = "volcano";
    r.obstacles = [];
    createHazards(r);
    startRoom(r);
    r.time = 20;
    r.modifiers = modifier ? [6] : [];
    updateHazards(r);
    expect(r.hazards![0].next).toBeCloseTo(20 + 5.5 * (modifier ? 0.8 : 1));
    expect(r.areas.length).toBe(3);
    r.phase = "POST_CLEAR";
    r.time = 40;
    updateHazards(r);
    expect(r.areas.length).toBe(3);
  }
});
it("M04 精英抽定位能力，護盾損失不提供吸血", () => {
  const abilities = new Set<string>();
  for (let seed = 1; seed < 60; seed++) {
    const r = newRun("sword", seed);
    const e = actor(999, 1, 400, 320, true);
    assignElite(r, e);
    abilities.add(e.eliteAbility!);
    expect(e.eliteAbility).not.toBe("barrage");
    if (e.eliteAbility !== "shield") continue;
    r.enemies = [e];
    r.stats.crit = 0;
    r.stats.lifesteal = 1;
    r.player.hp = 20;
    const before = e.hp;
    hit(r, e, 20, context(r, 1, "basic", [], true));
    expect(e.hp).toBe(before);
    expect(r.player.hp).toBe(20);
    expect(e.enemyShield).toBeLessThan(e.maxHP * 0.2);
  }
  expect([...abilities].sort()).toEqual(["element", "rush", "shield"]);
});
