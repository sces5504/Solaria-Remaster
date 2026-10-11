import { it, expect } from "vitest";
import {
  circleContact,
  rectangleContact,
  orderContacts,
} from "../../src/game/systems/collision-time";
import { SpatialGrid } from "../../src/game/systems/spatial-grid";
it("700速掃掠能找到薄墙前的首次圓接觸，斜擦邊與內部起點可重現", () => {
  const from = { x: 100, y: 100 },
    to = { x: 200, y: 100 };
  expect(circleContact(from, to, { x: 150, y: 100 }, 10)).toBeCloseTo(0.4);
  expect(
    rectangleContact(from, to, { x: 160, y: 80, w: 2, h: 40 }),
  ).toBeCloseTo(0.6);
  expect(circleContact(from, to, { x: 150, y: 110 }, 10)).toBeCloseTo(0.5);
  expect(circleContact(from, to, { x: 150, y: 111 }, 10)).toBeNull();
  expect(circleContact(from, to, from, 10)).toBe(0);
});
it("实际接触先后不依陣列順序，完全同時才依穩定ID", () => {
  const contacts = [
    { fraction: 0.9, id: 1, target: "late" },
    { fraction: 0.2, id: 8, target: "near" },
    { fraction: 0.2, id: 4, target: "tie" },
  ];
  expect(orderContacts(contacts).map((c) => c.target)).toEqual([
    "tie",
    "near",
    "late",
  ]);
});
it("空間網格查詢跨格界、負座標、等距ID，移動重建不遺留舊格", () => {
  const grid = new SpatialGrid<{ x: number; y: number; id: number }>(32);
  const actors = [
    { id: 8, x: -2, y: 0 },
    { id: 4, x: 2, y: 0 },
    { id: 9, x: 100, y: 100 },
    { id: 10, x: 32, y: 0 },
  ];
  grid.rebuild(actors);
  expect(grid.query({ x: 0, y: 0 }, 32).map((v) => v.id)).toEqual([4, 8, 10]);
  actors[0].x = 100;
  grid.rebuild(actors);
  expect(grid.query({ x: 0, y: 0 }, 3).map((v) => v.id)).toEqual([4]);
});
