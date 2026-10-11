import type { Actor, DamageContext, Run } from "../core/types";
import { angle, distance, DT, type Vec } from "../core/primitives";
import {
  hasEquipment,
  type EquipmentAbility,
  type SpecialItem,
} from "../data/equipment";
import { area, burst, context, hit, shield, shoot, visual } from "./combat";
import { move, lineBlocked } from "./geometry";

export interface GearState {
  signature: string;
  basics: number;
  skills: number;
  timeCharge: boolean;
  skillPower: number;
  legionUntil: number;
  voidUntil: number;
  voidReady: number;
  shieldReady: number;
  gravityReady: number;
  meteorNext: number;
  standFor: number;
  moveFor: number;
  standingArmor: boolean;
  lastPosition: Vec;
  thunder: { at: number; remaining: number };
  targets: Record<
    number,
    {
      hits: number;
      blood: number;
      threshold: number;
      last: number;
      decay: number;
    }
  >;
}
type GearRun = Run & { gear?: GearState };
export function gearState(run: Run): GearState {
  const r = run as GearRun;
  const signature = Object.values(r.equipment)
    .map((i) => i?.id)
    .filter(Boolean)
    .sort()
    .join("|");
  if (!r.gear || r.gear.signature !== signature)
    r.gear = {
      signature,
      basics: 0,
      skills: 0,
      timeCharge: false,
      skillPower: 1,
      legionUntil: 0,
      voidUntil: 0,
      voidReady: 0,
      shieldReady: 0,
      gravityReady: 0,
      meteorNext: r.time + 3,
      standFor: 0,
      moveFor: 0,
      standingArmor: false,
      lastPosition: { x: r.player.x, y: r.player.y },
      thunder: { at: 0, remaining: 0 },
      targets: {},
    };
  return r.gear;
}
const ids: Record<EquipmentAbility, number> = {
  molten: 201,
  meteorArmor: 202,
  voidCloth: 203,
  moonString: 204,
  riftRing: 205,
  starFlow: 206,
  thunderBox: 207,
  starSeeker: 208,
  starArmor: 209,
  timeRing: 210,
  starSeal: 211,
  frostBell: 212,
  redMoon: 213,
  ghostArmor: 214,
  gravity: 215,
  fallingStar: 216,
  legion: 217,
};
export function gearContext(
  r: Run,
  ability: EquipmentAbility,
  scale = 1,
  proxy = false,
) {
  return context(
    r,
    ids[ability],
    "additional",
    [],
    proxy,
    scale,
    proxy,
    proxy ? "one" : "none",
  );
}
export function gearBasic(r: Run, aim: number) {
  const s = gearState(r);
  s.basics++;
  if (hasEquipment(r, "timeRing") && s.basics % 6 === 0) s.timeCharge = true;
  if (hasEquipment(r, "moonString") && s.basics % 4 === 0) {
    const target = r.enemies
      .filter((e) => e.hp > 0 && !e.sealPillar)
      .sort((a, b) => distance(r.player, a) - distance(r.player, b))[0];
    burst(r, target ?? r.player, 65, 20, gearContext(r, "moonString"));
  }
  if (hasEquipment(r, "starFlow") && s.basics % 3 === 0)
    shoot(r, r.player, aim, 30, 560, 650, gearContext(r, "starFlow"), 2);
  if (hasEquipment(r, "legion") && s.legionUntil > r.time)
    for (const delta of [-0.12, 0.12])
      shoot(r, r.player, aim + delta, 20, 480, 500, gearContext(r, "legion"));
}
export function gearSkill(r: Run) {
  const s = gearState(r);
  s.skills++;
  s.skillPower = hasEquipment(r, "timeRing") && s.timeCharge ? 1.8 : 1;
  s.timeCharge = false;
  if (hasEquipment(r, "molten")) shield(r, r.stats.maxHP * 0.1, 3);
  if (hasEquipment(r, "legion")) s.legionUntil = r.time + 3;
  if (hasEquipment(r, "thunderBox") && s.skills % 3 === 0)
    s.thunder = { at: r.time, remaining: 3 };
}
export function gearHurt(r: Run, actual: number, broken: boolean) {
  const s = gearState(r);
  if (actual > 0 && hasEquipment(r, "voidCloth") && s.voidReady <= r.time) {
    s.voidUntil = r.time + 1;
    s.voidReady = r.time + 3;
    visual(r, "ghost", r.player, 0, 0xd1a6ff, 48, r.player.aim ?? 0, {
      duration: 0.6,
    });
  }
  if (broken && hasEquipment(r, "starArmor") && s.shieldReady <= r.time) {
    s.shieldReady = r.time + 5;
    burst(r, r.player, 100, 60, gearContext(r, "starArmor"));
  }
}
export function gearKill(r: Run, e: Actor) {
  const s = gearState(r);
  if (
    e.killedByRoot &&
    hasEquipment(r, "gravity") &&
    s.gravityReady <= r.time
  ) {
    s.gravityReady = r.time + 3;
    area(r, e, 120, 0, 0, 2, 0.1, gearContext(r, "gravity"), { pull: true });
  }
}
export function gearHit(
  r: Run,
  e: Actor,
  ctx: DamageContext,
  crit: boolean,
  actual: number,
) {
  const s = gearState(r);
  if (actual <= 0 || e.sealPillar || ctx.procPolicy === "none" || e.hp <= 0)
    return;
  if (crit && hasEquipment(r, "frostBell") && !ctx.ancestry.includes(212))
    burst(r, e, 72, 40, gearContext(r, "frostBell", ctx.chainScale));
  if (!ctx.basicHitProxy) return;
  const key = e.splitGroup ?? e.id;
  const t = (s.targets[key] ??= {
    hits: 0,
    blood: 0,
    threshold: 100,
    last: r.time,
    decay: r.time + 6,
  });
  s.targets[key] = t;
  t.hits++;
  t.last = r.time;
  t.decay = r.time + 6;
  if (hasEquipment(r, "starSeal") && t.hits % 6 === 0)
    burst(r, e, 100, 80, gearContext(r, "starSeal", ctx.chainScale));
  // Percentage blood damage is integrated through its own source policy, never a general-damage hit.
  if (hasEquipment(r, "redMoon")) t.blood += 10;
}
export function updateGear(r: Run) {
  const s = gearState(r),
    moving = distance(s.lastPosition, r.player) > 0.01;
  s.lastPosition = { x: r.player.x, y: r.player.y };
  if (moving) {
    s.moveFor += DT;
    s.standFor = 0;
    if (s.moveFor >= 0.4) s.standingArmor = false;
  } else {
    s.standFor += DT;
    s.moveFor = 0;
    if (s.standFor >= 1) s.standingArmor = true;
  }
  if (
    hasEquipment(r, "thunderBox") &&
    s.thunder.remaining > 0 &&
    r.time >= s.thunder.at
  ) {
    const target = r.enemies
      .filter((e) => e.hp > 0 && !e.sealPillar && !lineBlocked(r, r.player, e))
      .sort((a, b) => distance(r.player, a) - distance(r.player, b))[0];
    if (target) {
      visual(
        r,
        "arc",
        r.player,
        distance(r.player, target),
        0x58bcff,
        8,
        angle(r.player, target),
      );
      hit(r, target, 20, {
        ...gearContext(r, "thunderBox"),
        elementMask: ["lightning"],
      });
    }
    s.thunder.remaining--;
    s.thunder.at += 0.2;
  }
  if (hasEquipment(r, "fallingStar") && r.time >= s.meteorNext) {
    s.meteorNext = r.time + 3;
    const target = r.enemies
      .filter((e) => e.hp > 0 && distance(r.player, e) <= 450 * r.stats.range)
      .sort((a, b) => distance(r.player, a) - distance(r.player, b))[0];
    if (target)
      area(
        r,
        target,
        96,
        90,
        0.6,
        0.01,
        1,
        gearContext(r, "fallingStar", 1, true),
      );
  }
  for (const t of Object.values(s.targets))
    if (r.time >= t.decay && r.time - t.last >= 5) {
      t.blood = Math.max(0, t.blood - 20);
      t.decay += 1;
    }
}
export function equippedName(item: Run["bag"][number]) {
  return (item as SpecialItem).name;
}
