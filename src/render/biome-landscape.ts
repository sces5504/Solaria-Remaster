import type { Graphics } from "pixi.js";
import type { Run } from "../game/core/types";
import { currentBiome } from "../game/data/biomes";
export function biomeLandscape(g: Graphics, r: Run) {
  const b = currentBiome(r),
    id = r.biome!,
    [ground, path, light] = b.palette;
  g.clear()
    .rect(0, 0, 1024, 640)
    .fill(0x101b2a)
    .rect(32, 64, 960, 544)
    .fill(ground);
  const noise = (i: number) => {
    const n = Math.sin(i * 127.1 + r.seed * 0.13 + r.room * 11) * 43758.54;
    return n - Math.floor(n);
  };
  for (let i = 0; i < 200; i++) {
    const x = 40 + noise(i * 3) * 944,
      y = 72 + noise(i * 3 + 1) * 520,
      size = 6 + noise(i * 3 + 2) * 16;
    if (id === "desert") {
      g.moveTo(x - size, y + 5)
        .quadraticCurveTo(x, y - 7, x + size * 2, y)
        .stroke({ color: path, width: 2, alpha: 0.15 });
      if (i % 7 === 0)
        g.poly([x, y, x + 5, y - 4, x + 12, y + 2]).fill({
          color: light,
          alpha: 0.25,
        });
    } else if (id === "icefield") {
      g.moveTo(x - size, y)
        .lineTo(x, y + 7)
        .lineTo(x + size, y - 4)
        .stroke({ color: light, width: 1, alpha: 0.17 });
      if (i % 4 === 0)
        g.poly([
          x,
          y,
          x + size,
          y - 4,
          x + size * 1.5,
          y + 4,
          x + 4,
          y + 7,
        ]).fill({ color: path, alpha: 0.12 });
    } else if (id === "volcano") {
      g.moveTo(x - size, y)
        .lineTo(x, y + size / 2)
        .lineTo(x + size, y - 2)
        .stroke({
          color: i % 4 === 0 ? 0xff9554 : 0x786371,
          width: i % 4 === 0 ? 2 : 1,
          alpha: 0.25,
        });
    } else if (id === "jungle") {
      g.moveTo(x, y + 8)
        .quadraticCurveTo(x + size, y - size, x + size * 2, y + size)
        .stroke({ color: path, width: 3, alpha: 0.2 });
      if (i % 3 === 0)
        g.poly([x, y, x - 6, y - 7, x + 7, y - 4, x + 3, y + 2]).fill({
          color: light,
          alpha: 0.22,
        });
    } else if (id === "corruption") {
      g.moveTo(x, y)
        .lineTo(x + 4, y - size)
        .lineTo(x + size, y - size / 2)
        .lineTo(x + size * 1.4, y - size * 1.2)
        .stroke({ color: path, width: 2, alpha: 0.2 });
      if (i % 5 === 0)
        g.ellipse(x, y, size, 3).fill({ color: 0x19152e, alpha: 0.5 });
    } else if (id === "crimson") {
      g.moveTo(x - size, y - size)
        .lineTo(x, y)
        .lineTo(x + size, y - size / 2)
        .stroke({ color: path, width: 2, alpha: 0.22 });
      g.moveTo(x, y)
        .lineTo(x - 3, y + size)
        .stroke({ color: 0xff98a7, width: 1, alpha: 0.12 });
    } else if (id === "stars") {
      g.circle(x, y, i % 5 === 0 ? 2 : 1).fill({
        color: light,
        alpha: 0.3 + noise(i) * 0.5,
      });
      if (i % 15 === 0)
        g.ellipse(x, y, 48, 12).fill({ color: path, alpha: 0.025 });
    }
  }
  if (id === "castle")
    for (let y = 64; y < 608; y += 32)
      for (let x = 32; x < 992; x += 64) {
        const offset = ((y / 32) % 2) * 32;
        g.rect(x + offset, y, 62, 30).fill({ color: path, alpha: 0.065 });
        g.moveTo(x + offset + 3, y + 3)
          .lineTo(x + offset + 59, y + 3)
          .stroke({ color: light, width: 1, alpha: 0.11 });
      }
  const route = r.route ?? [
    { x: 112, y: 320 },
    { x: 928, y: 320 },
  ];
  for (let i = 1; i < route.length; i++)
    g.moveTo(route[i - 1].x, route[i - 1].y)
      .lineTo(route[i].x, route[i].y)
      .stroke({ color: path, width: id === "castle" ? 60 : 44, alpha: 0.1 });
  for (let x = 32; x < 992; x += 32) {
    g.poly([x, 64, x + 25, 64, x + 30, 77, x + 5, 82]).fill({
      color: path,
      alpha: 0.2,
    });
    g.rect(x, 606, 25, 2).fill({ color: light, alpha: 0.22 });
  }
}
