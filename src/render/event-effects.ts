import type { Graphics } from "pixi.js";
import type { Projectile, Visual } from "../game/core/types";

export function eventProjectile(g: Graphics, b: Projectile, time: number) {
  if (!b.eventGlyph) return false;
  const { x, y } = b,
    a = Math.atan2(b.vy, b.vx);
  if (b.eventGlyph === "gift") {
    g.roundRect(x - 8, y - 7, 16, 14, 2)
      .fill(0x789fd6)
      .stroke({ color: 0xd9f9ff, width: 2 });
    g.rect(x - 2, y - 7, 4, 14)
      .fill(0xffe0a5)
      .rect(x - 8, y - 2, 16, 3)
      .fill(0xffe0a5);
    g.moveTo(x, y - 7)
      .quadraticCurveTo(x - 13, y - 20, x - 1, y - 11)
      .quadraticCurveTo(x + 12, y - 21, x + 2, y - 7)
      .stroke({ color: 0xffffff, width: 2 });
  } else if (b.eventGlyph === "ghost") {
    g.moveTo(x - 9, y)
      .quadraticCurveTo(x - 10, y - 16, x + 2, y - 12)
      .quadraticCurveTo(x + 13, y - 11, x + 9, y + 2)
      .lineTo(x + 12, y + 11)
      .lineTo(x + 3, y + 6)
      .lineTo(x - 4, y + 12)
      .lineTo(x - 9, y)
      .fill(0xc2dba8);
    g.ellipse(x - 3, y - 4, 2, 3)
      .fill(0x243e46)
      .ellipse(x + 4, y - 4, 2, 3)
      .fill(0x243e46);
  } else if (b.eventGlyph === "plasma") {
    const p = (f: number, s: number) => [
      x + Math.cos(a) * f - Math.sin(a) * s,
      y + Math.sin(a) * f + Math.cos(a) * s,
    ];
    g.poly([...p(10, 0), ...p(-5, -6), ...p(-17, 0), ...p(-5, 6)])
      .fill(0x63daf3)
      .stroke({ color: 0xccffff, width: 2 });
    g.poly([...p(4, 0), ...p(-5, -2), ...p(-10, 0), ...p(-5, 2)]).fill(
      0xffffff,
    );
  } else {
    for (let i = 0; i < 3; i++) {
      const q = a + (i - 1) * 0.18,
        len = 22 + i * 6;
      g.moveTo(x - Math.cos(q) * len, y - Math.sin(q) * len)
        .quadraticCurveTo(
          x - Math.cos(q) * 8,
          y - Math.sin(q) * 8 - 3 * Math.sin(time * 12 + i),
          x,
          y,
        )
        .stroke({
          color: i === 1 ? 0xffe7bf : 0xa3beef,
          width: 5 - i,
          alpha: 0.65,
        });
    }
    g.poly([x - 6, y - 5, x + 5, y - 6, x + 8, y + 1, x, y + 7, x - 7, y + 3])
      .fill(0xf1b487)
      .stroke({ color: 0xffffff, width: 2 });
  }
  return true;
}

export function eventImpact(g: Graphics, v: Visual, time: number) {
  const key = v.eventAbility;
  if (!key || !/^(santa|pumpkin|meteor)-/.test(key)) return false;
  const t = Math.max(
      0,
      Math.min(1, 1 - (v.until - time) / (v.duration ?? 0.65)),
    ),
    f = 1 - t;
  const { x, y, radius: r } = v;
  if (key.startsWith("santa")) {
    const h = 60 * Math.sin(t * Math.PI);
    g.moveTo(x - 22, y - h)
      .quadraticCurveTo(x - 19, y - h - 40, x, y - h - 44)
      .quadraticCurveTo(x + 19, y - h - 40, x + 22, y - h)
      .lineTo(x - 22, y - h)
      .fill({ color: 0xc0ebff, alpha: f })
      .stroke({ color: 0xffffff, width: 3, alpha: f });
    g.circle(x, y - h + 5, 6).fill({ color: 0xffe5a4, alpha: f });
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      g.poly([
        x + Math.cos(a) * r * t,
        y + Math.sin(a) * r * t,
        x + Math.cos(a) * r * t + 5,
        y + Math.sin(a) * r * t - 17 * f,
        x + Math.cos(a) * r * t + 8,
        y + Math.sin(a) * r * t,
      ]).fill({ color: 0x97e7ff, alpha: f });
    }
  } else if (key.startsWith("pumpkin")) {
    for (let i = 0; i < 7; i++) {
      const a = (i * Math.PI * 2) / 7 + t * 0.2;
      const px = x + Math.cos(a) * r * (0.3 + 0.7 * t),
        py = y + Math.sin(a) * r * (0.3 + 0.7 * t);
      g.moveTo(x, y)
        .quadraticCurveTo((x + px) / 2 + 15, (y + py) / 2 - 35 * f, px, py)
        .stroke({ color: 0x96bb69, width: 9 * f + 1, alpha: f });
      g.poly([px, py, px - 6, py - 22 * f, px + 8, py - 12 * f]).fill({
        color: 0xe8c18b,
        alpha: f,
      });
    }
    g.ellipse(x, y - 20 * f, 22 * f + 5, 18 * f + 4).fill({
      color: 0xf4a353,
      alpha: f,
    });
    g.poly([x - 12, y - 25 * f, x - 4, y - 25 * f, x - 8, y - 18 * f]).fill({
      color: 0xfff8b1,
      alpha: f,
    });
    g.poly([x + 4, y - 25 * f, x + 12, y - 25 * f, x + 8, y - 18 * f]).fill({
      color: 0xfff8b1,
      alpha: f,
    });
  } else {
    g.ellipse(x, y, r * 0.6 * (0.2 + t), r * 0.2 * (0.2 + t)).fill({
      color: 0xffd7ae,
      alpha: 0.5 * f,
    });
    for (let i = 0; i < 11; i++) {
      const a = i * 2.4,
        reach = r * (0.1 + 0.9 * t);
      const px = x + Math.cos(a) * reach,
        py = y + Math.sin(a) * reach - 40 * Math.sin(t * Math.PI);
      g.poly([px - 5, py, px, py - 8, px + 8, py + 1, px + 1, py + 7]).fill({
        color: 0xe5a881,
        alpha: f,
      });
    }
    g.moveTo(x, y - 170 * f)
      .quadraticCurveTo(x - 15 * f, y - 50 * f, x, y)
      .stroke({ color: 0xffedcd, width: 12 * f, alpha: f });
  }
  return true;
}
