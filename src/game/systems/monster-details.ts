import { combatMonsters as monsters } from "../data/combat-content";

import type { Actor, Mode, Projectile, Run } from "../core/types";
import { angle, distance, DT, type Vec } from "../core/primitives";
import { move } from "./geometry";

export function normalWarning(e: Actor, type: Mode["type"]) {
  if (!e.monsterId) return e.kind <= 3 ? 0.7 : 0.6;
  if (type === "laser") return 0.8;
  if (type === "mark") return 0.6;
  if (type === "rush" || type === "slash") return 0.35;
  return 0.4;
}
export function normalShotInterval(id: number) {
  return [22, 28].includes(id) ? 0.15 : [13, 25].includes(id) ? 0.2 : 0.3;
}
export function preferredRange(id: number) {
  return id === 7 ? 180 : id === 19 ? 220 : 200;
}
// Side movement is real collision-checked motion, not a sprite wobble.
export function normalSideMovement(r: Run, e: Actor, speed: number): boolean {
  const id = e.monsterId ?? 0,
    d = distance(e, r.player),
    a = angle(e, r.player);
  if ([11, 25].includes(id) && d >= 150 && d <= 270) {
    const side = Math.sin(r.time * 0.8 + e.id) >= 0 ? 1 : -1;
    move(
      r,
      e,
      Math.cos(a + Math.PI / 2) * speed * side * DT,
      Math.sin(a + Math.PI / 2) * speed * side * DT,
      e.radius,
    );
    return true;
  }
  if (id === 15 && d > 80 && d < 220) {
    const side = e.id % 2 ? 1 : -1,
      turn = a + side * 0.75;
    move(
      r,
      e,
      Math.cos(turn) * speed * DT,
      Math.sin(turn) * speed * DT,
      e.radius,
    );
    return true;
  }
  if (id === 18 && d > 55) {
    const turn = a + Math.sin(r.time * 3 + e.id) * 0.45;
    move(
      r,
      e,
      Math.cos(turn) * speed * DT,
      Math.sin(turn) * speed * DT,
      e.radius,
    );
    return true;
  }
  return false;
}
export interface SerpentineProjectile extends Projectile {
  sine?: { direction: number; speed: number; travel: number; phase: number };
}
export function attachSine(p: Projectile, phase = 0) {
  const shot = p as SerpentineProjectile;
  shot.sine = {
    direction: Math.atan2(p.vy, p.vx),
    speed: Math.hypot(p.vx, p.vy),
    travel: 0,
    phase,
  };
}
export function sineVelocity(p: Projectile, dt: number) {
  const path = (p as SerpentineProjectile).sine;
  if (!path) return;
  const travel = path.speed * dt;
  const sideways =
    20 *
    (Math.sin((path.travel + travel) / 80 + path.phase) -
      Math.sin(path.travel / 80 + path.phase));
  const a = path.direction;
  p.vx = (Math.cos(a) * travel - Math.sin(a) * sideways) / dt;
  p.vy = (Math.sin(a) * travel + Math.cos(a) * sideways) / dt;
  path.travel += travel;
}
export function ringWithGap(i: number, n: number, rotation: number) {
  return rotation + Math.PI / 6 + ((i + 0.5) * ((Math.PI * 5) / 3)) / n;
}
export function limitedMark(origin: Vec, target: Vec, reach: number) {
  const d = distance(origin, target),
    fraction = Math.min(1, reach / (d || 1));
  return {
    x: origin.x + (target.x - origin.x) * fraction,
    y: origin.y + (target.y - origin.y) * fraction,
  };
}

export function enemyElements(e?: Actor): import("../core/types").Element[] {
  return [
    ...new Set(
      [e?.element, monsters[e?.monsterId ?? 0]?.element].filter(Boolean),
    ),
  ] as import("../core/types").Element[];
}
