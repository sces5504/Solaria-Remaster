import { expect, it } from "vitest";
import { newRun } from "../../src/game/core/run";
import { actor } from "../../src/game/data/world";
import {
  equipmentCatalog,
  specialTemplates,
  type EquipmentAbility,
} from "../../src/game/data/equipment";
import {
  gearState,
  gearBasic,
  gearSkill,
  gearHurt,
  gearKill,
  updateGear,
} from "../../src/game/systems/equipment-abilities";
import {
  syncPumpkin,
  pumpkin,
  hurtPumpkin,
  updatePumpkin,
  enemyTarget,
} from "../../src/game/systems/companion";
import { context } from "../../src/game/systems/combat";
import type { Run } from "../../src/game/core/types";
function setup(ability: EquipmentAbility) {
  const r = newRun("mage", 188);
  r.phase = "COMBAT";
  r.obstacles = [];
  r.modifiers = [];
  r.reserves = [];
  r.stats.crit = 0;
  r.enemies = [actor(5, 1, 155, 320), actor(6, 1, 200, 320)];
  for (const e of r.enemies) e.hp = e.maxHP = 10000;
  const d = equipmentCatalog[ability];
  r.equipment[d.slot] = {
    id: ability,
    slot: d.slot,
    rarity: d.rarity,
    affixes: [],
    x: 0,
    y: 0,
    ...{ ability, name: d.name },
  };
  gearState(r);
  return r;
}
it("八橘、三普通紅、六事件紅的普通池與事件池完全隔離", () => {
  expect(Object.keys(equipmentCatalog)).toHaveLength(17);
  expect(
    ["armor", "ring", "amulet"].flatMap((s) =>
      specialTemplates(s as "armor", "紅"),
    ),
  ).toHaveLength(3);
  expect(specialTemplates("amulet", "紅", "christmas")).toEqual(["frostBell"]);
  expect(
    ["armor", "ring", "amulet"].flatMap((s) =>
      specialTemplates(s as "armor", "橘"),
    ),
  ).toHaveLength(8);
});
it("原始普攻第四次月爆、第三次星刃；卸裝後停止且換物重置計數", () => {
  const r = setup("moonString");
  for (let i = 0; i < 3; i++) gearBasic(r, 0);
  expect(r.enemies[0].hp).toBe(10000);
  gearBasic(r, 0);
  expect(r.enemies[0].hp).toBe(9980);
  delete r.equipment.ring;
  for (let i = 0; i < 8; i++) gearBasic(r, 0);
  expect(r.enemies[0].hp).toBe(9980);
  const s = setup("starFlow");
  for (let i = 0; i < 3; i++) gearBasic(s, 0);
  expect(s.projectiles).toHaveLength(1);
  expect(s.projectiles[0].context).toMatchObject({
    damageKind: "additional",
    canCrit: false,
    procPolicy: "none",
    basicCastProxy: false,
  });
});
it("熔光職技盾、時序只儲一次、雷電匣三次技能的有限三擊間隔.2", () => {
  const r = setup("molten");
  gearSkill(r);
  expect(r.player.shields[0]).toMatchObject({ amount: 9, until: 3 });
  const t = setup("timeRing");
  for (let i = 0; i < 12; i++) gearBasic(t, 0);
  expect(gearState(t).timeCharge).toBe(true);
  gearSkill(t);
  expect(gearState(t).skillPower).toBe(1.8);
  gearSkill(t);
  expect(gearState(t).skillPower).toBe(1);
  const e = setup("thunderBox");
  for (let i = 0; i < 3; i++) gearSkill(e);
  updateGear(e);
  expect(e.enemies[0].hp).toBe(9980);
  e.time = 0.19;
  updateGear(e);
  expect(e.enemies[0].hp).toBe(9980);
  e.time = 0.2;
  updateGear(e);
  expect(e.enemies[0].hp).toBe(9960);
  e.time = 0.4;
  updateGear(e);
  expect(e.enemies[0].hp).toBe(9940);
  e.time = 2;
  updateGear(e);
  expect(e.enemies[0].hp).toBe(9940);
});
it("隕石站定1秒啟甲、移動.4秒解甲；虛空布甲需真正生命受傷且三秒CD", () => {
  const r = setup("meteorArmor");
  for (let i = 0; i < 61; i++) updateGear(r);
  expect(gearState(r).standingArmor).toBe(true);
  for (let i = 0; i < 25; i++) {
    r.player.x++;
    updateGear(r);
  }
  expect(gearState(r).standingArmor).toBe(false);
  const v = setup("voidCloth");
  gearHurt(v, 0, false);
  expect(gearState(v).voidUntil).toBe(0);
  gearHurt(v, 1, false);
  expect(gearState(v).voidUntil).toBe(1);
  v.time = 1;
  gearHurt(v, 1, false);
  expect(gearState(v).voidUntil).toBe(1);
  v.time = 3;
  gearHurt(v, 1, false);
  expect(gearState(v).voidUntil).toBe(4);
});
it("破盾星鎧五秒一次、引力只原始擊殺三秒一次且不附元素", () => {
  const r = setup("starArmor");
  gearHurt(r, 0, true);
  expect(r.enemies[0].hp).toBe(9940);
  gearHurt(r, 0, true);
  expect(r.enemies[0].hp).toBe(9940);
  r.time = 5;
  gearHurt(r, 0, true);
  expect(r.enemies[0].hp).toBe(9880);
  const g = setup("gravity");
  gearKill(g, g.enemies[0]);
  expect(g.areas).toHaveLength(0);
  g.enemies[0].killedByRoot = true;
  gearKill(g, g.enemies[0]);
  expect(g.areas[0]).toMatchObject({ damage: 0, pull: true, ends: 2 });
  expect(g.areas[0].context?.elementMask).toEqual([]);
  gearKill(g, g.enemies[0]);
  expect(g.areas).toHaveLength(1);
});
it("隕落星核三秒／.6預警／半徑96、普攻命中代理沒有施放；軍團只有兩追加刃", () => {
  const r = setup("fallingStar");
  r.time = 3;
  updateGear(r);
  expect(r.areas[0]).toMatchObject({ damage: 90, starts: 3.6, ability: 216 });
  expect(r.areas[0].radius).toBeCloseTo(96 * 1.15);
  expect(r.areas[0].context).toMatchObject({
    basicHitProxy: true,
    basicCastProxy: false,
    canCrit: true,
    procPolicy: "one",
  });
  const s = setup("legion");
  gearSkill(s);
  gearBasic(s, 0);
  expect(s.projectiles).toHaveLength(2);
  s.time = 3;
  gearBasic(s, 0);
  expect(s.projectiles).toHaveLength(2);
});
it("南瓜3倍生命／沿用甲／有效受傷.5秒保護／倒地10秒復活／卸裝消失", () => {
  const r = setup("ghostArmor");
  syncPumpkin(r);
  const c = pumpkin(r)!;
  expect(c.maximum).toBe(270);
  expect(enemyTarget(r, c)).toBe(c);
  hurtPumpkin(r, 105);
  expect(c.hp).toBe(170);
  hurtPumpkin(r, 105);
  expect(c.hp).toBe(170);
  r.time = 0.5;
  hurtPumpkin(r, 999);
  expect(c.hp).toBe(0);
  r.time = 10.4;
  updatePumpkin(r);
  expect(c.hp).toBe(0);
  r.time = 10.5;
  updatePumpkin(r);
  expect(c.hp).toBe(270);
  delete r.equipment.armor;
  syncPumpkin(r);
  expect(pumpkin(r)).toBeUndefined();
});
it("南瓜近戰為裝備召喚追加、吃技能傷且可吸血，不暴擊、不續觸發", () => {
  const r = setup("ghostArmor");
  r.stats.skill = 1;
  r.stats.lifesteal = 0.1;
  r.player.hp = 40;
  syncPumpkin(r);
  const c = pumpkin(r)!;
  c.x = 145;
  c.y = 320;
  updatePumpkin(r);
  expect(r.enemies[0].hp).toBe(9940);
  expect(r.player.hp).toBe(52);
  expect(r.visuals.some((v) => v.kind === "ghost")).toBe(true);
  // Existing unrelated source policies remain separate from summon damage.
  expect(
    context(r, 214, "additional", [], false, 1, false, "none").procPolicy,
  ).toBe("none");
});
