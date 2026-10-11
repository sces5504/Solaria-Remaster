import { idleCommand } from "../../src/game/core/run";
import {
  legal,
  lineBlocked,
  coneHit,
  beamEnd,
} from "../../src/game/systems/geometry";
import { distance, segmentDistance } from "../../src/game/core/primitives";
import type { Run } from "../../src/game/core/types";
const navigation = new WeakMap<
  Run,
  { until: number; waypoint: { x: number; y: number } }
>();
export function waypoint(
  r: Run,
  target: { x: number; y: number },
  body = false,
) {
  const steps = Math.ceil(distance(r.player, target) / 4);
  const bodyBlocked = Array.from({ length: steps + 1 }, (_, i) => ({
    x: r.player.x + ((target.x - r.player.x) * i) / (steps || 1),
    y: r.player.y + ((target.y - r.player.y) * i) / (steps || 1),
  })).some((point) => !legal(r, point, r.player.radius));
  if (body ? !bodyBlocked : !lineBlocked(r, r.player, target, true))
    return null;
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
    if (d < best && (body || !lineBlocked(r, p, target, true))) {
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
const previous = new WeakMap<
  Run,
  Map<number, { x: number; y: number; time: number }>
>();
export function command(r: Run) {
  const c = idleCommand(r),
    p = r.player;
  const enemies = r.enemies
    .filter((e) => e.hp > 0)
    .sort((a, b) => distance(p, a) - distance(p, b) || a.id - b.id);
  const target = enemies.find((e) => !lineBlocked(r, p, e)) ?? enemies[0];
  if (!target) return c;
  const seen =
    previous.get(r) ??
    new Map<number, { x: number; y: number; time: number }>();
  previous.set(r, seen);
  const old = seen.get(target.id),
    delta = old ? r.time - old.time : 0;
  const speed = r.classId === "bow" ? 700 : 600;
  const travel =
    r.classId === "sword"
      ? 0
      : distance(p, target) / (speed * r.stats.projectile);
  const vx =
    old && delta > 0
      ? Math.max(-400, Math.min(400, (target.x - old.x) / delta))
      : 0;
  const vy =
    old && delta > 0
      ? Math.max(-400, Math.min(400, (target.y - old.y) / delta))
      : 0;
  c.pointerWorld = {
    x: target.x + vx * travel * 0.8,
    y: target.y + vy * travel * 0.8,
  };
  for (const e of enemies) seen.set(e.id, { x: e.x, y: e.y, time: r.time });
  for (const id of seen.keys())
    if (!enemies.some((e) => e.id === id)) seen.delete(id);
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
        const future = { x: b.x + b.vx * 0.4, y: b.y + b.vy * 0.4 };
        cost += Math.max(0, 55 - segmentDistance(q, b, future)) * 5;
      }
    for (const area of r.areas)
      if (area.enemy && area.starts < r.time + 0.6 && area.ends > r.time) {
        if (area.shape === "beam")
          cost +=
            Math.max(
              0,
              area.width / 2 +
                35 -
                segmentDistance(q, area, beamEnd(r, area, area.angle)),
            ) * 4;
        else if (area.shape === "cone")
          cost += coneHit(
            area,
            q,
            area.radius,
            area.angle,
            area.width,
            p.radius + 20,
          )
            ? 180
            : 0;
        else cost += Math.max(0, area.radius + 35 - distance(q, area)) * 3;
      }
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
    r.projectiles.some(
      (b) =>
        b.enemy &&
        segmentDistance(p, b, { x: b.x + b.vx * 0.25, y: b.y + b.vy * 0.25 }) <
          b.radius + p.radius + 15,
    ) ||
    r.areas.some(
      (a) =>
        a.enemy &&
        a.starts < r.time + 0.2 &&
        a.ends > r.time &&
        distance(p, a) < a.radius + 20,
    );
  return c;
}
export function pick(r: Run, strong: boolean) {
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
