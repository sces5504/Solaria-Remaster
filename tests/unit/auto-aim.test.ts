import { expect, it } from "vitest";
import { AutoAim, aimBlocked, AIM_RANGE } from "../../src/input/auto-aim";
import { newRun, idleCommand, step } from "../../src/game/core/run";
import { actor } from "../../src/game/data/world";
function arena() {
  const r = newRun("mage", 888);
  r.player.x = 150;
  r.player.y = 320;
  r.obstacles = [];
  r.enemies = [];
  return r;
}
function wall(x: number, y: number, w = 30, h = 80) {
  return {
    id: 999,
    x,
    y,
    w,
    h,
    kind: "pillar" as const,
    durability: 20,
    maxDurability: 20,
    waves: [],
  };
}
it("長方形通道先排除遮擋：遠處暢通敵人優於近處牆後敵人", () => {
  const r = arena();
  const near = actor(10, 1, 300, 320),
    far = actor(11, 1, 150, 580);
  r.enemies = [near, far];
  r.obstacles = [wall(220, 290)];
  const a = new AutoAim();
  expect(a.select(r)).toEqual({ x: 150, y: 580 });
  expect(a.targetId).toBe(far.id);
});
it("通道邊緣、斜角與毀壞／湖泊：不是只用中心細線判斷", () => {
  const r = arena();
  r.obstacles = [wall(230, 329, 20, 20)];
  expect(aimBlocked(r, { x: 400, y: 320 })).toBe(true);
  r.obstacles[0].y = 331;
  expect(aimBlocked(r, { x: 400, y: 320 })).toBe(false);
  r.obstacles = [wall(230, 390, 30, 30)];
  expect(aimBlocked(r, { x: 400, y: 570 })).toBe(true);
  r.obstacles[0].durability = 0;
  expect(aimBlocked(r, { x: 400, y: 570 })).toBe(false);
  r.obstacles[0].durability = 20;
  r.obstacles[0].kind = "lake" as "pillar";
  expect(aimBlocked(r, { x: 400, y: 570 })).toBe(false);
});
it("短暫鎖定與距離遲滯，小幅距離變動不跳目標，明顯更近才切換", () => {
  const r = arena(),
    a = new AutoAim(),
    e = actor(10, 1, 450, 320),
    f = actor(11, 1, 460, 320);
  r.enemies = [e, f];
  a.select(r);
  f.x = 370;
  r.time = 0.2;
  a.select(r);
  expect(a.targetId).toBe(10);
  r.time = 0.4;
  a.select(r);
  expect(a.targetId).toBe(11);
  e.x = 360;
  r.time = 1;
  a.select(r);
  expect(a.targetId).toBe(11);
});
it("死亡、遮擋、超距離立即重選，不受鎖定窗口限制", () => {
  const r = arena(),
    a = new AutoAim(),
    e = actor(10, 1, 300, 320),
    f = actor(11, 1, 150, 500);
  r.enemies = [e, f];
  a.select(r);
  e.hp = 0;
  a.select(r);
  expect(a.targetId).toBe(11);
  e.hp = 10;
  f.x = 150 + AIM_RANGE + 1;
  a.select(r);
  expect(a.targetId).toBe(10);
  r.obstacles = [wall(220, 290)];
  a.select(r);
  expect(a.targetId).toBeNull();
});
it("全遮擋／無敵人沿用最後方向，首度無敵人用角色面向，新局清舊鎖定", () => {
  const r = arena(),
    a = new AutoAim();
  r.player.aim = Math.PI / 2;
  expect(a.select(r).y).toBeCloseTo(620);
  r.enemies = [actor(10, 1, 450, 320)];
  a.select(r);
  r.enemies = [];
  expect(a.select(r)).toEqual({ x: 450, y: 320 });
  r.runId += "next";
  expect(a.select(r).y).toBeCloseTo(620);
});
it("選敵不動核心／隨機數，也不自動施放；沒有敵人仍可主動施技", () => {
  const r = arena(),
    a = new AutoAim();
  r.phase = "COMBAT";
  r.player.aim = 0;
  r.reserves = [];
  const rng = r.rng,
    p = { ...r.player };
  a.select(r);
  expect(r.rng).toBe(rng);
  expect(r.player).toEqual(p);
  const c = idleCommand(r);
  c.pointerWorld = a.select(r);
  step(r, c);
  expect(r.player.casts).toBe(0);
  c.skill = true;
  step(r, c);
  expect(r.player.skillReady).toBeGreaterThan(r.time);
});

it("法師主動落雷鎖定目標座標，技能可達距離之外的目標不納入該次鎖定", async () => {
  const { castSkill } = await import("../../src/game/systems/skills");
  const r = arena(),
    a = new AutoAim();
  r.enemies = [actor(1, 1, 450, 320)];
  const c = idleCommand(r);
  c.pointerWorld = a.select(r, 450 * r.stats.range);
  castSkill(r, c);
  const mark = r.areas.find((v) => v.ability === 158)!;
  expect({ x: mark.x, y: mark.y }).toEqual({ x: 450, y: 320 });
  r.enemies[0].x = 800;
  a.select(r, 450 * r.stats.range);
  expect(a.targetId).toBeNull();
});

it("外接滑鼠更新最後有效方向，回觸控而無敵人時不恢復過期鎖定", () => {
  const r = arena(),
    a = new AutoAim();
  r.enemies = [actor(1, 1, 450, 320)];
  a.select(r);
  a.manual(r, { x: 150, y: 80 });
  r.enemies = [];
  expect(a.select(r).x).toBeCloseTo(150);
  expect(a.select(r).y).toBeCloseTo(20);
  expect(a.targetId).toBeNull();
});
