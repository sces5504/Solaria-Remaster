import { it, expect } from "vitest";
import {
  newRun,
  startRoom,
  settle,
  step,
  idleCommand,
  nextLoop,
} from "../../src/game/core/run";
import { jumpToRoom } from "../../src/game/core/testing";
import { TestingSequence } from "../../src/input/testing-sequence";
import {
  easeOpeningEncounter,
  actor,
  populate,
  roomXPBudget,
} from "../../src/game/data/world";
import { biomes, type BiomeId } from "../../src/game/data/biomes";
import {
  terrainLayout,
  connectedTerrain,
} from "../../src/game/data/terrain-layout";
import { terrainSize } from "../../src/render/terrain-presentation";
import { legal, move, lineBlocked } from "../../src/game/systems/geometry";
import { choose, derive } from "../../src/game/systems/progression";
import { validate } from "../../src/game/persistence/checkpoint";
import { clone } from "../../src/game/core/primitives";

const code = "WWSSADADBA".split("").map((c) => `Key${c}`);
it("密碼嚴格十鍵順序，錯鍵、重啟與額外按鍵不沿用部分進度", () => {
  for (let wrongAt = 1; wrongAt < code.length; wrongAt++) {
    const sequence = new TestingSequence();
    for (const key of code.slice(0, wrongAt))
      expect(sequence.press(key)).toBe(false);
    expect(sequence.press("KeyX")).toBe(false);
    for (const key of code.slice(wrongAt))
      expect(sequence.press(key)).toBe(false);
    sequence.reset();
    expect(code.map((key) => sequence.press(key))).toEqual([
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      true,
    ]);
  }
});
it("跳關保留六地形與王、構築及周目，沒有清關獎勵；31入口不准增加周目", () => {
  const r = newRun("sword", 999);
  r.cards[3] = 2;
  r.level = 7;
  r.xp = 34;
  const journey = clone(r.journey);
  for (let room = 1; room <= 31; room++) {
    expect(jumpToRoom(r, room)).toBe(true);
    expect(r.room).toBe(room);
    expect(r.loop).toBe(1);
    expect(r.journey).toEqual(journey);
    expect(r.cards).toEqual({ 3: 2 });
    expect(r.level).toBe(7);
    expect(r.xp).toBe(34);
    expect(r.phase).toBe("ROOM_INTRO");
    expect(nextLoop(r)).toBe(false);
    expect(r.biome).toBe(
      journey![Math.min(5, Math.floor((room - 1) / 5))].biome,
    );
    expect(() =>
      validate({ version: 1, revision: 0, current: clone(r), entry: clone(r) }),
    ).not.toThrow();
  }
  expect(r.enemies[0].solarisBar).toBe(1);
  for (const room of [0, 32, 2.5, NaN]) expect(jumpToRoom(r, room)).toBe(false);
  r.phase = "UPGRADE_CHOICE";
  expect(jumpToRoom(r, 7)).toBe(false);
  r.phase = "DEAD";
  expect(jumpToRoom(r, 7)).toBe(false);
});
it("首周目1–4關怪池數量四捨五入減20%，HP與精英盾減20%；第5關及下一周目不減", () => {
  for (const room of [1, 2, 3, 4, 5])
    for (const loop of [1, 2]) {
      const r = newRun("sword", 77);
      r.room = room;
      r.loop = loop;
      const roster = Array.from({ length: 13 }, (_, i) =>
        actor(i, 1, 700, 300, i === 0),
      );
      roster[0].enemyShield = 60;
      easeOpeningEncounter(r, roster);
      const reduced = loop === 1 && room <= 4;
      expect(roster).toHaveLength(reduced ? 10 : 13);
      expect(roster[0].maxHP).toBe(reduced ? 240 : 300);
      expect(roster[1].hp).toBe(reduced ? 96 : 120);
      expect(roster[0].enemyShield).toBe(reduced ? 48 : 60);
    }
});
it("31關逐關結算各升一級，選卡後不重複；跳關、舊檔低XP仍有一級", () => {
  const r = newRun("mage", 31);
  for (let room = 1; room <= 31; room++) {
    expect(jumpToRoom(r, room)).toBe(true);
    const level = r.level;
    const budget = [...r.enemies, ...(r.reserves ?? [])].reduce(
      (sum, e) => sum + (e.xpReward ?? 0),
      0,
    );
    if (!r.event) expect(budget).toBeCloseTo(roomXPBudget(room, level));
    r.enemies = [];
    r.reserves = [];
    r.hazards = [];
    r.event = undefined;
    r.drops = [
      {
        id: r.nextId++,
        x: 700,
        y: 320,
        kind: "xp",
        value: roomXPBudget(room, level),
      },
    ];
    startRoom(r);
    settle(r);
    for (let i = 0; i < 70; i++) step(r, idleCommand(r));
    expect(r.level).toBe(level + 1);
    expect(r.pendingLevels).toBe(1);
    const selected = r.choices.find((id) => ![8, 80, 85].includes(id))!;
    expect(choose(r, selected)).toBe(true);
    r.fusionChoices = [];
    if (r.phase === "FUSION_CHOICE")
      r.phase = room === 31 ? "RUN_END" : "POST_CLEAR";
    expect(r.pendingLevels).toBe(0);
    settle(r);
    expect(r.level).toBe(level + 1);
  }
  expect(r.level).toBe(32);
  const old = newRun("sword", 35);
  old.roomEntryLevel = undefined;
  old.level = 18;
  old.xp = 3;
  old.enemies = [];
  old.reserves = [];
  old.hazards = [];
  settle(old);
  for (let i = 0; i < 70; i++) step(old, idleCommand(old));
  expect(old.level).toBe(19);
});
it("經驗加成保留額外收益，進房後配額固定且跟隨等級，不受換裝重算", () => {
  const r = newRun("sword", 32);
  r.level = 50;
  r.cards[8] = 3;
  r.xp = 990;
  jumpToRoom(r, 21);
  expect(r.roomEntryLevel).toBe(50);
  expect(
    [...r.enemies, ...(r.reserves ?? [])].reduce(
      (sum, e) => sum + e.xpReward!,
      0,
    ),
  ).toBeCloseTo(1080);
  r.enemies = [];
  r.reserves = [];
  r.hazards = [];
  r.event = undefined;
  r.stats = derive(r);
  r.drops = [
    { id: 9999, kind: "xp", value: 1080 * r.stats.xp, x: 700, y: 320 },
  ];
  settle(r);
  for (let i = 0; i < 70; i++) step(r, idleCommand(r));
  expect(r.level).toBe(52);
  expect(r.xp).toBeCloseTo(149.2);
});
it.each(Object.keys(biomes).filter((id) => id !== "meadow") as BiomeId[])(
  "%s 生態大障礙、不同seed、六房型與兩王房可達",
  (id) => {
    const appearances = new Set<string>();
    for (let profile = 0; profile < 6; profile++)
      for (let seed = 1; seed <= 15; seed++) {
        const layout = terrainLayout(id, profile, seed);
        expect(connectedTerrain(layout.obstacles)).toBe(true);
        expect(
          layout.obstacles.filter((o) => o.kind !== "lake").length,
        ).toBeGreaterThanOrEqual(4);
        expect(layout.obstacles.length).toBeLessThanOrEqual(14);
        expect(
          layout.obstacles.reduce((area, o) => area + o.w * o.h, 0),
        ).toBeGreaterThanOrEqual(18000);
        expect(
          layout.obstacles
            .filter((o) => o.kind !== "lake")
            .every((o) => o.w >= 64 && o.h >= 48),
        ).toBe(true);
        const r = newRun("sword", seed);
        r.obstacles = layout.obstacles;
        for (const p of layout.route) expect(legal(r, p, 32)).toBe(true);
        appearances.add(JSON.stringify(layout));
        for (const o of layout.obstacles.filter((o) => o.kind !== "lake")) {
          const size = terrainSize(o, id);
          expect(size.width).toBeGreaterThanOrEqual(o.w);
          expect(size.height).toBeGreaterThanOrEqual(o.h);
        }
      }
    expect(appearances.size).toBeGreaterThan(60);
  },
);
it("新水岸／熔岩擋行走與閃避但不擋飛彈，舊湖仍保留可閃避跨越規則，存檔不重生地形", () => {
  const r = newRun("sword", 9);
  const layout = terrainLayout("volcano", 1, 9);
  r.obstacles = layout.obstacles;
  const bank = r.obstacles.find((o) => o.kind === "lake")!;
  const p = { x: bank.x - 14, y: bank.y + bank.h / 2 };
  move(r, p, 100, 0, 12, false);
  expect(p.x).toBeLessThanOrEqual(bank.x - 12);
  expect(
    lineBlocked(
      r,
      { x: bank.x - 5, y: p.y },
      { x: bank.x + bank.w + 5, y: p.y },
    ),
  ).toBe(false);
  const saved = validate({
    version: 1,
    revision: 0,
    current: clone(r),
    entry: clone(r),
  });
  expect(saved.current.obstacles).toEqual(r.obstacles);
  delete bank.blocksDash;
  move(r, p, 40, 0, 12, false);
  expect(p.x).toBeGreaterThan(bank.x);
});
