import { it, expect } from "vitest";
import { newRun } from "../../src/game/core/run";
import { actor } from "../../src/game/data/world";
import { shoot, context } from "../../src/game/systems/combat";
import { sweepProjectiles } from "../../src/game/systems/projectile-sweep";
import { ContactQueue } from "../../src/game/systems/contact-queue";
it("全彈時間序決定首次承傷，不依儲存先後，後到彈仍命中並被無敵擋下", () => {
  for (const reverse of [false, true]) {
    const r = newRun("sword", 501);
    r.obstacles = [];
    r.enemies = [];
    r.stats.armor = 0;
    r.player.x = 500;
    r.player.y = 320;
    shoot(r, { x: 400, y: 320 }, 0, 80, 6000, 1000, null, 1, true);
    shoot(r, { x: 480, y: 320 }, 0, 10, 6000, 1000, null, 1, true);
    if (reverse) r.projectiles.reverse();
    sweepProjectiles(r, 1 / 60);
    expect(r.player.hp).toBe(140);
    expect(r.projectiles).toHaveLength(0);
  }
});
it("穿透首碰依交點時間，即使敵人陣列以遠近反向儲存", () => {
  const r = newRun("mage", 502);
  r.obstacles = [];
  r.enemies = [actor(9, 1, 180, 320), actor(10, 1, 140, 320)];
  r.stats.crit = 0;
  for (const e of r.enemies) e.hp = e.maxHP = 1000;
  shoot(r, { x: 100, y: 320 }, 0, 20, 6000, 1000, context(r, 41, "basic"));
  sweepProjectiles(r, 1 / 60);
  expect(r.enemies[0].hp).toBe(1000);
  expect(r.enemies[1].hp).toBe(980);
});
it("掩體交點早於目標，穿湖但不穿實體；高速射彈不跳過薄掩體", () => {
  const r = newRun("mage", 503);
  r.enemies = [actor(10, 1, 250, 320)];
  r.stats.crit = 0;
  r.obstacles = [
    {
      id: 3,
      x: 190,
      y: 300,
      w: 2,
      h: 40,
      kind: "pillar",
      durability: 100,
      maxDurability: 100,
      waves: [],
    },
  ];
  const hp = r.enemies[0].hp;
  shoot(r, { x: 100, y: 320 }, 0, 20, 12000, 1000, context(r, 41, "basic"));
  sweepProjectiles(r, 1 / 60);
  expect(r.enemies[0].hp).toBe(hp);
  r.obstacles[0].kind = "lake";
  shoot(r, { x: 100, y: 320 }, 0, 20, 12000, 1000, context(r, 41, "basic"));
  sweepProjectiles(r, 1 / 60);
  expect(r.enemies[0].hp).toBeLessThan(hp);
});
it("接觸佇列穩定排序所有事件，空佇列安全", () => {
  const q = new ContactQueue<{ time: number; id: number }>(
    (a, b) => a.time - b.time || a.id - b.id,
  );
  for (const v of [
    { time: 3, id: 1 },
    { time: 1, id: 2 },
    { time: 1, id: 1 },
    { time: 4, id: 4 },
    { time: 2, id: 3 },
  ])
    q.push(v);
  const out = [];
  while (q.size) out.push(q.pop());
  expect(out).toEqual([
    { time: 1, id: 1 },
    { time: 1, id: 2 },
    { time: 2, id: 3 },
    { time: 3, id: 1 },
    { time: 4, id: 4 },
  ]);
  expect(q.pop()).toBeUndefined();
});
