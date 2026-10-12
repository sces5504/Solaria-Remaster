import { it, expect } from "vitest";
import { newRun } from "../../src/game/core/run";
import { actor, populate } from "../../src/game/data/world";
import { sceneLights } from "../../src/render/lighting";
it("熔甲獸的無火元素招式不妨礙熔核受光，熔池也發光且死亡／摧毀後移除", () => {
  const r = newRun("sword", 124);
  r.biome = "volcano";
  populate(r);
  const lava = actor(999, 3, 420, 320);
  lava.monsterId = 12;
  lava.element = null;
  r.enemies = [lava];
  r.projectiles = [];
  r.visuals = [];
  r.areas = [];
  r.drops = [];
  r.items = [];
  const pool = r.obstacles.find((o) => o.kind === "lake")!;
  expect(pool).toBeDefined();
  const before = JSON.stringify(r),
    sources = sceneLights(r);
  expect(
    sources.some(
      (l) => l.x === lava.x && l.radius > 80 && l.color === 0xff9b45,
    ),
  ).toBe(true);
  expect(
    sources.some((l) => l.x === pool.x + pool.w / 2 && l.radius >= 150),
  ).toBe(true);
  expect(JSON.stringify(r)).toBe(before);
  lava.hp = 0;
  pool.durability = 0;
  expect(
    sceneLights(r).some((l) => l.x === lava.x && l.color === 0xff9b45),
  ).toBe(false);
  expect(
    sceneLights(r).some((l) => l.x === pool.x + pool.w / 2 && l.radius >= 150),
  ).toBe(false);
});
