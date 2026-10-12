import type { SerpentineProjectile } from "../../src/game/systems/monster-details";
import { it, expect } from "vitest";
import { newRun } from "../../src/game/core/run";
import { shoot, context } from "../../src/game/systems/combat";
import {
  pooledProjectile,
  retireProjectile,
  inspectProjectilePool,
} from "../../src/game/systems/projectile-pool";
it("子彈退役清除所有可選來源與尋敵欄位，不殘留上一發副鏈且不進存檔", () => {
  const r = newRun("mage", 701);
  shoot(r, r.player, 0, 10, 200, 500, context(r, 50, "basic"));
  const first = r.projectiles.pop()! as SerpentineProjectile;
  first.homingTarget = 9;
  first.bossAttackId = "old";
  first.sine = { direction: 1, speed: 200, travel: 10, phase: 0.2 };
  const expected = { ...first, id: 999, context: context(r, 41, "basic") };
  delete expected.homingTarget;
  delete expected.bossAttackId;
  delete expected.sine;
  const created = inspectProjectilePool(r).created;
  retireProjectile(r, first);
  const next = pooledProjectile(r, expected) as SerpentineProjectile;
  expect(next).toBe(first);
  expect(next.homingTarget).toBeUndefined();
  expect(next.bossAttackId).toBeUndefined();
  expect(next.sine).toBeUndefined();
  expect(next.context?.sourceAbilityId).toBe(41);
  expect(inspectProjectilePool(r)).toEqual({ cached: 0, created });
  expect(JSON.stringify(r)).not.toContain('"free"');
});
