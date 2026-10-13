import type { Actor, Item, Run } from "../core/types";
import { random, seedFor, type Vec } from "../core/primitives";
import { eventDefinitions, rollEvent, type EventId } from "../data/events";
import { eventMonsters, eventBosses } from "../data/event-content";
import {
  biomeLayout,
  currentBiome,
  enemyHPScale,
  enemyDamageScale,
} from "../data/biomes";
import {
  actor,
  assignElite,
  roomXPBudget,
  easeOpeningEncounter,
  makeObstacles,
  roomRoute,
} from "../data/world";
import { legal } from "./geometry";
import { itemFor } from "./progression";
import { equipmentCatalog, type EquipmentAbility } from "../data/equipment";
import { area } from "./combat";
export interface EventState {
  id: EventId;
  theme: import("../data/biomes").BiomeId;
  room: number;
  loop: number;
  wave: number;
  next: number;
  waiting: boolean;
  boss: boolean;
  completed: boolean;
  rewarded: boolean;
  meteorNext: number;
}
type EventRun = Run & {
  event?: EventState;
  seenEvents?: EventId[];
  eventCounter?: number;
};
export function eventState(r: Run) {
  return (r as EventRun).event;
}
export function selectEvent(run: Run, forced?: EventId) {
  const r = run as EventRun;
  r.seenEvents ??= [];
  r.eventCounter ??= Math.min(10, r.room - 1 - Math.floor((r.room - 1) / 5));
  if (r.room === 31 || r.room % 5 === 0) {
    r.event = undefined;
    return false;
  }
  if (r.event?.room === r.room && r.event.loop === (r.loop ?? 1)) return true;
  const key = `${r.loop ?? 1}:${r.room}`;
  if (!forced && r.eventEntryKey === key) return false;
  r.eventEntryKey = key;
  const chosen =
    forced ??
    rollEvent(r.seed, r.loop ?? 1, r.room, r.eventCounter, r.seenEvents);
  if (!chosen) {
    r.event = undefined;
    r.eventCounter = Math.min(10, r.eventCounter + 1);
    return false;
  }
  r.eventCounter = 0;
  if (!r.seenEvents.includes(chosen)) r.seenEvents.push(chosen);
  r.event = {
    id: chosen,
    theme: eventDefinitions[chosen].theme,
    room: r.room,
    loop: r.loop ?? 1,
    wave: 0,
    next: r.time,
    waiting: false,
    boss: false,
    completed: false,
    rewarded: false,
    meteorNext: r.time + 3,
  };
  return true;
}
export function eventLayout(r: Run) {
  const e = eventState(r)!;
  const profiles: Record<EventId, number> = {
    christmas: 0,
    bloodmoon: 3,
    halloween: 5,
    alien: 2,
    meteor: 4,
    army: 1,
  };
  const seed = seedFor(r.seed, r.room + (r.loop ?? 1) * 457);
  if (e.theme === "meadow")
    return {
      obstacles: makeObstacles((profiles[e.id] + (seed % 3)) % 6, 0, seed),
      route: roomRoute((profiles[e.id] + (seed % 3)) % 6, 0, seed),
    };
  return biomeLayout(e.theme, (profiles[e.id] + (seed % 3)) % 6, seed);
}
function counts(r: Run) {
  const tier = currentBiome(r).tier;
  return [6 + tier * 2, 8 + tier * 2, 10 + tier * 2];
}
function waveRoster(r: Run, index: number) {
  const e = eventState(r)!,
    base = eventDefinitions[e.id].waves[index],
    n = counts(r)[index];
  return Array.from({ length: n }, (_, i) => base[i % base.length]);
}
function location(r: Run, state: { rng: number }, spawned: Actor[]): Vec {
  for (let i = 0; i < 150; i++) {
    const p = { x: 330 + random(state) * 580, y: 100 + random(state) * 470 };
    if (
      legal(r, p, 22) &&
      spawned.every((a) => Math.hypot(p.x - a.x, p.y - a.y) > 54) &&
      Math.hypot(p.x - r.player.x, p.y - r.player.y) > 170
    )
      return p;
  }
  for (let y = 112; y < 570; y += 40)
    for (let x = 330; x < 930; x += 40)
      if (
        legal(r, { x, y }, 22) &&
        spawned.every((a) => Math.hypot(x - a.x, y - a.y) > 44)
      )
        return { x, y };
  throw new Error("事件沒有可達的進場位置");
}
export function beginEventWave(r: Run) {
  const e = eventState(r)!;
  e.waiting = false;
  r.modifiers = [];
  r.hazards = [];
  r.enemies = [];
  r.reserves = [];
  const def = eventDefinitions[e.id];
  if (e.wave === 3 && def.boss) {
    e.boss = true;
    const b = eventBosses[def.boss];
    const monster = actor(r.nextId++, 6, 760, 320);
    monster.bossId = b.id;
    monster.radius = b.radius;
    monster.element = e.id === "christmas" ? "ice" : null;
    const health = [4000, 9500, 13500, 18000, 24000, 30000][
      currentBiome(r).tier
    ];
    monster.hp = monster.maxHP = health * 0.6 * 1.6 ** ((r.loop ?? 1) - 1);
    monster.xpReward = roomXPBudget(r.room, r.roomEntryLevel ?? r.level) * 0.25;
    monster.nextAttack = r.time + 1.5;
    r.enemies = [monster];
    easeOpeningEncounter(r, r.enemies);
    return;
  }
  const rng = {
    rng: seedFor(r.seed, 19000 + (r.loop ?? 1) * 491 + r.room * 3 + e.wave),
  };
  const ids = waveRoster(r, e.wave),
    spawned: Actor[] = [];
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i],
      definition = eventMonsters[id];
    const p = location(r, rng, spawned);
    const elite =
      e.id === "bloodmoon"
        ? i === ids.length - 1 || i === 0
        : e.id === "alien"
          ? id === 38 && i === 0 && e.wave === 2
          : e.id === "army"
            ? i === 0 && e.wave === 2
            : false;
    const monster = actor(
      r.nextId++,
      definition?.archetype ?? id,
      p.x,
      p.y,
      elite,
    );
    if (definition) {
      monster.monsterId = id;
      monster.radius = definition.radius;
      monster.element = definition.element;
    }
    monster.hp = monster.maxHP *= enemyHPScale(r);
    monster.nextAttack = r.time + 1 + (i % 5) * 0.2;
    if (elite) assignElite(r, monster);
    if (e.id === "army" && e.wave === 2 && i === 0) monster.rally = true;
    spawned.push(monster);
  }
  easeOpeningEncounter(r, spawned);
  const waveWeight = spawned.reduce((sum, m) => sum + (m.elite ? 2 : 1), 0);
  const share =
    (roomXPBudget(r.room, r.roomEntryLevel ?? r.level) *
      (def.boss ? 0.75 : 1)) /
    3;
  for (const m of spawned)
    m.xpReward = (share * (m.elite ? 2 : 1)) / waveWeight;
  r.encounterCap = Math.min(10, 6 + currentBiome(r).tier);
  r.enemies = spawned.slice(0, r.encounterCap);
  r.reserves = spawned.slice(r.encounterCap);
}
function eventReward(r: Run): Item {
  const e = eventState(r)!,
    ability = eventDefinitions[e.id].reward as EquipmentAbility,
    template = equipmentCatalog[ability];
  const base = itemFor(
    r,
    9000 + Object.keys(eventDefinitions).indexOf(e.id),
    0,
  )!;
  const q = { 藍: 1, 紫: 1.2, 黃: 1.4, 橘: 1.6, 紅: 1.8 }[base.rarity as "藍"];
  return {
    ...base,
    id: `${r.runId}-${r.loop ?? 1}-${r.room}-event-${e.id}`,
    slot: template.slot,
    rarity: "紅",
    ability,
    name: template.name,
    x: 820,
    y: 320,
    affixes: base.affixes
      .slice(0, 2)
      .map((a) => ({ ...a, value: (a.value / q) * 1.8 })),
  };
}
// Called after finite reserve replenishment and death rewards, before room settlement.
export function updateEvent(r: Run) {
  const e = eventState(r);
  if (!e || e.completed) return false;
  if (
    e.id === "meteor" &&
    !e.waiting &&
    r.enemies.some((m) => m.hp > 0) &&
    r.phase === "COMBAT" &&
    r.time >= e.meteorNext
  ) {
    e.meteorNext = r.time + 3;
    const rng = { rng: seedFor(r.seed, r.room * 71 + Math.floor(r.time / 3)) };
    for (let i = 0; i < 3; i++) {
      const p = {
        x: Math.max(70, Math.min(952, r.player.x + (random(rng) - 0.5) * 220)),
        y: Math.max(100, Math.min(570, r.player.y + (random(rng) - 0.5) * 180)),
      };
      area(r, p, 70, 18 * enemyDamageScale(r), 1, 0.01, 1, null, {
        owner: -1,
        eventAbility: "meteor-rain",
        enemyTheme: "stars",
      });
    }
  }
  if (r.enemies.some((m) => m.hp > 0) || (r.reserves?.length ?? 0) > 0)
    return true;
  const def = eventDefinitions[e.id];
  if (e.waiting) {
    if (r.time >= e.next) beginEventWave(r);
    return true;
  }
  if (e.wave < 2 || (e.wave === 2 && def.boss)) {
    e.wave++;
    e.waiting = true;
    e.next = r.time + 1.4;
    return true;
  }
  e.completed = true;
  if (!e.rewarded) {
    r.items.push(eventReward(r));
    e.rewarded = true;
  }
  return false;
}
