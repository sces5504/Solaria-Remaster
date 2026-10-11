import type { Graphics } from "pixi.js";
import type { Visual } from "../game/core/types";
// Equipment-specific overlays are composed with hit light, rather than substituting a recoloured blast.
export function equipmentEffect(g: Graphics, v: Visual, time: number) {
  if (v.kind !== "relic" || v.value < 201 || v.value > 217) return false;
  const t = Math.max(
      0,
      Math.min(1, 1 - (v.until - time) / (v.duration ?? 0.65)),
    ),
    fade = 1 - t,
    R = v.radius;
  const x = v.x,
    y = v.y,
    id = v.value;
  if (id === 204) {
    // Moon-string: three splitting crescents, shimmering seed and falling silver fragments.
    for (let i = 0; i < 3; i++) {
      const a = t * 1.3 + (i * Math.PI * 2) / 3,
        r = R * (0.3 + t * 0.8);
      g.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r)
        .quadraticCurveTo(
          x + Math.cos(a + 0.7) * r * 1.5,
          y + Math.sin(a + 0.7) * r * 1.5,
          x + Math.cos(a + 1.2) * r,
          y + Math.sin(a + 1.2) * r,
        )
        .stroke({ color: 0xdfd9ff, width: 6 * fade + 1, alpha: fade });
    }
    g.circle(x, y, 8 * fade).fill({ color: 0xffffe6, alpha: fade });
  } else if (id === 209) {
    // Armour plates disassemble into a six-point shock crown.
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3,
        r = R * (0.2 + t * 0.9),
        px = x + Math.cos(a) * r,
        py = y + Math.sin(a) * r;
      g.poly([
        px - 7,
        py - 11,
        px + 7,
        py - 11,
        px + 9,
        py + 4,
        px,
        py + 12,
        px - 9,
        py + 4,
      ])
        .fill({ color: 0x7494ad, alpha: fade })
        .stroke({ color: 0xe3f3ff, width: 2, alpha: fade });
      g.moveTo(x + Math.cos(a) * R * 0.15, y + Math.sin(a) * R * 0.15)
        .lineTo(px, py)
        .stroke({ color: 0xbedbff, width: 3 * fade, alpha: fade * 0.8 });
    }
  } else if (id === 212) {
    // Ribbon gift: lid flies upward while light spills out and paper fragments spread.
    const s = 16 * (1 - t * 0.5);
    g.rect(x - s, y - s, s * 2, s * 2).fill({ color: 0xaa5376, alpha: fade });
    g.rect(x - 3, y - s, 6, s * 2).fill({ color: 0xffe9ab, alpha: fade });
    g.rect(x - s - 2, y - s - 8 - t * R * 0.5, s * 2 + 4, 6).fill({
      color: 0xe6c48e,
      alpha: fade,
    });
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4,
        px = x + Math.cos(a) * R * t,
        py = y + Math.sin(a) * R * t;
      g.poly([px - 3, py, px, py - 5, px + 3, py, px, py + 5]).fill({
        color: i % 2 ? 0xffdb9f : 0xd7edff,
        alpha: fade,
      });
    }
  } else if (id === 213) {
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 - t * 0.5,
        r = R * (0.3 + t * 0.8);
      g.moveTo(x + Math.cos(a - 0.5) * r, y + Math.sin(a - 0.5) * r)
        .quadraticCurveTo(
          x,
          y,
          x + Math.cos(a + 0.5) * r,
          y + Math.sin(a + 0.5) * r,
        )
        .stroke({ color: 0xff5e8a, width: 5 * fade + 1, alpha: fade });
    }
    g.circle(x, y, 8).fill({ color: 0xffe0db, alpha: fade });
  } else if (id === 211) {
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5,
        r = R * (0.25 + t * 0.75);
      g.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r)
        .lineTo(
          x + Math.cos(a + (4 * Math.PI) / 5) * r,
          y + Math.sin(a + (4 * Math.PI) / 5) * r,
        )
        .stroke({ color: 0xc2edff, width: 3 * fade + 1, alpha: fade });
    }
    g.circle(x, y, 10 * fade).fill({ color: 0xf7ffff, alpha: fade });
  } else if (id === 201) {
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3,
        r = R * (0.7 + t * 0.2),
        px = x + Math.cos(a) * r,
        py = y + Math.sin(a) * r;
      g.poly([
        px - 6,
        py - 12,
        px + 6,
        py - 12,
        px + 10,
        py + 6,
        px,
        py + 14,
        px - 10,
        py + 6,
      ])
        .fill({ color: 0xa85342, alpha: fade * 0.45 })
        .stroke({ color: 0xffbd77, width: 3, alpha: fade });
    }
    g.moveTo(x - 12, y)
      .lineTo(x, y - 22)
      .lineTo(x + 12, y)
      .stroke({ color: 0xffefbc, width: 4, alpha: fade });
  } else if (id === 207) {
    g.poly([
      x - 18,
      y - 12,
      x,
      y - 24,
      x + 18,
      y - 12,
      x + 18,
      y + 14,
      x,
      y + 25,
      x - 18,
      y + 14,
    ])
      .fill({ color: 0x233c6a, alpha: fade })
      .stroke({ color: 0x77caff, width: 2, alpha: fade });
    g.moveTo(x + 3, y - 17)
      .lineTo(x - 8, y)
      .lineTo(x + 7, y - 3)
      .lineTo(x - 4, y + 18)
      .stroke({ color: 0xe5faff, width: 4, alpha: fade });
  } else return false;
  return true;
}
