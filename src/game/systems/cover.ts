import type { Obstacle, Run } from "../core/types";
import { clamp, distance, type Vec } from "../core/primitives";
import {
  COVER_DURABILITY,
  STATIC_DISCHARGE_RADIUS,
  type CoverSource,
} from "../core/cover-rules";
import { coneHit } from "./geometry";
import { rectangleContact } from "./collision-time";

export function closestCoverPoint(o: Obstacle, p: Vec): Vec {
  return { x: clamp(p.x, o.x, o.x + o.w), y: clamp(p.y, o.y, o.y + o.h) };
}
export function coverDamageRadius(r: Run) {
  return STATIC_DISCHARGE_RADIUS * 2 * r.stats.range;
}
export function enemyCoverSource(
  r: Run,
  owner: number,
): CoverSource | undefined {
  const e = r.enemies.find((e) => e.id === owner);
  return e ? (e.kind > 5 || e.sealPillar ? "boss" : "monster") : undefined;
}
export function normalizeCover(r: Run) {
  for (const o of r.obstacles) {
    if (o.kind === "lake" || o.maxDurability === COVER_DURABILITY) continue;
    // Preserve destroyed cover and the remaining fraction of old 5/10/15 HP.
    o.durability =
      o.maxDurability > 0
        ? Math.ceil(
            clamp(o.durability / o.maxDurability, 0, 1) * COVER_DURABILITY,
          )
        : 0;
    o.maxDurability = COVER_DURABILITY;
  }
}
export function coverInCone(
  o: Obstacle,
  origin: Vec,
  radius: number,
  angle: number,
  width: number,
) {
  const points = [
    closestCoverPoint(o, origin),
    { x: o.x, y: o.y },
    { x: o.x + o.w, y: o.y },
    { x: o.x, y: o.y + o.h },
    { x: o.x + o.w, y: o.y + o.h },
  ];
  if (points.some((p) => coneHit(origin, p, radius, angle, width))) return true;
  return [-width / 2, width / 2].some(
    (off) =>
      rectangleContact(
        origin,
        {
          x: origin.x + Math.cos(angle + off) * radius,
          y: origin.y + Math.sin(angle + off) * radius,
        },
        o,
      ) !== null,
  );
}
export function coverWithin(o: Obstacle, origin: Vec, radius: number) {
  return distance(closestCoverPoint(o, origin), origin) <= radius;
}
export function coverInSweep(
  o: Obstacle,
  body: Vec,
  dx: number,
  dy: number,
  radius: number,
) {
  return (
    rectangleContact(
      body,
      { x: body.x + dx, y: body.y + dy },
      {
        x: o.x - radius,
        y: o.y - radius,
        w: o.w + radius * 2,
        h: o.h + radius * 2,
      },
    ) !== null
  );
}
export function coverInRush(
  o: Obstacle,
  body: Vec,
  dx: number,
  dy: number,
  radius: number,
) {
  const p = closestCoverPoint(o, body);
  if ((p.x - body.x) * dx + (p.y - body.y) * dy <= 0) return false;
  return coverInSweep(o, body, dx, dy, radius);
}

/** Boss apex, player-centred perpendicular base, one static-field diameter. */
export function coverInBossTriangle(
  o: Obstacle,
  boss: Vec,
  player: Vec,
  halfBase: number,
) {
  const dx = player.x - boss.x,
    dy = player.y - boss.y,
    length = Math.hypot(dx, dy);
  if (length < 1e-6) return false;
  const nx = (-dy / length) * halfBase,
    ny = (dx / length) * halfBase;
  const tri = [
    boss,
    { x: player.x + nx, y: player.y + ny },
    { x: player.x - nx, y: player.y - ny },
  ];
  const rect = [
    { x: o.x, y: o.y },
    { x: o.x + o.w, y: o.y },
    { x: o.x + o.w, y: o.y + o.h },
    { x: o.x, y: o.y + o.h },
  ];
  const axes = [
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    ...tri.map((p, i) => ({
      x: -(tri[(i + 1) % 3].y - p.y),
      y: tri[(i + 1) % 3].x - p.x,
    })),
  ];
  return axes.every((axis) => {
    const a = tri.map((p) => p.x * axis.x + p.y * axis.y),
      b = rect.map((p) => p.x * axis.x + p.y * axis.y);
    return (
      Math.max(...a) >= Math.min(...b) - 1e-8 &&
      Math.max(...b) >= Math.min(...a) - 1e-8
    );
  });
}
export function bossCoverOrigin(r: Run, owner: number, fallback: Vec): Vec;
export function bossCoverOrigin(
  r: Run,
  owner: number,
  fallback?: Vec,
): Vec | undefined;
export function bossCoverOrigin(
  r: Run,
  owner: number,
  fallback?: Vec,
): Vec | undefined {
  return r.enemies.find((e) => e.id === owner) ?? fallback;
}
