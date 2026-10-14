import type { Actor, Run } from "../game/core/types";
import { distance, type Vec } from "../game/core/primitives";

export const AIM_RANGE = 720;
export const AIM_HALF_WIDTH = 10;
// SAT between the oriented aiming corridor and solid cover. Lakes do not block shots.
export function aimBlocked(r: Run, target: Vec): boolean {
  const p = r.player,
    length = distance(p, target);
  if (length < 0.001) return false;
  const dx = (target.x - p.x) / length,
    dy = (target.y - p.y) / length;
  const nx = -dy * AIM_HALF_WIDTH,
    ny = dx * AIM_HALF_WIDTH;
  const corridor = [
    { x: p.x + nx, y: p.y + ny },
    { x: target.x + nx, y: target.y + ny },
    { x: target.x - nx, y: target.y - ny },
    { x: p.x - nx, y: p.y - ny },
  ];
  return r.obstacles.some((o) => {
    if (o.durability <= 0 || o.kind === "lake") return false;
    const box = [
      { x: o.x, y: o.y },
      { x: o.x + o.w, y: o.y },
      { x: o.x + o.w, y: o.y + o.h },
      { x: o.x, y: o.y + o.h },
    ];
    return [
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: dx, y: dy },
      { x: -dy, y: dx },
    ].every((axis) => {
      const a = corridor.map((v) => v.x * axis.x + v.y * axis.y);
      const b = box.map((v) => v.x * axis.x + v.y * axis.y);
      return (
        Math.max(...a) >= Math.min(...b) && Math.max(...b) >= Math.min(...a)
      );
    });
  });
}
export class AutoAim {
  targetId: number | null = null;
  private holdUntil = 0;
  private direction: number | null = null;
  private runId = "";
  reset() {
    this.targetId = null;
    this.holdUntil = 0;
    this.direction = null;
    this.runId = "";
  }
  manual(r: Run, point: Vec) {
    if (this.runId !== r.runId) this.reset();
    this.runId = r.runId;
    this.targetId = null;
    this.direction = Math.atan2(point.y - r.player.y, point.x - r.player.x);
  }
  select(r: Run, range = AIM_RANGE): Vec {
    if (this.runId !== r.runId) {
      this.reset();
      this.runId = r.runId;
    }
    const candidates = r.enemies
      .filter(
        (e) =>
          e.hp > 0 &&
          e.transition <= r.time &&
          distance(r.player, e) <= range &&
          !aimBlocked(r, e),
      )
      .sort(
        (a, b) => distance(r.player, a) - distance(r.player, b) || a.id - b.id,
      );
    const current = candidates.find((e) => e.id === this.targetId);
    const nearest = candidates[0];
    let target: Actor | undefined = current;
    if (
      !current ||
      (r.time >= this.holdUntil &&
        nearest &&
        distance(r.player, nearest) < distance(r.player, current) * 0.8)
    )
      target = nearest;
    if (target?.id !== this.targetId) {
      this.targetId = target?.id ?? null;
      this.holdUntil = r.time + 0.3;
    }
    if (target) {
      this.direction = Math.atan2(target.y - r.player.y, target.x - r.player.x);
      return { x: target.x, y: target.y };
    }
    const facing = this.direction ?? r.player.aim ?? 0;
    return {
      x: r.player.x + Math.cos(facing) * 300,
      y: r.player.y + Math.sin(facing) * 300,
    };
  }
}
