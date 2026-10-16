import { it, expect } from "vitest";
import {
  newRun,
  idleCommand,
  step,
  enterNext,
  settle,
} from "../../src/game/core/run";
import { actor, populate } from "../../src/game/data/world";
import { cards, eligible, skillFactor } from "../../src/game/data/cards";
import {
  derive,
  choose,
  chooseFusion,
  chooseEquipmentSlot,
  grantTestCard,
  equip,
} from "../../src/game/systems/progression";
import {
  basic,
  castSkill,
  dodge,
  updateSkills,
} from "../../src/game/systems/skills";
import { context, hit, hurt } from "../../src/game/systems/combat";
import { clone } from "../../src/game/core/primitives";
import { validate } from "../../src/game/persistence/checkpoint";
function setup(ids: number[], cls: "mage" | "bow" | "sword" = "mage") {
  const r = newRun(cls, 701);
  r.obstacles = [];
  r.modifiers = [];
  r.reserves = [];
  r.phase = "COMBAT";
  for (const id of ids) r.cards[id] = 1;
  r.stats = derive(r);
  r.stats.crit = 0;
  r.enemies = [actor(900, 1, 185, 320), actor(901, 1, 700, 320)];
  for (const e of r.enemies) {
    e.hp = e.maxHP = 10000;
    e.armor = 0;
  }
  return r;
}
it("70 每第五次左鍵才幽影；快射代理／副本不加此計數，不可暴擊或副鏈", () => {
  const r = setup([70], "sword");
  for (let i = 0; i < 4; i++) basic(r, idleCommand(r));
  expect(r.visuals.some((v) => v.kind === "ghost")).toBe(false);
  const hp = r.enemies[0].hp;
  basic(r, idleCommand(r));
  expect(hp - r.enemies[0].hp).toBe(110);
  expect(r.visuals.filter((v) => v.kind === "ghost")).toHaveLength(1);
  basic(r, idleCommand(r), true);
  expect(r.player.originalBasics).toBe(5);
});
it("71 延迟副本保持CD、60%傷害、不暴击／普攻代理／副鏈，且不复制盾", () => {
  const r = setup([71, 33, 34, 67]);
  r.elements = ["water", "fire"];
  r.fusion = "steam";
  castSkill(r, idleCommand(r));
  const ready = r.player.skillReady,
    shields = r.player.shields.length;
  r.time = 0.8;
  updateSkills(r, idleCommand(r));
  expect(r.player.skillReady).toBe(ready);
  expect(r.player.shields).toHaveLength(shields);
  const copies = r.areas.filter((a) => a.context?.ancestry.includes(171));
  expect(copies).toHaveLength(4);
  for (const a of copies) {
    expect(a.context!.chainScale).toBeCloseTo(0.6);
    expect(a.context!.canCrit).toBe(false);
    expect(a.context!.basicHitProxy).toBe(false);
    expect(a.context!.procPolicy).toBe("none");
  }
});
it("71 弓快射副本有獨立排程，不重置原快射或施放計數", () => {
  const r = setup([71], "bow");
  castSkill(r, idleCommand(r));
  const original = clone(r.player.rapid);
  r.time = 0.8;
  updateSkills(r, idleCommand(r));
  expect(r.player.rapid.remaining).toBe(original.remaining - 1);
  expect(r.player.casts).toBe(1);
  expect(r.player.echoRapid!.remaining).toBe(4);
  expect(
    r.projectiles.filter((p) => p.context?.ancestry.includes(171)),
  ).toHaveLength(1);
});
it("72 冷卻錨保留基礎20%邊界；78禁閃避時不能偷減CD", () => {
  const r = setup([72]);
  r.time = 1;
  r.player.skillCast = 0;
  r.player.skillReady = 0.8;
  dodge(r, idleCommand(r));
  expect(r.player.skillReady).toBeCloseTo(0.6);
  r.cards[78] = 1;
  r.player.dashReady = 0;
  const ready = r.player.skillReady;
  expect(dodge(r, idleCommand(r))).toBe(false);
  expect(r.player.skillReady).toBe(ready);
});
it("73 高生命護甲與受傷盾12秒內一次；獻祭扣血觸發受傷盾", () => {
  const r = setup([73, 82]);
  expect(r.stats.armor).toBe(45);
  r.player.hp = 30;
  expect(derive(r).armor).toBe(5);
  castSkill(r, idleCommand(r));
  expect(r.player.hp).toBeCloseTo(27.6);
  expect(r.player.shields).toHaveLength(1);
  hurt(r, 10);
  expect(r.player.shields).toHaveLength(1);
  r.time = 1;
  r.player.shields = [];
  hurt(r, 10);
  expect(r.player.shields).toHaveLength(0);
});
it("74 原始元素命中同敵一秒一次，追加不循環；抽取需至少兩覺醒", () => {
  const r = setup([74]);
  expect(
    eligible(
      newRun("mage", 1),
      cards.find((c) => c.id === 74)!,
    ),
  ).toBe(false);
  r.elements = ["ice", "water"];
  const e = r.enemies[0];
  const hp = e.hp;
  hit(r, e, 10, context(r, 17, "skill", ["ice"]));
  expect(hp - e.hp).toBe(50);
  const next = e.hp;
  hit(r, e, 10, context(r, 17, "skill", ["ice"]));
  expect(next - e.hp).toBe(10);
  r.time = 1;
  const before = e.hp;
  hit(r, e, 10, context(r, 74, "additional", [], false, 1, false, "none"));
  expect(before - e.hp).toBe(10);
});
it("75 原始击杀射3追踪刃，追加击杀不續召", () => {
  const r = setup([75]);
  r.enemies[0].hp = 10;
  hit(r, r.enemies[0], 100, context(r, 1, "basic"));
  step(r, idleCommand(r));
  expect(
    r.projectiles.filter((p) => p.context?.sourceAbilityId === 75),
  ).toHaveLength(3);
  expect(r.projectiles.every((p) => p.context!.procPolicy === "none")).toBe(
    true,
  );
  const other = setup([75]);
  other.enemies[0].hp = 10;
  hit(
    other,
    other.enemies[0],
    100,
    context(other, 75, "additional", [], false, 1, false, "none"),
  );
  step(other, idleCommand(other));
  expect(other.projectiles).toHaveLength(0);
});
it("76 進王房一次盾，clone／重新配置同房不重複，下一王房另一次", () => {
  const r = setup([76]);
  r.room = 5;
  populate(r);
  expect(r.player.shields).toHaveLength(1);
  populate(r);
  expect(r.player.shields).toHaveLength(1);
  r.phase = "POST_CLEAR";
  enterNext(r);
  r.room = 10;
  populate(r);
  expect(r.player.shields).toHaveLength(2);
});
it("77 每階段首次原始職技首段翻倍，兩個分裂體共用額度", () => {
  const r = setup([77]);
  const a = actor(50, 6, 600, 320),
    b = actor(51, 6, 700, 320);
  for (const e of [a, b]) {
    e.hp = e.maxHP = 10000;
    e.phase = 2;
    e.splitGroup = 50;
    e.armor = 0;
  }
  r.enemies = [a, b];
  expect(hit(r, a, 100, context(r, 158))).toBe(200);
  expect(hit(r, b, 100, context(r, 158))).toBe(100);
  expect(hit(r, a, 100, context(r, 158))).toBe(100);
});
it("78／83互斥與動作禁用即時生效，保留記錄且失效卡不进池", () => {
  const r = setup([78]);
  expect(basic(r, idleCommand(r))).toBe(false);
  expect(dodge(r, idleCommand(r))).toBe(false);
  expect(derive(r).skillCD).toBeCloseTo(1.08);
  expect(
    eligible(
      r,
      cards.find((c) => c.id === 83)!,
    ),
  ).toBe(false);
  expect(grantTestCard(r, 83)).toBe(false);
  const s = setup([83]);
  expect(castSkill(s, idleCommand(s))).toBe(false);
  expect(
    eligible(
      s,
      cards.find((c) => c.id === 17)!,
    ),
  ).toBe(false);
  expect(s.cards[83]).toBe(1);
  expect(derive(s).basic).toBe(1.2);
  expect(derive(s).attackRate).toBe(6);
});
it("79 吸血實損，1秒最多20%HP，當前生命不得超40%", () => {
  const r = setup([79]);
  r.player.hp = 90;
  hit(r, r.enemies[0], 100, context(r, 1, "basic"));
  expect(r.player.hp).toBe(36);
  r.player.hp = 1;
  hit(r, r.enemies[0], 1000, context(r, 1, "basic"));
  expect(r.player.hp).toBe(19);
  r.player.hp = 1;
  hit(r, r.enemies[0], 1000, context(r, 1, "basic"));
  expect(r.player.hp).toBe(1);
  r.time = 1;
  hit(r, r.enemies[0], 1000, context(r, 1, "basic"));
  expect(r.player.hp).toBe(19);
  settle(r);
  expect(r.player.hp).toBe(28);
  r.room = 5;
  r.settledOnce = false;
  settle(r);
  expect(r.player.hp).toBe(36);
});
it("80 第三觉醒同时形成融合暂停自選且可存读；裝甲滿包落地，融合固定", () => {
  const r = setup([]);
  r.phase = "UPGRADE_CHOICE";
  r.pendingLevels = 3;
  r.choices = [80, 1, 2];
  r.equipment.armor = {
    id: "a",
    slot: "armor",
    rarity: "藍",
    x: 0,
    y: 0,
    affixes: [],
  };
  for (let i = 0; i < 12; i++)
    r.bag.push({
      id: `bag${i}`,
      slot: "ring",
      rarity: "藍",
      x: 0,
      y: 0,
      affixes: [],
    });
  choose(r, 80);
  expect(r.equipment.armor).toBeUndefined();
  expect(r.items.some((i) => i.id === "a")).toBe(true);
  r.elements = ["ice", "water"];
  r.cards[15] = 1;
  r.cards[24] = 1;
  r.choices = [19, 1, 2];
  choose(r, 19);
  expect(r.elements).toHaveLength(3);
  expect(r.phase).toBe("FUSION_CHOICE");
  const saved = validate({ version: 1, revision: 0, current: r, entry: r });
  expect(saved.current.fusionChoices).toEqual(["steam", "frostfire"]);
  expect(chooseFusion(r, "frostfire")).toBe(true);
  expect(r.fusion).toBe("frostfire");
  expect(
    eligible(
      r,
      cards.find((c) => c.id === 28)!,
    ),
  ).toBe(false);
});
it("81 承傷加倍／一般傷加100%；82每次主動扣8%留1副本不扣", () => {
  const r = setup([81, 82, 71]);
  expect(r.stats.maxHP).toBe(90);
  expect(r.stats.global).toBe(1);
  r.player.hp = 45;
  castSkill(r, idleCommand(r));
  expect(r.player.hp).toBeCloseTo(41.4);
  r.time = 0.8;
  updateSkills(r, idleCommand(r));
  expect(r.player.hp).toBeCloseTo(41.4);
  r.player.hp = 1;
  r.time = 4;
  castSkill(r, idleCommand(r));
  expect(r.player.hp).toBe(1);
});
it("84 閃避封印与生命基準加80%／甲60；85先全卸且同時至多一件", () => {
  const r = setup([84]);
  expect(r.stats.maxHP).toBe(162);
  expect(r.stats.armor).toBe(65);
  expect(dodge(r, idleCommand(r))).toBe(false);
  expect(r.player.dashReady).toBe(0);
  const s = setup([]);
  s.phase = "UPGRADE_CHOICE";
  s.pendingLevels = 1;
  s.choices = [85, 1, 2];
  for (const slot of ["armor", "ring", "amulet"] as const)
    s.equipment[slot] = {
      id: slot,
      slot,
      rarity: "藍",
      x: 0,
      y: 0,
      affixes: [],
    };
  choose(s, 85);
  expect(s.phase).toBe("POST_CLEAR");
  expect(Object.keys(s.equipment)).toHaveLength(0);
  expect(s.bag).toHaveLength(3);
  expect(equip(s, "ring")).toBe(true);
  expect(s.equipment.ring!.id).toBe("ring");
  expect(s.bag).toHaveLength(2);
  expect(equip(s, "armor")).toBe(false);
  expect(
    eligible(
      s,
      cards.find((c) => c.id === 85)!,
    ),
  ).toBe(false);
  expect(() =>
    validate({ version: 1, revision: 0, current: s, entry: s }),
  ).not.toThrow();
});
it("全部84現役卡合格矩陣：前置、職業、一次／上限、紅卡失效；技能十级傷害边际不加機關數", () => {
  expect(cards).toHaveLength(84);
  for (const c of cards) {
    const r = newRun(c.classId ?? "mage", (c.id * 2654435761) >>> 0);
    expect(grantTestCard(r, c.id)).toBe(true);
    expect(r.cards[c.id]).toBe(1);
    if (c.id >= 70 || [15, 19, 24, 28].includes(c.id))
      expect(eligible(r, c)).toBe(false);
    else if (c.id > 14) {
      r.cards[c.id] = 5;
      expect(eligible(r, c)).toBe(false);
      r.loop = 2;
      expect(eligible(r, c)).toBe(true);
    }
  }
  expect(skillFactor(10, 0.2)).toBeCloseTo(2.3);
});

it("71 快冷卻的每次術式都排隊，快照保留獨立瞄準／電容與增傷、各執行一次", () => {
  const r = setup([71, 37, 82]);
  r.elements = ["water", "lightning"];
  r.fusion = "storm";
  r.stats.skillCD = 0.65;
  r.player.capacitor = 5;
  castSkill(r, { ...idleCommand(r), pointerWorld: { x: 300, y: 200 } });
  const hp = r.player.hp;
  r.time = 0.65;
  r.player.capacitor = 2;
  castSkill(r, { ...idleCommand(r), pointerWorld: { x: 600, y: 400 } });
  expect(r.player.pendingEchoes).toHaveLength(2);
  expect(r.player.pendingEchoes!.map((e) => e.capacitor)).toEqual([5, 2]);
  const saved = validate({ version: 1, revision: 0, current: r, entry: r });
  expect(saved.current.player.pendingEchoes).toHaveLength(2);
  const beforeFirst = r.enemies[0].hp;
  r.time = 0.8;
  updateSkills(r, idleCommand(r));
  expect(beforeFirst - r.enemies[0].hp).toBeCloseTo(45);
  expect(r.player.pendingEchoes).toHaveLength(1);
  expect(r.areas.filter((a) => a.context?.ancestry.includes(171))).toHaveLength(
    1,
  );
  const beforeSecond = r.enemies[0].hp;
  r.time = 1.45;
  updateSkills(r, idleCommand(r));
  expect(beforeSecond - r.enemies[0].hp).toBeCloseTo(18);
  expect(r.player.pendingEchoes).toHaveLength(0);
  expect(r.areas.filter((a) => a.context?.ancestry.includes(171))).toHaveLength(
    2,
  );
  expect(r.player.hp).toBeCloseTo(hp * 0.92);
  updateSkills(r, idleCommand(r));
  expect(r.areas.filter((a) => a.context?.ancestry.includes(171))).toHaveLength(
    2,
  );
});
