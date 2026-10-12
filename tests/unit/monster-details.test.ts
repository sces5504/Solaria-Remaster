import { it, expect } from "vitest";
import { newRun } from "../../src/game/core/run";
import { actor } from "../../src/game/data/world";
import { monsters } from "../../src/game/data/biomes";
import { updateEnemies, updateModes } from "../../src/game/systems/enemies";
import {
  updateProjectiles,
  hurt,
  area,
  context,
  updateAreas,
} from "../../src/game/systems/combat";
import {
  enemyElements,
  attachSine,
} from "../../src/game/systems/monster-details";
function arena(id: number) {
  const r = newRun("mage", id);
  r.obstacles = [];
  r.modifiers = [];
  r.reserves = [];
  r.player.x = 300;
  r.player.y = 320;
  r.player.invulnerable = 100;
  const d = monsters[id],
    e = actor(100, d.archetype, 500, 320);
  e.monsterId = id;
  e.element = d.element;
  e.nextAttack = 0;
  e.hp = e.maxHP = 10000;
  r.enemies = [e];
  return { r, e };
}
for (const [id, count] of [
  [7, 3],
  [10, 5],
  [11, 12],
  [13, 3],
  [16, 5],
  [17, 8],
  [19, 3],
  [20, 12],
  [22, 3],
  [23, 24],
  [25, 8],
  [26, 16],
  [28, 5],
  [29, 6],
])
  it(`${id} 真正發射完整首招 ${count} 彈，未發射不算完成`, () => {
    const { r } = arena(id);
    for (let tick = 0; tick < 90; tick++) {
      r.time = tick / 60;
      updateEnemies(r);
      updateModes(r);
    }
    expect(r.projectiles).toHaveLength(count);
    expect(
      r.projectiles.every(
        (p) => Number.isFinite(p.vx) && Number.isFinite(p.vy),
      ),
    ).toBe(true);
  });
it("19 正弦彈橫幅不超20，沿實際路徑碰撞，而非僅美術抖動", () => {
  const { r } = arena(19);
  r.player.x = 50;
  r.projectiles = [
    {
      id: 1,
      x: 200,
      y: 200,
      vx: 260,
      vy: 0,
      radius: 5,
      distanceLeft: 800,
      damage: 5,
      context: null,
      enemy: true,
      owner: 100,
      wave: 1,
      hit: [],
      pierce: 1,
      bounce: 0,
      explosion: 0,
      explosionDamage: 0,
      trail: 0,
    },
  ];
  attachSine(r.projectiles[0]);
  let varied = false;
  for (let i = 0; i < 120; i++) {
    updateProjectiles(r, 1 / 60);
    const p = r.projectiles[0];
    expect(Math.abs(p.y - 200)).toBeLessThanOrEqual(20.00001);
    varied ||= Math.abs(p.y - 200) > 10;
  }
  expect(varied).toBe(true);
});
it("原生火焰可疊冰覺醒；敵人死後發出的元素仍保留，一次傷害不重複扣", () => {
  const { r, e } = arena(13);
  e.element = "ice";
  expect(enemyElements(e)).toEqual(["ice", "fire"]);
  updateEnemies(r);
  r.time = 0.4;
  updateModes(r);
  expect(r.projectiles[0].enemyElements).toEqual(["ice", "fire"]);
  r.enemies = [];
  r.player.invulnerable = 0;
  r.stats.armor = 0;
  r.player.x = 500;
  r.player.y = 320;
  const p = r.projectiles[0];
  p.x = 498;
  p.y = 320;
  p.vx = 260;
  p.vy = 0;
  const hp = r.player.hp,
    damage = p.damage;
  updateProjectiles(r, 1 / 60);
  expect(r.player.hp).toBe(hp - damage);
  expect(r.player.burnUntil).toBeGreaterThan(r.time);
  expect(r.player.frost).toBe(15);
});
it("封印柱不受聚怪拉動；玩家濕潤冰傷倍率及凍結身份保留", () => {
  const { r, e } = arena(18);
  e.sealPillar = true;
  area(r, { x: 480, y: 320 }, 80, 1, 0, 1, 1, context(r, 36), { pull: true });
  updateAreas(r);
  expect(e.x).toBe(500);
  r.player.invulnerable = 0;
  r.stats.armor = 0;
  r.player.wetUntil = 10;
  const hp = r.player.hp;
  hurt(r, 8, "ice");
  expect(r.player.hp).toBe(hp - 10);
  r.player.invulnerable = 0;
  r.player.frost = 90;
  hurt(r, 0, "ice");
  expect(r.player.freezeUntil).toBe(r.time + 0.6);
});
it("600 上限延後整组，排队模式不因原duration到期丟失", () => {
  const { r } = arena(7);
  updateEnemies(r);
  r.time = 0.4;
  for (let i = 0; i < 600; i++)
    r.projectiles.push({
      id: 1000 + i,
      x: 900,
      y: 500,
      vx: 0,
      vy: 0,
      radius: 5,
      distanceLeft: 500,
      damage: 5,
      context: null,
      enemy: true,
      owner: 100,
      wave: 1,
      hit: [],
      pierce: 1,
      bounce: 0,
      explosion: 0,
      explosionDamage: 0,
      trail: 0,
    });
  for (let i = 0; i < 120; i++) {
    r.time += 1 / 60;
    updateModes(r);
  }
  expect(r.projectiles).toHaveLength(600);
  expect(r.modes).toHaveLength(1);
  r.projectiles = [];
  r.time += 1 / 60;
  updateModes(r);
  expect(r.projectiles).toHaveLength(3);
});
