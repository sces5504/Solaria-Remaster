import type { Run, Obstacle, Actor } from "../core/types";
import { random, seedFor } from "../core/primitives";
export const roomXPBudget = (room: number) =>
  100 + 20 * Math.min(room - 1, 4) + 10 * Math.max(0, room - 5);
export const classes = {
  sword: { hp: 150, armor: 25, damage: 30, rate: 2, cd: 7 },
  bow: { hp: 100, armor: 10, damage: 18, rate: 3, cd: 8 },
  mage: { hp: 90, armor: 5, damage: 24, rate: 2, cd: 5 },
};
// Deterministic procedural meadow. Profiles affect density/material, never fixed coordinates.
export function roomRoute(profile: number, boss = 0, seed = 1) {
  const rng = { rng: seedFor(seed, profile + boss * 33 + 500) };
  const route = [{ x: 112, y: 320 }];
  for (let x = 192; x <= 832; x += 64) {
    route.push({
      x,
      y: boss ? 320 : 320 + (Math.floor(random(rng) * 3) - 1) * 32,
    });
  }
  route.push({ x: 928, y: 320 });
  return route;
}
export function makeObstacles(profile: number, boss = 0, seed = 1): Obstacle[] {
  const rng = { rng: seedFor(seed, profile + boss * 37 + 800) };
  const route = roomRoute(profile, boss, seed);
  const occupied: number[][] = [];
  const reserved = (x: number, y: number) => {
    if (x < 5 || x > 27) return true;
    // Carve a generous winding through-route and a central north/south branch.
    const px = x * 32 + 16,
      py = y * 32 + 16;
    const nearest = route.reduce(
      (best, p) => (Math.abs(p.x - px) < Math.abs(best.x - px) ? p : best),
      route[0],
    );
    return Math.abs(py - nearest.y) < 64 || (x >= 15 && x <= 17);
  };
  const connected = (entries: number[][]) => {
    const passable = new Uint8Array(32 * 20);
    let total = 0;
    for (let y = 3; y <= 17; y++)
      for (let x = 2; x <= 29; x++) {
        const px = x * 32 + 16,
          py = y * 32 + 16;
        if (
          entries.every(
            (v) =>
              px <= v[0] * 32 - 18 ||
              px >= (v[0] + v[2]) * 32 + 18 ||
              py <= v[1] * 32 - 18 ||
              py >= (v[1] + v[3]) * 32 + 18,
          )
        ) {
          passable[y * 32 + x] = 1;
          total++;
        }
      }
    const queue = new Uint16Array(32 * 20);
    const start = 10 * 32 + 3,
      exit = 10 * 32 + 28;
    if (!passable[start] || !passable[exit]) return false;
    queue[0] = start;
    passable[start] = 2;
    let end = 1;
    for (let i = 0; i < end; i++) {
      const at = queue[i];
      for (const next of [at - 1, at + 1, at - 32, at + 32]) {
        if (passable[next] === 1) {
          passable[next] = 2;
          queue[end++] = next;
        }
      }
    }
    return end === total && passable[exit] === 2;
  };
  const wanted = boss ? 12 : 20 + profile;
  for (let attempt = 0; attempt < 700 && occupied.length < wanted; attempt++) {
    const x = 5 + Math.floor(random(rng) * 23),
      y = 3 + Math.floor(random(rng) * 14);
    const w = random(rng) < 0.24 ? 2 : 1,
      h = random(rng) < 0.2 ? 2 : 1;
    let blocked = false;
    for (let dy = 0; dy < h; dy++)
      for (let dx = 0; dx < w; dx++)
        if (reserved(x + dx, y + dy)) blocked = true;
    if (blocked || x + w > 28 || y + h > 18) continue;
    if (
      occupied.some(
        (v) =>
          x < v[0] + v[2] + 1 &&
          x + w + 1 > v[0] &&
          y < v[1] + v[3] + 1 &&
          y + h + 1 > v[1],
      )
    )
      continue;
    const water =
      !boss &&
      profile === 0 &&
      occupied.filter((v) => v[4] === 0).length < 2 &&
      random(rng) < 0.18;
    const kind = water
      ? 0
      : boss === 2 && random(rng) < 0.4
        ? 3
        : random(rng) < 0.62
          ? 1
          : 2;
    const candidate = [x, y, w, h, kind];
    if (connected([...occupied, candidate])) occupied.push(candidate);
  }
  return occupied.map((v, i) => ({
    id: i + 1,
    x: v[0] * 32,
    y: v[1] * 32,
    w: v[2] * 32,
    h: v[3] * 32,
    kind: (["lake", "tree", "rock", "pillar"] as const)[v[4]],
    durability: [999, 5, 10, 15][v[4]],
    maxDurability: [999, 5, 10, 15][v[4]],
    waves: [],
  }));
}
export function actor(
  id: number,
  kind: number,
  x: number,
  y: number,
  elite = false,
  summoned = false,
): Actor {
  const boss = kind > 5;
  const maxHP = boss
    ? kind === 6
      ? 3600
      : 4000
    : [0, 120, 120, 120, 90, 110][kind] * (elite ? 2.5 : 1);
  return {
    id,
    kind,
    x,
    y,
    hp: maxHP,
    maxHP,
    armor: 0,
    radius: boss ? 36 : kind === 2 ? 18 : 14,
    nextAttack: 1 + (id % 6) * 0.25,
    navTarget: null,
    navUntil: 0,
    attackOrdinal: 0,
    controlUntil: 0,
    iceUntil: 0,
    frost: 0,
    wetUntil: 0,
    burn: [],
    burnTick: 0,
    ccCount: 0,
    ccLast: -10,
    ccImmune: 0,
    fireStacks: 0,
    hits: 0,
    resonanceNext: 0,
    elite,
    summoned,
    element: null,
    phase: 1,
    transition: 0,
    moveAngle: 0,
    rushUntil: 0,
    rushHits: [],
  };
}
export function populate(r: Run) {
  r.rng = seedFor(r.seed, r.room);
  r.enemies = [];
  r.reserves = [];
  r.reinforcementAt = r.time + 2;
  r.projectiles = [];
  r.areas = [];
  r.modes = [];
  r.visuals = [];
  r.items = [];
  r.drops = [];
  r.settledOnce = false;
  r.settlementEnds = undefined;
  r.route = roomRoute(
    r.templates[r.room - 1] ?? 0,
    r.room === 5 ? r.boss : 0,
    r.seed + r.room,
  );
  r.killOrdinal = 0;
  r.obstacles = makeObstacles(
    r.templates[r.room - 1] ?? 0,
    r.room === 5 ? r.boss : 0,
    r.seed + r.room,
  );
  r.player.x = 112;
  r.player.y = 320;
  r.player.attackNext = r.time;
  r.player.dashUntil = 0;
  r.player.rapid.remaining = 0;
  r.player.blockUntil = 0;
  r.player.counterAt = 0;
  r.modifiers = [];
  if (r.room === 5) {
    const e = actor(r.nextId++, r.boss + 5, 760, 320);
    e.nextAttack = r.time + 1.5;
    e.xpReward = roomXPBudget(r.room);
    r.enemies.push(e);
    return;
  }
  const countRoll = random(r),
    mc = countRoll < 0.5 ? 0 : countRoll < 0.85 ? 1 : countRoll < 0.97 ? 2 : 3;
  for (let i = 0; i < mc; i++) {
    let m = Math.floor(random(r) * 8);
    while (r.modifiers.includes(m)) m = (m + 1) % 8;
    r.modifiers.push(m);
  }
  let n = 8 + Math.floor(random(r) * 5);
  if (r.modifiers.includes(0)) n = Math.ceil(n * 1.25);
  const eliteIndex = random(r) < 0.25 ? Math.floor(random(r) * n) : -1;
  for (let i = 0; i < n; i++) {
    const kind = 1 + ((i + Math.floor(random(r) * 2)) % 5);
    let x = 0,
      y = 0;
    for (let retry = 0; retry < 100; retry++) {
      x = 330 + random(r) * 570;
      y = 110 + random(r) * 430;
      if (
        r.enemies.every((e) => Math.hypot(e.x - x, e.y - y) > 62) &&
        r.obstacles.every(
          (o) =>
            x < o.x - 24 ||
            x > o.x + o.w + 24 ||
            y < o.y - 24 ||
            y > o.y + o.h + 24,
        )
      )
        break;
    }
    const e = actor(r.nextId++, kind, x, y, i === eliteIndex);
    e.nextAttack = r.time + 1.5 + i * 0.35;
    if (r.modifiers.includes(1)) e.hp = e.maxHP *= 1.3;
    if (random(r) < (r.modifiers.includes(5) ? 0.2 : 0.05))
      e.element = (["ice", "fire", "water", "lightning"] as const)[
        Math.floor(random(r) * 4)
      ];
    r.enemies.push(e);
  }
  if (r.modifiers.includes(7)) {
    const e = actor(r.nextId++, 3, 880, 320, true);
    e.nextAttack = r.time + 3;
    r.enemies.push(e);
  }
  const budget = roomXPBudget(r.room);
  const weight = r.enemies.reduce((sum, e) => sum + (e.elite ? 2 : 1), 0);
  for (const e of r.enemies) e.xpReward = (budget * (e.elite ? 2 : 1)) / weight;
  r.encounterCap = 4 + Math.floor(random(r) * 7);
  r.reserves = r.enemies.splice(r.encounterCap);
}
