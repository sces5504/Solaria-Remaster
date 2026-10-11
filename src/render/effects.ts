import { Graphics } from "pixi.js";
import type { Area, Element, Run, Visual } from "../game/core/types";
import { beamEnd } from "../game/systems/geometry";
export const elementColors: Record<Element, number> = {
  ice: 0xa9f2ff,
  fire: 0xffaa57,
  water: 0x70d3ff,
  lightning: 0xffe996,
};
export function elementColor(elements: Element[] = [], fallback = 0xd1baff) {
  return elements.length > 1
    ? elements.includes("fire") && elements.includes("ice")
      ? 0xffc8e5
      : elements.includes("lightning")
        ? 0x99f3d7
        : 0xe5ead6
    : elementColors[elements[0]] || fallback;
}
export function diamond(
  g: Graphics,
  x: number,
  y: number,
  radius: number,
  color: number,
  alpha = 1,
) {
  g.poly([
    x,
    y - radius,
    x + radius * 0.65,
    y,
    x,
    y + radius,
    x - radius * 0.65,
    y,
  ]).fill({ color, alpha });
}
export function bolt(
  g: Graphics,
  x: number,
  y: number,
  tx: number,
  ty: number,
  time: number,
  color: number,
  alpha = 1,
) {
  const dx = tx - x,
    dy = ty - y,
    len = Math.hypot(dx, dy) || 1;
  g.moveTo(x, y);
  for (let i = 1; i < 7; i++) {
    const jitter = Math.sin(i * 13 + time * 29) * 6;
    g.lineTo(
      x + (dx * i) / 7 - (dy / len) * jitter,
      y + (dy * i) / 7 + (dx / len) * jitter,
    );
  }
  g.lineTo(tx, ty).stroke({ color, width: 4, alpha: alpha * 0.2 });
  g.moveTo(x, y);
  for (let i = 1; i < 7; i++) {
    const jitter = Math.sin(i * 13 + time * 29) * 6;
    g.lineTo(
      x + (dx * i) / 7 - (dy / len) * jitter,
      y + (dy * i) / 7 + (dx / len) * jitter,
    );
  }
  g.lineTo(tx, ty).stroke({ color: 0xfffae2, width: 1.5, alpha });
}
function arc(
  g: Graphics,
  x: number,
  y: number,
  radius: number,
  from: number,
  to: number,
) {
  return g
    .moveTo(x + Math.cos(from) * radius, y + Math.sin(from) * radius)
    .arc(x, y, radius, from, to);
}
export function areaEffect(g: Graphics, r: Run, a: Area) {
  const warning = r.time < a.starts,
    els = a.context?.elementMask || [],
    color = a.enemy ? (warning ? 0xffc795 : 0xff8877) : elementColor(els);
  if (a.shape === "beam") {
    const end = beamEnd(r, a, a.angle);
    for (const [width, alpha] of warning
      ? [
          [a.width + 10, 0.07],
          [2, 0.85],
        ]
      : [
          [a.width + 14, 0.13],
          [a.width, 0.8],
          [2, 1],
        ])
      g.moveTo(a.x, a.y).lineTo(end.x, end.y).stroke({ color, width, alpha });
    if (!warning) bolt(g, a.x, a.y, end.x, end.y, r.time, color, 0.7);
    return;
  }
  if (a.shape === "cone") {
    const sweep = Math.sin(r.time * 18) * 0.08;
    g.moveTo(a.x, a.y)
      .arc(a.x, a.y, a.radius, a.angle - a.width / 2, a.angle + a.width / 2)
      .closePath()
      .fill({ color, alpha: warning ? 0.04 : 0.12 })
      .stroke({ color, width: 2, alpha: 0.8 });
    if (!warning)
      for (let i = 0; i < 14; i++) {
        const angle = a.angle - a.width / 2 + (i / 13) * a.width + sweep,
          d = 20 + ((r.time * 90 + i * 37) % Math.max(1, a.radius - 20));
        diamond(
          g,
          a.x + Math.cos(angle) * d,
          a.y + Math.sin(angle) * d,
          2 + (i % 3),
          color,
          0.8,
        );
      }
    return;
  }
  g.circle(a.x, a.y, a.radius)
    .fill({ color, alpha: warning ? 0.04 : 0.07 })
    .stroke({ color, width: warning ? 2 : 1, alpha: 0.8 });
  if (warning) {
    // Progressing dotted hazard rim and cross distinguish danger from friendly aura.
    for (let i = 0; i < 12; i++) {
      const t = (i * Math.PI) / 6;
      arc(g, a.x, a.y, a.radius, t, t + 0.13).stroke({
        color,
        width: 3,
        alpha: 0.8,
      });
    }
    if (a.enemy)
      g.moveTo(a.x - 9, a.y)
        .lineTo(a.x + 9, a.y)
        .moveTo(a.x, a.y - 9)
        .lineTo(a.x, a.y + 9)
        .stroke({ color, width: 2 });
    else {
      diamond(g, a.x, a.y, 12, color, 0.8);
      g.circle(a.x, a.y, 22 + Math.sin(r.time * 14) * 4).stroke({
        color,
        width: 2,
      });
    }
    return;
  }
  const age = r.time - a.starts;
  if (a.ends - a.starts < 0.1) {
    for (let i = 0; i < 3; i++)
      g.circle(a.x, a.y, a.radius * (0.7 + i * 0.15)).stroke({
        color,
        width: 3 - i,
        alpha: 1 - i * 0.2,
      });
  }
  for (let i = 0; i < 14; i++) {
    const t = i * 2.39996 + r.time * (a.pull ? -0.7 : 0.3),
      rr = a.radius * (0.3 + ((i * 17 + age * 32) % 70) / 100),
      x = a.x + Math.cos(t) * rr,
      y = a.y + Math.sin(t) * rr;
    if (els.includes("lightning")) {
      if (i % 3 === 0) bolt(g, a.x, a.y, x, y, r.time, color, 0.6);
    } else if (els.includes("ice")) {
      diamond(g, x, y, 5, color, 0.75);
      g.moveTo(x - 4, y)
        .lineTo(x + 4, y)
        .stroke({ color: 0xffffff, width: 1, alpha: 0.5 });
    } else if (els.includes("fire")) {
      g.poly([
        x - 3,
        y + 4,
        x - 4,
        y - 1,
        x,
        y - 9 - Math.sin(r.time * 15 + i) * 4,
        x + 4,
        y,
        x + 2,
        y + 5,
      ]).fill({ color, alpha: 0.8 });
      g.circle(x, y, 2).fill(0xffefbd);
    } else if (els.includes("water")) {
      arc(g, a.x, a.y, rr, t, t + 0.45).stroke({ color, width: 2, alpha: 0.6 });
    } else diamond(g, x, y, 4, color, 0.7);
  }
  if (els.includes("water") && els.includes("fire"))
    for (let i = 0; i < 6; i++)
      g.ellipse(
        a.x + Math.sin(i * 3 + age) * a.radius * 0.5,
        a.y - i * 9,
        14 + i * 3,
        8,
      ).fill({ color: 0xe6fff1, alpha: 0.11 });
  if (a.mine) {
    diamond(g, a.x, a.y, 13, 0xffc383);
    g.circle(a.x, a.y, 6).fill(0xffefc0);
  }
}
export function visualEffect(g: Graphics, r: Run, v: Visual) {
  const progress = Math.max(0, Math.min(1, (v.until - r.time) / 0.3)),
    age = 1 - progress;
  if (v.kind === "slash") {
    const from = v.angle - v.value / 2,
      to = v.angle + v.value / 2;
    for (let i = 0; i < 4; i++)
      arc(
        g,
        v.x,
        v.y,
        v.radius * (1 - i * 0.08),
        from + age * v.value * 0.22,
        to,
      ).stroke({
        color: i === 0 ? 0xfff9e1 : v.color,
        width: i === 0 ? 3 : 7,
        alpha: progress * (i === 0 ? 0.9 : 0.15),
      });
    const a = from + age * v.value;
    g.moveTo(v.x + Math.cos(a) * 20, v.y + Math.sin(a) * 20)
      .lineTo(v.x + Math.cos(a) * v.radius, v.y + Math.sin(a) * v.radius)
      .stroke({ color: 0xffffff, width: 3, alpha: progress });
  } else if (v.kind === "arc")
    bolt(
      g,
      v.x,
      v.y,
      v.x + Math.cos(v.angle) * v.value,
      v.y + Math.sin(v.angle) * v.value,
      r.time,
      v.color,
      progress,
    );
  else {
    for (let i = 0; i < 2; i++)
      g.circle(v.x, v.y, v.radius * (0.4 + age * 0.8 + i * 0.15)).stroke({
        color: v.color,
        width: 2 - i,
        alpha: progress * 0.75,
      });
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4 + v.id * 0.13,
        d = (v.radius * 0.3 + age * v.radius) * (0.7 + (i % 3) * 0.15);
      diamond(
        g,
        v.x + Math.cos(a) * d,
        v.y + Math.sin(a) * d,
        Math.max(1, 3 * progress),
        v.color,
        progress,
      );
    }
  }
}
