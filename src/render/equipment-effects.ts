import type { Graphics } from "pixi.js";
import { hasEquipment } from "../game/data/equipment";
import type { Run, Visual } from "../game/core/types";
// Equipment-specific overlays are composed with hit light, rather than substituting a recoloured blast.
export function equipmentEffect(g: Graphics, v: Visual, time: number) {
  if (v.kind !== "relic" || v.value < 201 || v.value > 218) return false;
  const t = Math.max(
      0,
      Math.min(1, 1 - (v.until - time) / (v.duration ?? 0.65)),
    ),
    fade = 1 - t,
    R = v.radius;
  const x = v.x,
    y = v.y,
    id = v.value;
  if (id === 202) {
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5,
        r = v.angle === 1 ? 18 + t * R : R * (1 - t) * 0.6 + 18,
        px = x + Math.cos(a) * r,
        py = y + Math.sin(a) * r;
      g.poly([
        px - 5,
        py - 9,
        px + 5,
        py - 8,
        px + 8,
        py + 3,
        px,
        py + 8,
        px - 7,
        py + 2,
      ])
        .fill({ color: 0x8fa4b5, alpha: fade })
        .stroke({ color: 0xf3e7be, width: 1.5, alpha: fade });
    }
  } else if (id === 203) {
    for (let i = 0; i < 4; i++) {
      const px = x + (i - 1.5) * 9 - t * R * 0.7,
        py = y + i * 4;
      g.poly([
        px - 5,
        py - 20,
        px + 5,
        py - 21,
        px + 9,
        py + 8,
        px + 1,
        py + 18,
        px - 6,
        py + 12,
      ]).fill({ color: i % 2 ? 0x8c78ad : 0xd8c4ef, alpha: fade * 0.45 });
      g.moveTo(px, py - 18)
        .lineTo(px + 2, py + 10)
        .stroke({ color: 0xe1c4ff, width: 2, alpha: fade });
    }
  } else if (id === 205) {
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + t,
        r = R * (0.6 + t * 0.4);
      g.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r)
        .lineTo(
          x + Math.cos(a + 0.3) * r * 0.7,
          y + Math.sin(a + 0.3) * r * 0.7,
        )
        .lineTo(
          x + Math.cos(a - 0.2) * r * 0.5,
          y + Math.sin(a - 0.2) * r * 0.5,
        )
        .stroke({ color: 0xebcfff, width: 3, alpha: fade });
    }
    g.poly([x - 6, y, x, y - 10, x + 6, y, x, y + 10]).fill({
      color: 0x925ed4,
      alpha: fade * 0.65,
    });
  } else if (id === 208) {
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3,
        r = R * t;
      g.poly([
        x + Math.cos(a) * r,
        y + Math.sin(a) * r - 6,
        x + Math.cos(a) * r + 3,
        y + Math.sin(a) * r,
        x + Math.cos(a) * r,
        y + Math.sin(a) * r + 6,
        x + Math.cos(a) * r - 3,
        y + Math.sin(a) * r,
      ]).fill({ color: 0xffeab2, alpha: fade });
    }
  } else if (id === 210) {
    const s = 16 * fade;
    g.poly([
      x - s,
      y - s - t * 18,
      x + s,
      y - s - t * 18,
      x + 3,
      y,
      x + s,
      y + s + t * 18,
      x - s,
      y + s + t * 18,
      x - 3,
      y,
    ]).stroke({ color: 0xffe8ad, width: 3, alpha: fade });
    for (let i = 0; i < 7; i++)
      g.circle(
        x + Math.sin(i * 1.2 + t) * R * t,
        y + Math.cos(i * 1.7 + t) * R * t,
        2,
      ).fill({ color: 0xffffd7, alpha: fade });
  } else if (id === 214) {
    const a = v.angle;
    for (let i = 0; i < 2; i++) {
      const theta = a - 0.8 + t * 1.6 + i * 0.1,
        r = R * (0.6 + i * 0.25);
      g.moveTo(
        x + Math.cos(theta - 0.4) * r * 0.3,
        y + Math.sin(theta - 0.4) * r * 0.3,
      )
        .quadraticCurveTo(
          x + Math.cos(theta - 0.2) * r,
          y + Math.sin(theta - 0.2) * r,
          x + Math.cos(theta + 0.5) * r,
          y + Math.sin(theta + 0.5) * r,
        )
        .stroke({
          color: i ? 0xffef9b : 0x709f6e,
          width: i ? 3 : 6,
          alpha: fade,
        });
    }
    g.poly([x - 4, y - 10, x + 6, y - 3, x + 3, y + 9, x - 7, y + 5]).fill({
      color: 0xffaf56,
      alpha: fade,
    });
  } else if (id === 216) {
    const fall = Math.max(0, 1 - t * 4),
      cy = y - fall * 140;
    for (let i = 0; i < 3; i++) {
      g.moveTo(x + (i - 1) * 7, cy - 65)
        .lineTo(x + (i - 1) * 3, cy + 8)
        .stroke({
          color: i === 1 ? 0xfff1bb : 0xffbb70,
          width: i === 1 ? 7 : 4,
          alpha: fade,
        });
    }
    g.poly([
      x - 14,
      cy - 12,
      x + 5,
      cy - 18,
      x + 17,
      cy - 2,
      x + 12,
      cy + 14,
      x - 9,
      cy + 17,
      x - 18,
      cy + 2,
    ])
      .fill({ color: 0xa49ca2, alpha: fade })
      .stroke({ color: 0xffdc8d, width: 3, alpha: fade });
    if (t > 0.15)
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4,
          r = R * Math.min(1, t * 1.7);
        const px = x + Math.cos(a) * r,
          py = y + Math.sin(a) * r;
        g.poly([px - 5, py, px, py - 8, px + 7, py, px, py + 4]).fill({
          color: i % 2 ? 0xffd997 : 0x94a6bc,
          alpha: fade,
        });
      }
    g.ellipse(x, y, R * t, R * t * 0.4).stroke({
      color: 0xffdcb1,
      width: 3 * fade,
      alpha: fade * 0.7,
    });
  } else if (id === 218) {
    for (let i = 0; i < 3; i++) {
      const u = Math.max(0, Math.min(1, t + i * 0.07)),
        px = x + Math.cos(v.angle) * R * u,
        py = y + Math.sin(v.angle) * R * u - Math.sin(u * Math.PI) * 14;
      g.poly([px, py - 5, px + 3, py, px, py + 4, px - 3, py]).fill({
        color: i === 1 ? 0xffdfd4 : 0xf696ad,
        alpha: fade,
      });
    }
  } else if (id === 204) {
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

export function equipmentAura(g: Graphics, r: Run) {
  const p = r.player,
    s = r.gear;
  if (!s) return;
  if (hasEquipment(r, "meteorArmor") && s.standingArmor) {
    for (const sign of [-1, 1])
      g.poly([
        p.x + sign * 17,
        p.y - 16,
        p.x + sign * 25,
        p.y - 8,
        p.x + sign * 23,
        p.y + 11,
        p.x + sign * 16,
        p.y + 17,
        p.x + sign * 14,
        p.y - 7,
      ])
        .fill({ color: 0x8b99a5, alpha: 0.5 })
        .stroke({ color: 0xe4d6a1, width: 1, alpha: 0.8 });
  }
  if (hasEquipment(r, "timeRing") && s.timeCharge) {
    const y = p.y - 42 - Math.sin(r.time * 3) * 2;
    g.poly([
      p.x - 5,
      y - 8,
      p.x + 5,
      y - 8,
      p.x + 1,
      y,
      p.x + 5,
      y + 8,
      p.x - 5,
      y + 8,
      p.x - 1,
      y,
    ]).stroke({ color: 0xffecb6, width: 2 });
    g.circle(p.x, y + 4, 2).fill({ color: 0xfffbe9 });
  }
  if (hasEquipment(r, "voidCloth") && s.voidUntil > r.time) {
    for (let i = 0; i < 3; i++) {
      const x = p.x - 15 - i * 8,
        y = p.y + Math.sin(r.time * 12 + i) * 3;
      g.poly([
        x - 4,
        y - 16,
        x + 4,
        y - 16,
        x + 7,
        y + 11,
        x,
        y + 18,
        x - 6,
        y + 10,
      ]).fill({ color: 0xa899cb, alpha: 0.25 - i * 0.06 });
    }
  }
}
