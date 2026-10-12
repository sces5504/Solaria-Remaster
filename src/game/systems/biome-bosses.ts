import { coverInCone, coverInRush } from "./cover";
import { enemyTarget, contactRush, meleeBodies } from "./companion";
import { attachSine, enemyElements } from "./monster-details";
import type { Actor, Mode, Run } from "../core/types";
import { angle, distance, DT, type Vec } from "../core/primitives";
import type { BossAttack } from "../data/bosses";
import { combatBosses as bosses } from "../data/combat-content";
import { currentBiome, enemyDamageScale, enemyHPScale } from "../data/biomes";
import { actor, bossMinion } from "../data/world";
import { area, damageCover, hurt, shoot, visual } from "./combat";
import { legal, move, coneHit } from "./geometry";

export function placeBoss(r: Run, id: number): Actor {
  const b = bosses[id];
  const e = actor(r.nextId++, 6, 760, 320);
  e.bossId = id;
  e.radius = b.radius;
  e.maxHP = e.hp = b.hp * 1.6 ** ((r.loop ?? 1) - 1);
  e.nextAttack = r.time + 1.5;
  e.xpReward = 0;
  e.element =
    b.biome === "icefield" ? "ice" : b.biome === "volcano" ? "fire" : null;
  return e;
}
export function splitBoss(r: Run, e: Actor) {
  if (e.bossId !== 12 || e.splitGroup) return;
  const total = e.hp;
  e.splitGroup = e.id;
  e.maxHP = e.hp = total / 2;
  const twin = {
    ...e,
    id: r.nextId++,
    burn: e.burn.map((b) => ({ ...b })),
    rushHits: [],
    focusRoots: [],
    x: e.x + 70,
  };
  twin.hp = twin.maxHP = total / 2;
  twin.xpReward = (e.xpReward ?? 0) / 2;
  e.xpReward = twin.xpReward;
  twin.nextAttack = e.nextAttack + 0.5;
  if (!legal(r, twin, twin.radius)) twin.x = e.x - 70;
  r.enemies.push(twin);
  visual(r, "phase", e, 0, 0xe3c6ff, 85);
}
function point(r: Run, e: Actor, target: Vec): Vec {
  if (legal(r, target, e.radius)) return { ...target };
  let best: Vec = { x: e.x, y: e.y },
    score = Infinity;
  for (let y = 112; y <= 560; y += 32)
    for (let x = 224; x <= 912; x += 32) {
      const p = { x, y };
      if (!legal(r, p, e.radius)) continue;
      const d = distance(p, target);
      if (d < score) {
        score = d;
        best = p;
      }
    }
  return best;
}
export function beginBossAttack(r: Run, e: Actor, attack: BossAttack) {
  const id = r.nextId++,
    damage = attack.damage * enemyDamageScale(r);
  const starts = r.time + (attack.pattern === "burrow" ? 1.4 : attack.warning);
  const duration =
    attack.pattern === "burrow" ? attack.groups * 1.4 : attack.duration;
  const m: Mode = {
    id,
    actor: e.id,
    type: ([
      "rush",
      "slash",
      "fan",
      "ring",
      "spiral",
      "cross",
      "rows",
      "laser",
      "summon",
      "mine",
    ].includes(attack.pattern)
      ? attack.pattern
      : "mark") as Mode["type"],
    attackId: attack.id,
    starts,
    ends:
      starts +
      duration +
      (attack.pattern === "laser" || attack.pattern === "sweep"
        ? (attack.arms - 1) * (attack.beamStagger ?? 0.3)
        : 0),
    next: starts,
    count: 0,
    angle: angle(e, enemyTarget(r, e)),
    target: { ...enemyTarget(r, e) },
    origin: { x: e.x, y: e.y },
    phase: e.phase,
    bossAttack: attack,
  };
  if (attack.pattern === "mark" && attack.id.includes("leap")) {
    m.target = point(r, e, m.target);
    e.leap = {
      from: { x: e.x, y: e.y },
      to: { ...m.target },
      starts: r.time,
      ends: starts,
    };
  }
  r.modes.push(m);
  r.attackLog.push(attack.id);
  r.attackLog = r.attackLog.slice(-120);
  if (attack.pattern === "burrow") e.transition = r.time + 0.8;
  if (attack.pattern === "mark")
    for (let i = 0; i < attack.groups; i++) {
      const spread = attack.groups === 1 ? 0 : i * 24;
      const target = {
        x: Math.max(72, Math.min(950, m.target.x + Math.cos(i * 2.4) * spread)),
        y: Math.max(
          100,
          Math.min(570, m.target.y + Math.sin(i * 2.4) * spread),
        ),
      };
      area(
        r,
        target,
        attack.radius,
        damage,
        attack.warning + i * 0.25,
        0.01,
        1,
        null,
        {
          owner: e.id,
          eventAbility: attack.id,
          effect: /wolf-hunt|witch-thunder|brain-storm/.test(attack.id)
            ? "thunder"
            : undefined,
          wave: id,
          heavy: true,
          ...(attack.id === "santa-tracking"
            ? {
                trackingUntil: r.time + attack.warning + i * 0.25 - 0.4,
                trackingOffset: {
                  x: Math.cos(i * 2.4) * spread,
                  y: Math.sin(i * 2.4) * spread,
                },
              }
            : {}),
        },
      );
    }
  if (attack.pattern === "mine")
    for (let i = 0; i < attack.groups; i++) {
      const a = (i * Math.PI * 2) / attack.groups + m.angle;
      const radius = attack.mineDistance ?? 215;
      const p = {
        x: Math.max(72, Math.min(950, m.target.x + Math.cos(a) * radius)),
        y: Math.max(100, Math.min(570, m.target.y + Math.sin(a) * radius)),
      };
      area(r, p, attack.radius, damage, 1.3, 4.01, 1, null, {
        owner: e.id,
        eventAbility: attack.id,
        wave: id,
        heavy: true,
        mine: true,
      });
    }
  if (attack.pattern === "laser" || attack.pattern === "sweep")
    for (let i = 0; i < attack.arms; i++) {
      area(
        r,
        m.origin!,
        1100,
        damage,
        attack.warning + i * (attack.beamStagger ?? 0.3),
        attack.duration,
        0.15,
        null,
        {
          owner: e.id,
          wave: id,
          shape: "beam",
          width: 10,
          angle:
            m.angle +
            (attack.beamAngles?.[i] ?? (i * Math.PI * 2) / attack.arms),
          eventAbility: attack.id,
          ...(attack.pattern === "sweep"
            ? {
                beamMotion: {
                  angle:
                    m.angle +
                    (attack.beamAngles?.[i] ?? (i * Math.PI * 2) / attack.arms),
                  rotation: attack.beamTurn?.[i] ?? attack.rotation,
                  duration: attack.duration,
                },
              }
            : {}),
        },
      );
    }
  if (attack.pattern === "burrow")
    area(r, m.target, attack.radius, damage, 1.4, 0.01, 1, null, {
      owner: e.id,
      wave: id,
      heavy: true,
    });
}
export function updateBossLeap(r: Run, e: Actor) {
  if (e.leap) {
    const t = Math.max(
      0,
      Math.min(1, (r.time - e.leap.starts) / (e.leap.ends - e.leap.starts)),
    );
    e.x = e.leap.from.x + (e.leap.to.x - e.leap.from.x) * t;
    e.y = e.leap.from.y + (e.leap.to.y - e.leap.from.y) * t;
    if (t >= 1) e.leap = undefined;
    else return true;
  }
  return false;
}
export function biomeBossAI(r: Run, e: Actor) {
  const b = bosses[e.bossId!];
  if (e.transition > r.time || e.controlUntil > r.time) return;
  const active = r.modes.filter((m) => m.actor === e.id && m.ends > r.time);
  for (const m of active) {
    if (
      m.bossAttack?.pattern === "rush" &&
      m.count > 0 &&
      m.count < m.bossAttack.groups &&
      e.rushUntil <= r.time &&
      m.starts < e.rushUntil
    ) {
      m.angle = angle(e, enemyTarget(r, e));
      m.target = { ...enemyTarget(r, e) };
      m.starts = m.next;
    }
  }
  const groupActive = e.splitGroup
    ? r.modes.filter((m) =>
        r.enemies.some(
          (other) => other.splitGroup === e.splitGroup && other.id === m.actor,
        ),
      ).length
    : active.length;
  if (r.time >= e.nextAttack && groupActive < 2) {
    const attack = b.attacks[e.phase - 1][e.attackOrdinal++ % 3];
    if (
      (attack.pattern === "summon" || attack.pattern === "heal") &&
      r.enemies.filter(
        (s) =>
          s.bossOwner === e.id &&
          (attack.summon === "minion"
            ? !s.summonRole
            : s.summonRole === attack.summon),
      ).length >= attack.groups
    ) {
      beginBossAttack(
        r,
        e,
        b.attacks[e.phase - 1][(e.attackOrdinal - 1 + 1) % 3],
      );
    } else beginBossAttack(r, e, attack);
    e.nextAttack = r.time + 2.4;
  }
  if (e.rushUntil > r.time) {
    const m = active.find((m) => m.bossAttack?.pattern === "rush");
    moveBossRush(r, e, m);
    contactRush(
      r,
      e,
      (m?.bossAttack?.damage ?? 30) * enemyDamageScale(r),
      enemyElements(e),
      e.bossId === 14,
    );

    if (e.bossId === 8 && r.tick % 15 === 0)
      area(r, e, 25, 6 * enemyDamageScale(r), 0, 2.5, 0.5, null, {
        owner: e.id,
        wave: m?.id ?? 0,
      });
  } else if (
    !active.some((m) => m.starts > r.time) &&
    distance(e, r.player) >
      (b.attacks
        .flat()
        .some((a) => a.pattern === "rush" || a.pattern === "slash")
        ? 110
        : 190) &&
    b.speed > 0
  ) {
    const a = angle(e, enemyTarget(r, e));
    move(
      r,
      e,
      Math.cos(a) * b.speed * (e.iceUntil > r.time ? 0.8 : 1) * DT,
      Math.sin(a) * b.speed * (e.iceUntil > r.time ? 0.8 : 1) * DT,
      e.radius,
    );
  }
}
export function executeBossMode(r: Run, m: Mode, e: Actor) {
  const a = m.bossAttack!,
    damage = a.damage * enemyDamageScale(r),
    origin = m.origin ?? e;
  if (a.pattern === "mark") {
    if (a.id.includes("leap")) Object.assign(e, point(r, e, m.target));
    m.next = m.ends + 1;
    return;
  }
  if (a.pattern === "mine" || a.pattern === "laser") {
    m.next = m.ends + 1;
    return;
  }
  if (a.pattern === "sweep") {
    m.next = m.ends + 1;
    return;
  }
  if (a.pattern === "rush") {
    if (m.count >= a.groups) {
      m.next = m.ends + 1;
      return;
    }
    e.moveAngle = m.angle;
    e.rushUntil = r.time + (a.rushTime ?? 0.8);
    e.rushHits = [];
    m.count++;
    if (m.count < a.groups) {
      m.next = r.time + (a.rushTime ?? 0.8) + 0.5;
    } else m.next = m.ends + 1;
    return;
  }
  if (a.pattern === "slash") {
    if (m.count >= a.groups) {
      m.next = m.ends + 1;
      return;
    }
    const direction = m.angle + m.count * (a.rotation || Math.PI / 3);
    meleeBodies(
      r,
      e,
      direction,
      a.radius,
      (a.spread * Math.PI) / 180,
      damage,
      a.id === "solaris-flare" ? ["fire"] : enemyElements(e),
    );
    damageCover(r, e, a.radius, m.id, "boss", (o) =>
      coverInCone(o, e, a.radius, direction, (a.spread * Math.PI) / 180),
    );
    visual(
      r,
      "slash",
      e,
      (a.spread * Math.PI) / 180,
      0xffce99,
      a.radius,
      direction,
      {
        enemy: true,
        duration: 0.35,
        eventAbility: a.id,
        enemyTheme: e.solarisBar ? "sun" : bosses[e.bossId!]?.biome,
        elements: enemyElements(e),
      },
    );
    m.count++;
    m.next = r.time + Math.max(0.3, a.interval);
    return;
  }
  if (a.pattern === "teleport" || a.pattern === "burrow") {
    const target = point(r, e, m.target);
    Object.assign(e, target);
    visual(r, "phase", e, 0, currentBiome(r).palette[2], 80);
    if (a.pattern === "teleport")
      area(r, e, a.radius, damage, 0.6, 0.01, 1, null, {
        owner: e.id,
        wave: m.id,
        eventAbility: a.id,
      });
    if (++m.count < a.groups) {
      m.target = { ...enemyTarget(r, e) };
      m.next = r.time + 1.4;
      m.starts = m.next;
      if (a.pattern === "burrow") {
        e.transition = r.time + 0.8;
        area(r, m.target, a.radius, damage, 1.4, 0.01, 1, null, {
          owner: e.id,
          wave: m.id,
          heavy: true,
        });
      }
    } else m.next = m.ends + 1;
    return;
  }
  if (a.pattern === "field") {
    if (!m.count)
      area(r, e, a.radius, damage, 0, a.duration, 0.5, null, {
        owner: e.id,
        wave: m.id,
      });
    const field = r.areas.find((area) => area.wave === m.id);
    if (field) {
      const direction = angle(field, r.player);
      field.x += Math.cos(direction) * 40 * DT;
      field.y += Math.sin(direction) * 40 * DT;
    }
    m.count++;
    m.next = r.time + DT;
    return;
  }
  if (a.pattern === "summon" || a.pattern === "heal") {
    const active = r.enemies.filter(
      (s) =>
        s.bossOwner === e.id &&
        (a.summon === "minion" ? !s.summonRole : s.summonRole === a.summon),
    ).length;
    for (let i = active; i < a.groups; i++) {
      const biome = currentBiome(r);
      const summon =
        a.summon === "minion"
          ? bossMinion(
              r,
              biome.monsters[e.bossId === 9 ? 2 : 0],
              e.x + (i - 1) * 55,
              e.y + 80,
            )
          : actor(r.nextId++, 2, e.x + (i - 1) * 55, e.y + 80, false, true);
      summon.bossOwner = e.id;
      summon.nextAttack = r.time + 1;
      if (a.summon === "totem") {
        summon.summonRole = "totem";
        summon.hp = summon.maxHP = 500 * enemyHPScale(r);
        delete summon.monsterId;
      }
      if (a.summon === "blood") {
        summon.summonRole = "blood";
        summon.hp = summon.maxHP = 80 * enemyHPScale(r);
        delete summon.monsterId;
      }
      Object.assign(summon, point(r, summon, summon));
      r.enemies.push(summon);
      visual(r, "phase", summon, 0, 0xfac1ff, 45);
    }
    e.nextAttack = Math.max(e.nextAttack, r.time + 6);
    m.next = m.ends + 1;
    return;
  }
  const n = a.shots;
  if (r.projectiles.filter((p) => p.enemy).length + n > 600) {
    m.next = r.time + DT;
    m.ends += DT;
    return;
  }
  if (a.pattern !== "spiral" && m.count >= a.groups) {
    m.next = m.ends + 1;
    return;
  }
  const aim = a.pattern === "fan" ? angle(e, enemyTarget(r, e)) : m.angle;
  for (let i = 0; i < n; i++) {
    let off = 0,
      p = { x: e.x, y: e.y };
    if (a.pattern === "fan")
      off =
        ((n === 1 ? 0 : -0.5 + i / (n - 1)) * a.spread * Math.PI) / 180 +
        m.count * a.rotation;
    if (a.pattern === "ring")
      off = (i * Math.PI * 2) / n + m.count * a.rotation;
    if (a.pattern === "spiral")
      off =
        (Math.floor(i / 3) * Math.PI * 2) / a.arms +
        (i % 3) * 0.1 +
        m.count * (a.rotation || Math.PI / 10);
    if (a.pattern === "cross") {
      off =
        (Math.floor(i / 3) * Math.PI) / 2 +
        ((i % 3) - 1) * 0.13 +
        m.count * a.rotation;
      if (a.id.includes("diamond")) {
        const side = Math.floor(i / 3);
        p = {
          x: e.x + Math.cos((side * Math.PI) / 2) * 70,
          y: e.y + Math.sin((side * Math.PI) / 2) * 70,
        };
      }
    }
    if (a.pattern === "rows") {
      const offset = ((i % (n / 2)) - (n / 2 - 1) / 2) * 24;
      const forward = Math.floor(i / (n / 2)) * 30;
      p = {
        x:
          origin.x +
          Math.cos(aim + Math.PI / 2) * offset +
          Math.cos(aim) * forward,
        y:
          origin.y +
          Math.sin(aim + Math.PI / 2) * offset +
          Math.sin(aim) * forward,
      };
    }
    if (a.volley === "petals")
      off += Math.sin(((i * Math.PI * 2) / n) * 5 + m.count * 0.4) * 0.16;
    if (a.volley === "alternating") off += (m.count % 2 ? 1 : -1) * 0.12;
    const speed =
      a.speed *
      (a.volley === "stack"
        ? 1 + m.count * 0.12
        : a.volley === "petals"
          ? 1 + 0.15 * Math.cos(((i * Math.PI * 2) / n) * 5)
          : 1);
    shoot(r, p, aim + off, damage, speed, 1100, null, 1, true, e.id, m.id);
    if (a.volley === "sine")
      attachSine(r.projectiles.at(-1)!, (i * Math.PI) / 3 + m.count);
  }
  m.count++;
  m.next = r.time + a.interval;
}
export function updateHealingSummon(r: Run, e: Actor) {
  if (e.hp <= 0) return;
  const boss = r.enemies.find((b) => b.id === e.bossOwner && b.hp > 0);
  if (!boss) {
    e.hp = 0;
    return;
  }
  if (e.summonRole === "totem" && r.time >= e.nextAttack) {
    e.nextAttack = r.time + 1;
    boss.hp = Math.min(
      boss.phase === 2 && !boss.splitGroup ? boss.maxHP / 2 : boss.maxHP,
      boss.hp + boss.maxHP * 0.01,
    );
    visual(r, "heal", boss, Math.round(boss.maxHP * 0.01), 0xa7ebbb);
  }
  if (e.summonRole === "blood") {
    const direction = angle(e, boss);
    move(
      r,
      e,
      Math.cos(direction) * 70 * DT,
      Math.sin(direction) * 70 * DT,
      e.radius,
    );
    if (distance(e, boss) < boss.radius + e.radius) {
      boss.hp = Math.min(
        boss.phase === 2 && !boss.splitGroup ? boss.maxHP / 2 : boss.maxHP,
        boss.hp + boss.maxHP * 0.02,
      );
      e.hp = 0;
      e.summoned = true;
    }
  }
}

export function moveBossRush(r: Run, e: Actor, m?: Mode) {
  const speed = m?.bossAttack?.rushSpeed ?? 350;
  let dx = Math.cos(e.moveAngle) * speed * DT,
    dy = Math.sin(e.moveAngle) * speed * DT;
  if (m)
    damageCover(r, e, 0, m.id, "boss", (o) =>
      coverInRush(o, e, dx, dy, e.radius),
    );
  if (m?.bossAttack?.ricochet) {
    if (!legal(r, { x: e.x + dx, y: e.y }, e.radius)) dx = -dx;
    if (!legal(r, { x: e.x, y: e.y + dy }, e.radius)) dy = -dy;
    e.moveAngle = Math.atan2(dy, dx);
  }
  const before = { x: e.x, y: e.y };
  move(r, e, dx, dy, e.radius);
  if (
    !m?.bossAttack?.ricochet &&
    distance(before, e) < Math.hypot(dx, dy) * 0.5
  )
    e.rushUntil = r.time;
}
