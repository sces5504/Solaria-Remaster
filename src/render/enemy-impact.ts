import type { Graphics } from "pixi.js";
import type { BiomeId } from "../game/data/biomes";
import type { Visual } from "../game/core/types";
export type ImpactTheme = BiomeId | "sun";
export function enemyImpact(
  g: Graphics,
  v: Visual,
  time: number,
  theme: ImpactTheme,
) {
  const t = Math.max(
      0,
      Math.min(1, 1 - (v.until - time) / (v.duration ?? 0.65)),
    ),
    fade = 1 - t;
  const r = v.radius,
    x = v.x,
    y = v.y;
  if (theme === "icefield") {
    for (let i = 0; i < 9; i++) {
      const a = (i * Math.PI * 2) / 9,
        local = Math.max(0, t * 1.4 - i * 0.025),
        rise = Math.sin(Math.min(1, local) * Math.PI);
      const px = x + Math.cos(a) * r * (0.3 + 0.55 * t),
        py = y + Math.sin(a) * r * (0.3 + 0.55 * t),
        h = r * 0.65 * rise,
        w = 5 + 8 * rise;
      g.poly([
        px - w,
        py + 5,
        px - w * 0.5,
        py - h * 0.6,
        px + 2,
        py - h,
        px + w,
        py - h * 0.45,
        px + w,
        py + 4,
      ])
        .fill({ color: 0x75cddd, alpha: fade * 0.8 })
        .stroke({ color: 0xcdffff, width: 2, alpha: fade });
      g.poly([px, py - h + 3, px + 3, py - h * 0.35, px - 2, py]).fill({
        color: 0xf7ffff,
        alpha: fade,
      });
    }
    return;
  }
  if (theme === "volcano") {
    for (let i = 0; i < 10; i++) {
      const a = (i * Math.PI * 2) / 10 + 0.2,
        dist = r * (0.2 + t * 0.7),
        px = x + Math.cos(a) * dist,
        py = y + Math.sin(a) * dist,
        h = 30 * Math.sin(t * Math.PI) + (i % 3) * 8;
      g.poly([
        px - 7,
        py + 3,
        px - 9,
        py - h * 0.5,
        px - 3,
        py - h * 0.3,
        px + 2,
        py - h,
        px + 7,
        py - h * 0.55,
        px + 5,
        py + 4,
      ])
        .fill({ color: 0xe76635, alpha: fade })
        .stroke({ color: 0xffc66f, width: 2, alpha: fade });
      g.poly([px - 3, py, px, py - h * 0.7, px + 3, py]).fill({
        color: 0xfff0ad,
        alpha: fade,
      });
      const rockY = py - Math.sin(t * Math.PI) * r * 0.5;
      g.poly([
        px - 4,
        rockY,
        px,
        rockY - 6,
        px + 5,
        rockY + 1,
        px + 1,
        rockY + 5,
      ]).fill({ color: 0x332b32, alpha: fade });
    }
    return;
  }
  if (theme === "jungle") {
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4,
        dist = r * Math.sin(t * Math.PI * 0.7),
        px = x + Math.cos(a) * dist,
        py = y + Math.sin(a) * dist;
      g.moveTo(x, y)
        .quadraticCurveTo(x + Math.cos(a + 0.5) * dist, py + 12, px, py)
        .stroke({ color: 0x7f9c52, width: 7 * fade + 1, alpha: fade });
      g.poly([
        px - 5,
        py + 5,
        px - 3,
        py - 12,
        px + 3,
        py - 28 * Math.sin(t * Math.PI),
        px + 6,
        py + 4,
      ]).fill({ color: 0xcde49a, alpha: fade });
      g.poly([px, py - 12, px + 11, py - 19, px + 7, py - 5]).fill({
        color: 0x75b465,
        alpha: fade,
      });
    }
    return;
  }
  if (theme === "corruption") {
    const size = r * (0.35 + 0.4 * Math.sin(t * Math.PI));
    g.poly([
      x - size,
      y + 10,
      x - size * 0.3,
      y - size * 0.4,
      x + size * 0.2,
      y - size,
      x + size,
      y + 2,
      x + size * 0.3,
      y + size * 0.4,
    ])
      .fill({ color: 0x0c1121, alpha: fade })
      .stroke({ color: 0xbd8aff, width: 3, alpha: fade });
    for (let i = 0; i < 10; i++) {
      const a = (i * Math.PI) / 5 + t,
        near = r * (1 - t),
        far = near + 20;
      g.moveTo(x + Math.cos(a) * near, y + Math.sin(a) * near)
        .lineTo(x + Math.cos(a + 0.08) * far, y + Math.sin(a + 0.08) * far)
        .stroke({ color: i % 2 ? 0xe3b6ff : 0x9e76de, width: 2, alpha: fade });
    }
    return;
  }
  if (theme === "crimson") {
    g.ellipse(x, y, r * (0.3 + t * 0.65), r * (0.15 + t * 0.3)).fill({
      color: 0x781b42,
      alpha: fade * 0.45,
    });
    for (let i = 0; i < 9; i++) {
      const a = (i * Math.PI * 2) / 9,
        dist = r * (0.2 + t * 0.7),
        px = x + Math.cos(a) * dist,
        py = y + Math.sin(a) * dist,
        h = r * 0.55 * Math.sin(t * Math.PI);
      g.moveTo(x, y)
        .quadraticCurveTo(px, py - h, px, py)
        .stroke({ color: 0xd95d7d, width: 5 * fade + 1, alpha: fade });
      g.poly([px - 4, py, px + 2, py - h, px + 7, py + 3]).fill({
        color: 0xffbcc7,
        alpha: fade,
      });
    }
    return;
  }
  if (theme === "stars" || theme === "sun") {
    const sun = theme === "sun",
      color = sun ? 0xffd274 : 0xaec8ff,
      core = sun ? 0xfff1bf : 0xedfaff;
    if (t < 0.35)
      g.moveTo(x - r * 0.7, y - r * (1.8 - t * 4))
        .lineTo(x, y)
        .stroke({ color, width: 12 * (1 - t * 2), alpha: fade * 0.6 });
    for (let i = 0; i < (sun ? 16 : 8); i++) {
      const a = (i * Math.PI * 2) / (sun ? 16 : 8) + t * 0.25,
        near = r * (0.2 + t * 0.5),
        far = r * (0.3 + t * 0.7),
        px = x + Math.cos(a) * near,
        py = y + Math.sin(a) * near;
      g.poly([
        px - Math.sin(a) * 4,
        py + Math.cos(a) * 4,
        x + Math.cos(a) * far,
        y + Math.sin(a) * far,
        px + Math.sin(a) * 4,
        py - Math.cos(a) * 4,
      ]).fill({ color: i % 3 ? color : core, alpha: fade });
    }
    const s = r * 0.3 * Math.sin(t * Math.PI);
    g.poly([
      x,
      y - s,
      x + s * 0.25,
      y - s * 0.25,
      x + s,
      y,
      x + s * 0.25,
      y + s * 0.25,
      x,
      y + s,
      x - s * 0.25,
      y + s * 0.25,
      x - s,
      y,
      x - s * 0.25,
      y - s * 0.25,
    ]).fill({ color: core, alpha: fade });
    return;
  }
  // Sand blast: low dust banks and separate tumbling stone shards, with no opaque screen wash.
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4,
      dist = r * (0.15 + t * 0.8),
      px = x + Math.cos(a) * dist,
      py = y + Math.sin(a) * dist;
    g.ellipse(px, py, 10 + 12 * t, 5 + 6 * t).fill({
      color: 0xe0bd81,
      alpha: fade * 0.35,
    });
    const rise = Math.sin(t * Math.PI) * 20;
    g.poly([
      px - 3,
      py - rise,
      px + 2,
      py - rise - 5,
      px + 6,
      py - rise + 1,
      px,
      py - rise + 6,
    ]).fill({ color: 0xf5d89b, alpha: fade });
  }
}
