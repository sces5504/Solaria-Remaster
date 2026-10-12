import type { Graphics } from "pixi.js";
import type { Visual } from "../game/core/types";
import { elementColors } from "./effects";
export function advancedEffect(g: Graphics, v: Visual, time: number) {
  const t = Math.max(
      0,
      Math.min(1, 1 - (v.until - time) / (v.duration ?? 0.5)),
    ),
    fade = 1 - t;
  if (v.kind === "ghost") {
    for (let i = 0; i < 3; i++) {
      const a = v.angle - (1 - t) * 0.9 + i * 0.08,
        r = v.radius * (0.45 + i * 0.2),
        x = v.x + Math.cos(a) * r,
        y = v.y + Math.sin(a) * r;
      g.poly([
        x - 8,
        y + 16,
        x - 11,
        y - 8,
        x,
        y - 23,
        x + 11,
        y - 8,
        x + 8,
        y + 16,
        x,
        y + 11,
      ]).fill({ color: 0x706ea0, alpha: fade * (0.35 - i * 0.08) });
      g.moveTo(v.x + Math.cos(a - 0.4) * r, v.y + Math.sin(a - 0.4) * r)
        .quadraticCurveTo(
          x + Math.cos(a) * 18,
          y + Math.sin(a) * 18,
          v.x + Math.cos(a + 0.4) * r,
          v.y + Math.sin(a + 0.4) * r,
        )
        .stroke({
          color: i === 1 ? 0xffffff : 0xc9c9ff,
          width: 4 - i,
          alpha: fade,
        });
    }
    return true;
  }
  if (v.kind === "resonance") {
    for (let i = 0; i < 2; i++) {
      const a = t * Math.PI * 2 + i * Math.PI,
        r = v.radius * (0.5 + t * 0.4),
        color = elementColors[v.elements?.[i] ?? "water"];
      g.moveTo(v.x + Math.cos(a) * r, v.y + Math.sin(a) * r)
        .quadraticCurveTo(
          v.x + Math.cos(a + 0.6) * r * 1.4,
          v.y + Math.sin(a + 0.6) * r * 1.4,
          v.x + Math.cos(a + 1.2) * r,
          v.y + Math.sin(a + 1.2) * r,
        )
        .stroke({ color, width: 6 * fade + 1, alpha: fade });
      g.poly([
        v.x,
        v.y - 15 * fade,
        v.x + 5 * fade,
        v.y,
        v.x,
        v.y + 15 * fade,
        v.x - 5 * fade,
        v.y,
      ]).fill({ color: 0xfff8d6, alpha: fade });
    }
    return true;
  }
  if (v.kind === "relic") {
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3 + t * 0.5,
        r = v.radius * (0.6 + t * 0.3),
        x = v.x + Math.cos(a) * r,
        y = v.y + Math.sin(a) * r;
      g.poly([
        x - 5,
        y + 8,
        x - 5,
        y - 8,
        x,
        y - 13,
        x + 5,
        y - 8,
        x + 5,
        y + 8,
      ]).stroke({ color: 0xffe6a4, width: 2, alpha: fade });
      g.moveTo(x - 3, y)
        .lineTo(x + 3, y)
        .stroke({ color: 0xffffff, width: 2, alpha: fade });
    }
    return true;
  }
  return false;
}
