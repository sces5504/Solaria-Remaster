import type { Graphics } from "pixi.js";
import type { Projectile } from "../game/core/types";
export function equipmentProjectile(g: Graphics, b: Projectile, time: number) {
  const id = b.context?.sourceAbilityId;
  if (!id || ![75, 206, 217].includes(id)) return false;
  const a = Math.atan2(b.vy, b.vx),
    x = b.x,
    y = b.y;
  const point = (f: number, s: number) => [
    x + Math.cos(a) * f - Math.sin(a) * s,
    y + Math.sin(a) * f + Math.cos(a) * s,
  ];
  if (id === 206) {
    const points: number[] = [];
    for (let i = 0; i < 10; i++) {
      const theta = a + (i * Math.PI) / 5,
        r = i % 2 ? 5 : 12;
      points.push(x + Math.cos(theta) * r, y + Math.sin(theta) * r);
    }
    g.poly(points)
      .fill({ color: 0xa7cbec, alpha: 0.85 })
      .stroke({ color: 0xf4fbff, width: 1.5 });
    g.moveTo(...(point(-35, 0) as [number, number]))
      .quadraticCurveTo(
        ...([...point(-18, -9), ...point(10, 0)] as [
          number,
          number,
          number,
          number,
        ]),
      )
      .stroke({ color: 0x8fb9e4, width: 4, alpha: 0.45 });
    g.circle(x, y, 3).fill({ color: 0xffffff });
  } else if (id === 217) {
    const points = [
      ...point(16, 0),
      ...point(-3, -5),
      ...point(-15, -3),
      ...point(-15, 3),
      ...point(-3, 5),
    ];
    g.poly(points)
      .fill({ color: 0xd9eadb, alpha: 0.85 })
      .stroke({ color: 0x88cbaa, width: 2 });
    g.moveTo(...(point(-12, -9) as [number, number]))
      .lineTo(...(point(-12, 9) as [number, number]))
      .stroke({ color: 0xf7df9b, width: 3 });
    g.moveTo(...(point(-13, 0) as [number, number]))
      .lineTo(...(point(-23, 0) as [number, number]))
      .stroke({ color: 0xbce2c9, width: 3 });
    g.poly([
      ...point(-25, -9),
      ...point(-11, -5),
      ...point(8, 0),
      ...point(-11, 5),
      ...point(-25, 9),
    ]).fill({ color: 0x58b49d, alpha: 0.12 });
  } else {
    for (let i = 0; i < 3; i++) {
      const offset = i * 6 - 6;
      g.moveTo(...(point(-30, offset) as [number, number]))
        .quadraticCurveTo(
          ...([
            ...point(-15, offset + Math.sin(time * 8 + i) * 7),
            ...point(7, 0),
          ] as [number, number, number, number]),
        )
        .stroke({
          color: i === 1 ? 0xffffe7 : 0xbcaffe,
          width: 3 - i * 0.5,
          alpha: 1 - i * 0.2,
        });
    }
    g.poly([
      ...point(15, 0),
      ...point(-5, -8),
      ...point(-1, 0),
      ...point(-5, 8),
    ]).fill({ color: 0xe6ddff, alpha: 0.9 });
  }
  return true;
}
