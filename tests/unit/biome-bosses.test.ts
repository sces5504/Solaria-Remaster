import { it, expect } from "vitest";
import { newRun, startRoom, step, idleCommand } from "../../src/game/core/run";
import { bosses, bossArena } from "../../src/game/data/bosses";
import {
  placeBoss,
  executeBossMode,
  updateHealingSummon,
} from "../../src/game/systems/biome-bosses";
import { context, hit, shoot } from "../../src/game/systems/combat";
import { biomeLayout } from "../../src/game/data/biomes";
import { legal } from "../../src/game/systems/geometry";
import { actor } from "../../src/game/data/world";
it.each(Object.values(bosses))(
  "BOSS-$id $name 兩階段各三獨立招式持續可觀察",
  (definition) => {
    const r = newRun("mage", definition.id * 707);
    r.biome = definition.biome;
    r.room = 5;
    r.boss = definition.id;
    r.enemies = [];
    r.reserves = [];
    const e = placeBoss(r, definition.id);
    r.enemies = [e];
    r.obstacles = [];
    startRoom(r);
    r.player.invulnerable = 1000;
    for (const phase of [1, 2] as const) {
      e.phase = phase;
      e.nextAttack = r.time;
      e.attackOrdinal = 0;
      r.modes = [];
      for (let i = 0; i < 2400; i++) step(r, idleCommand(r));
      for (const attack of definition.attacks[phase - 1])
        expect(r.attackLog).toContain(attack.id);
      expect(
        r.projectiles.every(
          (p) => Number.isFinite(p.vx) && Number.isFinite(p.vy),
        ),
      ).toBe(true);
      expect(r.areas.every((a) => Number.isFinite(a.radius))).toBe(true);
    }
  },
);
it("雙眼總剩餘血量不增、第一體死亡不清關、兩體死才清算", () => {
  const r = newRun("sword", 1212);
  r.biome = "corruption";
  r.room = 5;
  r.boss = 12;
  r.obstacles = [];
  r.reserves = [];
  const e = placeBoss(r, 12);
  e.xpReward = 180;
  r.enemies = [e];
  r.stats.crit = 0;
  const actual = hit(
    r,
    e,
    99999,
    context(r, 1, "basic", [], false, 1, false, "none"),
  );
  expect(actual).toBe(9000);
  expect(r.enemies).toHaveLength(2);
  expect(r.enemies.reduce((total, e) => total + e.hp, 0)).toBe(9000);
  expect(r.enemies.every((e) => e.maxHP === 4500)).toBe(true);
  startRoom(r);
  r.enemies[0].hp = 0;
  step(r, idleCommand(r));
  expect(r.phase).toBe("COMBAT");
  r.enemies[0].hp = 0;
  step(r, idleCommand(r));
  expect(r.phase).toBe("SETTLEMENT");
});
it("血球可攔截、回血圖騰不跨階段回血", () => {
  const r = newRun("mage", 14);
  r.biome = "crimson";
  const boss = placeBoss(r, 14);
  boss.phase = 2;
  boss.hp = 8990;
  const orb = actor(888, 2, boss.x, boss.y, false, true);
  orb.summonRole = "blood";
  orb.bossOwner = boss.id;
  r.enemies = [boss, orb];
  updateHealingSummon(r, orb);
  expect(boss.hp).toBe(9000);
  expect(orb.hp).toBe(0);
  orb.hp = 0;
  boss.hp = 8000;
  updateHealingSummon(r, orb);
  expect(boss.hp).toBe(8000);
});
it("Boss整組超600延後，不發半組，也不刪現有彈", () => {
  const r = newRun("mage", 15);
  r.biome = "stars";
  r.obstacles = [];
  const e = placeBoss(r, 15);
  r.enemies = [e];
  for (let i = 0; i < 597; i++)
    shoot(r, e, i, 1, 1, 1100, null, 1, true, e.id, 1);
  const a = bosses[15].attacks[0][0];
  const m = {
    id: 555,
    actor: e.id,
    type: "mark" as const,
    attackId: a.id,
    starts: 0,
    ends: 2,
    next: 0,
    count: 0,
    angle: 0,
    target: { x: 112, y: 320 },
    phase: 1,
    bossAttack: a,
  };
  executeBossMode(r, m, e);
  expect(r.projectiles).toHaveLength(597);
  expect(m.count).toBe(0);
  expect(m.next).toBeGreaterThan(r.time);
  r.projectiles.splice(0, 6);
  r.time = m.next;
  executeBossMode(r, m, e);
  expect(r.projectiles).toHaveLength(597);
  expect(m.count).toBe(1);
});

it.each(Object.values(bosses))(
  "BOSS-$id 專屬布局入口、王落點及出口可走",
  (definition) => {
    for (let seed = 1; seed <= 12; seed++) {
      const r = newRun("sword", seed);
      const layout = bossArena(definition.id, seed);
      r.obstacles = layout.obstacles;
      expect(r.obstacles.length).toBeGreaterThanOrEqual(6);
      expect(r.obstacles.every((o) => o.w >= 64)).toBe(true);
      expect(
        r.obstacles.reduce((sum, o) => sum + o.w * o.h, 0),
      ).toBeGreaterThanOrEqual(18000);
      expect(legal(r, { x: 112, y: 320 }, 18)).toBe(true);
      expect(legal(r, { x: 928, y: 320 }, 18)).toBe(true);
      expect(legal(r, { x: 760, y: 320 }, definition.radius)).toBe(true);
    }
  },
);
