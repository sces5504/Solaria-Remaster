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
export function elementMotif(
  g: Graphics,
  x: number,
  y: number,
  radius: number,
  els: Element[],
  time: number,
  alpha = 1,
) {
  for (const el of els) {
    const color = elementColors[el];
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4 + (el === "water" ? time * 0.7 : 0),
        rr = radius * (0.6 + (i % 3) * 0.16),
        px = x + Math.cos(a) * rr,
        py = y + Math.sin(a) * rr;
      if (el === "fire") {
        const h = 14 + Math.sin(time * 12 + i) * 5;
        g.poly([
          px - 6,
          py + 5,
          px - 8,
          py - 2,
          px - 2,
          py - h,
          px,
          py - h * 0.4,
          px + 5,
          py - h * 0.8,
          px + 7,
          py + 3,
        ]).fill({ color: 0xff8749, alpha: alpha * 0.85 });
        g.poly([px - 3, py + 4, px, py - h * 0.6, px + 3, py + 4]).fill({
          color: 0xfff1a8,
          alpha,
        });
      } else if (el === "ice") {
        g.poly([
          px - 4,
          py + 8,
          px - 7,
          py - 4,
          px + 1,
          py - 19,
          px + 6,
          py - 3,
          px + 4,
          py + 8,
        ])
          .fill({ color: 0x83d6f3, alpha: alpha * 0.65 })
          .stroke({ color: 0xe9ffff, width: 1.5, alpha });
        g.moveTo(px, py - 16)
          .lineTo(px, py + 4)
          .stroke({ color: 0xffffff, width: 1, alpha });
      } else if (el === "lightning") {
        if (i % 2 === 0) bolt(g, x, y, px, py, time + i, color, alpha);
      } else {
        arc(g, x, y, rr, a, a + 0.6).stroke({
          color,
          width: 4,
          alpha: alpha * 0.65,
        });
        diamond(g, px, py, 3, 0xd8ffff, alpha);
      }
    }
  }
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
    if (a.effect === "thunder") {
      bolt(g, a.x, a.y - 100, a.x, a.y - 24, r.time, 0xffe7a0, 0.45);
      g.circle(
        a.x,
        a.y,
        Math.max(5, a.radius * Math.min(1, (a.starts - r.time) / 0.6)),
      ).stroke({ color: 0xffecc3, width: 2, alpha: 0.8 });
    }
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
  elementMotif(g, a.x, a.y, a.radius * 0.85, els, r.time, 0.65);
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
  const progress = Math.max(
      0,
      Math.min(1, (v.until - r.time) / (v.duration || 0.3)),
    ),
    age = 1 - progress;
  if (v.kind === "impact") {
    const length = v.radius * (0.6 + age);
    for (let i = 0; i < 4; i++) {
      const a = v.angle + Math.PI / 4 + (i * Math.PI) / 2;
      g.moveTo(v.x + Math.cos(a) * 3, v.y + Math.sin(a) * 3)
        .lineTo(v.x + Math.cos(a) * length, v.y + Math.sin(a) * length)
        .stroke({ color: v.color, width: 2.5 * progress, alpha: progress });
    }
    g.circle(v.x, v.y, 4 * progress).fill({ color: 0xfffde5, alpha: progress });
  } else if (v.kind === "block") {
    g.poly([
      v.x - 24,
      v.y - 30,
      v.x,
      v.y - 37,
      v.x + 24,
      v.y - 30,
      v.x + 20,
      v.y + 6,
      v.x,
      v.y + 24,
      v.x - 20,
      v.y + 6,
    ])
      .fill({ color: v.color, alpha: progress * 0.16 })
      .stroke({ color: 0xe0fff1, width: 3, alpha: progress });
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6,
        rr = v.radius * (0.4 + age * 1.2);
      g.moveTo(v.x + Math.cos(a) * rr, v.y + Math.sin(a) * rr)
        .lineTo(v.x + Math.cos(a) * (rr + 10), v.y + Math.sin(a) * (rr + 10))
        .stroke({ color: 0xffeab6, width: 2, alpha: progress });
    }
  } else if (v.kind === "charge") {
    const dx = Math.cos(v.angle),
      dy = Math.sin(v.angle);
    for (let i = 0; i < 3; i++) {
      const side = (i - 1) * 15;
      g.moveTo(v.x - dx * 40 - dy * side, v.y - dy * 40 + dx * side)
        .lineTo(v.x + dx * 35 - dy * side, v.y + dy * 35 + dx * side)
        .stroke({
          color: i === 1 ? 0xfffbe2 : v.color,
          width: i === 1 ? 4 : 2,
          alpha: progress * 0.65,
        });
    }
    arc(
      g,
      v.x + dx * 20,
      v.y + dy * 20,
      v.radius,
      v.angle - 1.2,
      v.angle + 1.2,
    ).stroke({ color: v.color, width: 7, alpha: progress * 0.5 });
  } else if (v.kind === "burst" || v.kind === "thunder") {
    const radius = v.radius * (0.3 + age * 0.85);
    g.circle(v.x, v.y, radius)
      .fill({ color: v.color, alpha: progress * 0.14 })
      .stroke({
        color: v.color,
        width: 6 * progress + 1,
        alpha: progress * 0.8,
      });
    g.circle(v.x, v.y, radius * 0.82).stroke({
      color: 0xfff1ce,
      width: 2,
      alpha: progress * 0.8,
    });
    g.circle(v.x, v.y, Math.max(3, v.radius * 0.32 * progress)).fill({
      color: 0xfff4dc,
      alpha: progress * 0.65,
    });
    for (let i = 0; i < 16; i++) {
      const a = i * 2.39996 + v.id,
        rr = radius * (0.8 + (i % 3) * 0.1);
      g.moveTo(v.x + Math.cos(a) * rr, v.y + Math.sin(a) * rr)
        .lineTo(
          v.x + Math.cos(a) * (rr + 16 * progress),
          v.y + Math.sin(a) * (rr + 16 * progress),
        )
        .stroke({
          color: i % 3 === 0 ? 0xfff8db : v.color,
          width: 2,
          alpha: progress,
        });
    }
    elementMotif(g, v.x, v.y, radius, v.elements || [], r.time, progress);
    if (v.kind === "thunder") {
      const top = Math.max(14, v.y - 230);
      g.moveTo(v.x, top)
        .lineTo(v.x, v.y)
        .stroke({
          color: v.color,
          width: 24 * progress,
          alpha: progress * 0.2,
        });
      bolt(g, v.x, top, v.x, v.y, r.time, v.color, progress);
      g.moveTo(v.x, top)
        .lineTo(v.x, v.y)
        .stroke({ color: 0xfffbe9, width: 3 * progress, alpha: progress });
      for (const sign of [-1, 1])
        bolt(
          g,
          v.x,
          v.y - 75,
          v.x + sign * 35,
          v.y - 30,
          r.time + sign,
          v.color,
          progress * 0.65,
        );
    }
  } else if (v.kind === "slash") {
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
