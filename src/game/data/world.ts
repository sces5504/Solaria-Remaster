import type { Run, Obstacle, Actor } from "../core/types";
import { random, seedFor } from "../core/primitives";
export const roomXPBudget = (room: number) =>
  100 + 20 * Math.min(room - 1, 4) + 10 * Math.max(0, room - 5);
export const classes = {
  sword: { hp: 150, armor: 25, damage: 30, rate: 2, cd: 7 },
  bow: { hp: 100, armor: 10, damage: 18, rate: 3, cd: 8 },
  mage: { hp: 90, armor: 5, damage: 24, rate: 2, cd: 5 },
};
// All six templates leave both the upper and lower routes connected.
const layouts = [
  [
    [13, 7, 6, 5, 0],
    [8, 5, 1, 1, 1],
    [23, 14, 1, 1, 2],
  ],
  [
    [8, 5, 2, 2, 1],
    [8, 13, 2, 2, 1],
    [22, 5, 2, 2, 2],
    [22, 13, 2, 2, 2],
  ],
  [
    [10, 5, 2, 4, 2],
    [16, 11, 2, 4, 2],
    [23, 5, 2, 4, 2],
  ],
  [
    [10, 3, 1, 5, 1],
    [10, 12, 1, 5, 1],
    [21, 3, 1, 5, 2],
    [21, 12, 1, 5, 2],
  ],
  [
    [9, 3, 2, 9, 1],
    [16, 9, 2, 8, 2],
    [23, 3, 2, 9, 1],
  ],
  [
    [12, 6, 1, 1, 1],
    [21, 13, 1, 1, 2],
    [17, 4, 3, 2, 0],
  ],
];
export function makeObstacles(
  template: number,
  boss = 0,
  seed = 1,
): Obstacle[] {
  const entries =
    boss === 1
      ? [
          [10, 5, 1, 1, 1],
          [10, 14, 1, 1, 1],
          [21, 5, 2, 1, 2],
          [21, 14, 2, 1, 2],
        ]
      : boss === 2
        ? [
            [11, 5, 1, 2, 3],
            [11, 13, 1, 2, 3],
            [21, 5, 1, 2, 3],
            [21, 13, 1, 2, 3],
          ]
        : layouts[template];
  const variation = { rng: seedFor(seed, template + 500) };
  const base = entries.map((v) => [...v]);
  if (!boss) {
    // Small, non-overlapping clusters; a broad centre trail and a vertical branch stay open.
    for (let i = 0; i < 11; i++) {
      const x = 6 + Math.floor(random(variation) * 21);
      const y = 3 + Math.floor(random(variation) * 14);
      const w = random(variation) < 0.25 ? 2 : 1;
      const h = random(variation) < 0.2 ? 2 : 1;
      if ((y + h >= 8 && y <= 12) || (x + w >= 15 && x <= 17)) continue;
      if (
        base.some(
          (v) =>
            x < v[0] + v[2] + 1 &&
            x + w + 1 > v[0] &&
            y < v[1] + v[3] + 1 &&
            y + h + 1 > v[1],
        )
      )
        continue;
      base.push([x, y, w, h, random(variation) < 0.7 ? 1 : 2]);
    }
  }
  return base.map((v, i) => ({
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
    ? 6500
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
  r.reserves = r.enemies.splice(r.room <= 2 ? 4 : 5);
}
