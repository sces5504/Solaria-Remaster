import { it, expect } from "vitest";
import { newRun, settle } from "../../src/game/core/run";
import { actor } from "../../src/game/data/world";
import { derive } from "../../src/game/systems/progression";
import { context, hit, hurt } from "../../src/game/systems/combat";
import { dodge, basic, castSkill } from "../../src/game/systems/skills";
import { idleCommand } from "../../src/game/core/run";
for (const id of [60, 62, 64, 65, 68])
  it(`${id} 傷害只在條件成立時增加；追加不冒充普攻或職技`, () => {
    const r = newRun("mage", id);
    r.cards[id] = 1;
    r.stats = derive(r);
    r.stats.crit = 0;
    r.obstacles = [];
    r.time = 10;
    r.player.lastBasic = 10;
    const e = actor(99, 1, 500, 320);
    e.hp = e.maxHP = 1e5;
    e.armor = 0;
    const kind =
      id === 62 ? "basic" : id === 65 || id === 68 ? "skill" : "additional";
    const base = hit(r, e, 100, context(r, 90, kind));
    if (id === 60) r.player.hp = r.stats.maxHP * 0.4;
    if (id === 62) dodge(r, idleCommand(r));
    if (id === 64) e.elite = true;
    if (id === 65) r.player.lastBasic = 0;
    if (id === 68) e.freezeUntil = 20;
    if (id === 65) {
      r.player.lastBasic = 10;
      expect(hit(r, e, 100, context(r, 90, kind))).toBe(base);
      r.player.lastBasic = 0;
    }
    const upgraded = hit(r, e, 100, context(r, 90, kind));
    expect(upgraded).toBeGreaterThan(base);
    if (id === 62 || id === 65 || id === 68)
      expect(hit(r, e, 100, context(r, 90, "additional"))).toBe(100);
  });
it("61 四秒後一次耐戰、受傷重算；總減傷不超50%", () => {
  const r = newRun("mage", 1);
  r.cards[61] = 5;
  r.stats = derive(r);
  r.stats.armor = 0;
  r.time = 4;
  hurt(r, 10);
  expect(r.player.hp).toBeCloseTo(83.2);
  r.time = 5;
  hurt(r, 10);
  expect(r.player.hp).toBeCloseTo(73.2);
  r.time = 9;
  hurt(r, 10);
  expect(r.player.hp).toBeCloseTo(66.4);
});
it("63 清算盾只一次；67 施技盾；69 受傷兩秒攻速不永久", () => {
  const r = newRun("mage", 3);
  r.cards[63] = 3;
  r.cards[67] = 2;
  r.cards[69] = 1;
  r.stats = derive(r);
  r.time = 10;
  settle(r);
  settle(r);
  expect(r.player.shields).toHaveLength(1);
  expect(r.player.shields[0].amount).toBeCloseTo(r.stats.maxHP * 0.14);
  castSkill(r, idleCommand(r));
  expect(r.player.shields).toHaveLength(2);
  r.player.shields = [];
  hurt(r, 5);
  expect(derive(r).attackRate).toBeGreaterThan(2);
  r.time += 2.01;
  expect(derive(r).attackRate).toBe(2);
});
it("65 弓職技連射代理不算按左鍵，主動左鍵才重設靜心", () => {
  const r = newRun("bow", 1);
  r.time = 10;
  basic(r, idleCommand(r), true);
  expect(r.player.lastBasic).toBeUndefined();
  basic(r, idleCommand(r));
  expect(r.player.lastBasic).toBe(10);
});
