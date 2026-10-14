import { describe, expect, it } from "vitest";
import { defaultLayout, readLayout } from "../../src/input/mobile-layout";
import { touchTarget } from "../../src/input/mobile-interaction";
import { newRun, step, idleCommand } from "../../src/game/core/run";
import { itemFor, pickup } from "../../src/game/systems/progression";
function room() {
  const r = newRun("mage", 140);
  r.phase = "POST_CLEAR";
  r.enemies = [];
  r.reserves = [];
  r.obstacles = [];
  r.hazards = [];
  r.player.x = 900;
  r.player.y = 320;
  const a = itemFor(r, 1, 0)!,
    b = itemFor(r, 1, 1)!;
  r.items = [
    { ...a, id: "near", x: 899, y: 320 },
    { ...b, id: "clicked", x: 920, y: 330 },
  ];
  return r;
}
describe("手機點選不改既有互動規則", () => {
  it("點指定裝備不誤撿較近裝備，也不被近門的優先規則帶去下一關", () => {
    const r = room();
    const c = idleCommand(r);
    c.interact = true;
    c.interactTarget = { kind: "item", id: "clicked" };
    step(r, c);
    expect(r.room).toBe(1);
    expect(r.bag.map((i) => i.id)).toEqual(["clicked"]);
    expect(r.items.map((i) => i.id)).toEqual(["near"]);
  });
  it("指定裝備仍須在64距離內，滿包與消失物品不改撿其他裝備", () => {
    const r = room();
    r.items[1].x = 1000;
    expect(pickup(r, "clicked")).toBe(false);
    expect(pickup(r, "missing")).toBe(false);
    expect(r.bag).toHaveLength(0);
    r.bag = Array.from({ length: 12 }, () => ({ ...r.items[0] }));
    expect(pickup(r, "near")).toBe(false);
    expect(r.items).toHaveLength(2);
  });
  it("遠處點門不拾取腳邊物品；靠近門才前進，原E鍵規則保留", () => {
    const r = room();
    r.player.x = 850;
    const c = idleCommand(r);
    c.interact = true;
    c.interactTarget = { kind: "door" };
    step(r, c);
    expect(r.room).toBe(1);
    expect(r.bag).toHaveLength(0);
    r.player.x = 900;
    step(r, {
      ...idleCommand(r),
      interact: true,
      interactTarget: { kind: "door" },
    });
    expect(r.room).toBe(2);
    const legacy = room();
    step(legacy, { ...idleCommand(legacy), interact: true });
    expect(legacy.room).toBe(2);
  });
  it("螢幕點擊只命中裝備與開啟的門，縮放後仍按實際物件選擇", () => {
    const r = room();
    expect(touchTarget(r, 920, 330, 0.5)).toEqual({
      kind: "item",
      id: "clicked",
    });
    expect(touchTarget(r, 150, 150, 0.5)).toBeUndefined();
    expect(touchTarget(r, 928, 320, 0.5)).toEqual({ kind: "door" });
    r.items = [];
    expect(touchTarget(r, 928, 320, 0.35)).toEqual({ kind: "door" });
    r.phase = "COMBAT";
    expect(touchTarget(r, 928, 320, 0.35)).toBeUndefined();
  });
});
describe("獨立手機佈局讀取", () => {
  it("破損／未知版本回預設，不受額外欄位影響", () => {
    expect(readLayout("bad")).toEqual(defaultLayout());
    expect(readLayout('{"version":2}')).toEqual(defaultLayout());
    expect(
      readLayout(
        '{"version":1,"controls":{"attack":{"x":"bad","y":0,"scale":1}}}',
      ),
    ).toEqual(defaultLayout());
  });
  it("位置與大小有安全界限，只接收已知按鍵", () => {
    const r = readLayout(
      JSON.stringify({
        version: 1,
        field: { x: -3, y: 4, scale: 2 },
        controls: {
          move: { x: 3, y: -1, scale: 0.1 },
          unknown: { x: 0, y: 0, scale: 1 },
        },
      }),
    );
    expect(r.field).toEqual({ x: 0, y: 1, scale: 1 });
    expect(r.controls).toEqual({ move: { x: 1, y: 0, scale: 0.6 } });
  });
});
