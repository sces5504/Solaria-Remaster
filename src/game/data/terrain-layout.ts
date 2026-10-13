import { roomThemes, themeGeometry, type GroundFeature } from "./room-themes";
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
function connectedGrid(obstacles: Obstacle[], cell: number, radius: number) {
  const cols = 1024 / cell,
    rows = 640 / cell;
  const grid = new Uint8Array(cols * rows);
  let total = 0;
  const minX = cell === 16 ? 3 : 2,
    maxX = cell === 16 ? 60 : 29;
  const minY = cell === 16 ? 5 : 3,
    maxY = cell === 16 ? 36 : 17;
  for (let y = minY; y <= maxY; y++)
    for (let x = minX; x <= maxX; x++) {
      const px = x * cell + cell / 2,
        py = y * cell + cell / 2;
      if (
        obstacles.every(
          (o) =>
            px <= o.x - radius ||
            px >= o.x + o.w + radius ||
            py <= o.y - radius ||
            py >= o.y + o.h + radius,
        )
      ) {
        grid[y * cols + x] = 1;
        total++;
      }
    }
  const start = Math.floor(320 / cell) * cols + Math.floor(112 / cell),
    exit = Math.floor(320 / cell) * cols + Math.floor(928 / cell);
  if (!grid[start] || !grid[exit]) return false;
  const queue = [start];
  grid[start] = 2;
  for (let i = 0; i < queue.length; i++)
    for (const next of [
      queue[i] - 1,
      queue[i] + 1,
      queue[i] - cols,
      queue[i] + cols,
    ])
      if (grid[next] === 1) {
        grid[next] = 2;
        queue.push(next);
      }
  return queue.length === total && grid[exit] === 2;
}
export function connectedTerrain(obstacles: Obstacle[], radius = 24) {
  return (
    connectedGrid(obstacles, 16, radius) && connectedGrid(obstacles, 32, 18)
  );
}

/** Six ecological grammars: basin, paired banks, ridge, groves, river, ruins. */
export function terrainLayout(
  id: BiomeId,
  profile: number,
  seed: number,
  boss = 0,
): {
  obstacles: Obstacle[];
  route: Vec[];
  scenery: GroundFeature[];
  theme: string;
} {
  const spec = ecology[id];
  const rng = { rng: seedFor(seed, 8500 + profile * 31 + boss * 113) };
  const theme = roomThemes[id][profile % 6];
  const geometry = themeGeometry(theme, seed);
  const route = boss
    ? [
        { x: 112, y: 320 },
        { x: 928, y: 320 },
      ]
    : geometry.route;
  const scenery: GroundFeature[] = [];
  if (!boss) {
    scenery.push({
      kind: theme.ground,
      points: geometry.anchors,
      width: theme.pattern === "ring" ? 92 : 72,
      seed,
    });
    if (theme.trail)
      scenery.push({
        kind: theme.trail,
        path: true,
        points: route,
        width: theme.pattern === "avenue" ? 76 : 40,
        seed: seed + 1,
      });
    if (theme.pattern === "ring")
      scenery.push({
        kind: theme.ground,
        path: true,
        points: Array.from({ length: 33 }, (_, i) => ({
          x: 512 + Math.cos((i * Math.PI) / 16) * 232,
          y: 320 + Math.sin((i * Math.PI) / 16) * 148,
        })),
        width: 28,
        seed: seed + 2,
      });
  }
  const protectedRoute = route.flatMap((p, i) =>
    i
      ? Array.from(
          {
            length:
              Math.ceil(
                Math.hypot(p.x - route[i - 1].x, p.y - route[i - 1].y) / 16,
              ) + 1,
          },
          (_, j) => {
            const steps = Math.ceil(
              Math.hypot(p.x - route[i - 1].x, p.y - route[i - 1].y) / 16,
            );
            return {
              x: route[i - 1].x + ((p.x - route[i - 1].x) * j) / steps,
              y: route[i - 1].y + ((p.y - route[i - 1].y) * j) / steps,
            };
          },
        )
      : [p],
  );
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
      protectedRoute.some(
        (p) =>
          p.x > o.x - 40 &&
          p.x < o.x + w + 40 &&
          p.y > o.y - 40 &&
          p.y < o.y + h + 40,
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
  if (!boss) {
    if (theme.pools === "center") add(432, 256, 160, 128, "lake", true);
    if (theme.pools === "mirror") {
      add(448, 112, 128, 96, "lake", true);
      add(448, 432, 128, 96, "lake", true);
    }
    if (theme.pools === "banks") {
      add(240, 96, 176, 80, "lake", true);
      add(640, 464, 176, 80, "lake", true);
    }
    if (theme.pools === "three")
      for (const p of [
        { x: 288, y: 128 },
        { x: 704, y: 128 },
        { x: 480, y: 448 },
      ])
        add(p.x, p.y, 96, 80, "lake", true);
  }
  const wanted = boss ? Math.min(8, spec.count) : spec.count;
  for (
    let attempt = 0;
    attempt < 240 && obstacles.filter((o) => o.kind !== "lake").length < wanted;
    attempt++
  ) {
    const anchor = geometry.anchors[attempt % geometry.anchors.length];
    const ordered = ["avenue", "ruins", "ring"].includes(theme.pattern) || boss;
    const x =
      anchor.x - spec.size / 2 + (ordered ? 0 : (random(rng) - 0.5) * 48);
    const y = anchor.y - 24 + (ordered ? 0 : (random(rng) - 0.5) * 32);
    const kind = theme.cover[Math.floor(random(rng) * theme.cover.length)];
    const w = spec.size + (random(rng) < 0.3 && kind === "rock" ? 32 : 0);
    const h = kind === "tree" || kind === "pillar" ? 48 : spec.size - 16;
    add(x, y, w, h, kind);
  }
  // Bank rooms retain a few substantial shore boulders/grove trunks, instead
  // of filling every gap with the previous 32px clutter.
  if (obstacles.filter((o) => o.kind !== "lake").length < (boss ? 6 : 4)) {
    for (const anchor of geometry.anchors)
      for (const shift of [-96, -64, -32, -16, 0, 16, 32, 64, 96]) {
        const x = anchor.x - 32 + shift,
          y = anchor.y - 24;
        if (obstacles.filter((o) => o.kind !== "lake").length >= (boss ? 6 : 4))
          break;
        add(x, y, 64, 48, theme.cover[0]);
      }
  }
  return { obstacles, route, scenery, theme: theme.name };
}
