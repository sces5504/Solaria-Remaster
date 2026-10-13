import type { Projectile, Run } from "../core/types";
import { enemyCoverSource } from "./cover";
export const BOSS_BARRAGE_MULTIPLIER = 0.95;
export function normalizeBossProjectileDamage(r: Run) {
  for (const p of r.projectiles) {
    if (
      !p.enemy ||
      p.bossDamageTuned ||
      (p.coverSource ?? enemyCoverSource(r, p.owner)) !== "boss"
    )
      continue;
    tuneBossProjectile(p);
  }
}
export function tuneBossProjectile(p: Projectile) {
  p.damage *= BOSS_BARRAGE_MULTIPLIER;
  p.explosionDamage *= BOSS_BARRAGE_MULTIPLIER;
  p.bossDamageTuned = true;
}
export const bossMeleeArea = (ability?: string) =>
  !!ability &&
  (ability.includes("leap") ||
    ["worm-burrow", "worm-double", "assassin-swap", "brain-shift"].includes(
      ability,
    ));
