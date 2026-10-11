import { it, expect } from "vitest";
import { newRun } from "../../src/game/core/run";
import { populate } from "../../src/game/data/world";
import {
  updateEnemies,
  updateModes,
  bossAttacks,
} from "../../src/game/systems/enemies";
import { updateProjectiles, updateAreas } from "../../src/game/systems/combat";
import { DT } from "../../src/game/core/primitives";
for (const boss of [1, 2])
  for (const phase of [1, 2] as const)
    it(`BOSS-${boss} 阶段 ${phase} 三招独立、预警与模式上限`, () => {
      const r = newRun("sword", 42);
      r.room = 5;
      r.boss = boss;
      populate(r);
      r.phase = "COMBAT";
      r.enemies[0].phase = phase;
      r.player.invulnerable = 1000;
      for (let i = 0; i < 900; i++) {
        r.time += DT;
        updateEnemies(r);
        expect(
          r.modes.filter((m) => m.actor === r.enemies[0].id).length,
        ).toBeLessThanOrEqual(2);
        updateModes(r);
        updateProjectiles(r, DT);
        updateAreas(r);
      }
      for (const id of bossAttacks[(boss + 5) as 6][phase - 1])
        expect(r.attackLog).toContain(id);
      expect(
        r.obstacles.some((o) => o.durability < o.maxDurability) ||
          r.projectiles.length > 0 ||
          r.enemies.length > 1 ||
          r.areas.length > 0,
      ).toBe(true);
    });
