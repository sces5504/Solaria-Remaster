import { it, expect } from "vitest";
import { newRun, startRoom, idleCommand, step } from "../../src/game/core/run";
import { legal, lineBlocked } from "../../src/game/systems/geometry";
import { distance, angle } from "../../src/game/core/primitives";
for (const cls of ["sword", "bow", "mage"] as const)
  it(`${cls} 固定種子首房可用普通攻擊與職技清關，無免傷／改敵血`, () => {
    const r = newRun(cls, 23);
    startRoom(r);
    for (let tick = 0; tick < 18000 && r.phase === "COMBAT"; tick++) {
      const p = r.player,
        enemies = r.enemies
          .filter((e) => e.hp > 0)
          .sort((a, b) => distance(p, a) - distance(p, b)),
        e = enemies[0];
      let move = { x: 0, y: 0 };
      const target = e || r.reserves?.[0];
      if (target) {
        const a = angle(p, target),
          d = distance(p, target),
          wanted = cls === "sword" ? 65 : 230;
        const rush = r.modes.find(
          (m) =>
            (m.type === "rush" || m.type === "mark" || m.type === "slash") &&
            m.starts > r.time &&
            r.enemies.some((e) => e.id === m.actor && distance(e, p) < 250),
        );
        let ma = a + (d < wanted ? Math.PI : 0);
        if (rush) ma = rush.angle + Math.PI / 2;
        else if (d > wanted - 8 && d < wanted + 8) ma = a + Math.PI / 2;
        const candidates = Array.from(
          { length: 16 },
          (_, i) => ma + ((i % 2 ? -1 : 1) * Math.ceil(i / 2) * Math.PI) / 8,
        );
        const chosen = candidates.find(
          (t) =>
            legal(
              r,
              { x: p.x + Math.cos(t) * 22, y: p.y + Math.sin(t) * 22 },
              p.radius,
            ) &&
            r.enemies.every(
              (o) =>
                distance(o, {
                  x: p.x + Math.cos(t) * 12,
                  y: p.y + Math.sin(t) * 12,
                }) >
                o.radius + p.radius + 2,
            ),
        );
        if (chosen !== undefined)
          move = { x: Math.cos(chosen), y: Math.sin(chosen) };
      }
      step(r, {
        ...idleCommand(r),
        move,
        pointerWorld: target || { x: 700, y: 320 },
        attack: true,
        skill:
          p.skillReady <= r.time &&
          !!e &&
          (cls !== "sword" || distance(p, e) < 150),
        dodge: false,
      });
    }
    expect(
      r.phase,
      `${cls}: ${r.kills} kills, ${r.enemies.length} active/${r.reserves?.length} reserves, hp ${r.player.hp}`,
    ).toBe("UPGRADE_CHOICE");
    expect(r.player.hp).toBeGreaterThan(0);
  }, 120000);
