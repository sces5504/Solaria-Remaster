import { updateEvent } from "../systems/events";
import { hasEquipment } from "../data/equipment";
import { gearKill, updateGear } from "../systems/equipment-abilities";
import { updatePumpkin, revivePumpkin } from "../systems/companion";
import { rootKillAbilities } from "../systems/advanced-abilities";
import { recoverHP, actionRestriction } from "../systems/ability-policies";
import { journeyFor, selectSegment, isBossRoom } from "../data/journey";
import type { Run, ClassId, Command } from "./types";
import { DT, seedFor, random, clone, distance, angle } from "./primitives";
import { populate, classes } from "../data/world";
import { derive, drawChoices, itemFor, pickup } from "../systems/progression";
import {
  basic,
  basicDamage,
  castSkill,
  dodge,
  updateSkills,
} from "../systems/skills";
import {
  context,
  hit,
  hurt,
  visual,
  shield,
  factor,
  updateAreas,
  updateProjectiles,
  cone,
} from "../systems/combat";
import { move, segmentDistance } from "../systems/geometry";
import { updateEnemies, updateModes, refillEnemies } from "../systems/enemies";
import { createHazards, updateHazards } from "../systems/hazards";
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
    loop: 1,
    journey: journeyFor(seed),
    templates: templates.slice(0, 4),
    boss: random(state) < 0.5 ? 1 : 2,
    classId,
    phase: "ROOM_INTRO",
    time: 0,
    tick: 0,
    nextId: 100,
    score: 0,
    kills: 0,
    level: 1,
    healthGrowthVersion: 2,
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
      dashHits: [],
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
  selectSegment(r);
  r.stats = derive(r);
  populate(r);
  createHazards(r);
  return r;
}
export function startRoom(r: Run) {
  if (r.phase === "ROOM_INTRO") r.phase = "COMBAT";
}
export function enterNext(r: Run) {
  if (r.phase !== "POST_CLEAR") return false;
  if (r.room === 31) {
    r.phase = "RUN_END";
    return true;
  }
  r.room++;
  if (r.room % 5 === 1) selectSegment(r);
  r.phase = "ROOM_INTRO";
  populate(r);
  createHazards(r);
  return true;
}
export function nextLoop(r: Run) {
  if (r.phase !== "RUN_END") return false;
  r.loop = (r.loop ?? 1) + 1;
  r.journey = journeyFor(r.seed, r.loop);
  r.room = 1;
  selectSegment(r);
  r.phase = "ROOM_INTRO";
  r.solaris = undefined;
  populate(r);
  createHazards(r);
  return true;
}
function deathRewards(r: Run) {
  const dead = r.enemies.filter((e) => e.hp <= 0);
  for (const e of dead) {
    if (e.sealPillar) {
      r.drops.push({
        id: r.nextId++,
        x: e.x,
        y: e.y,
        kind: "heal",
        value: r.stats.maxHP * 0.15,
      });
      continue;
    }
    rootKillAbilities(r, e);
    gearKill(r, e);
    if (r.cards[66])
      r.momentum = {
        stacks: Math.min(
          10,
          (r.momentum && r.momentum.until > r.time ? r.momentum.stacks : 0) + 1,
        ),
        until: r.time + 4,
      };
    r.kills = (r.kills || 0) + 1;
    r.score =
      (r.score || 0) +
      (e.kind > 5 ? (e.splitGroup ? 250 : 500) : e.elite ? 50 : 25);
    if (!e.summoned) {
      const value =
        (e.xpReward ?? (e.kind > 5 ? 148 : 12 * (e.elite ? 2 : 1))) *
        r.stats.xp *
        1.3 ** ((r.loop ?? 1) - 1);
      r.drops.push({ id: r.nextId++, x: e.x, y: e.y, kind: "xp", value });
      if (
        e.kind > 5 &&
        !r.enemies.some((other) => other.kind > 5 && other.hp > 0)
      ) {
        for (let i = 0; i < 2; i++) {
          const item = itemFor(r, e.id, i);
          if (item) r.items.push({ ...item, x: e.x + i * 30, y: e.y });
        }
      } else if (e.kind <= 5) {
        const item = itemFor(r, e.id);
        if (item) {
          r.items.push(item);
          if (e.elite && hasEquipment(r, "starSeeker"))
            visual(r, "relic", e, 208, 0xffe6a8, 65, 0, { duration: 0.65 });
        }
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
  if (dead.some((e) => e.kind > 5) && !r.enemies.some((e) => e.kind > 5))
    r.enemies = [];
}
function consumeDrops(r: Run, all = false) {
  for (const d of r.drops)
    if (all || distance(r.player, d) < 32) {
      if (d.kind === "xp") r.xp += d.value;
      else {
        const healed = recoverHP(r, d.value);
        visual(r, "heal", r.player, Math.round(healed), 0x9debba);
      }
      d.value = 0;
    }
  r.drops = r.drops.filter((d) => d.value > 0);
}
export function settle(r: Run) {
  if (r.settledOnce) return;
  r.settledOnce = true;
  revivePumpkin(r);
  r.score = (r.score || 0) + 100;
  r.phase = "SETTLEMENT";
  r.settlementEnds = r.time + 1.1;
  const healed = recoverHP(
    r,
    isBossRoom(r) ? r.stats.maxHP : r.stats.maxHP * 0.1,
  );
  if (r.cards[63])
    shield(r, r.stats.maxHP * (0.1 + 0.02 * (factor(r, 63, 1) - 1)), 5);
  r.modes = [];
  visual(r, "heal", r.player, Math.round(healed), 0x9debba);
}
function finishSettlement(r: Run) {
  consumeDrops(r, true);
  // XP remains collectible scenery/statistics; only clearing a room grants a level.
  const oldMaxHP = r.stats.maxHP;
  const oldLevel = r.level;
  r.level++;
  r.pendingLevels++;
  if (r.level !== oldLevel) {
    r.stats = derive(r);
    const healed = r.player.hp > 0 ? recoverHP(r, r.stats.maxHP - oldMaxHP) : 0;
    if (healed > 0) visual(r, "heal", r.player, Math.round(healed), 0x9debba);
    r.stats = derive(r);
  }
  if (r.pendingLevels) {
    r.phase = "UPGRADE_CHOICE";
    drawChoices(r);
  } else r.phase = r.room === 31 ? "RUN_END" : "POST_CLEAR";
}

export function step(r: Run, c: Command, paused = false) {
  if (paused || !["COMBAT", "SETTLEMENT", "POST_CLEAR"].includes(r.phase))
    return;
  r.time += DT;
  r.tick++;
  r.stats = derive(r);
  r.player.hp = Math.min(r.player.hp, r.stats.maxHP * (r.cards[79] ? 0.4 : 1));
  updateHazards(r);
  const p = r.player;
  p.aim = angle(p, c.pointerWorld);
  p.shields = p.shields.filter((s) => s.until > r.time && s.amount > 0);
  r.visuals = r.visuals.filter((v) => v.until > r.time);
  if (r.time >= p.controlUntil) {
    if (c.skill) castSkill(r, c);
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
      if (r.cards[47]) {
        if (c.dodge || r.tick % 3 === 0)
          visual(
            r,
            "charge",
            old,
            0,
            0xffda83,
            32 * r.stats.range,
            p.dashAngle,
          );
        for (const e of r.enemies)
          if (
            segmentDistance(e, old, p) <
            e.radius + p.radius * r.stats.range
          ) {
            if (!p.dashHits.includes(e.id)) {
              p.dashHits.push(e.id);
              hit(
                r,
                e,
                2 * basicDamage(r),
                context(r, 47, "basic", [...r.elements], true),
              );
            }
          }
      }
    } else {
      const len = Math.hypot(c.move.x, c.move.y) || 1;
      const nx = (c.move.x / len) * r.stats.speed * (p.terrainSlow ?? 1) * DT,
        ny = (c.move.y / len) * r.stats.speed * (p.terrainSlow ?? 1) * DT;
      const temp = { x: p.x, y: p.y };
      move(r, temp, nx, ny, p.radius);
      if (
        r.enemies.every(
          (e) =>
            distance(temp, e) >= p.radius + e.radius ||
            distance(temp, e) > distance(p, e),
        )
      )
        Object.assign(p, temp);
    }
    if (c.attack && !actionRestriction(r, "basic") && r.time >= p.attackNext) {
      basic(r, c);
      p.attackNext = r.time + 1 / r.stats.attackRate;
    }
  }
  updateSkills(r, c);
  updateGear(r);
  updatePumpkin(r);
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
  if (r.phase === "COMBAT") refillEnemies(r);
  if (r.phase === "SETTLEMENT") {
    const ends = r.settlementEnds ?? r.time + 1.1;
    r.settlementEnds = ends;
    // A deterministic eased flight reaches the moving player before choices open.
    const t = Math.min(1, DT / Math.max(DT, ends - r.time));
    for (const d of r.drops) {
      d.x += (p.x - d.x) * t;
      d.y += (p.y - d.y) * t;
    }
    consumeDrops(r);
    if (r.time + 1e-7 >= ends) finishSettlement(r);
  } else consumeDrops(r);
  if (r.phase === "COMBAT") {
    const eventPending = updateEvent(r);
    if (!eventPending && r.enemies.length === 0 && !r.reserves?.length)
      settle(r);
  }
  if (p.hp <= 0) {
    r.phase = "DEAD";
    r.choices = [];
  }
  if (c.interact) {
    if (c.interactTarget?.kind === "item") pickup(r, c.interactTarget.id);
    else if (r.phase === "POST_CLEAR" && p.x > 872 && Math.abs(p.y - 320) < 55)
      enterNext(r);
    else if (!c.interactTarget) pickup(r);
  }
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
