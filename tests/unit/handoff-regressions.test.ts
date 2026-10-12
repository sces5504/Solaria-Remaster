import { expect, it } from "vitest";
import { newRun, idleCommand } from "../../src/game/core/run";
import { actor } from "../../src/game/data/world";
import { basic, updateSkills } from "../../src/game/systems/skills";
import { context, hit } from "../../src/game/systems/combat";

it.each([
  [42, "sword", 60, 40, 30, 0.3],
  [48, "bow", 100, 100, 18, 0.4],
  [55, "mage", 200, 320, 24, 0.4],
] as const)(
  "CARD-%i 條件升級不外溢到條件外普攻",
  (id, cls, outside, inside, base, bonus) => {
    const r = newRun(cls, 221);
    r.obstacles = [];
    r.stats.crit = 0;
    r.cards[id] = 2;
    const e = actor(999, 1, r.player.x + outside, r.player.y);
    e.hp = e.maxHP = 10000;
    e.armor = 0;
    if (id === 48) e.hp--;
    r.enemies = [e];
    basic(r, idleCommand(r));
    if (cls === "sword") expect(10000 - e.hp).toBeCloseTo(base);
    else {
      expect(r.projectiles[0].damage).toBe(base);
      const hp = e.hp;
      hit(r, e, r.projectiles[0].damage, r.projectiles[0].context!);
      expect(hp - e.hp).toBeCloseTo(base);
    }
    e.x = r.player.x + inside;
    if (id === 48) e.hp = e.maxHP;
    const hp = e.hp;
    hit(r, e, base, context(r, id, "basic", [], true, 1, false, "none"));
    expect(hp - e.hp).toBeCloseTo(base * (1 + bonus * 1.15));
  },
);

it("CARD-49 升級只強化第三次命中，不提高前兩次", () => {
  const r = newRun("bow", 222);
  r.cards[49] = 2;
  r.obstacles = [];
  r.stats.crit = 0;
  const e = actor(999, 1, 400, 320);
  e.hp = e.maxHP = 10000;
  e.armor = 0;
  r.enemies = [e];
  for (let i = 0; i < 3; i++) {
    basic(r, idleCommand(r));
    const p = r.projectiles.at(-1)!;
    expect(p.damage).toBe(18);
    const hp = e.hp;
    hit(r, e, p.damage, p.context!);
    expect(hp - e.hp).toBeCloseTo(i === 2 ? 18 * 1.69 : 18);
  }
});

it("CARD-40 火加電麻痺不算冰，每個目標獨立交替且不補射", () => {
  const r = newRun("mage", 223);
  r.cards[40] = 1;
  r.obstacles = [];
  r.time = 1;
  const e = actor(999, 1, 400, 320);
  e.burn = [{ until: 10, damage: 8, scale: 0.2 }];
  e.controlUntil = e.stunUntil = 10;
  r.enemies = [e];
  updateSkills(r, idleCommand(r));
  expect(r.projectiles).toHaveLength(0);
  e.iceUntil = 10;
  updateSkills(r, idleCommand(r));
  expect(r.projectiles).toHaveLength(1);
  expect(r.projectiles[0].context!.elementMask).toEqual(["ice"]);
  expect(r.projectiles[0].context!.chainScale).toBe(0.2);
  expect(r.projectiles[0].context!.canCrit).toBe(true);
  updateSkills(r, idleCommand(r));
  expect(r.projectiles).toHaveLength(1);
  r.time = 8.2;
  updateSkills(r, idleCommand(r));
  expect(r.projectiles).toHaveLength(2);
  expect(r.projectiles[1].context!.elementMask).toEqual(["fire"]);
});
