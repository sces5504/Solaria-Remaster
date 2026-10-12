import type { Graphics } from "pixi.js";
import type { Run } from "../game/core/types";

// Event landmarks use the carved layout's margins, preserving the combat route.
export function eventLandscape(g: Graphics, r: Run) {
  if (!r.event) return;
  const id = r.event.id;
  for (let i = 0; i < 8; i++) {
    const x = 190 + i * 95 + Math.sin(r.seed + i * 3) * 18;
    const y = i % 2 ? 534 : 132;
    if (id === "christmas") {
      g.rect(x - 3, y - 6, 6, 24).fill(0x674d49);
      for (let j = 0; j < 3; j++)
        g.poly([
          x - 26 + j * 5,
          y - j * 13,
          x,
          y - 46 - j * 9,
          x + 26 - j * 5,
          y - j * 13,
        ])
          .fill(0x225e64)
          .stroke({ color: 0xaee8f3, width: 3, alpha: 0.5 });
      g.rect(x + 13, y + 2, 18, 14)
        .fill(i % 2 ? 0xb5506b : 0x5484b4)
        .rect(x + 20, y + 2, 3, 14)
        .fill(0xfbe3a4);
    } else if (id === "bloodmoon") {
      g.poly([x - 20, y + 15, x - 8, y - 30, x + 4, y - 42, x + 20, y + 15])
        .fill(0x481f39)
        .stroke({ color: 0xca4765, width: 2, alpha: 0.65 });
      g.moveTo(x - 10, y + 13)
        .lineTo(x + 16, y - 12)
        .lineTo(x - 6, y - 2)
        .stroke({ color: 0xef7080, width: 3, alpha: 0.5 });
      g.ellipse(x, y + 18, 30, 7).fill({ color: 0xa72750, alpha: 0.25 });
    } else if (id === "halloween") {
      g.roundRect(x - 15, y - 32, 30, 47, 12)
        .fill(0x46505a)
        .stroke({ color: 0x748772, width: 2 });
      g.moveTo(x - 8, y - 15)
        .lineTo(x + 8, y - 15)
        .moveTo(x, y - 22)
        .lineTo(x, y + 2)
        .stroke({ color: 0x152d30, width: 4 });
      g.poly([x + 19, y + 10, x + 28, y - 2, x + 39, y + 10]).fill(0xd37b37);
      g.poly([x + 25, y + 8, x + 28, y + 3, x + 31, y + 8]).fill(0xfce691);
    } else if (id === "alien") {
      g.ellipse(x, y + 5, 34, 12)
        .fill(0x263e58)
        .stroke({ color: 0x76dce5, width: 2 });
      g.poly([
        x - 13,
        y - 17,
        x,
        y - 30,
        x + 13,
        y - 17,
        x + 13,
        y - 2,
        x - 13,
        y - 2,
      ])
        .fill(0x527d8c)
        .stroke({ color: 0xc0fdff, width: 2 });
      for (let j = 0; j < 3; j++)
        g.rect(x - 21 + j * 19, y + 4, 5, 3).fill(0x82eedc);
      g.moveTo(x, y - 11)
        .lineTo(x - 6, y + 1)
        .lineTo(x + 5, y - 2)
        .stroke({ color: 0x182938, width: 2 });
    } else if (id === "meteor") {
      g.ellipse(x, y, 34, 13)
        .fill(0x101b3f)
        .stroke({ color: 0x5b527b, width: 5 });
      g.poly([x - 13, y + 1, x - 4, y - 24, x + 13, y - 10, x + 10, y + 4])
        .fill(0x665268)
        .stroke({ color: 0xedb576, width: 2 });
      g.moveTo(x - 2, y - 16)
        .lineTo(x + 3, y - 6)
        .lineTo(x - 5, y + 1)
        .stroke({ color: 0xffd5a2, width: 3, alpha: 0.7 });
    } else {
      g.poly([x - 27, y + 15, x, y - 29, x + 27, y + 15])
        .fill(0x697153)
        .stroke({ color: 0xb6b78a, width: 2 });
      g.poly([x - 8, y + 15, x, y - 9, x + 8, y + 15]).fill(0x2a3736);
      g.moveTo(x + 31, y + 16)
        .lineTo(x + 31, y - 48)
        .stroke({ color: 0xa38b65, width: 3 });
      g.poly([x + 33, y - 47, x + 59, y - 40, x + 33, y - 25]).fill(0xb76647);
      g.moveTo(x + 40, y - 40)
        .lineTo(x + 50, y - 35)
        .stroke({ color: 0xe8d6a7, width: 2 });
    }
  }
  if (id === "bloodmoon")
    g.circle(859, 98, 23).fill(0x9d334e).circle(867, 92, 18).fill(0x511f39);
}
