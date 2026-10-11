import { it, expect } from "vitest";
import {
  newRun,
  enterNext,
  nextLoop,
  step,
  idleCommand,
} from "../../src/game/core/run";
import { journeyFor, restoreJourney } from "../../src/game/data/journey";
import { populate, roomXPBudget } from "../../src/game/data/world";
import { hit, context } from "../../src/game/systems/combat";
import { solarisAI } from "../../src/game/systems/solaris";
import { validate } from "../../src/game/persistence/checkpoint";
it("六秘境分支穩定、每段四個不同程序主題，周目另有 seed stream", () => {
  expect(journeyFor(51)).toEqual(journeyFor(51));
  const routes = Array.from({ length: 100 }, (_, seed) => journeyFor(seed));
  expect(new Set(routes.map((r) => r[1].biome))).toEqual(
    new Set(["desert", "icefield"]),
  );
  for (const route of routes) {
    expect(route).toHaveLength(6);
    expect(route[0].biome).toBe("meadow");
    expect(route[5].biome).toBe("castle");
    for (const seg of route) expect(new Set(seg.templates).size).toBe(4);
  }
  expect(journeyFor(51, 2)).not.toEqual(journeyFor(51));
});
it("30 房不提前結束，第31房才索拉里斯；下一周目保留構築", () => {
  const r = newRun("mage", 53);
  r.cards[3] = 3;
  r.level = 10;
  r.xp = 42;
  for (let room = 1; room < 31; room++) {
    expect(r.room).toBe(room);
    r.phase = "POST_CLEAR";
    expect(enterNext(r)).toBe(true);
  }
  expect(r.enemies[0].solarisBar).toBe(1);
  expect(r.enemies[0].maxHP).toBe(18000);
  r.phase = "RUN_END";
  expect(nextLoop(r)).toBe(true);
  expect(r.room).toBe(1);
  expect(r.loop).toBe(2);
  expect(r.cards[3]).toBe(3);
  expect(r.level).toBe(10);
  expect(r.xp).toBe(42);
});
it("舊檢查點遷移保留草原模板、王、卡與周目入口", () => {
  const r = newRun("sword", 1);
  r.journey = undefined;
  r.loop = undefined;
  r.biome = undefined;
  r.templates = [5, 2, 1, 0];
  r.boss = 2;
  restoreJourney(r);
  expect(r.journey![0]).toEqual({
    biome: "meadow",
    templates: [5, 2, 1, 0],
    boss: 2,
  });
  expect(r.loop).toBe(1);
  r.room = 31;
  populate(r);
  expect(() =>
    validate({ version: 1, revision: 0, current: r, entry: r }),
  ).not.toThrow();
});
it("過量傷害不能跳三血；柱子無吸血與殺敵獎勵，四柱毀後解封", () => {
  const r = newRun("mage", 73);
  r.room = 31;
  populate(r);
  r.stats.crit = 0;
  r.stats.lifesteal = 0.1;
  r.player.hp = 1;
  const boss = r.enemies[0];
  expect(hit(r, boss, 1e6, context(r, 0))).toBe(18000);
  expect(boss.hp).toBe(22000);
  expect(boss.solarisBar).toBe(2);
  expect(r.solaris!.sealed).toBe(true);
  const columns = r.enemies.filter((e) => e.sealPillar);
  expect(columns).toHaveLength(4);
  const hp = r.player.hp;
  for (const column of columns) hit(r, column, 1e6, context(r, 0));
  expect(r.player.hp).toBe(hp);
  r.phase = "COMBAT";
  step(r, idleCommand(r));
  expect(r.kills).toBe(0);
  expect(r.score).toBe(0);
  expect(r.drops.filter((d) => d.kind === "heal")).toHaveLength(4);
  solarisAI(r, boss);
  expect(r.solaris!.sealed).toBe(false);
  expect(hit(r, boss, 1e6, context(r, 0))).toBe(22000);
  expect(boss.hp).toBe(28000);
  expect(boss.solarisBar).toBe(3);
  expect(boss.transition).toBeCloseTo(r.time + 2);
  r.time = boss.transition;
  expect(hit(r, boss, 1e6, context(r, 0))).toBe(28000);
  expect(boss.hp).toBe(0);
});
it("封印每兩秒12彈、旋轉60度通路、整組容量延後", () => {
  const r = newRun("mage", 2);
  r.room = 31;
  populate(r);
  const e = r.enemies[0];
  hit(r, e, 1e6, context(r, 0));
  r.time = 2;
  solarisAI(r, e);
  expect(r.projectiles).toHaveLength(12);
  const angles = r.projectiles
    .map((p) => (Math.atan2(p.vy, p.vx) + 2 * Math.PI) % (2 * Math.PI))
    .sort((a, b) => a - b);
  const gaps = angles.map(
    (a, i) => (angles[(i + 1) % 12] - a + 2 * Math.PI) % (2 * Math.PI),
  );
  expect(Math.max(...gaps)).toBeCloseTo(Math.PI / 3);
  const first = r.projectiles[0];
  r.time = 4;
  solarisAI(r, e);
  expect(r.projectiles).toHaveLength(24);
  expect(
    Math.atan2(r.projectiles[12].vy, r.projectiles[12].vx) -
      Math.atan2(first.vy, first.vx),
  ).toBeCloseTo(Math.PI / 4);
});
it("最終王沿用最新房間配額440，總配額8890保持約26級，沒有回復舊750", () => {
  const r = newRun("mage", 79);
  r.room = 31;
  populate(r);
  expect(r.enemies[0].xpReward).toBe(440);
  let xp = Array.from({ length: 31 }, (_, i) => roomXPBudget(i + 1)).reduce(
    (a, b) => a + b,
    0,
  );
  expect(xp).toBe(8890);
  let level = 1;
  while (xp >= 100 + 20 * (level - 1)) {
    xp -= 100 + 20 * (level - 1);
    level++;
  }
  expect(level).toBe(26);
});
