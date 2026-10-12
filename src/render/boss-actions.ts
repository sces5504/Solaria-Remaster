import type { Graphics } from "pixi.js";
import type { Visual } from "../game/core/types";

// Attack identity survives the attacker and controls both shape and motion.
export function bossAction(g: Graphics, v: Visual, time: number): boolean {
  if (!v.enemy || v.kind !== "slash" || !v.eventAbility) return false;
  const id = v.eventAbility;
  if (
    !/dragon-breath|troll-slam|beast-tail|flower-vine|flower-lashes|whale-tail|regent-sweep|regent-heavy|solaris-flare/.test(
      id,
    )
  )
    return false;
  const duration = v.duration ?? 0.35;
  const t = Math.max(0, Math.min(1, 1 - (v.until - time) / duration));
  const fade = Math.pow(1 - t, 0.6);
  const point = (distance: number, angle: number): [number, number] => [
    v.x + Math.cos(angle) * distance,
    v.y + Math.sin(angle) * distance,
  ];
  const start = v.angle - v.value / 2;
  if (id === "dragon-breath") {
    // Cold breath advances in layers; crystalline teeth remain at the rim.
    for (let layer = 0; layer < 4; layer++) {
      const reach = v.radius * Math.min(1, t * 2 + 0.2 - layer * 0.12);
      if (reach <= 0) continue;
      for (let ray = 0; ray < 9; ray++) {
        const a = start + (v.value * ray) / 8;
        const [x, y] = point(reach, a);
        g.moveTo(...point(18, a))
          .lineTo(x, y)
          .stroke({
            color: layer % 2 ? 0xdfffff : 0x81bde8,
            width: 12 - layer * 2,
            alpha: fade * 0.35,
          });
        g.poly([
          x + Math.cos(a) * 9,
          y + Math.sin(a) * 9,
          x - Math.sin(a) * 4,
          y + Math.cos(a) * 4,
          x - Math.cos(a) * 7,
          y - Math.sin(a) * 7,
          x + Math.sin(a) * 4,
          y - Math.cos(a) * 4,
        ]).fill({ color: 0xf0ffff, alpha: fade });
      }
    }
  } else if (id.startsWith("flower-")) {
    // Three staggered thorn whips curl across the actual damage sector.
    for (let strand = 0; strand < 3; strand++) {
      const a = start + v.value * (t * 0.7 + 0.15) + strand * 0.13;
      const [x, y] = point(v.radius * (0.6 + 0.4 * t), a);
      const [cx, cy] = point(v.radius * 0.55, a - 0.35);
      g.moveTo(v.x, v.y)
        .quadraticCurveTo(cx, cy, x, y)
        .stroke({ color: 0x3f805c, width: 10, alpha: fade })
        .moveTo(v.x, v.y)
        .quadraticCurveTo(cx, cy, x, y)
        .stroke({ color: 0xe2ed9b, width: 3, alpha: fade });
      for (let tooth = 1; tooth < 5; tooth++) {
        const [px, py] = point((v.radius * tooth) / 5, a - 0.12);
        g.poly([
          px,
          py,
          px + Math.cos(a + 0.8) * 10,
          py + Math.sin(a + 0.8) * 10,
          px + Math.cos(a) * 5,
          py + Math.sin(a) * 5,
        ]).fill({ color: 0xd4d98d, alpha: fade });
      }
    }
  } else if (id === "whale-tail") {
    const a = start + v.value * t;
    const [x, y] = point(v.radius * 0.85, a);
    const [leftX, leftY] = point(v.radius, a - 0.23);
    const [rightX, rightY] = point(v.radius, a + 0.23);
    g.moveTo(...point(25, a))
      .quadraticCurveTo(leftX, leftY, x, y)
      .quadraticCurveTo(rightX, rightY, ...point(25, a))
      .fill({ color: 0xb3b3f2, alpha: fade * 0.7 })
      .stroke({ color: 0xf6e9ff, width: 2, alpha: fade });
    for (let wake = 0; wake < 3; wake++)
      g.moveTo(...point(v.radius * (0.65 + wake * 0.13), start))
        .arc(v.x, v.y, v.radius * (0.65 + wake * 0.13), start, a)
        .stroke({
          color: wake === 0 ? 0xffffff : 0xa0d4ff,
          width: 5 - wake,
          alpha: fade * (0.65 - wake * 0.15),
        });
    for (let spark = 0; spark < 6; spark++) {
      const [px, py] = point(v.radius * (0.5 + spark * 0.08), a - 0.15);
      g.circle(px, py, 2.5).fill({ color: 0xeafaff, alpha: fade });
    }
  } else if (id === "troll-slam" || id === "regent-heavy") {
    const [x, y] = point(v.radius * 0.65, v.angle);
    for (let crack = 0; crack < 7; crack++) {
      const a = (crack * Math.PI * 2) / 7 + v.angle;
      const reach = v.radius * (0.3 + t * 0.5);
      g.moveTo(x, y)
        .lineTo(
          x + Math.cos(a + 0.18) * reach * 0.5,
          y + Math.sin(a + 0.18) * reach * 0.5,
        )
        .lineTo(x + Math.cos(a) * reach, y + Math.sin(a) * reach)
        .stroke({
          color: id === "troll-slam" ? 0xb8eeff : 0xe5b8ff,
          width: 4 * (1 - t) + 1,
          alpha: fade,
        });
      g.poly([
        x + Math.cos(a) * reach,
        y + Math.sin(a) * reach,
        x + Math.cos(a) * reach + 4,
        y + Math.sin(a) * reach - 10 - 18 * t,
        x + Math.cos(a) * reach + 9,
        y + Math.sin(a) * reach,
      ]).fill({ color: 0xe9e3db, alpha: fade });
    }
    g.ellipse(x, y, 25 + 40 * t, 10 + 20 * t).stroke({
      color: 0xffffff,
      width: 4 * (1 - t),
      alpha: fade,
    });
  } else if (id === "solaris-flare") {
    for (let ray = 0; ray < 11; ray++) {
      const a = start + (v.value * ray) / 10;
      const reach = v.radius * (0.3 + Math.min(1, t * 2) * 0.7);
      const [x, y] = point(reach, a);
      g.moveTo(...point(20, a))
        .lineTo(x, y)
        .stroke({ color: 0xea7153, width: 12, alpha: fade * 0.5 })
        .moveTo(...point(25, a))
        .lineTo(x, y)
        .stroke({ color: 0xfff4b6, width: 4, alpha: fade });
      g.circle(x, y, 4).fill({ color: 0xffffff, alpha: fade });
    }
  } else {
    // A physical crescent: volcanic tail plates or a broad royal blade.
    const a = start + v.value * t;
    const inner = v.radius * 0.65;
    const [tx, ty] = point(v.radius, a),
      [bx, by] = point(inner, a - 0.18);
    g.moveTo(...point(inner, start))
      .arc(v.x, v.y, v.radius, start, a)
      .lineTo(bx, by)
      .arc(v.x, v.y, inner, a - 0.18, start, true)
      .closePath()
      .fill({
        color: id === "beast-tail" ? 0xff9b60 : 0xbab4e4,
        alpha: fade * 0.7,
      });
    g.moveTo(...point(v.radius, start))
      .arc(v.x, v.y, v.radius, start, a)
      .stroke({
        color: 0xfff2cb,
        width: 3,
        alpha: fade,
      });
    if (id === "beast-tail")
      for (let tooth = 0; tooth < 5; tooth++) {
        const q = start + ((a - start) * tooth) / 5;
        const [x, y] = point(v.radius, q);
        g.poly([
          x,
          y,
          ...point(v.radius + 11, q + 0.04),
          ...point(v.radius, q + 0.08),
        ]).fill({ color: 0x713e45, alpha: fade });
      }
    else
      g.moveTo(v.x, v.y)
        .lineTo(tx, ty)
        .stroke({ color: 0xf9f4e8, width: 7, alpha: fade });
  }
  return true;
}
