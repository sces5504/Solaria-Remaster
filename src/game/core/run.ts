import type { Run, ClassId, Command } from "./types";
import { DT, seedFor, random, clone, distance, angle } from "./primitives";
import { populate, classes } from "../data/world";
import { derive, drawChoices, itemFor, pickup } from "../systems/progression";
import { basic, castSkill, dodge, updateSkills } from "../systems/skills";
import {
  context,
  hit,
  hurt,
  visual,
  updateAreas,
  updateProjectiles,
  cone,
} from "../systems/combat";
import { move, segmentDistance } from "../systems/geometry";
import { updateEnemies, updateModes } from "../systems/enemies";
export function newRun(classId: ClassId, seed: number): Run {
  const state = { rng: seedFor(seed, 999) };
  const templates = [0, 1, 2, 3, 4, 5];
  for (let i = 5; i > 0; i--) {
    const j = Math.floor(random(state) * (i + 1));
    [templates[i], templates[j]] = [templates[j], templates[i]];
  }
  const r: Run = {
    version: 1,
    runId: `${seed.toString(16)}-${classId}`,
    revision: 0,
    seed,
    rng: state.rng,
    cardRng: seedFor(seed, 777),
    room: 1,
    templates: templates.slice(0, 4),
    boss: random(state) < 0.5 ? 1 : 2,
    classId,
    phase: "ROOM_INTRO",
    time: 0,
    tick: 0,
    nextId: 100,
    level: 1,
    xp: 0,
    pendingLevels: 0,
    cards: {},
    elements: [],
    fusion: null,
    choices: [],
    stats: {} as Run["stats"],
    player: {
      x: 112,
      y: 320,
      hp: classes[classId].hp,
      radius: 12,
      shields: [],
      invulnerable: 0,
      attackNext: 0,
      skillReady: 0,
      skillCast: 0,
      dashReady: 0,
      dashUntil: 0,
      dashAngle: 0,
      blockUntil: 0,
      blockHit: false,
      counterAt: 0,
      rapid: { at: 0, remaining: 0, interval: 0.25 },
      casts: 0,
      capacitor: 0,
      buffUntil: 0,
      engineUntil: 0,
      controlUntil: 0,
      ccImmune: 0,
      frost: 0,
      iceUntil: 0,
      wetUntil: 0,
      burnUntil: 0,
      burnTick: 0,
    },
    enemies: [],
    obstacles: [],
    projectiles: [],
    areas: [],
    modes: [],
    items: [],
    drops: [],
    bag: [],
    equipment: {},
    visuals: [],
    cooldowns: {},
    settledOnce: false,
    dropCounter: 0,
    killOrdinal: 0,
    modifiers: [],
    attackLog: [],
    message: "",
  };
  r.stats = derive(r);
  populate(r);
  return r;
}
export function startRoom(r: Run) {
  if (r.phase === "ROOM_INTRO") r.phase = "COMBAT";
}
export function enterNext(r: Run) {
  if (r.phase !== "POST_CLEAR") return false;
  if (r.room === 5) {
    r.phase = "RUN_END";
    return true;
  }
  r.room++;
  r.phase = "ROOM_INTRO";
  populate(r);
  return true;
}
function deathRewards(r: Run) {
  const dead = r.enemies.filter((e) => e.hp <= 0);
  for (const e of dead) {
    if (!e.summoned) {
      const value = (e.kind > 5 ? 100 : 5 * (e.elite ? 2 : 1)) * r.stats.xp;
      r.drops.push({ id: r.nextId++, x: e.x, y: e.y, kind: "xp", value });
      if (e.kind > 5) {
        for (let i = 0; i < 2; i++) {
          const item = itemFor(r, e.id, i);
          if (item) r.items.push({ ...item, x: e.x + i * 30, y: e.y });
        }
      } else {
        const item = itemFor(r, e.id);
        if (item) r.items.push(item);
      }
    }
    const roll = { rng: seedFor(r.seed, r.room * 100000 + r.killOrdinal++) };
    const chance = e.summoned
      ? 0.15
      : Math.min(0.15, 0.02 + r.dropCounter * 0.015);
    if (random(roll) < chance) {
      r.drops.push({
        id: r.nextId++,
        x: e.x,
        y: e.y,
        kind: "heal",
        value: r.stats.maxHP * 0.15,
      });
      if (!e.summoned) r.dropCounter = 0;
    } else if (!e.summoned) r.dropCounter++;
  }
  r.enemies = r.enemies.filter((e) => e.hp > 0);
  if (dead.some((e) => e.kind > 5)) r.enemies = [];
}
function consumeDrops(r: Run, all = false) {
  for (const d of r.drops)
    if (all || distance(r.player, d) < 32) {
      if (d.kind === "xp") r.xp += d.value;
      else {
        r.player.hp = Math.min(r.stats.maxHP, r.player.hp + d.value);
        visual(r, "heal", r.player, Math.round(d.value), 0x9debba);
      }
      d.value = 0;
    }
  r.drops = r.drops.filter((d) => d.value > 0);
}
export function settle(r: Run) {
  if (r.settledOnce) return;
  r.settledOnce = true;
  consumeDrops(r, true);
  r.player.hp = Math.min(
    r.stats.maxHP,
    r.player.hp + (r.room === 5 ? r.stats.maxHP : r.stats.maxHP * 0.1),
  );
  while (r.xp >= 100 + 20 * (r.level - 1)) {
    r.xp -= 100 + 20 * (r.level - 1);
    r.level++;
    r.pendingLevels++;
  }
  r.modes = [];
  if (r.pendingLevels) {
    r.phase = "UPGRADE_CHOICE";
    drawChoices(r);
  } else r.phase = "POST_CLEAR";
  visual(
    r,
    "heal",
    r.player,
    Math.round(r.room === 5 ? r.stats.maxHP : r.stats.maxHP * 0.1),
    0x9debba,
  );
}
export function step(r: Run, c: Command, paused = false) {
  if (paused || !["COMBAT", "POST_CLEAR"].includes(r.phase)) return;
  r.time += DT;
  r.tick++;
  r.stats = derive(r);
  const p = r.player;
  p.shields = p.shields.filter((s) => s.until > r.time && s.amount > 0);
  r.visuals = r.visuals.filter((v) => v.until > r.time);
  if (r.time >= p.controlUntil) {
    if (c.skill && r.phase === "COMBAT") castSkill(r, c);
    if (c.dodge) dodge(r, c);
    const old = clone({ x: p.x, y: p.y });
    if (p.dashUntil > r.time) {
      move(
        r,
        p,
        Math.cos(p.dashAngle) * 800 * DT,
        Math.sin(p.dashAngle) * 800 * DT,
        p.radius,
        false,
      );
      if (r.cards[47])
        for (const e of r.enemies)
          if (segmentDistance(e, old, p) < e.radius + p.radius) {
            const key = -Math.round(p.dashReady * 60);
            if (!e.rushHits.includes(key)) {
              e.rushHits.push(key);
              hit(r, e, 40 * (1 + (r.cards[47] - 1) * 0.2), context(r, 47));
            }
          }
    } else {
      const len = Math.hypot(c.move.x, c.move.y) || 1;
      const nx = (c.move.x / len) * r.stats.speed * DT,
        ny = (c.move.y / len) * r.stats.speed * DT;
      const temp = { x: p.x, y: p.y };
      move(r, temp, nx, ny, p.radius);
      if (r.enemies.every((e) => distance(temp, e) >= p.radius + e.radius))
        Object.assign(p, temp);
    }
    if (c.attack && r.phase === "COMBAT" && r.time >= p.attackNext) {
      basic(r, c);
      p.attackNext = r.time + 1 / r.stats.attackRate;
    }
  }
  updateSkills(r, c);
  if (r.phase === "COMBAT") {
    updateEnemies(r);
    updateModes(r);
  }
  updateProjectiles(r, DT);
  updateAreas(r);
  for (const e of r.enemies) {
    e.burn = e.burn.filter((b) => b.until > r.time);
    if (e.burn.length && r.time >= e.burnTick) {
      e.burnTick = r.time + 1;
      const b = e.burn.reduce((a, b) =>
        a.damage * a.scale > b.damage * b.scale ? a : b,
      );
      hit(
        r,
        e,
        b.damage,
        context(r, 19, "dot", ["fire"], false, b.scale, false, "none"),
      );
    }
    if (e.iceUntil <= r.time) e.frost = 0;
    if (!e.burn.length) e.fireStacks = 0;
  }
  if (p.burnUntil > r.time && r.time >= p.burnTick) {
    p.burnTick = r.time + 1;
    hurt(r, 8);
  }
  if (p.iceUntil <= r.time) p.frost = 0;
  deathRewards(r);
  consumeDrops(r);
  if (r.phase === "COMBAT" && r.enemies.length === 0) settle(r);
  if (p.hp <= 0) {
    r.phase = "DEAD";
    r.choices = [];
  }
  if (c.interact && r.phase === "POST_CLEAR") pickup(r);
}
export function idleCommand(r: Run): Command {
  return {
    tick: r.tick,
    actorId: 0,
    move: { x: 0, y: 0 },
    pointerWorld: { x: 700, y: 320 },
    attack: false,
    skill: false,
    dodge: false,
    interact: false,
  };
}
