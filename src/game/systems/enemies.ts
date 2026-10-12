import { coverInCone, coverInRush } from "./cover";
import { rallyFactor } from "./event-combat";
import { combatMonsters as monsters } from "../data/combat-content";
import { enemyTarget, contactRush, meleeBodies } from "./companion";
import {
  normalWarning,
  normalShotInterval,
  preferredRange,
  normalSideMovement,
  attachSine,
  ringWithGap,
  limitedMark,
  enemyElements,
} from "./monster-details";
import { solarisAI } from "./solaris";
import type { Run, Actor, Mode } from "../core/types";
import { angle, distance, DT, random } from "../core/primitives";
import { legal, lineBlocked, move, coneHit, segmentDistance } from "./geometry";
import { shoot, area, hurt, damageCover, visual } from "./combat";
import { actor } from "../data/world";
import { enemyDamageScale } from "../data/biomes";
import {
  biomeBossAI,
  updateBossLeap,
  executeBossMode,
  updateHealingSummon,
} from "./biome-bosses";
export const bossAttacks = {
  6: [
    ["wolf-lunge", "wolf-claw-wave", "wolf-hunt"],
    ["wolf-triple-lunge", "wolf-spiral", "wolf-pack"],
  ],
  7: [
    ["goat-charge", "goat-horn-ring", "goat-mines"],
    ["goat-chain-charge", "goat-cross-laser", "goat-salvo"],
  ],
} as const;
function navigate(r: Run, e: Actor, speed: number) {
  const orbit = (e.id * 2.399963) % (Math.PI * 2);
  const radius =
    e.kind > 3
      ? e.monsterId
        ? preferredRange(e.monsterId)
        : 185
      : e.kind === 2
        ? 60
        : 32;
  const target = {
    x: enemyTarget(r, e).x + Math.cos(orbit) * radius,
    y: enemyTarget(r, e).y + Math.sin(orbit) * radius,
  };
  if (!legal(r, target, e.radius)) Object.assign(target, enemyTarget(r, e));
  let a = angle(e, target);
  if (e.navUntil > r.time && e.navTarget && distance(e, e.navTarget) > 8) {
    a = angle(e, e.navTarget);
  } else if (lineBlocked(r, e, enemyTarget(r, e), true)) {
    const start = Math.floor(e.y / 32) * 32 + Math.floor(e.x / 32),
      goal =
        Math.floor(enemyTarget(r, e).y / 32) * 32 +
        Math.floor(enemyTarget(r, e).x / 32);
    const queue = [start],
      prev = new Map<number, number>([[start, -1]]);
    let found = false;
    for (let qi = 0; qi < queue.length && qi < 640; qi++) {
      const n = queue[qi];
      if (n === goal) {
        found = true;
        break;
      }
      for (const next of [n - 32, n + 32, n - 1, n + 1]) {
        const x = next % 32,
          y = Math.floor(next / 32);
        if (
          x < 1 ||
          x > 30 ||
          y < 2 ||
          y > 18 ||
          prev.has(next) ||
          !legal(r, { x: x * 32 + 16, y: y * 32 + 16 }, e.radius)
        )
          continue;
        prev.set(next, n);
        queue.push(next);
      }
    }
    if (found) {
      let n = goal;
      for (let hops = 0; hops < 640; hops++) {
        const parent = prev.get(n);
        if (parent === undefined || parent === -1 || parent === start) break;
        n = parent;
      }
      e.navTarget = { x: (n % 32) * 32 + 16, y: Math.floor(n / 32) * 32 + 16 };
      e.navUntil = r.time + 0.4;
      a = angle(e, e.navTarget);
    }
  }
  // Anticipatory steering widens the approach before bodies overlap.
  let sx = Math.cos(a),
    sy = Math.sin(a);
  for (const other of r.enemies) {
    if (other === e || other.hp <= 0) continue;
    const d = distance(e, other),
      separation = e.radius + other.radius + 24;
    if (d > 0.01 && d < separation) {
      const force = (1 - d / separation) * 1.25;
      sx += ((e.x - other.x) / d) * force;
      sy += ((e.y - other.y) / d) * force;
    }
  }
  a = Math.atan2(sy, sx);
  e.moveAngle = a;
  const next = { x: e.x, y: e.y };
  move(r, next, Math.cos(a) * speed * DT, Math.sin(a) * speed * DT, e.radius);
  if (
    distance(next, enemyTarget(r, e)) >= e.radius + enemyTarget(r, e).radius ||
    distance(next, enemyTarget(r, e)) > distance(e, enemyTarget(r, e))
  )
    Object.assign(e, next);
}
function addMode(
  r: Run,
  e: Actor,
  type: Mode["type"],
  attackId: string,
  warning: number,
  duration: number,
  count = 1,
  target = enemyTarget(r, e),
) {
  const id = r.nextId++;
  r.modes.push({
    id,
    actor: e.id,
    type,
    attackId,
    starts: r.time + warning,
    ends: r.time + warning + duration,
    next: r.time + warning,
    count: type === "rush" || !e.monsterId ? count : 0,
    angle: angle(e, target),
    target: { x: target.x, y: target.y },
    phase: e.phase,
    shots: monsters[e.monsterId ?? 0]?.shots,
    groups: monsters[e.monsterId ?? 0]?.groups,
    spread: monsters[e.monsterId ?? 0]?.spread,
    reach: monsters[e.monsterId ?? 0]?.reach,
  });
  r.attackLog.push(attackId);
  if (r.attackLog.length > 120) r.attackLog.shift();
  if (type === "mark" && e.kind > 5)
    for (let i = 0; i < 3; i++)
      area(
        r,
        {
          x: target.x + Math.cos(i * 2.1) * i * 25,
          y: target.y + Math.sin(i * 2.1) * i * 25,
        },
        65,
        36,
        0.6 + i * 0.25,
        0.01,
        1,
        null,
        { owner: e.id, wave: id, heavy: true, effect: "thunder" },
      );
  if (type === "mine")
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      area(
        r,
        { x: e.x + Math.cos(a) * 130, y: e.y + Math.sin(a) * 130 },
        65,
        36,
        1.3,
        4.01,
        1,
        null,
        { owner: e.id, wave: id, heavy: true, mine: true },
      );
    }
  if (type === "laser")
    for (let i = 0; i < (e.kind > 5 ? 2 : 1); i++)
      area(
        r,
        e,
        1100,
        (e.kind > 5 ? 24 : 8) *
          enemyDamageScale(r) *
          rallyFactor(r, e, "damage"),
        0.8 + i * 0.3,
        e.monsterId === 29 ? 0.6 : 1.2,
        0.15,
        null,
        {
          owner: e.id,
          wave: id,
          shape: "beam",
          width: e.monsterId === 29 ? 8 : 10,
          angle:
            e.kind > 5 ? Math.PI / 4 + (i * Math.PI) / 2 : angle(e, target),
        },
      );
}
function bossAI(r: Run, e: Actor) {
  if (e.transition > r.time || e.controlUntil > r.time) return;
  const active = r.modes.filter((m) => m.actor === e.id && m.ends > r.time);
  if (r.time >= e.nextAttack && active.length < 2) {
    const index = Math.floor(e.attackOrdinal++ % 3),
      attack = bossAttacks[e.kind as 6][e.phase - 1][index];
    const types: Mode["type"][] =
      e.kind === 6
        ? e.phase === 1
          ? ["rush", "fan", "mark"]
          : ["rush", "spiral", "summon"]
        : e.phase === 1
          ? ["rush", "ring", "mine"]
          : ["rush", "laser", "fan"];
    const type = types[index];
    addMode(
      r,
      e,
      type,
      attack,
      type === "rush" ? 0.8 : type === "laser" ? 0.8 : 0.6,
      type === "rush"
        ? e.phase === 2
          ? 3.0
          : 0.65
        : type === "spiral"
          ? 1.8
          : type === "fan"
            ? 1.2
            : type === "ring"
              ? 1.4
              : 1.5,
      type === "rush" && e.phase === 2 ? 3 : 1,
    );
    e.nextAttack = r.time + 2.4;
  }
  if (!active.some((m) => m.type === "rush"))
    navigate(r, e, (e.kind === 6 ? 85 : 48) * (e.iceUntil > r.time ? 0.8 : 1));
}
export function refillEnemies(r: Run) {
  const cap = Math.max(4, Math.min(10, r.encounterCap ?? 6));
  let alive = r.enemies.filter((e) => e.hp > 0 && !e.summoned).length;
  if (
    !r.reserves?.length ||
    alive >= cap ||
    (alive >= 4 && r.time < (r.reinforcementAt || 0))
  )
    return;
  const target = Math.min(cap, Math.max(4, alive + 1));
  while (alive < target && r.reserves.length) {
    const next = r.reserves[0];
    // Keep the reserved identity/XP/loot and use deterministic legal landing points.
    // A reserve near the player must not stall the entire finite wave queue.
    if (
      distance(next, r.player) <= 150 ||
      !legal(r, next, next.radius) ||
      r.enemies.some(
        (e) => e.hp > 0 && distance(next, e) < next.radius + e.radius + 8,
      )
    ) {
      let point: { x: number; y: number } | undefined;
      let best = Infinity;
      for (let y = 112; y <= 560; y += 32)
        for (let x = 80; x <= 944; x += 32) {
          const candidate = { x, y };
          if (
            distance(candidate, r.player) <= 170 ||
            !legal(r, candidate, next.radius) ||
            r.enemies.some(
              (e) =>
                e.hp > 0 && distance(candidate, e) < next.radius + e.radius + 8,
            )
          )
            continue;
          const d = distance(candidate, next);
          if (d < best) {
            best = d;
            point = candidate;
          }
        }
      if (!point) break;
      Object.assign(next, point);
    }
    r.reserves.shift();
    next.nextAttack = r.time + 1.2;
    r.enemies.push(next);
    visual(r, "phase", next, 0, 0xe7c58e, 35);
    alive++;
  }
  r.reinforcementAt = r.time + 2;
}
export function updateEnemies(r: Run) {
  refillEnemies(r);
  for (const e of r.enemies) {
    if (e.hp <= 0) continue;
    if (e.sealPillar) continue;
    if (e.summonRole) {
      updateHealingSummon(r, e);
      continue;
    }
    if (e.kind > 5) {
      if (updateBossLeap(r, e)) continue;
      if (e.solarisBar) solarisAI(r, e);
      else if (e.bossId) biomeBossAI(r, e);
      else bossAI(r, e);
      continue;
    }
    if (e.controlUntil > r.time) continue;
    const definition = monsters[e.monsterId ?? 0];
    if (
      e.elite &&
      r.time >= (e.eliteReady ?? Infinity) &&
      !r.modes.some((m) => m.actor === e.id)
    ) {
      e.eliteReady = r.time + 7;
      if (e.eliteAbility === "rush" || e.eliteAbility === "barrage") {
        addMode(
          r,
          e,
          e.eliteAbility === "rush" ? "rush" : "ring",
          `elite-${e.eliteAbility}`,
          0.8,
          0.4,
        );
        const mode = r.modes.at(-1)!;
        mode.shots = 10;
        mode.groups = 1;
        mode.count = 0;
        mode.spread = 360;
        continue;
      }
      if (e.eliteAbility === "shield")
        e.enemyShield = Math.max(e.enemyShield ?? 0, e.maxHP * 0.2);
    }
    const speed =
      (definition?.speed ??
        (e.kind === 1
          ? 94
          : e.kind === 2
            ? 48
            : e.kind === 3
              ? 88
              : e.kind === 4
                ? 55
                : 45)) *
      (e.iceUntil > r.time ? 0.8 : 1) *
      (r.modifiers.includes(3) ? 1.2 : 1) *
      rallyFactor(r, e, "speed");
    const d = distance(e, r.player);
    if (e.rushUntil > r.time) {
      const rushing = r.modes.find(
        (m) => m.actor === e.id && m.type === "rush",
      );
      const rushSpeed = definition
        ? Math.min(600, definition.reach / 0.4)
        : 240;
      if (rushing)
        damageCover(r, e, 0, rushing.id, "monster", (o) =>
          coverInRush(
            o,
            e,
            Math.cos(e.moveAngle) * rushSpeed * DT,
            Math.sin(e.moveAngle) * rushSpeed * DT,
            e.radius,
          ),
        );
      move(
        r,
        e,
        Math.cos(e.moveAngle) *
          (definition ? Math.min(600, definition.reach / 0.4) : 240) *
          DT,
        Math.sin(e.moveAngle) *
          (definition ? Math.min(600, definition.reach / 0.4) : 240) *
          DT,
        e.radius,
      );
      contactRush(
        r,
        e,
        12 *
          enemyDamageScale(r) *
          rallyFactor(r, e, "damage") *
          (e.elite ? 1.4 : 1) *
          (r.modifiers.includes(2) ? 1.2 : 1),
        enemyElements(e),
        e.monsterId === 21,
      );

      continue;
    }
    if (r.modes.some((m) => m.actor === e.id && m.starts > r.time)) continue;
    const sided = definition && normalSideMovement(r, e, speed);
    const preferred = e.monsterId ? preferredRange(e.monsterId) : 195;
    if (
      !sided &&
      ((e.kind <= 3 && d > 55) ||
        (e.kind > 3 && (d > preferred + 25 || lineBlocked(r, e, r.player))))
    )
      navigate(r, e, speed);
    if (e.kind > 3 && d < preferred - 25) {
      const a = angle(r.player, e);
      move(r, e, Math.cos(a) * speed * DT, Math.sin(a) * speed * DT, e.radius);
    }
    if (r.time < e.nextAttack || r.modes.some((m) => m.actor === e.id))
      continue;
    if (e.kind <= 3 && d > 220) continue;
    e.nextAttack =
      r.time +
      (definition?.interval ?? (e.kind === 2 ? 2.5 : e.kind === 5 ? 2.2 : 2));
    const attack =
      definition?.attacks[e.attackOrdinal++ % definition.attacks.length];
    addMode(
      r,
      e,
      attack ??
        (e.kind === 1
          ? "rush"
          : e.kind === 2
            ? "mark"
            : e.kind === 3
              ? "slash"
              : "fan"),
      `mon-${e.monsterId ?? e.kind}-${attack ?? e.kind}`,
      normalWarning(e, attack ?? (e.kind <= 3 ? "rush" : "fan")),
      definition
        ? Math.max(0.4, (definition.groups - 1) * 0.3 + 0.1)
        : e.kind <= 3
          ? 0.4
          : e.kind === 4
            ? 0.31
            : 0.01,
      e.kind === 4 ? 3 : 1,
    );
    if (e.monsterId === 24)
      r.modes.at(-1)!.target = limitedMark(e, enemyTarget(r, e), 200);
  }
  // Soft separation prevents enemies piling into one unreadable target.
  for (let i = 0; i < r.enemies.length; i++)
    for (let j = i + 1; j < r.enemies.length; j++) {
      const a = r.enemies[i],
        b = r.enemies[j],
        d = distance(a, b);
      if (a.hp > 0 && b.hp > 0 && d > 0 && d < a.radius + b.radius) {
        const mul = (0.2 * (a.radius + b.radius - d)) / d;
        const dx = (a.x - b.x) * mul,
          dy = (a.y - b.y) * mul;
        move(r, a, dx, dy, a.radius);
        move(r, b, -dx, -dy, b.radius);
      }
    }
}
export function updateModes(r: Run) {
  for (const m of r.modes) {
    const e = r.enemies.find((e) => e.id === m.actor);
    if (
      !e ||
      e.hp <= 0 ||
      r.time < m.starts ||
      r.time < m.next ||
      e.transition > r.time ||
      e.controlUntil > r.time
    )
      continue;
    if (m.bossAttack) {
      executeBossMode(r, m, e);
      continue;
    }
    const boss = e.kind > 5,
      damage =
        enemyDamageScale(r) *
        rallyFactor(r, e, "damage") *
        (boss ? 18 : e.kind === 4 ? 10 : 8) *
        (e.elite ? 1.4 : 1) *
        (r.modifiers.includes(2) ? 1.2 : 1),
      speed = (boss ? 235 : 260) * (r.modifiers.includes(4) ? 1.2 : 1);
    if (m.type === "rush") {
      if (m.count > 0) {
        e.moveAngle = m.angle;
        e.rushUntil = r.time + (boss ? 0.6 : 0.4);
        e.rushHits = [];
        m.count--;
        if (e.monsterId === 6) {
          addMode(r, e, "slash", "mon-6-followslash", 0.4, 0.1);
          const follow = r.modes.at(-1)!;
          follow.angle = m.angle;
          follow.target = { ...m.target };
          follow.spread = 90;
        }
        m.next = r.time + (boss ? 1.05 : 1);
        if (m.count) {
          m.target = { ...enemyTarget(r, e) };
          m.angle = angle(e, m.target);
          m.starts = m.next - 0.45;
        }
      }
    }
    if (m.type === "slash") {
      const a = angle(e, m.target);
      if (![6, 12].includes(e.monsterId ?? 0))
        move(r, e, Math.cos(a) * 70, Math.sin(a) * 70, e.radius);
      const radius = e.monsterId === 12 ? 80 : 60;
      const width = ((m.spread ?? 90) * Math.PI) / 180;
      meleeBodies(
        r,
        e,
        a,
        radius,
        width,
        12 *
          (e.monsterId === 12 ? 1.5 : 1) *
          enemyDamageScale(r) *
          rallyFactor(r, e, "damage") *
          (e.elite ? 1.4 : 1) *
          (r.modifiers.includes(2) ? 1.2 : 1),
        enemyElements(e),
      );
      damageCover(r, e, radius, m.id, boss ? "boss" : "monster", (o) =>
        coverInCone(o, e, radius, a, width),
      );
      visual(r, "cast", e, 0, 0xff796e, 60, a);
      m.next = m.ends + 1;
    }
    if (["fan", "ring", "spiral", "cross", "rows"].includes(m.type)) {
      if (m.groups !== undefined && m.count >= m.groups) {
        m.next = m.ends + 1;
        continue;
      }
      const n =
        m.shots ??
        (m.type === "ring"
          ? 14
          : m.type === "spiral"
            ? 6
            : e.kind === 4
              ? 1
              : boss
                ? 6
                : 7);
      if (r.projectiles.filter((p) => p.enemy).length + n > 600) {
        m.next = r.time + DT;
        m.ends += DT;
        continue;
      }
      const a =
        e.kind === 4
          ? angle(e, enemyTarget(r, e))
          : m.type === "spiral"
            ? m.angle + m.count * 0.314
            : angle(e, enemyTarget(r, e));
      for (let i = 0; i < n; i++) {
        let off = 0;
        if (m.type === "fan") {
          off =
            e.kind === 4 ? 0 : -Math.PI / 3 + (i * Math.PI * 2) / (3 * (n - 1));
          if (!e.monsterId && e.kind === 5 && Math.abs(off) < 0.175) continue;
        }
        if (m.type === "ring") {
          off = e.monsterId
            ? ringWithGap(i, n, (m.count * Math.PI) / 12)
            : (i * Math.PI * 2) / n;
        }
        if (m.spread !== undefined && m.type === "fan")
          off = n === 1 ? 0 : ((-0.5 + i / (n - 1)) * m.spread * Math.PI) / 180;
        if (e.monsterId === 20) off += (m.count * Math.PI) / 12;
        if (m.type === "cross")
          off = (Math.floor(i / 3) * Math.PI) / 2 + ((i % 3) - 1) * 0.13;
        let origin = { x: e.x, y: e.y };
        if (m.type === "rows")
          origin = {
            x: e.x + Math.cos(a + Math.PI / 2) * ((i % 4) - 1.5) * 24,
            y: e.y + Math.sin(a + Math.PI / 2) * ((i % 4) - 1.5) * 24,
          };
        if (m.type === "spiral")
          off = Math.floor(i / 3) * Math.PI + (i % 3) * 0.1;
        shoot(
          r,
          origin,
          a + off,
          damage,
          speed,
          1100,
          null,
          1,
          true,
          e.id,
          m.id,
        );
        if (e.monsterId === 19)
          attachSine(r.projectiles.at(-1)!, (i * Math.PI * 2) / 3);
      }
      m.count++;
      m.next =
        r.time +
        (e.monsterId
          ? normalShotInterval(e.monsterId)
          : e.kind === 4
            ? 0.15
            : m.type === "spiral"
              ? 0.14
              : m.type === "ring"
                ? 0.24
                : boss
                  ? 0.21
                  : 0.18);
    }
    if (m.type === "summon") {
      const count = r.enemies.filter((e) => e.summoned && e.hp > 0).length;
      if (count < 3)
        for (let i = count; i < 3; i++) {
          const summoned = actor(
            r.nextId++,
            1,
            e.x + (i - 1) * 55,
            e.y + 70,
            false,
            true,
          );
          if (!legal(r, summoned, summoned.radius)) {
            summoned.x = 800;
            summoned.y = 300 + i * 40;
          }
          summoned.nextAttack = r.time + 1;
          r.enemies.push(summoned);
        }
      m.next = m.ends + 1;
    }
    if (m.type === "mark" && !boss) {
      area(
        r,
        m.target,
        e.monsterId === 24 ? 65 : 55,
        18 * enemyDamageScale(r) * rallyFactor(r, e, "damage"),
        0,
        0.01,
        1,
        null,
        { owner: e.id },
      );
      if (![8, 14].includes(e.monsterId ?? 0)) {
        const travel = distance(e, m.target),
          scale = Math.min(1, (m.reach ?? 160) / (travel || 1));
        move(
          r,
          e,
          (m.target.x - e.x) * scale,
          (m.target.y - e.y) * scale,
          e.radius,
        );
      }
      m.next = m.ends + 1;
    }
    if (m.type === "mine" || m.type === "laser" || m.type === "mark")
      m.next = m.ends + 1;
  }
  for (const e of r.enemies)
    if (
      e.kind > 5 &&
      !e.bossId &&
      e.rushUntil > r.time &&
      e.controlUntil <= r.time &&
      e.transition <= r.time
    ) {
      const m = r.modes.find((m) => m.actor === e.id && m.type === "rush");
      if (m)
        damageCover(r, e, 0, m.id, "boss", (o) =>
          coverInRush(
            o,
            e,
            Math.cos(e.moveAngle) * 310 * DT,
            Math.sin(e.moveAngle) * 310 * DT,
            e.radius,
          ),
        );
      move(
        r,
        e,
        Math.cos(e.moveAngle) * 310 * DT,
        Math.sin(e.moveAngle) * 310 * DT,
        e.radius,
      );
      contactRush(r, e, 30, enemyElements(e));
    }
  r.modes = r.modes.filter(
    (m) =>
      m.ends >= r.time && r.enemies.some((e) => e.id === m.actor && e.hp > 0),
  );
}
