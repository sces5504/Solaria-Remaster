import { describe, it, expect } from "vitest";
import { newRun, startRoom, idleCommand, step } from "../../src/game/core/run";
import { choose } from "../../src/game/systems/progression";
import { actor, makeObstacles, roomXPBudget } from "../../src/game/data/world";
import { updateEnemies, updateModes } from "../../src/game/systems/enemies";
import { Input } from "../../src/input/keyboard";
import { vi } from "vitest";

describe("第一里程碑試玩回饋", () => {
  it("右鍵／閃避／E 的按下事件保留至實際 fixed tick", () => {
    const win = new EventTarget(),
      doc = new EventTarget(),
      canvas = new EventTarget();
    vi.stubGlobal("window", win);
    vi.stubGlobal("document", doc);
    const input = new Input(
      canvas as HTMLCanvasElement,
      () => {},
      () => {},
    );
    input.attack = true;
    input.skill = true;
    input.dodge = true;
    input.interact = true;
    const r = newRun("bow", 1);
    expect(input.command(r).skill).toBe(true);
    // Rendering can sample more than once before the next 60Hz simulation step.
    expect(input.command(r).skill).toBe(true);
    input.consumeEdges();
    expect(input.command(r)).toMatchObject({
      skill: false,
      dodge: false,
      interact: false,
      attack: true,
    });
    vi.unstubAllGlobals();
  });
  for (const cls of ["sword", "bow", "mage"] as const)
    it(`${cls} 左鍵持續按住也能開技能；清算後仍可攻擊`, () => {
      const r = newRun(cls, 2);
      r.phase = "POST_CLEAR";
      r.enemies = [];
      r.reserves = [];
      r.obstacles = [];
      const c = { ...idleCommand(r), attack: true, skill: true };
      step(r, c);
      expect(r.player.skillReady).toBeGreaterThan(r.time);
      expect(r.player.casts).toBeGreaterThan(0);
      const casts = r.player.casts;
      c.skill = false;
      for (let i = 0; i < 65; i++) step(r, c);
      expect(r.player.casts).toBeGreaterThan(casts);
    });
  it("站在門口不會自動換關，必須按 E", () => {
    const r = newRun("sword", 3);
    r.phase = "POST_CLEAR";
    r.player.x = 912;
    r.player.y = 320;
    r.enemies = [];
    r.reserves = [];
    r.obstacles = [];
    step(r, idleCommand(r));
    expect(r.room).toBe(1);
    step(r, { ...idleCommand(r), interact: true });
    expect(r.room).toBe(2);
    expect(r.phase).toBe("ROOM_INTRO");
  });
  it("每房原生怪初始 4–10，增援不越過上限，尚有增援時不提前清關", () => {
    for (let seed = 1; seed <= 30; seed++) {
      const r = newRun("mage", seed);
      startRoom(r);
      expect(r.enemies.length).toBeGreaterThanOrEqual(4);
      expect(r.enemies.length).toBeLessThanOrEqual(10);
      expect(
        r.enemies.length + (r.reserves?.length || 0),
      ).toBeGreaterThanOrEqual(Math.round(8 * 0.8));
      if (!r.reserves?.length) r.reserves = [r.enemies.pop()!];
      r.enemies = [];
      step(r, idleCommand(r));
      expect(r.phase).toBe("COMBAT");
      r.time = 3;
      updateEnemies(r);
      expect(r.enemies.length).toBeLessThanOrEqual(10);
    }
  });
  it("前四房逐房升級，第五房結算到 Lv.6；清算不重複給分", () => {
    const r = newRun("bow", 4);
    for (let room = 1; room <= 5; room++) {
      startRoom(r);
      r.enemies.push(...(r.reserves || []));
      r.reserves = [];
      for (const e of r.enemies) e.hp = 0;
      step(r, idleCommand(r));
      while (r.phase === "SETTLEMENT") step(r, idleCommand(r));
      expect(r.phase).toBe("UPGRADE_CHOICE");
      while (r.phase === "UPGRADE_CHOICE") choose(r, r.choices[0]);
      expect(r.level).toBeGreaterThanOrEqual(room + 1);
      const score = r.score;
      step(r, idleCommand(r));
      expect(r.score).toBe(score);
      if (room < 5) {
        r.player.x = 912;
        r.player.y = 320;
        step(r, { ...idleCommand(r), interact: true });
      }
    }
    expect(r.level).toBe(6);
  });
  it("山羊環彈發出完整十四方向，沒有人工缺口", () => {
    const r = newRun("mage", 5);
    r.enemies = [actor(10, 7, 512, 320)];
    r.reserves = [];
    r.obstacles = [];
    r.modes = [
      {
        id: 88,
        actor: 10,
        attackId: "goat-horn-ring",
        type: "ring",
        starts: 0,
        ends: 2,
        next: 0,
        count: 0,
        angle: 0,
        target: r.player,
        phase: 1,
      },
    ];
    updateModes(r);
    expect(r.projectiles.length).toBe(14);
    const angles = r.projectiles
      .map((b) => Math.atan2(b.vy, b.vx))
      .sort((a, b) => a - b);
    for (let i = 1; i < 14; i++)
      expect(angles[i] - angles[i - 1]).toBeCloseTo((Math.PI * 2) / 14, 6);
  });
  it("衝刺前停止行走、蓄力至少 .7 秒，普通狼衝刺速度不超過 240", () => {
    const r = newRun("sword", 6);
    r.reserves = [];
    r.obstacles = [];
    r.player.x = 400;
    r.player.y = 320;
    const e = actor(10, 1, 530, 320);
    e.nextAttack = 0;
    r.enemies = [e];
    updateEnemies(r);
    expect(r.modes[0].starts - r.time).toBeGreaterThanOrEqual(0.7);
    const x = e.x;
    r.time = 0.2;
    updateEnemies(r);
    expect(e.x).toBe(x);
    r.time = 0.71;
    updateModes(r);
    const before = e.x;
    updateEnemies(r);
    expect(Math.abs(e.x - before)).toBeLessThanOrEqual(240 / 60 + 0.01);
  });
  it("相同模板不同 seed 有不同植被／掩體，不改動出生和門口", () => {
    expect(makeObstacles(5, 0, 1)).not.toEqual(makeObstacles(5, 0, 2));
    for (let seed = 1; seed < 50; seed++)
      for (let template = 0; template < 6; template++)
        for (const o of makeObstacles(template, 0, seed)) {
          expect(o.x).toBeGreaterThan(150);
          expect(o.x + o.w).toBeLessThan(900);
        }
  });
});

it("31 關經驗配額每關一級至Lv.32，不靠補殺召喚怪", () => {
  let xp = 0,
    level = 1;
  for (let room = 1; room <= 31; room++) {
    xp += roomXPBudget(room);
    while (xp >= 100 + 20 * (level - 1)) {
      xp -= 100 + 20 * (level - 1);
      level++;
    }
  }
  expect(level).toBe(32);
});
