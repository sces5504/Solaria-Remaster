import type { Graphics } from "pixi.js";
import type { Projectile } from "../game/core/types";
export function bossProjectile(
  g: Graphics,
  b: Projectile & { bossAttackId?: string },
  time: number,
) {
  if (!b.enemy || !b.bossAttackId || b.eventGlyph) return false;
  const { x, y } = b,
    a = Math.atan2(b.vy, b.vx),
    theme = b.enemyTheme;
  const p = (f: number, s: number) => [
    x + Math.cos(a) * f - Math.sin(a) * s,
    y + Math.sin(a) * f + Math.cos(a) * s,
  ];
  if (theme === "icefield") {
    const spear = /spear|shard|block/.test(b.bossAttackId),
      length = spear ? 18 : 9;
    g.poly([...p(length, 0), ...p(0, -6), ...p(-length, 0), ...p(0, 6)])
      .fill(0x90dafa)
      .stroke({ color: 0xf4ffff, width: 2 });
    g.moveTo(...(p(-length + 3, 0) as [number, number]))
      .lineTo(...(p(length - 2, 0) as [number, number]))
      .stroke({ color: 0xffffff, width: 2 });
  } else if (theme === "desert") {
    g.poly([...p(11, 0), ...p(-7, -7), ...p(-3, 0), ...p(-7, 7)])
      .fill(0xdcb374)
      .stroke({ color: 0xfff1c5, width: 2 });
    g.poly([...p(5, 0), ...p(-3, -3), ...p(-1, 0), ...p(-3, 3)]).fill(0xfff6cf);
  } else if (theme === "volcano") {
    g.moveTo(x, y)
      .quadraticCurveTo(
        x - Math.cos(a) * 30 + 4 * Math.sin(time * 15),
        y - Math.sin(a) * 30 - 8,
        x - Math.cos(a) * 34,
        y - Math.sin(a) * 34,
      )
      .stroke({ color: 0xe55f43, width: 10, alpha: 0.45 });
    g.poly([...p(9, 0), ...p(1, -6), ...p(-7, -5), ...p(-8, 4), ...p(0, 7)])
      .fill(0xffa469)
      .stroke({ color: 0xffe8a9, width: 2 });
  } else if (theme === "jungle") {
    g.poly([...p(12, 0), ...p(-6, -7), ...p(-10, 0), ...p(-6, 7)])
      .fill(0xafd481)
      .stroke({ color: 0xe8f5b6, width: 2 });
    g.moveTo(...(p(-8, 0) as [number, number]))
      .lineTo(...(p(8, 0) as [number, number]))
      .stroke({ color: 0x4d6958, width: 2 });
    g.poly([...p(-2, 0), ...p(-4, 11), ...p(4, 6)]).fill(0x88b16b);
  } else if (theme === "corruption") {
    g.ellipse(x, y, 11, 7).fill(0xb6a8e4).stroke({ color: 0xe9d9ff, width: 2 });
    g.circle(x + Math.cos(a) * 3, y + Math.sin(a) * 3, 4)
      .fill(0x382b65)
      .circle(x + Math.cos(a) * 5, y + Math.sin(a) * 5, 1.5)
      .fill(0xffffff);
    for (const s of [-1, 1])
      g.moveTo(...(p(-4, s * 4) as [number, number]))
        .quadraticCurveTo(
          ...([...p(-13, s * 10), ...p(-21, s * 3)] as [
            number,
            number,
            number,
            number,
          ]),
        )
        .stroke({ color: 0x9d90c8, width: 2, alpha: 0.6 });
  } else if (theme === "crimson") {
    g.poly([...p(15, 0), ...p(-10, -4), ...p(-3, 0), ...p(-10, 4)])
      .fill(0xeb637a)
      .stroke({ color: 0xffcece, width: 2 });
    g.circle(x - Math.cos(a) * 13, y - Math.sin(a) * 13, 3).fill(0xb13760);
  } else if (theme === "castle") {
    g.poly([
      ...p(15, 0),
      ...p(-7, -4),
      ...p(-10, -7),
      ...p(-14, -3),
      ...p(-8, 0),
      ...p(-14, 3),
      ...p(-10, 7),
      ...p(-7, 4),
    ])
      .fill(0xd9d3ba)
      .stroke({ color: 0xfff3d9, width: 2 });
  } else if (theme === "stars" || theme === "sun") {
    const r = theme === "sun" ? 9 : 7,
      n = theme === "sun" ? 8 : 5,
      points: number[] = [];
    for (let i = 0; i < n * 2; i++) {
      const q = (i * Math.PI) / n + time * 0.8,
        rad = i % 2 ? r * 0.45 : r;
      points.push(x + Math.cos(q) * rad, y + Math.sin(q) * rad);
    }
    g.poly(points)
      .fill(theme === "sun" ? 0xffda8e : 0xb5dcff)
      .stroke({ color: 0xffffff, width: 2 });
  } else return false;
  return true;
}
