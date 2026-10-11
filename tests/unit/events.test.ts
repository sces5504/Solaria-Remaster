import { it, expect } from "vitest";
import { newRun } from "../../src/game/core/run";
import {
  eventDefinitions,
  eventChance,
  rollEvent,
  type EventId,
} from "../../src/game/data/events";
import {
  selectEvent,
  eventLayout,
  beginEventWave,
  updateEvent,
  eventState,
} from "../../src/game/systems/events";
import { eventMonsters } from "../../src/game/data/event-content";
import { legal } from "../../src/game/systems/geometry";
for (const id of Object.keys(eventDefinitions) as EventId[])
  it(`${id} 三有限波、後波不提前、XP替換預算、紅裝僅一次`, () => {
    const r = newRun("mage", 1871);
    r.room = 12;
    r.biome = "corruption";
    r.phase = "COMBAT";
    selectEvent(r, id);
    r.obstacles = eventLayout(r).obstacles;
    beginEventWave(r);
    const event = eventState(r)!;
    let xp = 0;
    const art = new Set<number>();
    for (let wave = 0; wave < 3; wave++) {
      expect(event.wave).toBe(wave);
      expect(event.waiting).toBe(false);
      expect(r.modifiers).toEqual([]);
      expect(r.hazards).toEqual([]);
      expect(r.enemies.length).toBeLessThanOrEqual(10);
      const all = [...r.enemies, ...r.reserves!];
      for (const m of all) {
        expect(legal(r, m, m.radius)).toBe(true);
        if (m.monsterId) art.add(m.monsterId);
        xp += m.xpReward ?? 0;
      }
      expect(updateEvent(r)).toBe(true);
      r.enemies = [];
      r.reserves = [];
      if (wave < 2 || eventDefinitions[id].boss) {
        expect(updateEvent(r)).toBe(true);
        expect(event.waiting).toBe(true);
        const next = event.next;
        r.time = next - 0.01;
        updateEvent(r);
        expect(r.enemies).toHaveLength(0);
        r.time = next;
        updateEvent(r);
      }
    }
    if (eventDefinitions[id].boss) {
      expect(event.boss).toBe(true);
      expect(r.enemies[0].hp).toBe(18000 * 0.6);
      expect(r.enemies[0].bossId).toBe(eventDefinitions[id].boss);
      xp += r.enemies[0].xpReward ?? 0;
      r.enemies = [];
    }
    expect(updateEvent(r)).toBe(false);
    expect(event.completed).toBe(true);
    expect(event.rewarded).toBe(true);
    expect(
      r.items.filter((i) => i.ability === eventDefinitions[id].reward),
    ).toHaveLength(1);
    updateEvent(r);
    expect(
      r.items.filter((i) => i.ability === eventDefinitions[id].reward),
    ).toHaveLength(1);
    expect(xp).toBeCloseTo(250);
    expect(r.items.at(-1)!.affixes).toHaveLength(2);
    expect(r.items.at(-1)!.rarity).toBe("紅");
    if (id !== "army")
      expect([...art].every((n) => eventMonsters[n])).toBe(true);
  });
it("事件機率序列、六種排除一次、首關0%、Boss和最終房不抽", () => {
  expect(Array.from({ length: 12 }, (_, i) => eventChance(i))).toEqual([
    0, 0.01, 0.01, 0.05, 0.05, 0.1, 0.1, 0.15, 0.15, 0.2, 0.2, 0.2,
  ]);
  for (let i = 0; i < 500; i++) expect(rollEvent(i, 1, 1, 0, [])).toBeNull();
  const all = Object.keys(eventDefinitions) as EventId[];
  for (let i = 0; i < 500; i++) expect(rollEvent(i, 10, 7, 10, all)).toBeNull();
  const r = newRun("mage", 1);
  r.room = 5;
  expect(selectEvent(r, "army")).toBe(false);
  r.room = 31;
  expect(selectEvent(r, "army")).toBe(false);
});
it("整局已遇跨周目保留，同房事件不重新計數／抽取，正常房不遭遇未開概率事件", () => {
  const r = newRun("mage", 1421);
  r.room = 2;
  selectEvent(r, "meteor");
  const e = eventState(r);
  selectEvent(r);
  expect(eventState(r)).toBe(e);
  expect((r as typeof r & { seenEvents: EventId[] }).seenEvents).toEqual([
    "meteor",
  ]);
  r.loop = 2;
  r.room = 1;
  selectEvent(r, "army");
  expect((r as typeof r & { seenEvents: EventId[] }).seenEvents).toEqual([
    "meteor",
    "army",
  ]);
  const available = Object.keys(eventDefinitions).filter(
    (id) => id !== "meteor",
  ) as EventId[];
  let seen = false;
  for (let i = 0; i < 5000; i++) {
    const result = rollEvent(i * 919, 4, 12, 10, ["meteor"]);
    if (result) {
      seen = true;
      expect(available).toContain(result);
    }
  }
  expect(seen).toBe(true);
});
it("流星三處鎖定落星有一秒警告、三秒節奏，波次等待期間不無限生成", () => {
  const r = newRun("mage", 717);
  r.phase = "COMBAT";
  selectEvent(r, "meteor");
  r.obstacles = [];
  beginEventWave(r);
  r.time = 3;
  updateEvent(r);
  expect(r.areas).toHaveLength(3);
  expect(r.areas.every((a) => a.starts === 4 && a.damage === 18)).toBe(true);
  updateEvent(r);
  expect(r.areas).toHaveLength(3);
  r.time = 6;
  updateEvent(r);
  expect(r.areas).toHaveLength(6);
});
