import type { Graphics } from "pixi.js";
import type { Run } from "../game/core/types";
import { random, seedFor } from "../game/core/primitives";
export function solarLandscape(g: Graphics, r: Run) {
  if (r.room !== 31) return;
  const rng = { rng: seedFor(r.seed, 9300 + (r.loop ?? 1)) };
  g.clear()
    .rect(0, 0, 1024, 640)
    .fill(0x111728)
    .roundRect(32, 64, 960, 544, 16)
    .fill(0x343241)
    .stroke({ color: 0x9a8b73, width: 4 });
  for (let y = 64; y < 608; y += 32)
    for (let x = 32; x < 992; x += 48)
      g.rect(x + 1, y + 1, 46, 30).fill({
        color: random(rng) < 0.35 ? 0x484251 : 0x302f40,
        alpha: 0.5,
      });
  for (const radius of [94, 178, 246]) {
    g.ellipse(512, 336, radius, radius * 0.7).stroke({
      color: 0x686075,
      width: 1,
      alpha: 0.15,
    });
    for (let segment = 0; segment < 12; segment++) {
      const start = (segment * Math.PI) / 6 + 0.04;
      g.moveTo(512 + Math.cos(start) * radius, 320 + Math.sin(start) * radius)
        .arc(512, 320, radius, start, start + 0.38)
        .stroke({
          color: radius === 178 ? 0xbbae89 : 0x867c79,
          width: radius === 178 ? 4 : 2,
          alpha: 0.5,
        });
      const a = start + 0.2,
        x = 512 + Math.cos(a) * radius,
        y = 320 + Math.sin(a) * radius;
      g.poly([
        x + Math.cos(a) * 8,
        y + Math.sin(a) * 8,
        x - Math.sin(a) * 3,
        y + Math.cos(a) * 3,
        x - Math.cos(a) * 8,
        y - Math.sin(a) * 8,
        x + Math.sin(a) * 3,
        y - Math.cos(a) * 3,
      ]).stroke({ color: 0xdac796, width: 1, alpha: 0.55 });
    }
  }
  // A clear east-west approach remains readable through the damaged sun dial.
  g.moveTo(48, 320)
    .lineTo(976, 320)
    .stroke({ color: 0xc4ad89, width: 40, alpha: 0.06 })
    .moveTo(48, 300)
    .lineTo(976, 300)
    .moveTo(48, 340)
    .lineTo(976, 340)
    .stroke({ color: 0x756b65, width: 1, alpha: 0.4 });
  for (let i = 0; i < 80; i++) {
    const x = 60 + random(rng) * 904,
      y = 88 + random(rng) * 496;
    if (Math.abs(y - 320) < 35) continue;
    const a = random(rng) * Math.PI,
      length = 4 + random(rng) * 14;
    g.moveTo(x, y)
      .lineTo(x + Math.cos(a) * length, y + Math.sin(a) * length)
      .lineTo(
        x + Math.cos(a + 0.7) * length * 1.5,
        y + Math.sin(a + 0.7) * length * 1.5,
      )
      .stroke({ color: 0x151a2d, width: 1, alpha: 0.5 });
  }
  for (const p of [
    { x: 240, y: 160 },
    { x: 840, y: 160 },
    { x: 240, y: 480 },
    { x: 840, y: 480 },
  ]) {
    g.poly([p.x - 30, p.y, p.x, p.y - 30, p.x + 30, p.y, p.x, p.y + 30])
      .fill({ color: 0x594859, alpha: 0.5 })
      .stroke({ color: 0xb6a48c, width: 2, alpha: 0.55 });
    for (let tooth = 0; tooth < 4; tooth++) {
      const a = (tooth * Math.PI) / 2;
      g.moveTo(p.x + Math.cos(a) * 18, p.y + Math.sin(a) * 18)
        .lineTo(p.x + Math.cos(a) * 24, p.y + Math.sin(a) * 24)
        .stroke({ color: 0xe1cea0, width: 3, alpha: 0.7 });
    }
  }
}
