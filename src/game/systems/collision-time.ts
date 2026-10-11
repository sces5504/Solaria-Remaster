import type { Vec } from "../core/primitives";

// Fractions are measured along one fixed-tick sweep. They permit stable global
// ordering even when the storage order differs from the actual contact order.
export function circleContact(
  from: Vec,
  to: Vec,
  center: Vec,
  radius: number,
): number | null {
  const x = from.x - center.x,
    y = from.y - center.y,
    dx = to.x - from.x,
    dy = to.y - from.y;
  const c = x * x + y * y - radius * radius;
  if (c <= 0) return 0;
  const a = dx * dx + dy * dy;
  if (a === 0) return null;
  const b = 2 * (x * dx + y * dy),
    disc = b * b - 4 * a * c;
  if (disc < 0) return null;
  const t = (-b - Math.sqrt(disc)) / (2 * a);
  return t >= 0 && t <= 1 ? t : null;
}
export function rectangleContact(
  from: Vec,
  to: Vec,
  box: { x: number; y: number; w: number; h: number },
): number | null {
  let entry = 0,
    exit = 1;
  for (const [p, d, low, high] of [
    [from.x, to.x - from.x, box.x, box.x + box.w],
    [from.y, to.y - from.y, box.y, box.y + box.h],
  ]) {
    if (Math.abs(d) < 1e-12) {
      if (p < low || p > high) return null;
      continue;
    }
    const a = (low - p) / d,
      b = (high - p) / d;
    entry = Math.max(entry, Math.min(a, b));
    exit = Math.min(exit, Math.max(a, b));
    if (entry > exit) return null;
  }
  return entry >= 0 && entry <= 1 ? entry : null;
}
export interface Contact<T> {
  fraction: number;
  id: number;
  target: T;
}
export function orderContacts<T>(events: Contact<T>[]) {
  return events.sort((a, b) => a.fraction - b.fraction || a.id - b.id);
}
