import { COVER_DURABILITY } from "../core/cover-rules";
import type { Run, Obstacle } from "../core/types";
import { random, seedFor } from "../core/primitives";
export function solarArena(r: Run): Obstacle[] {
  const state = { rng: seedFor(r.seed, 9300 + (r.loop ?? 1)) };
  const out: Obstacle[] = [];
  for (const side of [-1, 1])
    for (const row of [-1, 1]) {
      const x = 512 + side * (138 + random(state) * 42),
        y = 320 + row * (128 + random(state) * 32);
      out.push({
        id: out.length + 1,
        x: x - 24,
        y: y - 24,
        w: 48,
        h: 48,
        kind: "pillar",
        durability: COVER_DURABILITY,
        maxDurability: COVER_DURABILITY,
        waves: [],
      });
      const rx = 512 + side * (285 + random(state) * 20),
        ry = 320 + row * (68 + random(state) * 12);
      out.push({
        id: out.length + 1,
        x: rx - 22,
        y: ry - 15,
        w: 44,
        h: 30,
        kind: "rock",
        durability: COVER_DURABILITY,
        maxDurability: COVER_DURABILITY,
        waves: [],
      });
    }
  return out;
}
