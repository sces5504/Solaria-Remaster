import type { Graphics } from "pixi.js";
import type { Actor, Mode, Run } from "../game/core/types";
import { biomes, currentBiome } from "../game/data/biomes";
export function bossTelegraph(g: Graphics, r: Run, e: Actor, m: Mode): boolean {
  const attack = m.bossAttack;
  if (!attack) return false;
  const color = e.solarisBar
    ? 0xffe2a0
    : (r.event ? biomes[r.event.theme] : currentBiome(r)).palette[2];
  const alpha = 0.5 + 0.2 * Math.sin(r.time * 12);
  const line = (x1: number, y1: number, x2: number, y2: number, width = 2) =>
    g.moveTo(x1, y1).lineTo(x2, y2).stroke({ color, width, alpha });
  const local = (forward: number, side: number) => ({
    x: e.x + Math.cos(m.angle) * forward - Math.sin(m.angle) * side,
    y: e.y + Math.sin(m.angle) * forward + Math.cos(m.angle) * side,
  });
  if (attack.pattern === "rush") {
    const length = (attack.rushSpeed ?? 350) * (attack.rushTime ?? 0.8),
      width = e.radius + 8;
    const pts = [
      local(0, -width),
      local(length, -width),
      local(length + 24, 0),
      local(length, width),
      local(0, width),
    ];
    g.poly(pts.flatMap((p) => [p.x, p.y]))
      .fill({ color, alpha: 0.07 })
      .stroke({ color, width: 2, alpha });
    for (let i = 1; i <= 3; i++) {
      const a = local((i * length) / 4, -10),
        b = local((i * length) / 4 + 12, 0),
        c = local((i * length) / 4, 10);
      line(a.x, a.y, b.x, b.y);
      line(b.x, b.y, c.x, c.y);
    }
    return true;
  }
  if (attack.pattern === "slash" || attack.pattern === "fan") {
    const radius = attack.pattern === "slash" ? attack.radius : 95;
    const width = (attack.spread * Math.PI) / 180;
    const pts = [e.x, e.y];
    for (let i = 0; i <= 24; i++) {
      const a = m.angle - width / 2 + (width * i) / 24;
      pts.push(e.x + Math.cos(a) * radius, e.y + Math.sin(a) * radius);
    }
    g.poly(pts).fill({ color, alpha: 0.06 }).stroke({ color, width: 2, alpha });
    for (let i = 0; i < (attack.pattern === "fan" ? attack.shots : 3); i++) {
      const a =
        m.angle -
        width / 2 +
        (width * (i + 0.5)) / (attack.pattern === "fan" ? attack.shots : 3);
      line(
        e.x + Math.cos(a) * 25,
        e.y + Math.sin(a) * 25,
        e.x + Math.cos(a) * radius,
        e.y + Math.sin(a) * radius,
        1,
      );
    }
    return true;
  }
  if (attack.pattern === "spiral") {
    for (let arm = 0; arm < attack.arms; arm++) {
      for (let i = 1; i <= 24; i++) {
        const a = m.angle + (arm * Math.PI * 2) / attack.arms + i * 0.1,
          prev = a - 0.1,
          rad = 22 + i * 2.3;
        line(
          e.x + Math.cos(prev) * (rad - 2.3),
          e.y + Math.sin(prev) * (rad - 2.3),
          e.x + Math.cos(a) * rad,
          e.y + Math.sin(a) * rad,
          2,
        );
      }
    }
    return true;
  }
  if (attack.pattern === "ring") {
    for (let i = 0; i < attack.shots; i++) {
      const a = (i * Math.PI * 2) / attack.shots,
        radius = e.radius + 20,
        x = e.x + Math.cos(a) * radius,
        y = e.y + Math.sin(a) * radius;
      g.poly([
        x + Math.cos(a) * 8,
        y + Math.sin(a) * 8,
        x - Math.sin(a) * 4,
        y + Math.cos(a) * 4,
        x - Math.cos(a) * 4,
        y - Math.sin(a) * 4,
        x + Math.sin(a) * 4,
        y - Math.cos(a) * 4,
      ]).stroke({ color, width: 2, alpha });
    }
    return true;
  }
  if (attack.pattern === "cross" || attack.pattern === "rows") {
    const groups = attack.pattern === "cross" ? 4 : 2;
    for (let i = 0; i < groups; i++) {
      const a = m.angle + (attack.pattern === "cross" ? (i * Math.PI) / 2 : 0),
        offset = attack.pattern === "rows" ? (i - 0.5) * 32 : 0;
      for (let j = -1; j <= 1; j++) {
        const x = e.x - Math.sin(a) * (offset + j * 10),
          y = e.y + Math.cos(a) * (offset + j * 10);
        line(
          x + Math.cos(a) * 30,
          y + Math.sin(a) * 30,
          x + Math.cos(a) * 95,
          y + Math.sin(a) * 95,
          1,
        );
      }
    }
    return true;
  }
  if (["mark", "burrow", "teleport", "field"].includes(attack.pattern)) {
    const x = m.target.x,
      y = m.target.y,
      rad = attack.radius;
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2,
        px = x + Math.cos(a) * rad,
        py = y + Math.sin(a) * rad;
      line(px - Math.sin(a) * 9, py + Math.cos(a) * 9, px, py);
      line(px, py, px + Math.cos(a) * 10, py + Math.sin(a) * 10);
    }
    if (attack.pattern === "burrow")
      for (let i = 0; i < 3; i++) {
        const a = m.angle + (i * Math.PI * 2) / 3;
        g.poly([
          x + Math.cos(a) * 22,
          y + Math.sin(a) * 22,
          x + Math.cos(a + 0.15) * rad * 0.6,
          y + Math.sin(a + 0.15) * rad * 0.6,
          x + Math.cos(a - 0.15) * rad * 0.6,
          y + Math.sin(a - 0.15) * rad * 0.6,
        ]).stroke({ color, width: 2, alpha });
      }
    else {
      line(x - 10, y, x + 10, y);
      line(x, y - 10, x, y + 10);
    }
    return true;
  }
  if (attack.pattern === "summon" || attack.pattern === "heal") {
    for (let i = 0; i < attack.groups; i++) {
      const a = (i * Math.PI * 2) / attack.groups,
        x = e.x + Math.cos(a) * 60,
        y = e.y + Math.sin(a) * 45;
      g.poly([
        x - 10,
        y + 10,
        x - 10,
        y - 10,
        x,
        y - 20,
        x + 10,
        y - 10,
        x + 10,
        y + 10,
      ]).stroke({ color, width: 2, alpha });
      line(x - 5, y, x + 5, y);
      line(x, y - 5, x, y + 5);
    }
    return true;
  }
  // Mines and beams have precise world-area warnings, drawn by their area renderer.
  return true;
}
