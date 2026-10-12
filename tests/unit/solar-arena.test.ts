import { it, expect } from "vitest";
import { newRun } from "../../src/game/core/run";
import { solarArena } from "../../src/game/data/solar-arena";
import { legal, lineBlocked } from "../../src/game/systems/geometry";
it("日輪王房跨100seed各周目保有中央通路、四封印位置與可破壞掩體", () => {
  const shapes = new Set<string>();
  for (let seed = 1; seed <= 100; seed++)
    for (const loop of [1, 2, 5, 10]) {
      const r = newRun("sword", seed);
      r.loop = loop;
      r.obstacles = solarArena(r);
      expect(r.obstacles).toHaveLength(8);
      expect(new Set(r.obstacles.map((o) => o.id)).size).toBe(8);
      expect(lineBlocked(r, { x: 112, y: 320 }, { x: 928, y: 320 }, true)).toBe(
        false,
      );
      for (const p of [
        { x: 240, y: 160 },
        { x: 840, y: 160 },
        { x: 240, y: 480 },
        { x: 840, y: 480 },
        { x: 760, y: 320 },
      ])
        expect(legal(r, p, 36)).toBe(true);
      shapes.add(JSON.stringify(r.obstacles.map((o) => [o.x, o.y])));
    }
  expect(shapes.size).toBeGreaterThan(390);
});
