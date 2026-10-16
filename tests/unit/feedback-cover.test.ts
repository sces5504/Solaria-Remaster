import { it, expect } from "vitest";
import { newRun } from "../../src/game/core/run";
import { actor } from "../../src/game/data/world";
import type { Obstacle } from "../../src/game/core/types";
import {
  damageCover,
  shoot,
  updateProjectiles,
  area,
  updateAreas,
} from "../../src/game/systems/combat";
import {
  coverDamageRadius,
  normalizeCover,
  coverInCone,
  coverInRush,
} from "../../src/game/systems/cover";
import { updateModes, updateEnemies } from "../../src/game/systems/enemies";
import { castSkill } from "../../src/game/systems/skills";
import { idleCommand } from "../../src/game/core/run";
import { validate } from "../../src/game/persistence/checkpoint";
import {
  syncPumpkin,
  pumpkin,
  revivePumpkin,
} from "../../src/game/systems/companion";
function wall(x = 160, y = 300): Obstacle {
  return {
    id: 1,
    x,
    y,
    w: 32,
    h: 32,
    kind: "pillar",
    durability: 20,
    maxDurability: 20,
    waves: [],
  };
}
function room() {
  const r = newRun("mage", 911);
  r.phase = "COMBAT";
  r.obstacles = [wall()];
  r.enemies = [];
  r.reserves = [];
  r.player.x = 120;
  r.player.y = 320;
  r.player.invulnerable = 1000;
  return r;
}
it("Boss四擊，2秒保護邊界，同一波無論持續多久最多一次", () => {
  const r = room(),
    o = r.obstacles[0];
  damageCover(r, { x: 160, y: 320 }, 5, 1, "boss");
  expect(o.durability).toBe(15);
  r.time = 1.999;
  damageCover(r, { x: 160, y: 320 }, 5, 2, "boss");
  expect(o.durability).toBe(15);
  r.time = 2;
  damageCover(r, { x: 160, y: 320 }, 5, 1, "boss");
  expect(o.durability).toBe(15);
  for (let i = 0; i < 3; i++) {
    r.time = 2 + i * 2;
    damageCover(r, { x: 160, y: 320 }, 5, 10 + i, "boss");
    expect(o.durability).toBe(10 - i * 5);
  }
});
it("小怪五擊、混合攻擊共用耐久；無傷害倍率與重擊特權", () => {
  const r = room();
  for (let i = 0; i < 5; i++) {
    r.time = i * 2;
    damageCover(r, { x: 160, y: 320 }, 5, i + 1, "monster");
    expect(r.obstacles[0].durability).toBe(16 - i * 4);
  }
  const mixed = room();
  for (const [i, source] of (
    ["boss", "monster", "boss", "monster", "monster"] as const
  ).entries()) {
    mixed.time = i * 2;
    damageCover(mixed, { x: 160, y: 320 }, 5, i + 1, source);
  }
  expect(mixed.obstacles[0].durability).toBe(0);
});
it("遠處掩體不扣血，移近才可破壞；湖泊不受傷", () => {
  const r = room();
  r.obstacles = [wall(500)];
  damageCover(r, { x: 500, y: 320 }, 5, 1, "boss");
  expect(r.obstacles[0].durability).toBe(20);
  r.player.x = 400;
  damageCover(r, { x: 500, y: 320 }, 5, 1, "boss");
  expect(r.obstacles[0].durability).toBe(15);
  r.obstacles[0].kind = "lake";
  r.time = 2;
  damageCover(r, { x: 500, y: 320 }, 5, 2, "boss");
  expect(r.obstacles[0].durability).toBe(15);
});
it("可受傷圓為靜電釋放兩倍半徑，實體邊緣相交才合格，範圍升級同步", () => {
  const r = room();
  r.cards[30] = 1;
  r.elements = ["lightning"];
  r.stats.range = 2;
  castSkill(r, idleCommand(r));
  expect(r.areas.find((a) => a.ability === 30)!.radius).toBe(
    coverDamageRadius(r) / 2,
  );
  expect(coverDamageRadius(r)).toBe(440);
  r.obstacles = [wall(r.player.x + 440)];
  damageCover(r, { x: r.player.x + 440, y: 320 }, 0, 1, "boss");
  expect(r.obstacles[0].durability).toBe(15);
  const outside = wall(r.player.x + 440.01);
  outside.id = 2;
  r.obstacles.push(outside);
  damageCover(r, { x: outside.x, y: 320 }, 0, 2, "boss");
  expect(outside.durability).toBe(20);
});
for (const kind of [1, 6])
  it(`第30房敵彈kind${kind}撞掩體，來源即使死亡也保留`, () => {
    const r = room();
    r.room = 30;
    const owner = actor(9, kind, 100, 320);
    r.enemies = [owner];
    shoot(
      r,
      { x: 140, y: 320 },
      0,
      99999,
      300,
      500,
      null,
      1,
      true,
      owner.id,
      77,
    );
    r.enemies = [];
    updateProjectiles(r, 0.2);
    expect(r.obstacles[0].durability).toBe(kind === 6 ? 15 : 16);
    expect(r.projectiles).toHaveLength(0);
  });
it("遠方掩體仍擋彈、我方攻擊不扣掩體血", () => {
  const r = room();
  r.obstacles = [wall(500)];
  r.enemies = [actor(9, 1, 300, 320)];
  shoot(r, { x: 450, y: 320 }, 0, 100, 300, 500, null, 1, true, 9, 1);
  updateProjectiles(r, 0.3);
  expect(r.projectiles).toHaveLength(0);
  expect(r.obstacles[0].durability).toBe(20);
});
it("雷射在被掩體截斷的終點傷掩體，同波只一次，小怪雷射也可破壞", () => {
  const r = room();
  r.enemies = [actor(9, 1, 100, 320)];
  area(r, { x: 100, y: 320 }, 1000, 8, 0, 4, 0.1, null, {
    owner: 9,
    shape: "beam",
    width: 8,
    angle: 0,
    wave: 91,
  });
  r.enemies = [];
  updateAreas(r);
  expect(r.obstacles[0].durability).toBe(16);
  r.time = 2.1;
  updateAreas(r);
  expect(r.obstacles[0].durability).toBe(16);
});
it("小怪斬擊只有真正扇形命中才傷掩體，不打背後", () => {
  const r = room();
  r.player.x = 300;
  const front = wall(270);
  front.w = 16;
  const rear = wall(170);
  rear.id = 2;
  rear.w = 16;
  r.obstacles = [front, rear];
  const e = actor(9, 3, 230, 320);
  e.monsterId = 6;
  r.enemies = [e];
  r.modes = [
    {
      id: 99,
      actor: e.id,
      attackId: "mon-6-followslash",
      type: "slash",
      starts: 0,
      ends: 1,
      next: 0,
      count: 0,
      angle: 0,
      target: { x: 400, y: 320 },
      phase: 1,
      spread: 90,
    },
  ];
  updateModes(r);
  expect(front.durability).toBe(16);
  expect(rear.durability).toBe(20);
  expect(coverInCone(rear, e, 60, 0, Math.PI / 2)).toBe(false);
});
it("舊掩體遷移保留受損比例與碎裂，不重抽已保存Boss與2秒保護", () => {
  const r = room();
  r.obstacles = [
    { ...wall(), maxDurability: 5, durability: 3 },
    { ...wall(300), id: 2, maxDurability: 10, durability: 0 },
  ];
  normalizeCover(r);
  expect(r.obstacles.map((o) => o.durability)).toEqual([12, 0]);
  r.obstacles[0].invulnerableUntil = 1.8;
  const journey = structuredClone(r.journey);
  const saved = validate({ version: 1, revision: 0, current: r, entry: r });
  expect(saved.current.obstacles[0].invulnerableUntil).toBe(1.8);
  expect(saved.current.journey).toEqual(journey);
});
it("南瓜125HP不隨職業、生命強化與周目長大；舊南瓜與清關復活也固定", () => {
  for (const classId of ["sword", "bow", "mage"] as const) {
    const r = newRun(classId, 19);
    r.equipment.armor = {
      id: "ghost",
      slot: "armor",
      rarity: "紅",
      ability: "ghostArmor",
      affixes: [],
      x: 0,
      y: 0,
    };
    syncPumpkin(r);
    expect(pumpkin(r)!.hp).toBe(125);
    r.stats.maxHP = 9000;
    r.loop = 10;
    syncPumpkin(r);
    expect(pumpkin(r)!.maximum).toBe(125);
    pumpkin(r)!.maximum = 27000;
    pumpkin(r)!.hp = 1000;
    syncPumpkin(r);
    expect(pumpkin(r)!.hp).toBe(125);
    pumpkin(r)!.hp = 0;
    pumpkin(r)!.maximum = 27000;
    revivePumpkin(r);
    expect(pumpkin(r)!.hp).toBe(125);
  }
});

it("小怪衝撞嘗試跨越實體時傷掩體，不必先穿牆才命中", () => {
  const r = room();
  r.player.x = 220;
  r.obstacles = [wall(170)];
  const e = actor(9, 1, 154, 320);
  e.rushUntil = 1;
  e.moveAngle = 0;
  r.enemies = [e];
  r.modes = [
    {
      id: 88,
      actor: e.id,
      attackId: "rush",
      type: "rush",
      starts: 0,
      ends: 1,
      next: 1,
      count: 0,
      angle: 0,
      target: { x: 400, y: 320 },
      phase: 1,
    },
  ];
  updateEnemies(r);
  expect(r.obstacles[0].durability).toBe(16);
  expect(e.x).toBeLessThan(170);
  updateEnemies(r);
  expect(r.obstacles[0].durability).toBe(16);
});
it("舊鬼甲存檔進入房間介紹前已遷移125上限", () => {
  const r = room();
  r.equipment.armor = {
    id: "ghost",
    slot: "armor",
    rarity: "紅",
    ability: "ghostArmor",
    affixes: [],
    x: 0,
    y: 0,
  };
  syncPumpkin(r);
  pumpkin(r)!.maximum = 3000;
  pumpkin(r)!.hp = 3000;
  const s = validate({ version: 1, revision: 0, current: r, entry: r });
  expect(pumpkin(s.current)!.maximum).toBe(125);
  expect(pumpkin(s.current)!.hp).toBe(125);
});

it("衝撞從貼牆處往外離開不攻擊背後的牆", () => {
  const o = wall();
  expect(coverInRush(o, { x: 146, y: 320 }, -4, 0, 14)).toBe(false);
  expect(coverInRush(o, { x: 146, y: 320 }, 4, 0, 14)).toBe(true);
});
it("雷射只有半線寬可傷掩體，不因取樣半徑加倍傷到旁邊", () => {
  const r = room();
  r.enemies = [actor(9, 1, 100, 320)];
  r.obstacles = [wall(140, 326)];
  area(r, { x: 100, y: 320 }, 1000, 8, 0, 1, 0.1, null, {
    owner: 9,
    shape: "beam",
    width: 8,
    angle: 0,
    wave: 91,
  });
  updateAreas(r);
  expect(r.obstacles[0].durability).toBe(20);
});
