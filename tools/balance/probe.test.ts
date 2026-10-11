import { test, expect } from "vitest";
import { writeFileSync, mkdirSync } from "node:fs";
import { newRun, startRoom, idleCommand, step } from "../../src/game/core/run";
import {
  choose,
  chooseFusion,
  chooseEquipmentSlot,
  equip,
} from "../../src/game/systems/progression";
import { cards } from "../../src/game/data/cards";
import { legal, lineBlocked, coneHit } from "../../src/game/systems/geometry";
import { distance, segmentDistance } from "../../src/game/core/primitives";
import type { Run, ClassId } from "../../src/game/core/types";

// This bot only issues normal commands and selects offered choices. Its death
// is evidence about this bot, never an assertion about a human player's skill.
const navigation = new WeakMap<
  Run,
  { until: number; waypoint: { x: number; y: number } }
>();
function waypoint(r: Run, target: { x: number; y: number }) {
  if (!lineBlocked(r, r.player, target, true)) return null;
  const cached = navigation.get(r);
  if (
    cached &&
    cached.until > r.time &&
    distance(cached.waypoint, r.player) > 10
  )
    return cached.waypoint;
  const start = Math.floor(r.player.y / 32) * 32 + Math.floor(r.player.x / 32),
    queue = [start],
    prev = new Map([[start, -1]]);
  let goal = start,
    best = Infinity;
  for (let qi = 0; qi < queue.length && qi < 640; qi++) {
    const n = queue[qi],
      p = { x: (n % 32) * 32 + 16, y: Math.floor(n / 32) * 32 + 16 };
    const d = distance(p, target);
    if (d < best && !lineBlocked(r, p, target, true)) {
      best = d;
      goal = n;
    }
    for (const next of [n - 1, n + 1, n - 32, n + 32]) {
      const x = next % 32,
        y = Math.floor(next / 32);
      if (
        x < 2 ||
        x > 29 ||
        y < 3 ||
        y > 17 ||
        prev.has(next) ||
        !legal(r, { x: x * 32 + 16, y: y * 32 + 16 }, r.player.radius)
      )
        continue;
      prev.set(next, n);
      queue.push(next);
    }
  }
  if (goal === start) return null;
  for (let i = 0; i < 640; i++) {
    const parent = prev.get(goal);
    if (parent === undefined || parent === -1 || parent === start) break;
    goal = parent;
  }
  const point = {
    x: (goal % 32) * 32 + 16,
    y: Math.floor(goal / 32) * 32 + 16,
  };
  navigation.set(r, { until: r.time + 0.3, waypoint: point });
  return point;
}
function command(r: Run) {
  const c = idleCommand(r),
    p = r.player;
  const enemies = r.enemies
    .filter((e) => e.hp > 0)
    .sort((a, b) => distance(p, a) - distance(p, b) || a.id - b.id);
  const target = enemies.find((e) => !lineBlocked(r, p, e)) ?? enemies[0];
  if (!target) return c;
  c.pointerWorld = { x: target.x, y: target.y };
  c.attack = true;
  c.skill = true;
  c.interact = true;
  const desired = r.classId === "sword" ? 55 : r.classId === "bow" ? 230 : 200;
  const path = waypoint(r, target);
  let best = Infinity,
    heading = { x: 0, y: 0 };
  for (let direction = 0; direction < 16; direction++) {
    const a = (direction * Math.PI) / 8,
      move = { x: Math.cos(a), y: Math.sin(a) };
    const q = { x: p.x + move.x * 26, y: p.y + move.y * 26 };
    if (!legal(r, q, p.radius)) continue;
    let cost = path
      ? distance(q, path) * 0.8
      : Math.abs(distance(q, target) - desired) * 0.2;
    if (lineBlocked(r, q, target)) cost += 40;
    cost +=
      Math.max(0, 80 - Math.min(q.x - 32, 992 - q.x, q.y - 64, 608 - q.y)) *
      0.6;
    for (const e of enemies)
      if (e !== target || r.classId !== "sword")
        cost += Math.max(0, 100 - distance(q, e));
    for (const b of r.projectiles)
      if (b.enemy) {
        const future = { x: b.x + b.vx * 0.12, y: b.y + b.vy * 0.12 };
        cost += Math.max(0, 55 - distance(q, future)) * 2;
      }
    for (const area of r.areas)
      if (area.enemy && area.starts < r.time + 0.6 && area.ends > r.time)
        cost += Math.max(0, area.radius + 35 - distance(q, area)) * 3;
    for (const m of r.modes)
      if (m.ends > r.time && m.starts < r.time + 0.7) {
        const e = r.enemies.find((e) => e.id === m.actor);
        if (!e) continue;
        if (m.type === "rush") {
          const end = {
            x: e.x + Math.cos(m.angle) * 250,
            y: e.y + Math.sin(m.angle) * 250,
          };
          cost += Math.max(0, e.radius + 30 - segmentDistance(q, e, end)) * 4;
        } else if (
          m.type === "slash" &&
          coneHit(
            e,
            q,
            m.bossAttack?.radius ?? 90,
            m.angle,
            ((m.bossAttack?.spread ?? 120) * Math.PI) / 180,
            r.player.radius,
          )
        )
          cost += 100;
      }
    if (cost < best) {
      best = cost;
      heading = move;
    }
  }
  c.move = heading;
  c.dodge =
    r.projectiles.some((b) => b.enemy && distance(p, b) < 60) ||
    r.areas.some(
      (a) =>
        a.enemy &&
        a.starts < r.time + 0.2 &&
        a.ends > r.time &&
        distance(p, a) < a.radius + 20,
    );
  return c;
}
function pick(r: Run, strong: boolean) {
  const priority = strong
    ? [
        33, 43, 50, 51, 54, 56, 29, 23, 20, 38, 39, 40, 32, 34, 36, 37, 15, 19,
        24, 28, 5, 14, 9, 3, 4,
      ]
    : [1, 2, 3, 4, 5, 9, 14, 15, 19, 24, 28, 27, 46, 61, 67, 69];
  return [...r.choices].sort((a, b) => {
    const score = (id: number) => {
      const rank = priority.indexOf(id);
      return (rank < 0 ? 100 : rank) + (strong ? 0 : (r.cards[id] ?? 0) * 12);
    };
    return score(a) - score(b) || a - b;
  })[0];
}
test("三職普通與偏攻構築命令式探測，保存實際死亡或完成，不授卡不改敵血", () => {
  const results = [];
  const roles = (process.env.SOLARIA_PROBE_ROLE?.split(",") ?? [
    "sword",
    "bow",
    "mage",
  ]) as ClassId[];
  for (const classId of roles)
    for (const strong of [false, true]) {
      const r = newRun(classId, 0x501a);
      const rooms = [];
      let roomStart = 0,
        oldRoom = 1,
        hurt = 0,
        healed = 0;
      const seconds = Number(process.env.SOLARIA_PROBE_SECONDS ?? 3600);
      for (
        let tick = 0;
        tick < seconds * 60 && r.phase !== "DEAD" && r.phase !== "RUN_END";
        tick++
      ) {
        const hp = r.player.hp;
        if (r.phase === "ROOM_INTRO") {
          startRoom(r);
          roomStart = r.time;
          oldRoom = r.room;
        } else if (r.phase === "UPGRADE_CHOICE") choose(r, pick(r, strong));
        else if (r.phase === "FUSION_CHOICE")
          chooseFusion(r, r.fusionChoices![0]);
        else if (r.phase === "EQUIPMENT_SLOT_CHOICE")
          chooseEquipmentSlot(r, "armor");
        else if (r.phase === "POST_CLEAR") {
          if (!rooms.some((x) => x.room === oldRoom))
            rooms.push({
              room: oldRoom,
              seconds: r.time - roomStart,
              level: r.level,
              hp: r.player.hp,
            });
          for (const item of [...r.bag]) {
            const old = r.equipment[item.slot];
            if (
              !old ||
              ["藍", "紫", "黃", "橘", "紅"].indexOf(item.rarity) >
                ["藍", "紫", "黃", "橘", "紅"].indexOf(old.rarity)
            )
              equip(r, item.id);
          }
          const c = idleCommand(r);
          c.move = {
            x: Math.sign(920 - r.player.x),
            y: Math.abs(r.player.y - 320) > 3 ? Math.sign(320 - r.player.y) : 0,
          };
          c.interact = true;
          step(r, c);
        } else step(r, command(r));
        if (r.player.hp < hp) hurt += hp - r.player.hp;
        else healed += r.player.hp - hp;
      }
      expect(Number.isFinite(r.time)).toBe(true);
      expect(r.player.hp).toBeGreaterThanOrEqual(0);
      results.push({
        classId,
        build: strong ? "偏攻抽選" : "一般抽選",
        seed: r.seed,
        phase: r.phase,
        room: r.room,
        seconds: r.time,
        level: r.level,
        kills: r.kills,
        remainingEnemies: r.enemies.map((e) => ({
          id: e.id,
          hp: e.hp,
          maxHP: e.maxHP,
          x: e.x,
          y: e.y,
        })),
        hurt,
        healed,
        cards: Object.entries(r.cards).map(([id, count]) => ({
          id: Number(id),
          name: cards.find((c) => c.id === Number(id))?.name,
          count,
        })),
        rooms,
      });
    }
  mkdirSync("/tmp/solaria-balance", { recursive: true });
  writeFileSync(
    "/tmp/solaria-balance/command-probe.json",
    JSON.stringify(
      {
        kind: "AUTOMATED_COMMAND_PROBE",
        humanBalance: "NOT_RUN",
        generated: new Date().toISOString(),
        results,
      },
      null,
      2,
    ),
  );
});
