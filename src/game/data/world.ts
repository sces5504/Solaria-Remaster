import { bossEntryAbility } from "../systems/advanced-abilities";
import { placeSolaris } from "../systems/solaris";
import type { Run, Obstacle, Actor } from "../core/types";
import { random, seedFor } from "../core/primitives";
import { biomeLayout, currentBiome, enemyHPScale, monsters } from "./biomes";
import { placeBoss } from "../systems/biome-bosses";
import { bossArena } from "./bosses";
export const roomXPBudget = (room: number) =>
  100 + 20 * Math.min(room - 1, 4) + 10 * Math.max(0, room - 5);
export const classes = {
  sword: { hp: 150, armor: 25, damage: 30, rate: 2, cd: 5 },
  bow: { hp: 100, armor: 10, damage: 18, rate: 3, cd: 6 },
  mage: { hp: 90, armor: 5, damage: 24, rate: 2, cd: 3 },
};
// Deterministic procedural meadow. Profiles affect density/material, never fixed coordinates.
export function roomRoute(profile: number, boss = 0, seed = 1) {
  const rng = { rng: seedFor(seed, profile + boss * 33 + 500) };
  const phase = random(rng) * Math.PI * 2;
  const route = [{ x: 112, y: 320 }];
  for (let x = 192; x <= 832; x += 64) {
    route.push({
      x,
      y: boss
        ? 320
        : 320 +
          Math.sin(((x - 112) / 700) * Math.PI * 2 + phase) *
            (profile === 1 ? 20 : 32),
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
  // Each profile has a spatial grammar: groves, rock banks, avenues or ruins.
  const anchors = boss
    ? [
        [8, 5],
        [13, 5],
        [21, 5],
        [26, 5],
        [8, 15],
        [13, 15],
        [21, 15],
        [26, 15],
      ]
    : profile === 0
      ? [
          [8, 5],
          [10, 15],
          [23, 5],
          [25, 15],
        ]
      : profile === 1
        ? [
            [8, 5],
            [13, 5],
            [21, 15],
            [26, 15],
          ]
        : profile === 2
          ? [
              [7, 5],
              [13, 5],
              [21, 5],
              [27, 5],
              [7, 15],
              [13, 15],
              [21, 15],
              [27, 15],
            ]
          : profile === 3
            ? [
                [8, 5],
                [9, 15],
                [24, 5],
                [25, 15],
              ]
            : profile === 4
              ? [
                  [7, 5],
                  [12, 15],
                  [22, 5],
                  [27, 15],
                ]
              : [
                  [8, 5],
                  [13, 15],
                  [22, 5],
                  [27, 15],
                ];
  const wanted = boss ? 12 : 20 + profile;
  for (let attempt = 0; attempt < 700 && occupied.length < wanted; attempt++) {
    const anchor = anchors[Math.floor(random(rng) * anchors.length)];
    const x = Math.max(
        5,
        Math.min(
          27,
          anchor[0] + Math.floor((random(rng) + random(rng) - 1) * 6),
        ),
      ),
      y = Math.max(
        3,
        Math.min(
          16,
          anchor[1] + Math.floor((random(rng) + random(rng) - 1) * 5),
        ),
      );
    const waterCandidate =
      !boss &&
      [0, 3].includes(profile) &&
      occupied.filter((v) => v[4] === 0).length < 2;
    const w = waterCandidate ? 2 : random(rng) < 0.24 ? 2 : 1,
      h = waterCandidate ? 2 : random(rng) < 0.2 ? 2 : 1;
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
    const water = waterCandidate;
    const kind = water
      ? 0
      : (boss === 2 || (!boss && profile === 5)) && random(rng) < 0.65
        ? 3
        : random(rng) <
            (boss === 1 || profile === 2
              ? 0.9
              : profile === 1 || profile === 3
                ? 0.25
                : 0.65)
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
  const biome = currentBiome(r);
  const localRoom = ((r.room - 1) % 5) + 1;
  r.rng = seedFor(r.seed, r.room + ((r.loop ?? 1) - 1) * 1000);
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
    r.templates[localRoom - 1] ?? 0,
    localRoom === 5 ? r.boss : 0,
    r.seed + r.room + ((r.loop ?? 1) - 1) * 1000,
  );
  r.killOrdinal = 0;
  r.obstacles = makeObstacles(
    r.templates[localRoom - 1] ?? 0,
    localRoom === 5 ? r.boss : 0,
    r.seed + r.room + ((r.loop ?? 1) - 1) * 1000,
  );
  if (r.biome && r.biome !== "meadow") {
    const layout = biomeLayout(
      r.biome,
      r.templates[localRoom - 1] ?? 0,
      r.seed + r.room + ((r.loop ?? 1) - 1) * 1000,
      localRoom === 5 ? r.boss : 0,
    );
    r.obstacles = layout.obstacles;
    r.route = layout.route;
  }
  if (localRoom === 5 && r.boss > 2) {
    const layout = bossArena(
      r.boss,
      r.seed + r.room + ((r.loop ?? 1) - 1) * 1000,
    );
    r.obstacles = layout.obstacles;
    r.route = layout.route;
  }
  r.player.x = 112;
  r.player.y = 320;
  r.player.attackNext = r.time;
  r.player.dashUntil = 0;
  r.player.rapid.remaining = 0;
  r.player.pendingEcho = undefined;
  r.player.echoRapid = undefined;
  r.echoCapacitor = 0;
  r.player.blockUntil = 0;
  r.player.counterAt = 0;
  r.modifiers = [];
  if (r.room === 31) {
    placeSolaris(r);
    bossEntryAbility(r);
    return;
  }
  if (localRoom === 5) {
    const e =
      r.boss > 2
        ? placeBoss(r, r.boss)
        : actor(r.nextId++, r.boss + 5, 760, 320);
    if (r.boss <= 2) e.hp = e.maxHP *= 1.6 ** ((r.loop ?? 1) - 1);
    e.nextAttack = r.time + 1.5;
    e.xpReward = roomXPBudget(r.room);
    r.enemies.push(e);
    bossEntryAbility(r);
    return;
  }
  const countRoll = random(r),
    mc = countRoll < 0.5 ? 0 : countRoll < 0.85 ? 1 : countRoll < 0.97 ? 2 : 3;
  for (let i = 0; i < mc; i++) {
    let m = Math.floor(random(r) * 8);
    while (r.modifiers.includes(m)) m = (m + 1) % 8;
    r.modifiers.push(m);
  }
  let n = 8 + biome.tier * 2 + Math.floor(random(r) * (5 + biome.tier));
  if (r.modifiers.includes(0)) n = Math.ceil(n * 1.25);
  const eliteIndices = new Set<number>();
  for (let i = 0; i < (biome.tier >= 3 ? 2 : 1); i++)
    if (random(r) < 0.25 + biome.tier * 0.05)
      eliteIndices.add(Math.floor(random(r) * n));
  for (let i = 0; i < n; i++) {
    const monsterId =
      biome.monsters[(i + Math.floor(random(r) * 2)) % biome.monsters.length];
    const definition = monsters[monsterId];
    const kind = definition?.archetype ?? monsterId;
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
    const e = actor(r.nextId++, kind, x, y, eliteIndices.has(i));
    if (definition) {
      e.monsterId = monsterId;
      e.radius = definition.radius;
      e.element = definition.element;
    }
    e.hp = e.maxHP *= enemyHPScale(r);
    if (e.elite) assignElite(r, e);
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
    assignElite(r, e);
    e.hp = e.maxHP *= enemyHPScale(r);
    e.nextAttack = r.time + 3;
    r.enemies.push(e);
  }
  const budget = roomXPBudget(r.room);
  const weight = r.enemies.reduce((sum, e) => sum + (e.elite ? 2 : 1), 0);
  for (const e of r.enemies) e.xpReward = (budget * (e.elite ? 2 : 1)) / weight;
  r.encounterCap = 4 + Math.floor(random(r) * 7);
  r.reserves = r.enemies.splice(r.encounterCap);
}

export function assignElite(r: Run, e: Actor) {
  const choices =
    e.kind <= 3
      ? (["rush", "shield", "element"] as const)
      : (["barrage", "shield", "element"] as const);
  e.eliteAbility = choices[Math.floor(random(r) * choices.length)];
  e.eliteReady = r.time + 3;
  if (e.eliteAbility === "shield") e.enemyShield = e.maxHP * 0.2;
  if (e.eliteAbility === "element")
    e.element = (["ice", "fire", "water", "lightning"] as const)[
      Math.floor(random(r) * 4)
    ];
}
