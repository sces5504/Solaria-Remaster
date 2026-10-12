import type { Graphics } from "pixi.js";
import type { Vec } from "../game/core/primitives";
// A walkable laser mechanism is an engraved floor seal, never a solid column.
export function castleStatueMark(g: Graphics, h: Vec, pulse: number) {
  g.poly([h.x - 27, h.y, h.x, h.y - 19, h.x + 27, h.y, h.x, h.y + 19])
    .fill({ color: 0x30283b, alpha: 0.85 })
    .stroke({ color: 0xb49bcd, width: 2, alpha: 0.65 });
  g.poly([h.x - 20, h.y, h.x, h.y - 13, h.x + 20, h.y, h.x, h.y + 13]).stroke({
    color: 0x7e649c,
    width: 1,
    alpha: 0.6,
  });
  g.moveTo(h.x - 10, h.y - 5)
    .lineTo(h.x - 3, h.y - 1)
    .moveTo(h.x + 10, h.y - 5)
    .lineTo(h.x + 3, h.y - 1)
    .stroke({ color: 0xe4c8ff, width: 3, alpha: pulse });
  g.moveTo(h.x, h.y + 1)
    .lineTo(h.x, h.y + 9)
    .moveTo(h.x - 5, h.y + 9)
    .lineTo(h.x + 5, h.y + 9)
    .stroke({ color: 0xc09adb, width: 2, alpha: 0.75 });
  for (const side of [-1, 1])
    g.poly([
      h.x + side * 31,
      h.y - 4,
      h.x + side * 36,
      h.y,
      h.x + side * 31,
      h.y + 4,
    ]).fill({ color: 0xceb3ec, alpha: pulse * 0.8 });
}
