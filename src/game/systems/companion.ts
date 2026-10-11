import type { Run, Player, Element } from "../core/types";
import { clone, DT, angle, distance, random } from "../core/primitives";
import { hasEquipment } from "../data/equipment";
import { move, lineBlocked } from "./geometry";
import { cone, context, visual } from "./combat";
export interface Pumpkin extends Player {
  id: number;
  downUntil: number;
  maximum: number;
  equippedId: string;
}
type CompanionRun = Run & { companion?: Pumpkin };
export function pumpkin(run: Run) {
  return (run as CompanionRun).companion;
}
export function syncPumpkin(run: Run) {
  const r = run as CompanionRun;
  if (!hasEquipment(r, "ghostArmor")) {
    r.companion = undefined;
    return;
  }
  const id = r.equipment.armor!.id;
  if (r.companion?.equippedId === id) return;
  r.companion = {
    ...clone(r.player),
    id: r.nextId++,
    maximum: r.stats.maxHP * 3,
    hp: r.stats.maxHP * 3,
    equippedId: id,
    radius: 16,
    x: r.player.x - 25,
    y: r.player.y,
    downUntil: 0,
    attackNext: r.time,
    shields: [],
    blockUntil: 0,
    blockHit: false,
    invulnerable: 0,
    burnUntil: 0,
    frost: 0,
    iceUntil: 0,
    wetUntil: 0,
    controlUntil: 0,
    ccImmune: 0,
  };
}
export function enemyTarget(r: Run, origin: { x: number; y: number }) {
  const c = pumpkin(r);
  return c &&
    c.hp > 0 &&
    distance(origin, c) < distance(origin, r.player) * 1.25
    ? c
    : r.player;
}
export function hurtPumpkin(r: Run, base: number, mask: Element[] = []) {
  const c = pumpkin(r);
  if (!c || c.hp <= 0 || r.time < c.invulnerable) return false;
  let value = (base * 100) / (100 + r.stats.armor);
  if (
    c.wetUntil > r.time &&
    mask.some((el) => el === "ice" || el === "lightning")
  )
    value *= 1.25;
  c.hp = Math.max(0, c.hp - value);
  c.invulnerable = r.time + 0.5;
  if (mask.includes("water")) c.wetUntil = r.time + 3;
  if (mask.includes("fire")) c.burnUntil = r.time + 3;
  if (mask.includes("ice")) {
    c.frost += 15;
    c.iceUntil = r.time + 3;
    if (c.frost >= 100) {
      c.frost = 0;
      if (c.ccImmune <= r.time) {
        c.controlUntil = r.time + 0.6;
        c.freezeUntil = c.controlUntil;
        c.ccImmune = r.time + 1.6;
      }
    }
  }
  if (mask.includes("lightning") && random(r) < 0.15 && c.ccImmune <= r.time) {
    c.controlUntil = r.time + 0.25;
    c.stunUntil = c.controlUntil;
    c.ccImmune = r.time + 1.25;
  }
  visual(r, "damage", c, Math.round(value), 0xff9566);
  if (c.hp <= 0) {
    c.downUntil = r.time + 10;
    visual(r, "phase", c, 0, 0xffaa58, 36);
  }
  return true;
}
export function revivePumpkin(r: Run) {
  const c = pumpkin(r);
  if (c) {
    c.hp = c.maximum;
    c.downUntil = 0;
    c.x = r.player.x - 25;
    c.y = r.player.y;
    c.burnUntil = 0;
    c.controlUntil = 0;
  }
}
export function updatePumpkin(r: Run) {
  syncPumpkin(r);
  const c = pumpkin(r);
  if (!c) return;
  c.maximum = r.stats.maxHP * 3;
  c.hp = Math.min(c.hp, c.maximum);
  if (c.hp <= 0) {
    if (r.time >= c.downUntil) revivePumpkin(r);
    else return;
  }
  if (c.iceUntil <= r.time) c.frost = 0;
  if (c.burnUntil > r.time && r.time >= c.burnTick) {
    hurtPumpkin(r, 8);
    c.burnTick = r.time + 1;
  }
  if (c.controlUntil > r.time) return;
  const target = r.enemies
    .filter((e) => e.hp > 0 && !e.sealPillar)
    .sort((a, b) => distance(c, a) - distance(c, b))[0];
  const aim = target ?? r.player;
  const a = angle(c, aim);
  c.aim = a;
  if (distance(c, aim) > (target ? 48 : 70))
    move(
      r,
      c,
      Math.cos(a) * 190 * (c.iceUntil > r.time ? 0.8 : 1) * DT,
      Math.sin(a) * 190 * (c.iceUntil > r.time ? 0.8 : 1) * DT,
      16,
    );
  if (
    target &&
    distance(c, target) <= 70 * r.stats.range + target.radius &&
    !lineBlocked(r, c, target) &&
    r.time >= c.attackNext
  ) {
    c.attackNext = r.time + 1;
    const ctx = context(r, 214, "additional", [], false, 1, false, "none");
    ctx.ownerActorId = c.id;
    cone(r, c, a, 70, Math.PI * 1.1, 30 * (1 + r.stats.skill), ctx);
    visual(r, "ghost", c, 0, 0xffac5b, 70 * r.stats.range, a, {
      duration: 0.4,
    });
  }
}
