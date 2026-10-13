import { expect, it } from "vitest";
import { newRun } from "../../src/game/core/run";
import { actor } from "../../src/game/data/world";
import {
  shoot,
  damageCover,
  area,
  updateAreas,
} from "../../src/game/systems/combat";
import { normalizeBossProjectileDamage } from "../../src/game/systems/boss-balance";
import {
  beginBossAttack,
  executeBossMode,
  placeBoss,
} from "../../src/game/systems/biome-bosses";
import { bosses } from "../../src/game/data/bosses";
import { eventBosses } from "../../src/game/data/event-content";
import { validate } from "../../src/game/persistence/checkpoint";
import { coverDamageRadius } from "../../src/game/systems/cover";
const wall = (x = 500, y = 280) => ({
  id: 1,
  x,
  y,
  w: 32,
  h: 64,
  kind: "rock" as const,
  durability: 20,
  maxDurability: 20,
  waves: [] as number[],
});
it.each([1, 2, ...Object.keys(bosses).map(Number), 20, 21, 31])(
  "Boss身份 %i 的子彈傷害只乘.95一次，保存／發射者死亡也不重乘",
  (id) => {
    const r = newRun("sword", 701);
    r.enemies = [actor(99, 6, 400, 320)];
    r.enemies[0].bossId = id;
    r.obstacles = [];
    shoot(
      r,
      { x: 400, y: 320 },
      0,
      20,
      200,
      1000,
      null,
      1,
      true,
      99,
      100,
      20,
      10,
    );
    expect(r.projectiles[0].damage).toBe(19);
    expect(r.projectiles[0].explosionDamage).toBe(9.5);
    r.enemies = [];
    const saved = validate({
      version: 1,
      revision: 0,
      current: r,
      entry: structuredClone(r),
    });
    normalizeBossProjectileDamage(saved.current);
    expect(saved.current.projectiles[0].damage).toBe(19);
    delete saved.current.projectiles[0].bossDamageTuned;
    saved.current.projectiles[0].damage = 20;
    saved.current.projectiles[0].explosionDamage = 10;
    normalizeBossProjectileDamage(saved.current);
    normalizeBossProjectileDamage(saved.current);
    expect(saved.current.projectiles[0].damage).toBe(19);
  },
);
it("一般敵彈、Boss召喚的普通精英、我方彈不降傷，Solaris柱彈屬Boss", () => {
  const r = newRun("sword", 702);
  r.enemies = [actor(90, 1, 400, 320, true, true), actor(91, 2, 400, 320)];
  r.enemies[1].sealPillar = true;
  shoot(r, r.player, 0, 20, 200, 1000, null, 1, true, 90);
  shoot(r, r.player, 0, 20, 200, 1000, null, 1, false, 91);
  shoot(r, r.player, 0, 20, 200, 1000, null, 1, true, 91);
  expect(r.projectiles.map((p) => p.damage)).toEqual([20, 20, 19]);
});
it("近戰斬／衝撞掩體在三角形每次10耐久，2秒／同波及湖泊仍保持", () => {
  const r = newRun("sword", 703);
  r.player.x = 112;
  r.player.y = 320;
  r.obstacles = [wall()];
  damageCover(r, { x: 500, y: 320 }, 60, 1, "boss", undefined, true);
  expect(r.obstacles[0].durability).toBe(10);
  r.time = 1.99;
  damageCover(r, { x: 500, y: 320 }, 60, 2, "boss", undefined, true);
  expect(r.obstacles[0].durability).toBe(10);
  r.time = 2;
  damageCover(r, { x: 500, y: 320 }, 60, 1, "boss", undefined, true);
  expect(r.obstacles[0].durability).toBe(10);
  damageCover(r, { x: 500, y: 320 }, 60, 2, "boss", undefined, true);
  expect(r.obstacles[0].durability).toBe(0);
  r.obstacles = [{ ...wall(), kind: "lake" }];
  r.time = 4;
  damageCover(r, { x: 500, y: 320 }, 60, 3, "boss", undefined, true);
  expect(r.obstacles[0].durability).toBe(20);
});
it("普通來源只在兩倍靜電圓與掩體邊缘相交時受損；静電技能本身未放大", () => {
  const r = newRun("sword", 704);
  r.player.x = 112;
  r.player.y = 320;
  r.stats.range = 1;
  expect(coverDamageRadius(r)).toBe(220);
  r.obstacles = [wall(332), { ...wall(332.01), id: 2 }];
  damageCover(r, { x: 332, y: 320 }, 40, 1, "monster");
  expect(r.obstacles.map((o) => o.durability)).toEqual([16, 20]);
});
it("實際Boss斬擊與落擊在三角形扣10；同區落雷維持5", () => {
  const r = newRun("sword", 705);
  r.biome = "icefield";
  r.enemies = [];
  r.reserves = [];
  r.obstacles = [wall()];
  r.player.x = 900;
  r.player.y = 550;
  const e = placeBoss(r, 6);
  e.x = 450;
  e.y = 320;
  r.enemies = [e];
  const slash = bosses[6].attacks.flat().find((a) => a.pattern === "slash")!;
  beginBossAttack(r, e, slash);
  const m = r.modes.at(-1)!;
  m.angle = 0;
  r.time = m.starts;
  executeBossMode(r, m, e);
  expect(r.obstacles[0].durability).toBe(10);
  r.obstacles = [wall()];
  r.time += 3;
  r.areas = [];
  area(r, { x: 510, y: 320 }, 85, 20, 0, 0.01, 1, null, {
    owner: e.id,
    eventAbility: "troll-leap",
    wave: 99,
  });
  updateAreas(r);
  expect(r.obstacles[0].durability).toBe(10);
  r.obstacles = [wall()];
  r.areas = [];
  area(r, { x: 510, y: 320 }, 85, 20, 0, 0.01, 1, null, {
    owner: e.id,
    eventAbility: "witch-thunder",
    wave: 100,
  });
  updateAreas(r);
  expect(r.obstacles[0].durability).toBe(15);
});
