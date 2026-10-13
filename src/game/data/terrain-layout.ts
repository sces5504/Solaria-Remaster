import { COVER_DURABILITY } from "../core/cover-rules";
import { random, seedFor, type Vec } from "../core/primitives";
import type { Obstacle } from "../core/types";
import type { BiomeId } from "./biomes";

// Footprints are ground occupancy, not sprite sizes. Larger landmarks are fewer.
const ecology: Record<
  BiomeId,
  { kinds: Obstacle["kind"][]; size: number; count: number; water: boolean }
> = {
  meadow: { kinds: ["tree", "tree", "rock"], size: 64, count: 12, water: true },
  desert: {
    kinds: ["rock", "rock", "pillar"],
    size: 80,
    count: 9,
    water: true,
  },
  icefield: {
    kinds: ["rock", "rock", "pillar"],
    size: 80,
    count: 10,
    water: true,
  },
  volcano: {
    kinds: ["rock", "rock", "pillar"],
    size: 96,
    count: 8,
    water: true,
  },
  jungle: { kinds: ["tree", "tree", "rock"], size: 64, count: 12, water: true },
  corruption: {
    kinds: ["rock", "pillar", "rock"],
    size: 80,
    count: 10,
    water: true,
  },
  crimson: {
    kinds: ["rock", "pillar", "rock"],
    size: 80,
    count: 10,
    water: true,
  },
  stars: { kinds: ["rock", "pillar", "rock"], size: 80, count: 9, water: true },
  castle: {
    kinds: ["pillar", "pillar", "rock"],
    size: 64,
    count: 12,
    water: false,
  },
};

/** All usable floor remains one component, including both banks and entrance/exit. */
export function connectedTerrain(obstacles: Obstacle[], radius = 24) {
  const grid = new Uint8Array(64 * 40);
  let total = 0;
  for (let y = 5; y <= 36; y++)
    for (let x = 3; x <= 60; x++) {
      const px = x * 16 + 8,
        py = y * 16 + 8;
      if (
        obstacles.every(
          (o) =>
            px <= o.x - radius ||
            px >= o.x + o.w + radius ||
            py <= o.y - radius ||
            py >= o.y + o.h + radius,
        )
      ) {
        grid[y * 64 + x] = 1;
        total++;
      }
    }
  const start = 20 * 64 + 6,
    exit = 20 * 64 + 58;
  if (!grid[start] || !grid[exit]) return false;
  const queue = [start];
  grid[start] = 2;
  for (let i = 0; i < queue.length; i++)
    for (const next of [
      queue[i] - 1,
      queue[i] + 1,
      queue[i] - 64,
      queue[i] + 64,
    ])
      if (grid[next] === 1) {
        grid[next] = 2;
        queue.push(next);
      }
  return queue.length === total && grid[exit] === 2;
}

/** Six ecological grammars: basin, paired banks, ridge, groves, river, ruins. */
export function terrainLayout(
  id: BiomeId,
  profile: number,
  seed: number,
  boss = 0,
): { obstacles: Obstacle[]; route: Vec[] } {
  const spec = ecology[id];
  const rng = { rng: seedFor(seed, 8500 + profile * 31 + boss * 113) };
  const phase = random(rng) * Math.PI * 2;
  const bend = boss ? 0 : profile === 4 ? 58 : profile === 1 ? 24 : 40;
  const route: Vec[] = Array.from({ length: 18 }, (_, i) => ({
    x: 112 + i * 48,
    y: 320 + Math.sin((i / 17) * Math.PI * 2) * Math.cos(phase) * bend,
  }));
  const obstacles: Obstacle[] = [];
  const add = (
    x: number,
    y: number,
    w: number,
    h: number,
    kind: Obstacle["kind"],
    barrier = false,
  ) => {
    const o: Obstacle = {
      id: obstacles.length + 1,
      x: Math.round(x / 16) * 16,
      y: Math.round(y / 16) * 16,
      w,
      h,
      kind,
      durability: kind === "lake" ? 999 : COVER_DURABILITY,
      maxDurability: kind === "lake" ? 999 : COVER_DURABILITY,
      waves: [],
      ...(barrier ? { blocksDash: true } : {}),
    };
    if (
      o.x < 192 ||
      o.x + w > 912 ||
      o.y < 96 ||
      o.y + h > 560 ||
      (o.x < 560 && o.x + w > 464) ||
      route.some(
        (p) =>
          p.x > o.x - 64 &&
          p.x < o.x + w + 64 &&
          p.y > o.y - 64 &&
          p.y < o.y + h + 64,
      ) ||
      obstacles.some(
        (a) =>
          o.x < a.x + a.w + 32 &&
          o.x + w + 32 > a.x &&
          o.y < a.y + a.h + 32 &&
          o.y + h + 32 > a.y,
      )
    )
      return false;
    if (!connectedTerrain([...obstacles, o])) return false;
    obstacles.push(o);
    return true;
  };
  const mirrored = random(rng) < 0.5;
  const bankY = mirrored ? 464 : 96;
  // Large connected water/lava banks have deliberate crossings, never sealed rooms.
  if (!boss && spec.water && [0, 1, 4].includes(profile)) {
    const widths = profile === 0 ? [128, 96] : [192, 160];
    add(208 + random(rng) * 32, bankY, widths[0], 80, "lake", true);
    add(
      640 + random(rng) * 32,
      profile === 1 ? (mirrored ? 96 : 464) : bankY,
      widths[1],
      profile === 4 ? 96 : 80,
      "lake",
      true,
    );
  }
  const wanted = boss ? Math.min(8, spec.count) : spec.count;
  for (
    let attempt = 0;
    attempt < 240 && obstacles.filter((o) => o.kind !== "lake").length < wanted;
    attempt++
  ) {
    const sector = Math.floor(random(rng) * 4),
      side = random(rng) < 0.5 ? -1 : 1;
    let x = [208, 352, 608, 784][sector],
      y = side < 0 ? 128 : 432;
    const jitterX = (random(rng) - 0.5) * 64,
      jitterY = (random(rng) - 0.5) * 48;
    if (profile === 0) y += side * (sector % 2 ? 12 : -12);
    if (profile === 2) y += sector % 2 ? 24 : -24;
    if (profile === 3) x += side * 16;
    if (profile === 4) y += Math.sin(sector + phase) * 24;
    const ordered = id === "castle" || profile === 5 || boss;
    if (!ordered) {
      x += jitterX;
      y += jitterY;
    } else {
      x += ((seed % 3) - 1) * 16;
      y += attempt % 2 ? 0 : 16;
    }
    const kind =
      ordered && id === "castle"
        ? "pillar"
        : spec.kinds[Math.floor(random(rng) * spec.kinds.length)];
    const w = spec.size + (random(rng) < 0.3 && kind === "rock" ? 32 : 0);
    const h = kind === "tree" || kind === "pillar" ? 48 : spec.size - 16;
    add(x, y, w, h, kind);
  }
  // Bank rooms retain a few substantial shore boulders/grove trunks, instead
  // of filling every gap with the previous 32px clutter.
  if (!boss && obstacles.filter((o) => o.kind !== "lake").length < 4) {
    for (const y of [96, 496])
      for (const x of [192, 272, 320, 384, 608, 704, 752, 832]) {
        if (obstacles.filter((o) => o.kind !== "lake").length >= 4) break;
        add(x, y, 64, 48, id === "jungle" ? "tree" : "rock");
      }
  }
  return { obstacles, route };
}
