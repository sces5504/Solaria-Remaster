import { it, expect } from "vitest";
import { journeyFor } from "../../src/game/data/journey";
import { seedFor, random } from "../../src/game/core/primitives";
for (const loop of [1, 2, 5, 10])
  it(`實際路線條件下九Boss池各50%，第${loop}周目`, () => {
    const state = { rng: seedFor(5504, 991) },
      counts: Record<string, Record<number, number>> = {},
      patterns = new Set<string>();
    for (let i = 0; i < 20000; i++) {
      const seed = Math.floor(random(state) * 4294967296);
      const route = journeyFor(seed, loop);
      patterns.add(route.map((s) => s.biome + ":" + s.boss).join("/"));
      for (const seg of route) {
        const pool = (counts[seg.biome] ??= {});
        pool[seg.boss] = (pool[seg.boss] ?? 0) + 1;
      }
    }
    expect(Object.keys(counts)).toHaveLength(9);
    for (const pool of Object.values(counts)) {
      expect(Object.keys(pool)).toHaveLength(2);
      const [a, b] = Object.values(pool);
      expect(a / (a + b)).toBeGreaterThan(0.47);
      expect(a / (a + b)).toBeLessThan(0.53);
    }
    expect(patterns.size).toBeGreaterThan(400);
  });
