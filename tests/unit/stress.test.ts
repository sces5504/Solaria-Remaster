import { it, expect } from "vitest";
import { newRun } from "../../src/game/core/run";
import { actor } from "../../src/game/data/world";
import {
  shoot,
  hit,
  context,
  updateProjectiles,
} from "../../src/game/systems/combat";
import { inspectProjectilePool } from "../../src/game/systems/projectile-pool";
it("600有效敵彈一個固定tick全部移動，不刪有效彈；退役後重用同批物件", () => {
  const r = newRun("mage", 701);
  r.obstacles = [];
  r.enemies = [];
  for (let i = 0; i < 600; i++)
    shoot(
      r,
      { x: 800 + (i % 8), y: 90 + (i % 500) },
      Math.PI,
      10,
      180,
      2000,
      null,
      1,
      true,
    );
  const identities = new Set(r.projectiles.map((p) => p.id));
  const before = r.projectiles.map((p) => p.x);
  updateProjectiles(r, 1 / 60);
  expect(r.projectiles).toHaveLength(600);
  expect(new Set(r.projectiles.map((p) => p.id))).toEqual(identities);
  r.projectiles.forEach((p, i) => expect(p.x).toBeCloseTo(before[i] - 3));
  for (const p of r.projectiles) p.distanceLeft = 0;
  updateProjectiles(r, 1 / 60);
  expect(r.projectiles).toHaveLength(0);
  expect(inspectProjectilePool(r).cached).toBe(600);
  const created = inspectProjectilePool(r).created;
  for (let i = 0; i < 600; i++)
    shoot(
      r,
      { x: 800, y: 100 + (i % 450) },
      Math.PI,
      5,
      180,
      2000,
      null,
      1,
      true,
    );
  expect(inspectProjectilePool(r).created).toBe(created);
  expect(r.projectiles).toHaveLength(600);
});
it("十二共振目標各保留獨立根傷與共振傷字、控制及計時器", () => {
  const r = newRun("mage", 702);
  r.obstacles = [];
  r.cards[74] = 1;
  r.elements = ["ice", "fire"];
  r.stats.crit = 0;
  r.enemies = Array.from({ length: 12 }, (_, i) => {
    const e = actor(
      1000 + i,
      1,
      150 + (i % 4) * 50,
      200 + Math.floor(i / 4) * 70,
    );
    e.hp = e.maxHP = 10000;
    return e;
  });
  for (const e of r.enemies)
    hit(r, e, 10, context(r, 41, "basic", ["ice", "fire"], true));
  const labels = r.visuals.filter((v) => v.kind === "damage");
  expect(labels).toHaveLength(24);
  expect(new Set(labels.map((v) => v.id)).size).toBe(24);
  for (const e of r.enemies) {
    expect(e.hp).toBe(9950);
    expect(e.advancedResonanceNext).toBe(1);
    expect(e.burn).toHaveLength(1);
    expect(e.iceUntil).toBe(3);
  }
});
