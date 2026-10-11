import type {
  Run,
  Actor,
  DamageContext,
  Element,
  Area,
  Projectile,
} from "../core/types";
import { angle, distance, random, clamp, type Vec } from "../core/primitives";
import { cardLevel, skillFactor } from "../data/cards";
import { coneHit, lineBlocked, segmentDistance, beamEnd } from "./geometry";
export const level = (r: Run, id: number) => cardLevel(r, id);
export const factor = (r: Run, id: number, inc = 0.2) =>
  skillFactor(level(r, id), inc);
export function context(
  r: Run,
  id: number,
  kind: DamageContext["damageKind"] = "skill",
  elements: Element[] = [],
  proxy = false,
  scale = 1,
  crit = true,
  proc: DamageContext["procPolicy"] = "root",
  ancestry: number[] = [],
): DamageContext {
  return {
    sourceAbilityId: id,
    ownerActorId: 0,
    rootAttackId: r.nextId++,
    damageKind: kind,
    elementMask: elements,
    canCrit: crit,
    lifestealEligible: kind !== "dot",
    basicEffectMask: proxy,
    basicHitProxy: proxy,
    basicCastProxy: false,
    procPolicy: proc,
    ancestry: [...ancestry, id],
    chainScale: scale,
  };
}
export function visual(
  r: Run,
  kind: Run["visuals"][number]["kind"],
  p: Vec,
  value = 0,
  color = 0xffd891,
  radius = 20,
  a = 0,
) {
  r.visuals.push({
    id: r.nextId++,
    kind,
    x: p.x,
    y: p.y,
    value,
    color,
    radius,
    angle: a,
    until: r.time + (kind === "damage" ? 0.45 : 0.3),
  });
}
export function shield(r: Run, amount: number, seconds: number) {
  r.player.shields.push({ amount, until: r.time + seconds });
}
export function control(r: Run, e: Actor, seconds: number) {
  if (e.kind > 5) {
    if (r.time < e.ccImmune) return;
    if (r.time - e.ccLast > 5) e.ccCount = 0;
    if (e.ccCount >= 2) {
      e.ccImmune = r.time + 2;
      e.ccCount = 0;
      return;
    }
    seconds *= e.ccCount === 1 ? 0.5 : 1;
    e.ccCount++;
    e.ccLast = r.time;
  }
  e.controlUntil = Math.max(e.controlUntil, r.time + seconds);
}
export function elemental(r: Run, e: Actor, ctx: DamageContext, frost = 15) {
  for (const el of ctx.elementMask) {
    if (el === "water") e.wetUntil = r.time + 3;
    if (el === "ice") {
      e.iceUntil = r.time + 3;
      e.frost += frost;
      if (e.frost >= 100) {
        e.frost -= 100;
        control(r, e, e.kind > 5 ? 0.75 : 3);
      }
    }
    if (el === "fire")
      e.burn.push({ until: r.time + 3, damage: 8, scale: ctx.chainScale });
    if (el === "lightning") {
      if (ctx.procPolicy !== "none") {
        hit(
          r,
          e,
          6,
          context(
            r,
            28,
            "additional",
            ["lightning"],
            false,
            ctx.chainScale,
            false,
            "none",
            ctx.ancestry,
          ),
        );
      }
      if (random(r) < 0.15) control(r, e, e.kind > 5 ? 0.2 : 0.4);
    }
  }
}
export function hit(
  r: Run,
  e: Actor,
  base: number,
  ctx: DamageContext,
  frost = 15,
) {
  if (e.hp <= 0 || e.transition > r.time) return 0;
  let conditional = 1;
  if (ctx.basicHitProxy) {
    if (level(r, 42) && distance(r.player, e) <= 45)
      conditional += 0.3 * factor(r, 42, 0.15);
    if (level(r, 48) && e.hp === e.maxHP)
      conditional += 0.4 * factor(r, 48, 0.15);
    if (level(r, 55) && distance(r.player, e) >= 300)
      conditional += 0.4 * factor(r, 55, 0.15);
    if (level(r, 49)) {
      e.focusRoots ??= [];
      if (!e.focusRoots.includes(ctx.rootAttackId)) {
        e.focusRoots.push(ctx.rootAttackId);
        e.focusRoots = e.focusRoots.slice(-128);
        e.hits++;
      }
      if (e.hits % 3 === 0) conditional += 0.6 * factor(r, 49, 0.15);
    }
  }
  let crit = ctx.canCrit && random(r) < r.stats.crit;
  if (ctx.sourceAbilityId === 144 && level(r, 45)) crit = true;
  const category =
    ctx.damageKind === "basic"
      ? r.stats.basic
      : ctx.damageKind === "skill"
        ? r.stats.skill
        : 0;
  let value =
    base *
    (1 + r.stats.global) *
    (1 + category) *
    (1 + (ctx.elementMask.length ? r.stats.elemental : 0)) *
    conditional;
  if (crit) value *= r.stats.critMult;
  if (
    e.wetUntil > r.time &&
    ctx.elementMask.some((el) => el === "ice" || el === "lightning")
  )
    value *= 1.25;
  value *= (ctx.chainScale * 100) / (100 + e.armor);
  const prev = e.hp;
  if (e.kind > 5 && e.phase === 1 && e.hp - value <= e.maxHP / 2) {
    e.hp = e.maxHP / 2;
    e.phase = 2;
    e.transition = r.time + 2;
    r.modes = r.modes.filter((m) => m.actor !== e.id);
    e.nextAttack = r.time + 2.1;
    visual(r, "phase", e, 0, 0xffb77b, 80);
  } else e.hp = Math.max(0, e.hp - value);
  const actual = prev - e.hp;
  visual(
    r,
    "damage",
    e,
    Math.round(actual),
    crit
      ? 0xffd767
      : ctx.elementMask.includes("ice")
        ? 0x9deaff
        : ctx.elementMask.includes("fire")
          ? 0xffa274
          : 0xf4edcc,
    crit ? 22 : 16,
  );
  if (ctx.lifestealEligible && actual > 0 && r.stats.lifesteal > 0) {
    const gain = Math.min(
      r.stats.maxHP - r.player.hp,
      actual * r.stats.lifesteal,
    );
    r.player.hp += gain;
  }
  if (e.hp > 0 && ctx.damageKind !== "dot") elemental(r, e, ctx, frost);
  if ((ctx.procPolicy === "root" || ctx.procPolicy === "one") && e.hp > 0) {
    const child = (id: number, elements: Element[] = []) =>
      context(
        r,
        id,
        "additional",
        elements,
        false,
        ctx.chainScale,
        false,
        "none",
        ctx.ancestry,
      );
    if (level(r, 16) && crit && !ctx.ancestry.includes(16))
      shoot(
        r,
        r.player,
        angle(r.player, e),
        30 * factor(r, 16),
        650,
        650,
        child(16, ["ice"]),
        99,
      );
    if (level(r, 29) && !ctx.ancestry.includes(29)) {
      let from = e;
      const visited = [e.id];
      for (let n = 0; n < 3; n++) {
        const target = r.enemies
          .filter(
            (t) =>
              t.hp > 0 &&
              !visited.includes(t.id) &&
              distance(from, t) <= 120 &&
              !lineBlocked(r, from, t),
          )
          .sort(
            (a, b) => distance(from, a) - distance(from, b) || a.id - b.id,
          )[0];
        if (!target) break;
        visual(
          r,
          "arc",
          from,
          distance(from, target),
          0xc7b8ff,
          3,
          angle(from, target),
        );
        hit(r, target, 18 * factor(r, 29), child(29, ["lightning"]));
        visited.push(target.id);
        from = target;
      }
    }
    if (
      level(r, 23) &&
      ctx.elementMask.includes("fire") &&
      !ctx.ancestry.includes(23)
    ) {
      e.fireStacks++;
      if (e.fireStacks >= 5) {
        e.fireStacks = 0;
        burst(
          r,
          e,
          70 + Math.min(4, level(r, 23) - 1) * 8,
          40 * factor(r, 23),
          child(23, ["fire"]),
        );
      }
    }
    if (level(r, 56) && ctx.basicHitProxy && !ctx.ancestry.includes(56))
      burst(
        r,
        e,
        48 + Math.min(4, level(r, 56) - 1) * 4,
        12 * factor(r, 56),
        child(56),
      );
  }
  return actual;
}
export function hurt(r: Run, base: number, element: Element | null = null) {
  const p = r.player;
  if (p.hp <= 0 || p.invulnerable > r.time) return false;
  if (p.blockUntil > r.time) {
    if (!p.blockHit) {
      p.blockHit = true;
      p.counterAt = r.time + 0.3;
      p.blockUntil = Math.max(p.blockUntil, r.time + 0.4);
    }
    return false;
  }
  let value = ((base * 100) / (100 + r.stats.armor)) * (1 - r.stats.reduction);
  for (const s of p.shields) {
    const absorbed = Math.min(s.amount, value);
    s.amount -= absorbed;
    value -= absorbed;
  }
  p.hp = Math.max(0, p.hp - value);
  p.invulnerable = r.time + 0.5;
  visual(r, "damage", p, Math.round(value), 0xff797c);
  if (element === "water") p.wetUntil = r.time + 3;
  if (element === "fire") p.burnUntil = r.time + 3;
  if (element === "ice") {
    p.frost += 15;
    p.iceUntil = r.time + 3;
    if (p.frost >= 100) {
      p.frost = 0;
      if (r.time >= p.ccImmune) {
        p.controlUntil = r.time + 0.6;
        p.ccImmune = r.time + 1.6;
      }
    }
  }
  if (element === "lightning" && random(r) < 0.15 && r.time >= p.ccImmune) {
    p.controlUntil = r.time + 0.25;
    p.ccImmune = r.time + 1.25;
  }
  return true;
}
export function burst(
  r: Run,
  p: Vec,
  radius: number,
  damage: number,
  ctx: DamageContext,
) {
  visual(
    r,
    "burst",
    p,
    0,
    ctx.elementMask.includes("fire") ? 0xffac69 : 0xbde8ff,
    radius,
  );
  for (const e of [...r.enemies])
    if (distance(p, e) <= radius * r.stats.range + e.radius)
      hit(r, e, damage, ctx);
}
export function cone(
  r: Run,
  p: Vec,
  a: number,
  radius: number,
  width: number,
  damage: number,
  ctx: DamageContext,
) {
  visual(r, "cast", p, 0, 0xffdcab, radius, a);
  let successful = false;
  for (const e of r.enemies)
    if (coneHit(p, e, radius * r.stats.range, a, width, e.radius)) {
      hit(r, e, damage, ctx);
      successful = true;
    }
  return successful;
}
export function shoot(
  r: Run,
  p: Vec,
  a: number,
  damage: number,
  speed: number,
  range: number,
  ctx: DamageContext | null,
  pierce = 1,
  enemy = false,
  owner = 0,
  wave = 0,
  explosion = 0,
  explosionDamage = 0,
  bounce = 0,
  trail = 0,
) {
  if (enemy && r.projectiles.filter((p) => p.enemy).length >= 600) return;
  const mul = enemy ? 1 : r.stats.projectile;
  r.projectiles.push({
    id: r.nextId++,
    x: p.x,
    y: p.y,
    vx: Math.cos(a) * speed * mul,
    vy: Math.sin(a) * speed * mul,
    radius: enemy ? 5 : ctx?.sourceAbilityId === 50 ? 3 : 4,
    distanceLeft: range,
    damage,
    context: ctx,
    enemy,
    owner,
    wave,
    hit: [],
    pierce,
    bounce,
    explosion,
    explosionDamage,
    trail,
  });
}
export function area(
  r: Run,
  p: Vec,
  radius: number,
  damage: number,
  delay: number,
  duration: number,
  interval: number,
  ctx: DamageContext | null,
  extra: Partial<Area> = {},
) {
  r.areas.push({
    id: r.nextId++,
    ability: ctx?.sourceAbilityId ?? 0,
    owner: 0,
    x: p.x,
    y: p.y,
    radius,
    damage,
    starts: r.time + delay,
    ends: r.time + delay + duration,
    interval,
    next: r.time + delay,
    context: ctx,
    enemy: !ctx,
    follow: false,
    pull: false,
    frost: 15,
    angle: 0,
    width: 0,
    shape: "circle",
    hit: [],
    wave: r.nextId++,
    heavy: false,
    ...extra,
  });
}
export function damageCover(
  r: Run,
  p: Vec,
  radius: number,
  wave: number,
  heavy = false,
) {
  for (const o of r.obstacles)
    if (
      o.kind !== "lake" &&
      o.durability > 0 &&
      !o.waves.includes(wave) &&
      p.x + radius >= o.x &&
      p.x - radius <= o.x + o.w &&
      p.y + radius >= o.y &&
      p.y - radius <= o.y + o.h
    ) {
      o.waves.push(wave);
      o.durability = Math.max(0, o.durability - (heavy ? 3 : 1));
    }
}
export function updateProjectiles(r: Run, dt: number) {
  for (const p of r.projectiles) {
    const old = { x: p.x, y: p.y };
    const dist = Math.hypot(p.vx, p.vy) * dt;
    let stopped = false;
    const steps = Math.ceil(dist / 4) || 1;
    for (let i = 0; i < steps; i++) {
      p.x += (p.vx * dt) / steps;
      p.y += (p.vy * dt) / steps;
      if (lineBlocked(r, old, p)) {
        stopped = true;
        break;
      }
      if (p.enemy) {
        if (segmentDistance(r.player, old, p) < r.player.radius + p.radius) {
          const owner = r.enemies.find((e) => e.id === p.owner);
          hurt(r, p.damage, owner?.element);
          stopped = true;
          break;
        }
      } else if (p.context) {
        for (const e of r.enemies)
          if (
            e.hp > 0 &&
            !p.hit.includes(e.id) &&
            segmentDistance(e, old, p) < e.radius + p.radius
          ) {
            hit(r, e, p.damage, p.context);
            p.hit.push(e.id);
            p.pierce--;
            if (p.bounce > 0) {
              const target = r.enemies
                .filter(
                  (e2) =>
                    e2.hp > 0 &&
                    !p.hit.includes(e2.id) &&
                    !lineBlocked(r, e, e2),
                )
                .sort(
                  (a, b) => distance(e, a) - distance(e, b) || a.id - b.id,
                )[0];
              if (target) {
                const a = angle(e, target),
                  speed = Math.hypot(p.vx, p.vy);
                p.vx = Math.cos(a) * speed;
                p.vy = Math.sin(a) * speed;
                p.context = {
                  ...p.context,
                  chainScale: p.context.chainScale * 0.7,
                };
                p.bounce--;
                p.pierce++;
                break;
              }
            }
            if (p.pierce <= 0) {
              stopped = true;
              break;
            }
          }
      }
      if (stopped) break;
    }
    p.distanceLeft -= dist;
    if (p.trail && r.tick % 15 === 0 && p.context)
      area(r, p, 25, 6 * factor(r, 21), 0, 3, 0.5, {
        ...p.context,
        damageKind: "skill",
        canCrit: true,
        procPolicy: "root",
      });
    if (stopped || p.distanceLeft <= 0) {
      p.distanceLeft = -1;
      if (p.enemy) {
        if (r.room === 5) damageCover(r, p, 8, p.wave);
      } else if (p.explosion && p.context)
        burst(r, p, p.explosion, p.explosionDamage, {
          ...p.context,
          damageKind: "additional",
          canCrit: false,
          basicHitProxy: false,
          procPolicy: "none",
        });
    }
  }
  r.projectiles = r.projectiles.filter((p) => p.distanceLeft > 0);
}
export function updateAreas(r: Run) {
  for (const a of r.areas) {
    if (a.follow) {
      a.x = r.player.x;
      a.y = r.player.y;
    }
    if (a.mine) {
      if (r.time < a.starts) continue;
      if (!a.triggerAt && distance(a, r.player) <= 30)
        a.triggerAt = r.time + 0.25;
      const detonate = a.triggerAt ?? a.starts + 4;
      if (r.time < detonate) continue;
      a.mine = false;
      a.next = r.time;
      a.ends = r.time + 0.01;
    }
    if (r.time < a.starts || r.time < a.next || r.time > a.ends) continue;
    a.next += a.interval;
    if (a.enemy) {
      const end = beamEnd(r, a, a.angle);
      const affected =
        a.shape === "beam"
          ? segmentDistance(r.player, a, end) < a.width / 2 + r.player.radius
          : a.shape === "cone"
            ? coneHit(a, r.player, a.radius, a.angle, a.width, r.player.radius)
            : distance(a, r.player) < a.radius + r.player.radius;
      if (affected) hurt(r, a.damage);
      if (r.room === 5) {
        if (a.shape === "beam") {
          for (let d = 0; d < distance(a, end); d += 20)
            damageCover(
              r,
              {
                x: a.x + Math.cos(a.angle) * d,
                y: a.y + Math.sin(a.angle) * d,
              },
              a.width,
              a.wave,
              a.heavy,
            );
        } else damageCover(r, a, a.radius, a.wave, a.heavy);
      }
    } else if (a.context) {
      for (const e of r.enemies)
        if (
          e.hp > 0 &&
          coneHit(
            a,
            e,
            a.radius * r.stats.range,
            a.angle,
            a.shape === "cone" ? a.width : Math.PI * 2,
            e.radius,
          )
        ) {
          hit(r, e, a.damage, a.context, a.frost);
          if (a.pull && e.kind <= 5) {
            e.x += (a.x - e.x) * 0.08;
            e.y += (a.y - e.y) * 0.08;
          }
        }
      visual(
        r,
        "burst",
        a,
        0,
        a.context.elementMask.includes("fire")
          ? 0xff9d69
          : a.context.elementMask.includes("lightning")
            ? 0xc3aeff
            : 0x83d9ef,
        a.radius,
      );
    }
  }
  r.areas = r.areas.filter((a) => a.ends >= r.time);
}
