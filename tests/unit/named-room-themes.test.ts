import { expect, it } from "vitest";
import { biomes, type BiomeId } from "../../src/game/data/biomes";
import { roomThemes } from "../../src/game/data/room-themes";
import {
  terrainLayout,
  connectedTerrain,
} from "../../src/game/data/terrain-layout";
import { newRun } from "../../src/game/core/run";
import { populate } from "../../src/game/data/world";
import { legal, lineBlocked } from "../../src/game/systems/geometry";
import { isolateProp } from "../../src/render/prop-isolation";
import { pauseView, menu } from "../../src/ui/view";
import { validate } from "../../src/game/persistence/checkpoint";

it.each(Object.keys(biomes) as BiomeId[])(
  "%s 六個房名各有具名配置、不同佈局，54房型保持通行",
  (id) => {
    expect(roomThemes[id].map((t) => t.name)).toEqual(biomes[id].themes);
    const shapes = new Set<string>();
    for (let profile = 0; profile < 6; profile++)
      for (let seed = 1; seed <= 10; seed++) {
        const layout = terrainLayout(id, profile, seed);
        expect(layout.theme).toBe(biomes[id].themes[profile]);
        expect(connectedTerrain(layout.obstacles)).toBe(true);
        expect(
          layout.obstacles.filter((o) => o.kind !== "lake").length,
        ).toBeGreaterThanOrEqual(4);
        expect(layout.scenery.length).toBeGreaterThan(0);
        if (seed === 1) shapes.add(JSON.stringify(layout.obstacles));
        const t = roomThemes[id][profile];
        if (t.pools !== "none")
          expect(layout.obstacles.some((o) => o.kind === "lake")).toBe(true);
        if (t.pools === "three")
          expect(
            layout.obstacles.filter((o) => o.kind === "lake"),
          ).toHaveLength(3);
        if (t.pools === "center")
          expect(
            layout.obstacles.some(
              (o) => o.kind === "lake" && o.x === 432 && o.y === 256,
            ),
          ).toBe(true);
      }
    expect(shapes.size).toBe(6);
  },
);
it("四季樹庭四群樹、軌道環臺環狀星紋、黑曜長廊雙列柱，裝飾沒有碰撞", () => {
  const meadow = terrainLayout("meadow", 4, 21);
  expect(meadow.obstacles.every((o) => o.kind === "tree")).toBe(true);
  for (const [x, y] of [
    [288, 160],
    [736, 160],
    [288, 480],
    [736, 480],
  ])
    expect(
      meadow.obstacles.some(
        (o) => Math.hypot(o.x + o.w / 2 - x, o.y + o.h / 2 - y) < 120,
      ),
    ).toBe(true);
  const stars = terrainLayout("stars", 0, 21);
  expect(
    stars.scenery.some(
      (s) => s.kind === "stars" && s.path && s.points.length === 33,
    ),
  ).toBe(true);
  const castle = terrainLayout("castle", 4, 21);
  expect(castle.scenery.some((s) => s.kind === "paving" && s.path)).toBe(true);
  expect(castle.obstacles.every((o) => o.y < 240 || o.y > 360)).toBe(true);
  const r = newRun("sword", 21);
  r.obstacles = [];
  r.scenery = stars.scenery;
  expect(legal(r, { x: 512, y: 320 })).toBe(true);
  expect(lineBlocked(r, { x: 112, y: 320 }, { x: 928, y: 320 })).toBe(false);
});
it("新局房型與名字使用同一模板，scenery在存檔保留且不變成掩體", () => {
  const r = newRun("sword", 30);
  r.templates = [4, 1, 2, 3];
  populate(r);
  expect(r.roomTheme).toBe("四季樹庭");
  const saved = validate({ version: 1, revision: 0, current: r, entry: r });
  expect(saved.current.scenery).toEqual(r.scenery);
});
it("冰柱頂端清掉暖色鄰格殘片，保留藍色冰尖與下方裝飾", () => {
  const w = 100,
    data = new Uint8ClampedArray(w * w * 4);
  const set = (x: number, y: number, r: number, g: number, b: number) => {
    data.set([r, g, b, 255], (y * w + x) * 4);
  };
  for (let y = 8; y < 90; y++)
    for (let x = 48; x < 58; x++) set(x, y, 70, 150, 200);
  for (let x = 25; x < 85; x++) set(x, 8, 190, 140, 50);
  set(53, 7, 50, 160, 230);
  set(53, 50, 190, 140, 50);
  isolateProp(data, w, w, "icefield-pillar");
  expect(data[(8 * w + 30) * 4 + 3]).toBe(0);
  expect(data[(7 * w + 53) * 4 + 3]).toBe(255);
  expect(data[(50 * w + 53) * 4 + 3]).toBe(255);
});
it("暫停移除成就與外觀，主選單仍保留收藏入口", () => {
  expect(pauseView(newRun("sword", 32))).not.toContain('data-action="journal"');
  expect(menu(false)).toContain('data-action="journal"');
});

it("叢林樹冠清掉前一列冰岩白邊，保留綠葉頂部", () => {
  const w = 100,
    data = new Uint8ClampedArray(w * w * 4);
  for (let y = 8; y < 90; y++)
    for (let x = 30; x < 70; x++) data.set([60, 140, 30, 255], (y * w + x) * 4);
  for (let x = 30; x < 70; x++) data.set([180, 200, 220, 255], (5 * w + x) * 4);
  isolateProp(data, w, w, "jungle-tree");
  expect(data[(5 * w + 50) * 4 + 3]).toBe(0);
  expect(data[(8 * w + 50) * 4 + 3]).toBe(255);
});
