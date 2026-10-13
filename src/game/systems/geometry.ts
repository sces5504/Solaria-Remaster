import type { Run, Obstacle } from "../core/types";
import { distance, segmentDistance, type Vec } from "../core/primitives";
export function contains(o: Obstacle, p: Vec, r = 0) {
  return (
    o.durability > 0 &&
    p.x > o.x - r &&
    p.x < o.x + o.w + r &&
    p.y > o.y - r &&
    p.y < o.y + o.h + r
  );
}
export function legal(r: Run, p: Vec, radius = 12, low = true) {
  return (
    p.x >= 32 + radius &&
    p.x <= 992 - radius &&
    p.y >= 64 + radius &&
    p.y <= 608 - radius &&
    r.obstacles.every(
      (o) =>
        (!low && o.kind === "lake" && !o.blocksDash) || !contains(o, p, radius),
    )
  );
}
export function lineBlocked(r: Run, a: Vec, b: Vec, low = false) {
  const n = Math.ceil(distance(a, b) / 5);
  for (let i = 0; i <= n; i++) {
    const p = {
      x: a.x + ((b.x - a.x) * i) / (n || 1),
      y: a.y + ((b.y - a.y) * i) / (n || 1),
    };
    if (
      p.x < 32 ||
      p.x > 992 ||
      p.y < 64 ||
      p.y > 608 ||
      r.obstacles.some((o) => (low || o.kind !== "lake") && contains(o, p))
    )
      return true;
  }
  return false;
}
export function move(
  r: Run,
  p: Vec,
  dx: number,
  dy: number,
  radius = 12,
  low = true,
) {
  const n = Math.ceil(Math.hypot(dx, dy) / 4) || 1;
  for (let i = 0; i < n; i++) {
    const nx = { x: p.x + dx / n, y: p.y };
    if (legal(r, nx, radius, low)) p.x = nx.x;
    const ny = { x: p.x, y: p.y + dy / n };
    if (legal(r, ny, radius, low)) p.y = ny.y;
  }
}
export function coneHit(
  origin: Vec,
  target: Vec,
  radius: number,
  a: number,
  width: number,
  targetRadius = 0,
) {
  const d = Math.atan2(target.y - origin.y, target.x - origin.x) - a;
  return (
    distance(origin, target) <= radius + targetRadius &&
    Math.abs(Math.atan2(Math.sin(d), Math.cos(d))) <= width / 2
  );
}
export function beamEnd(r: Run, origin: Vec, a: number) {
  for (let d = 0; d < 1300; d += 4) {
    const p = { x: origin.x + Math.cos(a) * d, y: origin.y + Math.sin(a) * d };
    if (lineBlocked(r, p, p)) return p;
  }
  return origin;
}
export { segmentDistance };
