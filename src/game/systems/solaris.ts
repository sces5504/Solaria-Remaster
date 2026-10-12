import { solarArena } from "../data/solar-arena";
import type { Actor, Run } from "../core/types";
import type { BossAttack, BossPattern } from "../data/bosses";
import { actor, roomXPBudget } from "../data/world";
import { angle, distance, DT } from "../core/primitives";
import { beginBossAttack, moveBossRush } from "./biome-bosses";
import { hurt, shoot, visual } from "./combat";
import { move } from "./geometry";
const health = [18000, 22000, 28000];
const attack = (
  id: string,
  name: string,
  pattern: BossPattern,
  extra: Partial<BossAttack> = {},
): BossAttack => ({
  id,
  name,
  pattern,
  warning: 0.8,
  duration: 1.5,
  interval: 0.25,
  shots: 14,
  groups: 1,
  arms: 2,
  spread: 120,
  radius: 85,
  damage: 18,
  speed: 240,
  rotation: 0,
  ...extra,
});
export const solarisAttacks: BossAttack[][] = [
  [
    attack("solaris-rush", "日輪突進", "rush", {
      damage: 30,
      duration: 0.95,
      rushSpeed: 375,
      rushTime: 0.9,
    }),
    attack("solaris-leap", "天日躍擊", "mark", { damage: 36 }),
    attack("solaris-flare", "日焰", "slash", {
      damage: 30,
      radius: 205,
      spread: 100,
    }),
  ],
  [
    attack("solaris-spiral", "雙重日輪", "spiral", {
      shots: 6,
      arms: 2,
      duration: 2.4,
      rotation: Math.PI / 12,
    }),
    attack("solaris-shifted-ring", "錯位日環", "ring", {
      groups: 3,
      interval: 0.4,
      rotation: Math.PI / 14,
    }),
    attack("solaris-cross", "交叉星芒", "cross", {
      shots: 12,
      groups: 2,
      interval: 0.5,
      rotation: Math.PI / 4,
    }),
  ],
  [
    attack("solaris-rays", "日冕雷射", "sweep", {
      damage: 24,
      arms: 3,
      beamAngles: [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3],
      beamStagger: 0,
      rotation: Math.PI * 2,
      duration: 3,
    }),
    attack("solaris-falling-stars", "群星墜落", "mark", {
      damage: 36,
      groups: 5,
      radius: 65,
      duration: 1.8,
    }),
    attack("solaris-final-rush", "終日突進", "rush", {
      damage: 30,
      groups: 3,
      duration: 3.4,
      rushSpeed: 390,
      rushTime: 0.8,
    }),
  ],
];
export function placeSolaris(r: Run) {
  const e = actor(r.nextId++, 6, 760, 320);
  e.solarisBar = 1;
  e.radius = 36;
  e.hp = e.maxHP = health[0] * 1.6 ** ((r.loop ?? 1) - 1);
  e.xpReward = roomExperience(r);
  r.solaris = { sealed: false, wave: 0, next: r.time + 2 };
  r.enemies = [e];
  r.reserves = [];
  r.hazards = [];
  r.obstacles = solarArena(r);
  r.route = [
    { x: 48, y: 320 },
    { x: 512, y: 320 },
    { x: 980, y: 320 },
  ];
}
function roomExperience(r: Run) {
  return roomXPBudget(r.room);
}
// Returns actual HP lost from one bar. Excess damage never skips a bar or seal.
export function damageSolaris(r: Run, e: Actor, value: number) {
  const lost = Math.min(e.hp, value);
  e.hp -= lost;
  if (e.hp > 0 || e.solarisBar === 3) return lost;
  const old = e.solarisBar!;
  e.solarisBar = (old + 1) as 2 | 3;
  e.hp = e.maxHP = health[e.solarisBar - 1] * 1.6 ** ((r.loop ?? 1) - 1);
  e.attackOrdinal = 0;
  e.rushUntil = 0;
  r.modes = r.modes.filter((m) => m.actor !== e.id);
  if (old === 1) {
    r.solaris = { sealed: true, wave: 0, next: r.time + 2 };
    e.transition = 1e11;
    for (const p of [
      { x: 240, y: 160 },
      { x: 840, y: 160 },
      { x: 240, y: 480 },
      { x: 840, y: 480 },
    ]) {
      const pillar = actor(r.nextId++, 2, p.x, p.y, true, true);
      pillar.sealPillar = true;
      pillar.hp = pillar.maxHP = 1500 * 1.6 ** ((r.loop ?? 1) - 1);
      pillar.armor = 0;
      pillar.radius = 24;
      pillar.xpReward = 0;
      r.enemies.push(pillar);
    }
  } else {
    e.transition = r.time + 2;
    e.nextAttack = r.time + 2.1;
  }
  visual(r, "phase", e, 0, 0xffe5a0, 110);
  return lost;
}
export function solarisAI(r: Run, e: Actor) {
  if (r.solaris?.sealed) {
    if (!r.enemies.some((a) => a.sealPillar && a.hp > 0)) {
      r.solaris.sealed = false;
      e.transition = r.time;
      e.nextAttack = r.time + 0.8;
      visual(r, "phase", e, 0, 0xfff4bc, 140);
      return;
    }
    if (
      r.time >= r.solaris.next &&
      r.projectiles.filter((p) => p.enemy).length + 12 <= 600
    ) {
      const gap = (r.solaris.wave++ * Math.PI) / 4;
      // Twelve evenly spaced projectiles occupy 300 degrees; a rotating 60-degree corridor stays open.
      for (let i = 0; i < 12; i++)
        shoot(
          r,
          e,
          gap + Math.PI / 6 + (i * Math.PI * 5) / 33,
          54 * 1.2 ** ((r.loop ?? 1) - 1),
          235,
          1100,
          null,
          1,
          true,
          e.id,
          r.nextId,
        );
      r.solaris.next = r.time + 2;
      r.attackLog.push("solaris-seal-ring");
    }
    return;
  }
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
      m.angle = angle(e, r.player);
      m.target = { ...r.player };
      m.starts = m.next;
    }
  }
  if (r.time >= e.nextAttack && active.length < 2) {
    const a = solarisAttacks[e.solarisBar! - 1][e.attackOrdinal++ % 3];
    beginBossAttack(r, e, a);
    // The last-bar rush carries a complete radial volley, sharing its telegraph and mode slot.
    if (a.id === "solaris-final-rush")
      beginBossAttack(
        r,
        e,
        attack("solaris-final-ring", "日輪迸裂", "ring", {
          warning: 0.8,
          shots: 14,
        }),
      );
    e.nextAttack = r.time + 2.6;
  }
  if (e.rushUntil > r.time) {
    moveBossRush(
      r,
      e,
      active.find((m) => m.bossAttack?.pattern === "rush"),
    );
    if (
      distance(e, r.player) < e.radius + r.player.radius &&
      !e.rushHits.includes(0)
    ) {
      hurt(r, 90 * 1.2 ** ((r.loop ?? 1) - 1), "fire");
      e.rushHits.push(0);
    }
  } else if (
    !active.some((m) => m.starts > r.time) &&
    distance(e, r.player) > 190
  ) {
    const a = angle(e, r.player);
    move(r, e, Math.cos(a) * 77 * DT, Math.sin(a) * 77 * DT, e.radius);
  }
}
