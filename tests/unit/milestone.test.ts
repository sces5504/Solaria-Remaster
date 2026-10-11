import { it, expect } from "vitest";
import {
  newRun,
  startRoom,
  idleCommand,
  step,
  enterNext,
} from "../../src/game/core/run";
import { choose } from "../../src/game/systems/progression";
import { clone } from "../../src/game/core/primitives";
it("四普通房、逐级选卡、Boss清算到里程碑结尾；阶段检查点可序列化", () => {
  const r = newRun("bow", 12);
  for (let room = 1; room <= 5; room++) {
    expect(r.phase).toBe("ROOM_INTRO");
    startRoom(r);
    r.enemies.push(...(r.reserves || []));
    r.reserves = [];
    for (const e of r.enemies) e.hp = 0;
    step(r, idleCommand(r));
    while (r.phase === "SETTLEMENT") step(r, idleCommand(r));
    while (r.phase === "UPGRADE_CHOICE") {
      const saved = clone(r);
      const id = r.choices[0];
      expect(choose(r, id)).toBe(true);
      expect(saved.choices[0]).toBe(id);
    }
    expect(r.phase).toBe("POST_CLEAR");
    expect(enterNext(r)).toBe(true);
  }
  expect(r.phase).toBe("RUN_END");
  expect(r.room).toBe(5);
});
it("清关后残留投射物仍伤、旧房危险不跟到下房", () => {
  const r = newRun("mage", 1);
  startRoom(r);
  r.obstacles = [];
  r.enemies.push(...(r.reserves || []));
  r.reserves = [];
  for (const e of r.enemies) {
    e.hp = 0;
    e.xpReward = 0;
  }
  r.projectiles = [
    {
      id: 999,
      x: r.player.x - 40,
      y: r.player.y,
      vx: 260,
      vy: 0,
      radius: 5,
      distanceLeft: 800,
      damage: 10,
      context: null,
      enemy: true,
      owner: 3,
      wave: 3,
      hit: [],
      pierce: 1,
      bounce: 0,
      explosion: 0,
      explosionDamage: 0,
      trail: 0,
    },
  ];
  step(r, idleCommand(r));
  const hp = r.player.hp;
  for (let i = 0; i < 10; i++) step(r, idleCommand(r));
  expect(r.player.hp).toBeLessThan(hp);
  while (r.phase === "SETTLEMENT") step(r, idleCommand(r));
  while (r.phase === "UPGRADE_CHOICE") choose(r, r.choices[0]);
  enterNext(r);
  expect(r.projectiles).toHaveLength(0);
});
