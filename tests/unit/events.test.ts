import { populate, roomXPBudget } from "../../src/game/data/world";
import { context, hit } from "../../src/game/systems/combat";
import { validate } from "../../src/game/persistence/checkpoint";
import { isBossRoom } from "../../src/game/data/journey";
import { it, expect } from "vitest";
import { newRun, step, idleCommand, nextLoop } from "../../src/game/core/run";
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
    expect(xp).toBeCloseTo(roomXPBudget(r.room, r.roomEntryLevel ?? r.level));
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

for (const id of Object.keys(eventDefinitions) as EventId[])
  it(`${id} 正式核心三波死亡獎勵後才清算，保證紅裝且重載不複製`, () => {
    const r = newRun("mage", 3119);
    r.room = 2;
    selectEvent(r, id);
    populate(r);
    r.phase = "COMBAT";
    r.player.invulnerable = 1000;
    r.player.hp = 1;
    const aliveCount = () =>
      [...r.enemies, ...(r.reserves ?? [])].filter((e) => e.hp > 0).length;
    let elapsed = 0;
    while (!r.settledOnce && elapsed < 5000) {
      for (const m of [...r.enemies])
        if (!m.transition || m.transition <= r.time)
          hit(r, m, 1000000, context(r, 1, "basic", [], true));
      step(r, idleCommand(r));
      if (r.event!.waiting) expect(r.settledOnce).toBe(false);
      elapsed++;
    }
    expect(elapsed).toBeLessThan(5000);
    expect(aliveCount()).toBe(0);
    expect(r.phase).toBe("SETTLEMENT");
    expect(r.event!.completed).toBe(true);
    expect(r.player.hp).toBe(
      isBossRoom(r) ? r.stats.maxHP : 1 + r.stats.maxHP * 0.1,
    );
    expect(
      r.items.filter((i) => i.ability === eventDefinitions[id].reward),
    ).toHaveLength(1);
    const saved = validate(
      JSON.parse(
        JSON.stringify({ version: 1, revision: 0, current: r, entry: r }),
      ),
    );
    const copy = saved.current;
    for (let i = 0; i < 90; i++) step(copy, idleCommand(copy));
    expect(
      copy.items.filter((i) => i.ability === eventDefinitions[id].reward),
    ).toHaveLength(1);
    const seen = [...copy.seenEvents!];
    copy.phase = "RUN_END";
    nextLoop(copy);
    expect(copy.seenEvents).toEqual(seen);
  });
it("非事件同房重建不增加抽取計數；存檔拒絕重複已遇與未完成發獎", () => {
  const r = newRun("mage", 711);
  const counter = r.eventCounter;
  populate(r);
  populate(r);
  expect(r.eventCounter).toBe(counter);
  selectEvent(r, "army");
  populate(r);
  const saved = { version: 1, revision: 0, current: r, entry: r };
  expect(() => validate(saved)).not.toThrow();
  r.seenEvents!.push("army");
  expect(() => validate(saved)).toThrow("災厄紀錄");
  r.seenEvents!.pop();
  r.event!.rewarded = true;
  expect(() => validate(saved)).toThrow("災厄進度");
});
it("事件王螺旋有真雙臂／三臂整批；追蹤冰鈴提前.4秒鎖點", async () => {
  const { eventBosses } = await import("../../src/game/data/event-content");
  const { beginBossAttack, executeBossMode } =
    await import("../../src/game/systems/biome-bosses");
  const { updateAreas } = await import("../../src/game/systems/combat");
  for (const id of ["christmas", "halloween"] as EventId[]) {
    const r = newRun("mage", 773);
    r.room = 2;
    selectEvent(r, id);
    populate(r);
    r.event!.wave = 3;
    beginEventWave(r);
    const e = r.enemies[0],
      a = eventBosses[e.bossId!].attacks[1][0];
    beginBossAttack(r, e, a);
    const m = r.modes.at(-1)!;
    r.time = m.starts;
    executeBossMode(r, m, e);
    expect(r.projectiles.length).toBe(a.arms * 3);
    const angles = r.projectiles
      .filter((_, i) => i % 3 === 0)
      .map((p) => Math.atan2(p.vy, p.vx));
    expect(new Set(angles.map((n) => Math.round(n * 100))).size).toBe(a.arms);
  }
  const r = newRun("mage", 771);
  r.room = 2;
  selectEvent(r, "christmas");
  populate(r);
  r.event!.wave = 3;
  beginEventWave(r);
  const e = r.enemies[0],
    a = eventBosses[20].attacks[1][1];
  beginBossAttack(r, e, a);
  r.player.x = 240;
  r.player.y = 340;
  r.time = 0.2;
  updateAreas(r);
  expect(r.areas[0].x).toBe(240);
  expect(r.areas[0].y).toBe(340);
  r.player.x = 360;
  r.time = 0.5;
  updateAreas(r);
  expect(r.areas[0].x).toBe(240);
});
it("南瓜躍擊是真位移與合法落點、沒有額外無敵；流星等待停止新危險", async () => {
  const { eventBosses } = await import("../../src/game/data/event-content");
  const { beginBossAttack, updateBossLeap } =
    await import("../../src/game/systems/biome-bosses");
  const r = newRun("mage", 781);
  r.room = 2;
  selectEvent(r, "halloween");
  populate(r);
  r.event!.wave = 3;
  beginEventWave(r);
  const e = r.enemies[0],
    start = e.x;
  beginBossAttack(r, e, eventBosses[21].attacks[1][2]);
  const landing = { ...r.areas[0] };
  r.time = 0.55;
  expect(updateBossLeap(r, e)).toBe(true);
  expect(e.x).toBeLessThan(start);
  expect(e.x).toBeGreaterThan(landing.x);
  expect(e.transition).toBe(0);
  r.time = 1.1;
  updateBossLeap(r, e);
  expect(e.x).toBe(landing.x);
  expect(e.y).toBe(landing.y);
  expect(legal(r, e, e.radius)).toBe(true);
  selectEvent(r, "meteor");
  beginEventWave(r);
  r.enemies = [];
  r.reserves = [];
  r.areas = [];
  updateEvent(r);
  r.time = 200;
  updateEvent(r);
  expect(r.areas).toHaveLength(0);
});
it("軍旗第三波附近友軍真正強化，旗倒下立即失去效果", async () => {
  const { rallyFactor } = await import("../../src/game/systems/event-combat");
  const r = newRun("mage", 973);
  r.room = 2;
  selectEvent(r, "army");
  populate(r);
  r.event!.wave = 2;
  beginEventWave(r);
  const flag = r.enemies[0],
    friend = r.enemies[1];
  expect(flag.rally).toBe(true);
  friend.x = flag.x + 40;
  friend.y = flag.y;
  expect(rallyFactor(r, friend, "speed")).toBe(1.12);
  expect(rallyFactor(r, friend, "damage")).toBe(1.15);
  flag.hp = 0;
  expect(rallyFactor(r, friend, "damage")).toBe(1);
});
