import { expect, it } from "vitest";
import {
  newRun,
  startRoom,
  step,
  settle,
  idleCommand,
  nextLoop,
} from "../../src/game/core/run";
import { jumpToRoom } from "../../src/game/core/testing";
import {
  derive,
  choose,
  levelHealthFactor,
  grantTestCard,
  drawChoices,
} from "../../src/game/systems/progression";
import {
  selectEvent,
  beginEventWave,
  eventState,
} from "../../src/game/systems/events";
import { eventDefinitions } from "../../src/game/data/events";
import { cards } from "../../src/game/data/cards";
import { validate } from "../../src/game/persistence/checkpoint";
import {
  syncPumpkin,
  pumpkin,
  hurtPumpkin,
  updatePumpkin,
} from "../../src/game/systems/companion";
import {
  updateProfile,
  emptyProfile,
} from "../../src/game/persistence/profile";

it("三周目93次清關：零或巨量經驗都恰升一級、選卡一次，重複清算不再給獎", () => {
  const r = newRun("mage", 140);
  for (let loop = 1; loop <= 3; loop++) {
    for (let room = 1; room <= 31; room++) {
      jumpToRoom(r, room);
      r.enemies = [];
      r.reserves = [];
      r.hazards = [];
      r.event = undefined;
      r.xp = room % 2 ? 0 : 1e10;
      const xp = r.xp,
        before = r.level;
      r.drops = [{ id: r.nextId++, kind: "xp", value: 73, x: 600, y: 320 }];
      startRoom(r);
      settle(r);
      expect(r.level).toBe(before);
      for (let tick = 0; tick < 70; tick++) step(r, idleCommand(r));
      expect(r.level).toBe(before + 1);
      expect(r.pendingLevels).toBe(1);
      expect(r.xp).toBe(xp + 73);
      expect(r.drops).toHaveLength(0);
      r.choices = [3, 1, 2];
      choose(r, 3);
      expect(r.pendingLevels).toBe(0);
      expect(r.phase).toBe(room === 31 ? "RUN_END" : "POST_CLEAR");
      settle(r);
      step(r, idleCommand(r));
      expect(r.level).toBe(before + 1);
      expect(r.pendingLevels).toBe(0);
    }
    expect(r.level).toBe(1 + 31 * loop);
    if (loop < 3) expect(nextLoop(r)).toBe(true);
  }
});
it.each(Object.keys(eventDefinitions) as (keyof typeof eventDefinitions)[])(
  "%s 每波不升等，事件王也僅整房清關升一等",
  (id) => {
    const r = newRun("sword", 14001);
    r.room = 2;
    r.event = undefined;
    selectEvent(r, id);
    r.obstacles = [];
    beginEventWave(r);
    startRoom(r);
    r.player.invulnerable = 1e6;
    for (let tick = 0; tick < 2000 && r.phase !== "UPGRADE_CHOICE"; tick++) {
      for (const e of [...r.enemies, ...(r.reserves ?? [])]) e.hp = 0;
      step(r, idleCommand(r));
      if (r.phase === "COMBAT") expect(r.level).toBe(1);
    }
    expect(eventState(r)?.completed).toBe(true);
    expect(r.level).toBe(2);
    expect(r.pendingLevels).toBe(1);
  },
);
it("首32級保持、33級後大幅減速且每級增量持續遞減", () => {
  for (let level = 1; level <= 32; level++)
    expect(levelHealthFactor(level)).toBe(1 + 1.5 * ((level - 1) / 30) ** 0.9);
  const oldLast = levelHealthFactor(32) - levelHealthFactor(31);
  let previous = oldLast;
  for (let level = 33; level <= 1000; level++) {
    const increment = levelHealthFactor(level) - levelHealthFactor(level - 1);
    expect(increment).toBeGreaterThan(0);
    expect(increment).toBeLessThan(previous);
    previous = increment;
  }
  expect(levelHealthFactor(33) - levelHealthFactor(32)).toBeLessThan(
    oldLast / 4,
  );
});
it.each(["sword", "bow", "mage"] as const)(
  "%s 舊高等快照保留生命比例、死亡不復活、重載不補血",
  (cls) => {
    const r = newRun(cls, 14002);
    r.level = 94;
    r.healthGrowthVersion = 1;
    const oldMax =
      newRun(cls, 14002).stats.maxHP * (1 + 1.5 * ((r.level - 1) / 30) ** 0.9);
    r.stats.maxHP = oldMax;
    r.player.hp = oldMax * 0.37;
    const original = structuredClone(r);
    const a = validate({ version: 1, revision: 0, current: r, entry: r });
    expect(a.current.player.hp / a.current.stats.maxHP).toBeCloseTo(0.37);
    expect(a.current.stats.maxHP).toBeCloseTo(derive(original).maxHP);
    expect(a.current.healthGrowthVersion).toBe(2);
    expect(a.current.level).toBe(94);
    expect(a.current.obstacles).toEqual(original.obstacles);
    expect(a.current.journey).toEqual(original.journey);
    expect(validate(a)).toEqual(a);
    r.player.hp = 0;
    r.phase = "DEAD";
    expect(
      validate({ version: 1, revision: 0, current: r, entry: r }).current.player
        .hp,
    ).toBe(0);
  },
);
it("求知退出抽卡／測試／圖鑑；舊卡與待選項移轉不丟其他選項或刷新紀錄", () => {
  const r = newRun("mage", 14003);
  r.cards = { 8: 5 };
  r.phase = "UPGRADE_CHOICE";
  r.pendingLevels = 1;
  r.level = 2;
  r.choices = [8, 1, 3];
  r.rerollUsed = true;
  const saved = validate({
    version: 1,
    revision: 0,
    current: r,
    entry: r,
    discovered: [8, 1, 3],
  });
  expect(saved.current.cards[8]).toBeUndefined();
  expect(saved.discovered).toEqual([1, 3]);
  expect(saved.current.choices.slice(1)).toEqual([1, 3]);
  expect(saved.current.choices).not.toContain(8);
  expect(saved.current.rerollUsed).toBe(true);
  expect(saved.current.pendingLevels).toBe(1);
  expect(validate(saved)).toEqual(saved);
  expect(grantTestCard(saved.current, 8)).toBe(false);
  expect((cards.map((c) => c.id) as number[]).includes(8)).toBe(false);
  for (let n = 0; n < 100; n++) {
    drawChoices(saved.current);
    expect(saved.current.choices).not.toContain(8);
  }
  expect(
    updateProfile(
      emptyProfile(),
      r,
      cards.map((c) => c.id),
    ).achievements,
  ).toContain("fullArchive");
  expect(
    updateProfile(
      emptyProfile(),
      r,
      cards.filter((c) => c.id !== 85).map((c) => c.id),
    ).achievements,
  ).not.toContain("fullArchive");
});
it("南瓜125HP、倒地20秒，舊倒地快照只延長一次且清關仍復甦", () => {
  const r = newRun("mage", 14004);
  r.equipment.armor = {
    id: "ghost",
    slot: "armor",
    rarity: "紅",
    ability: "ghostArmor",
    affixes: [],
    x: 0,
    y: 0,
  };
  syncPumpkin(r);
  const c = pumpkin(r)!;
  expect(c.hp).toBe(125);
  hurtPumpkin(r, 10000);
  expect(c.downUntil).toBe(20);
  r.time = 19.99;
  updatePumpkin(r);
  expect(c.hp).toBe(0);
  r.time = 20;
  updatePumpkin(r);
  expect(c.hp).toBe(125);
  c.hp = 0;
  c.downUntil = 25;
  delete c.balanceVersion;
  const a = validate({ version: 1, revision: 0, current: r, entry: r });
  expect(pumpkin(a.current)!.downUntil).toBe(35);
  expect(pumpkin(validate(a).current)!.downUntil).toBe(35);
  settle(a.current);
  expect(pumpkin(a.current)!.hp).toBe(125);
});
