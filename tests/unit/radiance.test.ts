import { it, expect } from "vitest";
import { newRun, idleCommand } from "../../src/game/core/run";
import { derive, grantTestCard } from "../../src/game/systems/progression";
import { castSkill } from "../../src/game/systems/skills";
import { actor } from "../../src/game/data/world";
import {
  updateAreas,
  area,
  context,
  hit,
  elemental,
  control,
} from "../../src/game/systems/combat";
import { validate } from "../../src/game/persistence/checkpoint";
import { cards } from "../../src/game/data/cards";
it("行星爆與回響在非整點冷卻連續施放都爆炸且只命中一次", () => {
  const r = newRun("mage", 872);
  r.obstacles = [];
  r.cards[9] = 3;
  r.cards[58] = 1;
  r.stats = derive(r);
  r.stats.crit = 0;
  const e = actor(101, 2, 250, 320);
  e.hp = e.maxHP = 100000;
  r.enemies = [e];
  for (let cast = 0; cast < 25; cast++) {
    r.time = 0.013 + cast * (r.stats.skillCD + 0.017);
    const before = e.hp;
    expect(
      castSkill(r, { ...idleCommand(r), pointerWorld: { x: 250, y: 320 } }),
    ).toBe(true);
    const start = r.time;
    for (let tick = 1; tick <= 66; tick++) {
      r.time = start + tick / 60;
      updateAreas(r);
    }
    expect(before - e.hp).toBeCloseTo(144);
    expect(r.areas).toHaveLength(0);
  }
  expect(r.visuals.filter((v) => v.kind === "burst")).toHaveLength(50);
});
it("敵方瞬間落雷跨過短窗口仍結算一次，長效場不在到期後補傷害", () => {
  const r = newRun("sword", 873);
  area(r, r.player, 50, 10, 0.303, 0.01, 1, null, { effect: "thunder" });
  area(r, r.player, 50, 100, 0.1, 0.1, 1, null);
  r.time = 0.317;
  updateAreas(r);
  expect(r.visuals.filter((v) => v.kind === "thunder")).toHaveLength(1);
  const hp = r.player.hp;
  updateAreas(r);
  expect(r.player.hp).toBe(hp);
  expect(r.visuals.filter((v) => v.kind === "burst")).toHaveLength(0);
});
it("技能基礎冷卻5/6/3秒，範圍統一擴大且場的畫面半徑就是判定半徑", () => {
  for (const [classId, cd] of [
    ["sword", 5],
    ["bow", 6],
    ["mage", 3],
  ] as const)
    expect(newRun(classId, 873).stats.skillCD).toBe(cd);
  const r = newRun("mage", 874);
  r.stats.crit = 0;
  const e = actor(102, 2, r.player.x + 125, r.player.y);
  e.radius = 1;
  r.enemies = [e];
  area(r, r.player, 110, 10, 0, 2, 1, context(r, 30, "skill", []));
  expect(r.areas[0].radius).toBeCloseTo(126.5);
  updateAreas(r);
  expect(e.hp).toBeLessThan(e.maxHP);
  expect(r.visuals.find((v) => v.kind === "burst")!.radius).toBe(
    r.areas[0].radius,
  );
});
it("连锁雷可跳180以上距离但仍不能穿掩体或无限续链", () => {
  const r = newRun("bow", 875);
  r.obstacles = [];
  grantTestCard(r, 29);
  r.stats.crit = 0;
  r.enemies = [
    actor(100, 2, 150, 320),
    actor(101, 2, 345, 320),
    actor(102, 2, 540, 320),
    actor(103, 2, 735, 320),
    actor(104, 2, 930, 320),
  ];
  hit(r, r.enemies[0], 1, context(r, 150, "basic", ["lightning"], true));
  expect(r.visuals.filter((v) => v.kind === "arc")).toHaveLength(3);
  expect(r.enemies[4].hp).toBe(r.enemies[4].maxHP);
  r.visuals = [];
  r.obstacles = [
    {
      id: 8,
      x: 220,
      y: 240,
      w: 40,
      h: 160,
      kind: "rock",
      durability: 6,
      maxDurability: 6,
      waves: [],
    },
  ];
  hit(r, r.enemies[0], 1, context(r, 150, "basic", ["lightning"], true));
  expect(r.visuals.filter((v) => v.kind === "arc")).toHaveLength(0);
});
it("冰緩速沒有冰凍殼；只有成功控制才標記冰凍／麻痺並尊重Boss免控", () => {
  const r = newRun("mage", 876),
    e = actor(105, 2, 200, 320);
  elemental(
    r,
    e,
    context(r, 15, "additional", ["ice"], false, 1, false, "none"),
    15,
  );
  expect(e.iceUntil).toBeGreaterThan(r.time);
  expect(e.freezeUntil).toBeUndefined();
  elemental(
    r,
    e,
    context(r, 15, "additional", ["ice"], false, 1, false, "none"),
    85,
  );
  expect(e.freezeUntil).toBe(3);
  const boss = actor(106, 6, 300, 320);
  control(r, boss, 0.4, "stun");
  expect(boss.stunUntil).toBe(0.4);
  expect(boss.freezeUntil).toBeUndefined();
  boss.ccImmune = 9;
  control(r, boss, 3, "freeze");
  expect(boss.freezeUntil).toBeUndefined();
});
it("59張測試給卡皆可取得真正能力，補前置、換職業且不消耗待選或刷新", () => {
  for (const c of cards) {
    const r = newRun("sword", 877);
    expect(grantTestCard(r, c.id)).toBe(true);
    expect(r.cards[c.id]).toBe(1);
    expect(r.elements.length).toBeLessThanOrEqual(2);
    if (c.classId) expect(r.classId).toBe(c.classId);
    validate({ version: 1, revision: 0, current: r, entry: r });
  }
  const r = newRun("mage", 878);
  grantTestCard(r, 39);
  expect(r.fusion).toBe("frostfire");
  grantTestCard(r, 36);
  expect(r.elements).toEqual(["water", "lightning"]);
  expect(r.fusion).toBe("storm");
  expect(r.cards[39]).toBeUndefined();
  r.phase = "UPGRADE_CHOICE";
  r.pendingLevels = 2;
  r.choices = [54, 58, 59];
  r.rerollUsed = true;
  grantTestCard(r, 47);
  expect(r.phase).toBe("UPGRADE_CHOICE");
  expect(r.pendingLevels).toBe(2);
  expect(r.rerollUsed).toBe(true);
  expect(r.cards[47]).toBe(1);
  expect(r.choices).not.toContain(54);
  validate({ version: 1, revision: 0, current: r, entry: r });
});
