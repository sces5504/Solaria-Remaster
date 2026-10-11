import { it, expect } from "vitest";
import { writeFileSync, mkdirSync } from "node:fs";
import { newRun, startRoom, step } from "../../../src/game/core/run";
import { selectSegment } from "../../../src/game/data/journey";
import { populate, roomXPBudget } from "../../../src/game/data/world";
import { grantTestCard, derive } from "../../../src/game/systems/progression";
import { eligible, cards, skillFactor } from "../../../src/game/data/cards";
import { equipmentCatalog } from "../../../src/game/data/equipment";
import { legal } from "../../../src/game/systems/geometry";
import type { ClassId, Run, Item } from "../../../src/game/core/types";
import { command as baseCommand } from "../../../tools/balance/bot";
import { distance, segmentDistance } from "../../../src/game/core/primitives";
import { beamEnd, coneHit } from "../../../src/game/systems/geometry";
function command(r: Run) {
  const c = baseCommand(r),
    p = r.player;
  const imminent =
    r.projectiles.some(
      (b) =>
        b.enemy &&
        segmentDistance(p, b, { x: b.x + b.vx * 0.65, y: b.y + b.vy * 0.65 }) <
          p.radius + b.radius + 10,
    ) ||
    r.areas.some(
      (a) =>
        a.enemy &&
        a.starts < r.time + 0.65 &&
        a.ends > r.time &&
        (a.shape === "beam"
          ? segmentDistance(p, a, beamEnd(r, a, a.angle)) <
            a.width / 2 + p.radius + 10
          : a.shape === "cone"
            ? coneHit(a, p, a.radius, a.angle, a.width, p.radius)
            : distance(p, a) < a.radius + p.radius),
    ) ||
    r.modes.some(
      (m) =>
        m.starts < r.time + 0.65 &&
        m.ends > r.time &&
        ["slash", "rush"].includes(m.type) &&
        distance(p, r.enemies.find((e) => e.id === m.actor) ?? p) < 200,
    );
  c.skill = imminent && p.skillReady <= r.time && p.controlUntil <= r.time;
  if (p.blockUntil > r.time || c.skill) c.dodge = false;
  return c;
}
function endLevel(loop: number) {
  let xp = 0;
  for (let l = 1; l <= loop; l++)
    xp +=
      Array.from({ length: l === loop ? 29 : 31 }, (_, i) =>
        roomXPBudget(i + 1),
      ).reduce((a, b) => a + b, 0) *
      1.3 ** (l - 1);
  let level = 1;
  while (xp >= 100 + 20 * (level - 1)) {
    xp -= 100 + 20 * (level - 1);
    level++;
  }
  return level;
}
function fixture(role: ClassId, loop: number, strong: boolean): Run {
  const r = newRun(role, 0x501a);
  r.loop = loop;
  r.level = endLevel(loop);
  grantTestCard(r, 15);
  grantTestCard(r, 28);
  const classCards =
    role === "sword"
      ? [43, 41, 47, 44, 46]
      : role === "bow"
        ? [50, 51, 52, 49, 48]
        : [56, 54, 58, 57, 59];
  const offensive = strong
    ? [3, 4, 5, 9, 14, ...classCards, 29, 17]
    : role === "sword"
      ? [3, 4, 5, 9, 14, 12, 41, 44, 46, 29, 17]
      : [3, 4, 5, 9, 14, 12, classCards[1], 29, 17];
  for (let point = 2; point < r.level - 1; point++) {
    const preferred =
      point % 3 === 0
        ? point % 2
          ? 1
          : 2
        : (strong
            ? [
                ...offensive.slice(point % offensive.length),
                ...offensive.slice(0, point % offensive.length),
              ]
            : [
                ...offensive.slice(point % offensive.length),
                ...offensive.slice(0, point % offensive.length),
              ]
          ).find((id) =>
            eligible(
              r,
              cards.find((c) => c.id === id)!,
            ),
          );
    expect(grantTestCard(r, preferred ?? 3)).toBe(true);
  }
  if (strong) {
    // One offered red card consumes one of the level-up points.
    const remove = Object.keys(r.cards)
      .map(Number)
      .find((id) => id < 15 && r.cards[id] > 0)!;
    r.cards[remove]--;
    if (!r.cards[remove]) delete r.cards[remove];
    grantTestCard(r, 79);
  }
  const grow = 2 * 1.35 ** (loop - 1);
  r.equipment.armor = {
    id: "fixture-armor",
    slot: "armor",
    rarity: "藍",
    affixes: [{ stat: "armor", value: 9 * grow }],
    x: 0,
    y: 0,
  };
  r.equipment.ring = {
    id: "fixture-ring",
    slot: "ring",
    rarity: "藍",
    affixes: [{ stat: "global", value: 0.045 * grow }],
    x: 0,
    y: 0,
  };
  r.equipment.amulet = {
    id: "fixture-amulet",
    slot: "amulet",
    rarity: "紫",
    affixes: [
      { stat: "skill", value: 0.075 * grow * 1.2 },
      { stat: "lifesteal", value: 0.0024 },
    ],
    x: 0,
    y: 0,
  };
  if (strong) {
    for (const ability of ["starArmor", "redMoon", "starFlow"] as const) {
      const d = equipmentCatalog[ability];
      const base = r.equipment[d.slot]!;
      const quality = d.rarity === "紅" ? 1.8 : 1.6;
      const previousQuality = base.rarity === "紫" ? 1.2 : 1;
      r.equipment[d.slot] = {
        ...base,
        id: ability,
        rarity: d.rarity,
        ability,
        name: d.name,
        affixes: [
          ...base.affixes.map((affix) => ({
            ...affix,
            value: (affix.value / previousQuality) * quality,
          })),
          ...Array.from(
            { length: (d.rarity === "紅" ? 2 : 3) - base.affixes.length },
            (_, i) => ({
              stat: i === 0 ? "hp" : "crit",
              value: i === 0 ? 30 * grow * quality : 0.15 * grow * quality,
            }),
          ),
        ],
      } as Item;
    }
  }
  for (const item of Object.values(r.equipment)) {
    expect(new Set(item!.affixes.map((a) => a.stat)).size).toBe(
      item!.affixes.length,
    );
    expect(item!.affixes).toHaveLength(
      ({ 藍: 1, 紫: 2, 黃: 3, 橘: 3, 紅: 2 } as const)[item!.rarity],
    );
    const quality =
      1 + ["藍", "紫", "黃", "橘", "紅"].indexOf(item!.rarity) * 0.2;
    const bounds: Record<string, [number, number]> = {
      hp: [20, 40],
      armor: [6, 12],
      global: [0.03, 0.06],
      skill: [0.05, 0.1],
      crit: [0.1, 0.2],
      lifesteal: [0.001, 0.003],
    };
    for (const affix of item!.affixes) {
      const base =
        affix.value / quality / (affix.stat === "lifesteal" ? 1 : grow);
      expect(base).toBeGreaterThanOrEqual(bounds[affix.stat][0] - 1e-9);
      expect(base).toBeLessThanOrEqual(bounds[affix.stat][1] + 1e-9);
    }
  }
  r.stats = derive(r);
  r.player.hp = r.stats.maxHP;
  r.room = 30;
  selectSegment(r);
  populate(r);
  startRoom(r);
  expect(legal(r, r.player, r.player.radius)).toBe(true);
  return r;
}
it("劍士以正常右鍵依可見預警格擋的四周目對照；不改敵血、不代替人工全程", () => {
  const results = [];
  for (const loop of [1, 2, 5, 10])
    for (const role of ["sword"] as const)
      for (const strong of [false, true]) {
        const r = fixture(role, loop, strong),
          before = structuredClone(r.stats),
          boss = r.enemies.find((e) => e.kind > 5)!;
        const initial = boss.maxHP;
        let hurt = 0,
          healed = 0;
        const costs = [];
        const seconds = Number(process.env.SOLARIA_CURVE_SECONDS ?? 300);
        for (
          let tick = 0;
          tick < seconds * 60 && r.phase === "COMBAT";
          tick++
        ) {
          const hp = r.player.hp,
            next = command(r),
            begin = performance.now();
          step(r, next);
          costs.push(performance.now() - begin);
          if (r.player.hp < hp) hurt += hp - r.player.hp;
          else healed += r.player.hp - hp;
        }
        expect(Number.isFinite(r.time)).toBe(true);
        expect(r.player.hp).toBeGreaterThanOrEqual(0);
        costs.sort((a, b) => a - b);
        results.push({
          role,
          loop,
          build: strong ? "強構築fixture" : "一般fixture",
          level: r.level,
          cards: r.cards,
          stats: before,
          boss: boss.bossId,
          bossHP: initial,
          remainingBossHP: Math.max(0, boss.hp),
          phase: r.phase,
          seconds: r.time,
          hurt,
          healed,
          cpuMeanMs: costs.reduce((a, b) => a + b, 0) / costs.length,
          cpuP95Ms: costs[Math.floor(costs.length * 0.95)],
          mechanismAt50: Math.min(
            5,
            r.cards[role === "bow" ? 50 : role === "mage" ? 54 : 41] ?? 0,
          ),
          marginalFactorAt50: skillFactor(50),
        });
      }
  mkdirSync("/tmp/solaria-balance", { recursive: true });
  writeFileSync(
    process.env.SOLARIA_CURVE_REPORT ??
      "/tmp/solaria-balance/block-timing-curves.json",
    JSON.stringify(
      {
        kind: "ACTUAL_CORE_SWORD_BLOCK_TIMING_PROBE",
        humanFullJourneyBalance: "NOT_RUN",
        cpuIncludesBot: false,
        method:
          "預算內固定合法構築，城堡領主實際AI與正常指令；沒有改敵血或不死。一般與強構築只供同場景比較；fixture不等同三選一取得歷程。",
        generated: new Date().toISOString(),
        results,
      },
      null,
      2,
    ),
  );
});
