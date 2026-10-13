import { it, expect } from "vitest";
import { newRun, idleCommand, step } from "../../src/game/core/run";
import { actor } from "../../src/game/data/world";
import {
  equipmentCatalog,
  type EquipmentAbility,
} from "../../src/game/data/equipment";
import {
  derive,
  itemFor,
  discard,
  grantTestCard,
  choose,
  chooseEquipmentSlot,
} from "../../src/game/systems/progression";
import {
  context,
  hit,
  hurt,
  shoot,
  updateProjectiles,
} from "../../src/game/systems/combat";
import { castSkill, basic, updateSkills } from "../../src/game/systems/skills";
import {
  gearState,
  updateGear,
} from "../../src/game/systems/equipment-abilities";
import { syncPumpkin, pumpkin } from "../../src/game/systems/companion";
import { validate } from "../../src/game/persistence/checkpoint";
function setup(ability: EquipmentAbility) {
  const r = newRun("mage", 401);
  r.phase = "COMBAT";
  r.obstacles = [];
  r.reserves = [];
  r.modifiers = [];
  r.enemies = [actor(9, 1, 180, 320), actor(10, 1, 210, 320)];
  for (const e of r.enemies) e.hp = e.maxHP = 10000;
  const d = equipmentCatalog[ability];
  r.equipment[d.slot] = {
    id: ability,
    slot: d.slot,
    rarity: d.rarity,
    name: d.name,
    ability,
    affixes: [],
    x: 0,
    y: 0,
  };
  r.stats = derive(r);
  r.stats.crit = 0;
  return r;
}
it("扣盾也屬有效受傷，69／73觸發而生命未扣；獻祭不能觸發", () => {
  const r = setup("molten");
  r.cards[69] = 1;
  r.cards[73] = 1;
  r.player.shields = [{ amount: 100, until: 10 }];
  const hp = r.player.hp;
  hurt(r, 10);
  expect(r.player.hp).toBe(hp);
  expect(r.player.recoveryUntil).toBe(2);
  expect(r.player.shields).toHaveLength(2);
  expect(r.cooldowns[73]).toBe(12);
});
it("裂隙一般傷精英+25%，爆血忽略護甲／全域／技能與吸血", () => {
  const r = setup("riftRing"),
    e = r.enemies[0];
  e.elite = true;
  hit(r, e, 100, context(r, 41, "basic", [], true));
  expect(e.hp).toBe(9875);
  r.stats.global = 10;
  r.stats.skill = 10;
  r.stats.lifesteal = 1;
  r.player.hp = 10;
  e.armor = 1000;
  hit(r, e, 2000, {
    ...context(r, 213, "percent", [], false, 1, false, "none"),
    lifestealEligible: false,
  });
  expect(e.hp).toBe(7875);
  expect(r.player.hp).toBe(10);
});
it("赤月10次命中才爆血，來源副鏈折扣一次、門檻×1.35、5秒後衰退", () => {
  const r = setup("redMoon"),
    e = r.enemies[0];
  r.stats.lifesteal = 0;
  for (let i = 0; i < 9; i++)
    hit(r, e, 1, context(r, 50, "basic", [], true, 0.2));
  expect(e.hp).toBeCloseTo(9998.2);
  hit(r, e, 1, context(r, 50, "basic", [], true, 0.2));
  expect(e.hp).toBeCloseTo(9598);
  expect(gearState(r).targets[e.id].threshold).toBe(135);
  hit(r, e, 1, context(r, 50, "basic", [], true));
  r.time = 6;
  updateGear(r);
  expect(gearState(r).targets[e.id].blood).toBe(0);
});
it("星裂六命中爆炸不續觸發，致命第六擊也波及其他目標", () => {
  const r = setup("starSeal"),
    e = r.enemies[0];
  for (let i = 0; i < 5; i++) hit(r, e, 1, context(r, 50, "basic", [], true));
  e.hp = 1;
  hit(r, e, 1, context(r, 50, "basic", [], true));
  expect(e.hp).toBe(0);
  expect(r.enemies[1].hp).toBe(9920);
  expect(gearState(r).targets[r.enemies[1].id]).toBeUndefined();
});
it("霜鈴25%基礎按相對暴擊，冰矛既得封印，兩暴擊無全域CD；致命暴擊禮物也命中其他敵", () => {
  const r = setup("frostBell");
  r.cards[10] = 2;
  r.stats = derive(r);
  expect(r.stats.crit).toBeCloseTo(0.35);
  r.cards[16] = 1;
  r.elements = ["ice"];
  r.stats.crit = 1;
  r.enemies[0].hp = 1;
  hit(r, r.enemies[0], 1, context(r, 50, "basic", [], true));
  expect(r.enemies[1].hp).toBe(9960);
  hit(r, r.enemies[1], 1, context(r, 50, "basic", [], true));
  expect(
    r.visuals.filter((v) => v.kind === "relic" && v.value === 212),
  ).toHaveLength(2);
  for (let i = 0; i < 3; i++) basic(r, idleCommand(r));
  expect(
    r.projectiles.filter((p) => p.context?.sourceAbilityId === 16),
  ).toHaveLength(0);
});
it("時序加成只用於下一次職技本體、快射與複本，不能污染後續普攻／獨立招式", () => {
  const r = setup("timeRing");
  r.cards[71] = 1;
  for (let i = 0; i < 6; i++) basic(r, idleCommand(r));
  expect(gearState(r).timeCharge).toBe(true);
  castSkill(r, idleCommand(r));
  expect(
    r.areas.filter((a) => a.ability === 158).at(-1)!.context!.skillBonus,
  ).toBeCloseTo(0.8);
  expect(r.activeSkillBonus).toBeUndefined();
  expect(context(r, 40).skillBonus).toBeUndefined();
  r.time = 0.8;
  updateSkills(r, idleCommand(r));
  expect(
    r.areas.filter((a) => a.ability === 158).at(-1)!.context,
  ).toMatchObject({ skillBonus: 0.8, chainScale: 0.6, canCrit: false });
});
it("南瓜實際攔截敵彈且沿用有效受傷保護，卸裝清掉召喚；其吸血回玩家", () => {
  const r = setup("ghostArmor");
  syncPumpkin(r);
  const c = pumpkin(r)!;
  c.x = 150;
  c.y = 320;
  shoot(r, { x: 220, y: 320 }, Math.PI, 20, 400, 400, null, 1, true);
  updateProjectiles(r, 0.3);
  expect(c.hp).toBeLessThan(c.maximum);
  expect(r.player.hp).toBe(r.stats.maxHP);
  r.phase = "POST_CLEAR";
  discard(r, "ghostArmor");
  expect(pumpkin(r)).toBeUndefined();
});
it("橘紅帶實際能力且保存往返，卸裝物件唯一，非法模板拒絕", () => {
  const r = setup("redMoon");
  const saved = validate({ version: 1, revision: 0, current: r, entry: r });
  expect(saved.current.equipment.amulet?.ability).toBe("redMoon");
  r.equipment.amulet!.ability = "molten";
  expect(() =>
    validate({ version: 1, revision: 0, current: r, entry: r }),
  ).toThrow("特殊裝備");
});
it("一般掉落含8橘／3普通紅、紅兩詞橘三詞，事件不入池，地形與周目成長不放大吸血", () => {
  const seen = new Set<string>();
  for (let seed = 1; seed <= 5000; seed++) {
    const r = newRun("mage", seed);
    const item = itemFor(r, 9, 0)!;
    if (item.ability) {
      seen.add(item.ability);
      expect(item.affixes).toHaveLength(item.rarity === "橘" ? 3 : 2);
      expect("event" in equipmentCatalog[item.ability]).toBe(false);
    }
    for (const a of item.affixes)
      if (a.stat === "lifesteal") expect(a.value).toBeLessThanOrEqual(0.0054);
  }
  expect(seen.size).toBe(11);
  let compared = false;
  for (let i = 1; i < 100 && !compared; i++) {
    const seed = (Math.imul(i, 0x9e3779b9) ^ 0xa5814e3f) >>> 0;
    const a = newRun("mage", seed),
      b = newRun("mage", seed);
    b.loop = 5;
    b.biome = "castle";
    const old = itemFor(a, 9, 0)!,
      scaled = itemFor(b, 9, 0)!;
    const matching = scaled.affixes.find(
      (aff) =>
        aff.stat !== "lifesteal" &&
        old.affixes.some((a) => a.stat === aff.stat),
    );
    if (matching) {
      expect(matching.value).toBeGreaterThan(
        old.affixes.find((a) => a.stat === matching.stat)!.value,
      );
      expect(old.id).not.toBe(scaled.id);
      compared = true;
    }
  }
  expect(compared).toBe(true);
  const c = newRun("mage", 1);
  c.equipment.armor = {
    id: "old",
    slot: "armor",
    rarity: "藍",
    x: 0,
    y: 0,
    affixes: [
      { stat: "hp", value: 30 },
      { stat: "lifesteal", value: 0.003 },
    ],
  };
  const before = derive(c);
  c.loop = 10;
  expect(derive(c).maxHP).toBe(before.maxHP);
  expect(derive(c).lifesteal).toBe(0.003);
}, 20000);

it("紅卡自動卸裝即刻停止南瓜，暫停選擇期間也不保留夥伴", () => {
  const r = setup("ghostArmor");
  syncPumpkin(r);
  expect(pumpkin(r)).toBeDefined();
  grantTestCard(r, 80);
  expect(r.equipment.armor).toBeUndefined();
  expect(pumpkin(r)).toBeUndefined();
  expect(r.bag).toHaveLength(1);
  const s = setup("ghostArmor");
  syncPumpkin(s);
  s.phase = "UPGRADE_CHOICE";
  s.pendingLevels = 1;
  s.choices = [85, 1, 2];
  choose(s, 85);
  expect(pumpkin(s)).toBeUndefined();
  expect(pumpkin(s)).toBeUndefined();
  expect(s.bag).toHaveLength(1);
});

it("不同來源盾各自破裂可觸發星鎧，不必等全部盾消失；時序對已有技能增益仍增加80%該次傷害", () => {
  const r = setup("starArmor");
  r.player.shields = [
    { amount: 1, until: 10 },
    { amount: 100, until: 10 },
  ];
  hurt(r, 10);
  expect(r.player.shields[1].amount).toBeGreaterThan(0);
  expect(r.enemies[0].hp).toBe(9940);
  expect(r.player.hp).toBe(r.stats.maxHP);
  const s = setup("timeRing");
  s.stats.skill = 1;
  const ctx = context(s, 158);
  ctx.skillBonus = 0.8;
  hit(s, s.enemies[0], 100, ctx);
  expect(s.enemies[0].hp).toBe(9640);
});
it("覓星只提升精英掉落30→40%，普通4%和已掉品質完全相同", () => {
  const a = setup("riftRing"),
    b = setup("starSeeker");
  a.equipment = {};
  a.enemies[0].elite = true;
  b.enemies[0].elite = true;
  let original = 0,
    boosted = 0;
  for (let i = 1; i <= 1000; i++) {
    a.seed = b.seed = (Math.imul(i, 0x9e3779b9) ^ 0x14a03d8f) >>> 0;
    const old = itemFor(a, 9),
      next = itemFor(b, 9);
    if (old) {
      original++;
      expect(next).toEqual(old);
    }
    if (next) boosted++;
  }
  expect(original).toBeGreaterThan(250);
  expect(original).toBeLessThan(350);
  expect(boosted - original).toBeGreaterThan(60);
  expect(boosted - original).toBeLessThan(140);
  a.enemies[0].elite = b.enemies[0].elite = false;
  for (let i = 1; i <= 200; i++) {
    a.seed = b.seed = i * 913119;
    expect(itemFor(a, 9)).toEqual(itemFor(b, 9));
  }
});
it("百分比入口隔離錯誤代理標記、強制暴擊、元素與副鏈，不修改來源物件", () => {
  const r = setup("starSeal");
  const e = r.enemies[0];
  r.cards[45] = 1;
  r.cards[16] = 1;
  r.cards[10] = 1;
  r.stats.crit = 1;
  r.stats.lifesteal = 1;
  r.player.hp = 10;
  const ctx = {
    ...context(r, 144, "basic", ["fire", "ice", "lightning"], true),
    damageKind: "percent" as const,
  };
  const before = r.projectiles.length;
  hit(r, e, 200, ctx);
  expect(e.hp).toBe(9800);
  expect(e.burn).toEqual([]);
  expect(e.frost).toBe(0);
  expect(r.player.hp).toBe(10);
  expect(r.projectiles.length).toBe(before);
  expect(gearState(r).targets[e.id]).toBeUndefined();
  expect(ctx.basicHitProxy).toBe(true);
  expect(ctx.elementMask).toHaveLength(3);
});
