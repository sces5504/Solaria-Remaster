import { it, expect } from "vitest";
import {
  newRun,
  startRoom,
  idleCommand,
  step,
  settle,
} from "../../src/game/core/run";
import { makeObstacles, actor, populate } from "../../src/game/data/world";
import { legal } from "../../src/game/systems/geometry";
import { clone } from "../../src/game/core/primitives";
import { validate } from "../../src/game/persistence/checkpoint";
import { worldHints } from "../../src/ui/view";
it("清算先展示 XP／補包飛行，然後才抽卡；保存中途重載不重複給分或 XP", () => {
  const r = newRun("sword", 20);
  startRoom(r);
  r.enemies = [];
  r.reserves = [];
  r.obstacles = [];
  r.drops = [
    { id: 1, kind: "xp", value: 100, x: 820, y: 400 },
    { id: 2, kind: "heal", value: 20, x: 700, y: 180 },
  ];
  r.player.hp = 30;
  settle(r);
  expect(r.phase).toBe("SETTLEMENT");
  expect(r.choices).toEqual([]);
  expect(r.drops.length).toBe(2);
  expect(r.player.hp).toBe(45);
  const from = r.drops[0].x;
  for (let i = 0; i < 25; i++) step(r, idleCommand(r));
  expect(r.phase).toBe("SETTLEMENT");
  expect(r.drops[0].x).toBeLessThan(from);
  expect(r.choices).toEqual([]);
  const saved = validate({
    version: 1,
    revision: 0,
    current: r,
    entry: r,
  }).current;
  for (let i = 0; i < 70; i++) {
    step(r, idleCommand(r));
    step(saved, idleCommand(saved));
  }
  expect(r.phase).toBe("UPGRADE_CHOICE");
  expect(r.drops).toEqual([]);
  expect(r.level).toBe(2);
  expect(r.stats.maxHP - r.player.hp).toBeCloseTo(85);
  expect(saved.choices).toEqual(r.choices);
  expect(saved.score).toBe(r.score);
  const score = r.score;
  settle(r);
  expect(r.score).toBe(score);
});
it("每個草原房初始敵群 4–10 且種子有數量變化", () => {
  const counts = new Set<number>();
  for (let seed = 1; seed <= 100; seed++) {
    const r = newRun("sword", seed);
    counts.add(r.enemies.length);
    expect(r.enemies.length).toBeGreaterThanOrEqual(4);
    expect(r.enemies.length).toBeLessThanOrEqual(10);
  }
  expect(counts.size).toBeGreaterThan(4);
});
it("前期狼王 3600／山羊王 4000 HP，兩階段仍保留", () => {
  expect(actor(1, 6, 760, 320).maxHP).toBe(3600);
  expect(actor(1, 7, 760, 320).maxHP).toBe(4000);
});
it("程序生成全部可走格連通、種子可重現，普通房及王房有足夠實體掩體", () => {
  const counts: number[] = [];
  for (let seed = 1; seed <= 40; seed++)
    for (const boss of [0, 1, 2]) {
      const r = newRun("sword", seed);
      r.obstacles = makeObstacles(seed % 6, boss, seed);
      expect(r.obstacles).toEqual(makeObstacles(seed % 6, boss, seed));
      const solid = r.obstacles.filter((o) => o.kind !== "lake").length;
      counts.push(solid);
      expect(solid, `seed ${seed}, boss ${boss}`).toBeGreaterThanOrEqual(
        boss ? 8 : 12,
      );
      const queue = [{ x: 112, y: 336 }],
        seen = new Set(["3,10"]);
      for (let i = 0; i < queue.length; i++) {
        const p = queue[i];
        for (const [dx, dy] of [
          [32, 0],
          [-32, 0],
          [0, 32],
          [0, -32],
        ]) {
          const next = { x: p.x + dx, y: p.y + dy },
            key = `${Math.floor(next.x / 32)},${Math.floor(next.y / 32)}`;
          if (!seen.has(key) && legal(r, next, 18)) {
            seen.add(key);
            queue.push(next);
          }
        }
      }
      expect(seen.has("28,10")).toBe(true);
      for (let y = 2; y <= 18; y++)
        for (let x = 1; x <= 30; x++)
          if (legal(r, { x: x * 32 + 16, y: y * 32 + 16 }, 18))
            expect(seen.has(`${x},${y}`)).toBe(true);
    }
  expect(new Set(counts).size).toBeGreaterThan(2);
}, 120000);
it("靠近裝備與清關門有 E 提示，遠距裝備仍標示名稱", () => {
  const r = newRun("mage", 90);
  r.phase = "POST_CLEAR";
  r.items = [
    { id: "hint", slot: "ring", rarity: "黃", affixes: [], x: 120, y: 320 },
  ];
  expect(worldHints(r)).toContain("檢取 · 戒指");
  r.player.x = 910;
  expect(worldHints(r)).toContain("進入");
  expect(worldHints(r)).toContain("戒指");
  r.phase = "COMBAT";
  expect(worldHints(r)).not.toContain("進入");
});
