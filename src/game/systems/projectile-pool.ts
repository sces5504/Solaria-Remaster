import type { Projectile, Run } from "../core/types";
interface Pool {
  free: Projectile[];
  created: number;
}
const pools = new WeakMap<Run, Pool>();
function pool(r: Run) {
  let p = pools.get(r);
  if (!p) {
    p = { free: [], created: 0 };
    pools.set(r, p);
  }
  return p;
}
export function pooledProjectile(r: Run, initial: Projectile): Projectile {
  const p = pool(r),
    value = p.free.pop();
  if (!value) {
    p.created++;
    return initial;
  }
  return Object.assign(value, initial);
}
// Retirement is delayed until the entire tick's contact queue drains, so a
// new emission can never mutate a projectile referenced by an earlier event.
export function retireProjectile(r: Run, value: Projectile) {
  const p = pool(r);
  if (p.free.length >= 1024) return;
  for (const key of Object.keys(value))
    delete (value as unknown as Record<string, unknown>)[key];
  p.free.push(value);
}
export function retireRoomProjectiles(r: Run) {
  for (const value of r.projectiles) retireProjectile(r, value);
  r.projectiles = [];
}
export function inspectProjectilePool(r: Run) {
  const p = pools.get(r);
  return { cached: p?.free.length ?? 0, created: p?.created ?? 0 };
}
