import type { Graphics } from "pixi.js";
import type { Run, Area } from "../game/core/types";
import { beamEnd } from "../game/systems/geometry";
export function bossBeam(g: Graphics, r: Run, a: Area): boolean {
  if (!a.enemy || a.shape !== "beam" || !a.eventAbility || r.time < a.starts)
    return false;
  const end = beamEnd(r, a, a.angle),
    dx = end.x - a.x,
    dy = end.y - a.y,
    length = Math.hypot(dx, dy),
    normal = { x: -Math.sin(a.angle), y: Math.cos(a.angle) };
  const theme = a.enemyTheme;
  const color =
    theme === "sun" || theme === "desert"
      ? 0xffd392
      : theme === "volcano"
        ? 0xff8656
        : theme === "stars"
          ? 0xa3cfff
          : 0xc1a9f0;
  const point = (f: number, side = 0): [number, number] => [
    a.x + dx * f + normal.x * side,
    a.y + dy * f + normal.y * side,
  ];
  const pulse = 0.8 + Math.sin(r.time * 28) * 0.2;
  g.moveTo(a.x, a.y)
    .lineTo(end.x, end.y)
    .stroke({ color, width: a.width + 15, alpha: 0.15 * pulse })
    .moveTo(a.x, a.y)
    .lineTo(end.x, end.y)
    .stroke({ color, width: a.width, alpha: 0.7 })
    .moveTo(a.x, a.y)
    .lineTo(end.x, end.y)
    .stroke({
      color: 0xffffff,
      width: Math.max(3, a.width * 0.25),
      alpha: 0.9,
    });
  const count = Math.ceil(length / 65);
  for (let i = 0; i < count; i++) {
    const f = (i / count + r.time * 0.35) % 1,
      [x, y] = point(f);
    if (a.eventAbility.startsWith("santa-")) {
      // Light folds into two ribbons with moving knots at their crossings.
      const wave = Math.sin(f * Math.PI * 12 - r.time * 7) * a.width * 0.7;
      for (const side of [-1, 1])
        g.moveTo(...point(Math.max(0, f - 0.06), -wave * side))
          .quadraticCurveTo(
            x + normal.x * wave * side,
            y + normal.y * wave * side,
            ...point(Math.min(1, f + 0.06), -wave * side),
          )
          .stroke({
            color: side > 0 ? 0xffb6ce : 0x99e1fb,
            width: 4,
            alpha: 0.9,
          });
      g.poly([x - 5, y, x, y - 5, x + 5, y, x, y + 5]).fill(0xfff5cf);
    } else if (theme === "desert") {
      const vertices: number[] = [];
      for (const [forward, side] of [
        [10, 0],
        [0, -8],
        [-10, 0],
        [0, 8],
      ])
        vertices.push(
          x + Math.cos(a.angle) * forward + normal.x * side,
          y + Math.sin(a.angle) * forward + normal.y * side,
        );
      g.poly(vertices)
        .fill({ color: 0xffe2a2, alpha: 0.7 })
        .stroke({ color: 0xffffff, width: 2, alpha: 0.9 });
    } else if (theme === "volcano") {
      for (const side of [-1, 1]) {
        const flare = 6 + Math.sin(r.time * 14 + i) * 5;
        const [sx, sy] = point(f, side * a.width * 0.55);
        g.moveTo(sx, sy)
          .quadraticCurveTo(
            sx + normal.x * side * flare,
            sy + normal.y * side * flare,
            ...point(Math.min(1, f + 0.1), side * (a.width * 0.5 + 12)),
          )
          .stroke({ color: 0xffb25b, width: 5, alpha: 0.75 });
      }
    } else if (theme === "stars" || theme === "sun") {
      const rays = theme === "sun" ? 8 : 5,
        points: number[] = [];
      for (let j = 0; j < rays * 2; j++) {
        const angle = (j * Math.PI) / rays + r.time * 0.8,
          rad = j % 2 ? 4 : 10;
        points.push(x + Math.cos(angle) * rad, y + Math.sin(angle) * rad);
      }
      g.poly(points).fill({ color: 0xffffea, alpha: 0.9 });
      for (const side of [-1, 1])
        g.moveTo(...point(Math.max(0, f - 0.05), side * a.width))
          .lineTo(...point(Math.min(1, f + 0.05), side * a.width))
          .stroke({ color, width: 2, alpha: 0.7 });
    } else {
      // Arcane beams carry linked runes rather than the solid solar facets.
      const [lx, ly] = point(f, -a.width * 0.6),
        [rx, ry] = point(f, a.width * 0.6);
      g.moveTo(lx, ly)
        .quadraticCurveTo(
          x + Math.cos(a.angle) * 13,
          y + Math.sin(a.angle) * 13,
          rx,
          ry,
        )
        .quadraticCurveTo(
          x - Math.cos(a.angle) * 13,
          y - Math.sin(a.angle) * 13,
          lx,
          ly,
        )
        .stroke({ color: 0xf0e4ff, width: 2, alpha: 0.8 });
      g.moveTo(lx, ly)
        .lineTo(rx, ry)
        .stroke({ color: 0xe2c5ff, width: 2, alpha: 0.7 });
    }
  }
  // The emitting lens has a luminous core and rotating supports.
  for (let ray = 0; ray < 4; ray++) {
    const q = r.time * 1.5 + (ray * Math.PI) / 2,
      x = a.x + Math.cos(q) * (a.width + 8),
      y = a.y + Math.sin(q) * (a.width + 8);
    g.moveTo(x, y)
      .lineTo(
        a.x + Math.cos(q) * (a.width + 15),
        a.y + Math.sin(q) * (a.width + 15),
      )
      .stroke({ color, width: 4, alpha: 0.85 });
  }
  g.circle(a.x, a.y, a.width * 0.7)
    .fill({ color, alpha: 0.6 })
    .circle(a.x, a.y, 4)
    .fill(0xffffff);
  return true;
}
