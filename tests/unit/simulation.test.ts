import { describe, it, expect } from "vitest";
import { newRun, startRoom, step, idleCommand } from "../../src/game/core/run";
import { FixedClock, clone, DT } from "../../src/game/core/primitives";
import {
  castSkill,
  basic,
  dodge,
  updateSkills,
} from "../../src/game/systems/skills";
import { actor, makeObstacles, populate } from "../../src/game/data/world";
import {
  hit,
  context,
  hurt,
  control,
  shield,
  damageCover,
  updateProjectiles,
} from "../../src/game/systems/combat";
import {
  drawChoices,
  choose,
  derive,
  equip,
  pickup,
  itemFor,
} from "../../src/game/systems/progression";
import { cards, eligible, skillFactor } from "../../src/game/data/cards";
import { legal, lineBlocked } from "../../src/game/systems/geometry";
import { validate } from "../../src/game/persistence/checkpoint";
function arena(cls: "sword" | "bow" | "mage" = "mage") {
  const r = newRun(cls, 42);
  startRoom(r);
  r.obstacles = [];
  r.enemies = [actor(90, 1, 300, 320)];
  r.stats.crit = 0;
  return r;
}
describe("C01–09 時鐘、職業與來源", () => {
  it("60Hz 暫停不累積補射，恢復只一 tick", () => {
    let ticks = 0;
    const clock = new FixedClock();
    clock.advance(1, true, () => ticks++);
    expect(ticks).toBe(0);
    clock.advance(DT, false, () => ticks++);
    expect(ticks).toBe(1);
    const r = arena(),
      before = clone(r);
    step(r, idleCommand(r), true);
    expect(r).toEqual(before);
  });
  it("格擋早擋 .9；成功 .3 反擊一次；晚擋延長至 .75", () => {
    const r = arena("sword"),
      cmd = idleCommand(r);
    castSkill(r, cmd);
    expect(r.player.skillReady).toBe(5);
    expect(hurt(r, 30)).toBe(false);
    expect(r.player.counterAt).toBe(0.3);
    r.time = 0.31;
    updateSkills(r, cmd);
    const hp = r.enemies[0].hp;
    updateSkills(r, cmd);
    expect(r.enemies[0].hp).toBe(hp);
    r.time = 8;
    castSkill(r, cmd);
    r.time = 8.85;
    hurt(r, 30);
    expect(r.player.blockUntil).toBeCloseTo(9.6);
  });
  it("快射每箭獨立計數，副箭不計；右場只一次", () => {
    const r = arena("bow");
    r.cards = { 50: 5, 52: 5, 17: 1 };
    r.elements = ["ice"];
    castSkill(r, idleCommand(r));
    for (let i = 0; i < 61; i++) {
      r.time = i / 60;
      updateSkills(r, idleCommand(r));
    }
    expect(r.player.casts).toBe(10);
    expect(
      r.projectiles.filter((p) => p.context?.sourceAbilityId === 50),
    ).toHaveLength(50);
    expect(r.areas.filter((a) => a.ability === 17)).toHaveLength(1);
  });
  it("格擋與行星爆不增加普攻施放", () => {
    const r = arena();
    castSkill(r, idleCommand(r));
    expect(r.player.casts).toBe(0);
    expect(r.areas[0].starts).toBe(0.3);
  });
  it("先甲再盾、溢傷、盾也觸發 .5 秒保護", () => {
    const r = arena("sword");
    shield(r, 10, 3);
    hurt(r, 25);
    expect(r.player.hp).toBe(140);
    expect(r.player.invulnerable).toBe(0.5);
    hurt(r, 999);
    expect(r.player.hp).toBe(140);
  });
  it("副鏈折扣只一次；追加不暴擊；根原始可暴擊", () => {
    const r = arena(),
      e = r.enemies[0];
    r.stats.crit = 1;
    expect(hit(r, e, 100, context(r, 50, "basic", [], true, 0.2))).toBe(30);
    e.hp = e.maxHP;
    expect(
      hit(
        r,
        e,
        100,
        context(r, 29, "additional", [], false, 0.2, false, "none"),
      ),
    ).toBe(20);
  });
  it("同幀最後怪與玩家零 HP 先清算救回且只一次", () => {
    const r = arena();
    r.reserves = [];
    r.player.hp = 0;
    r.enemies[0].hp = 0;
    step(r, idleCommand(r));
    expect(r.phase).toBe("SETTLEMENT");
    expect(r.player.hp).toBe(9);
    const xp = r.xp;
    step(r, idleCommand(r));
    expect(r.xp).toBe(xp);
    expect(r.player.hp).toBe(9);
  });
  it("dash 不無敵、能跨湖、薄牆擋且不足落點耗 CD", () => {
    const r = arena(),
      cmd = idleCommand(r);
    r.player.x = 100;
    r.player.y = 320;
    r.obstacles = [
      {
        id: 1,
        x: 145,
        y: 280,
        w: 40,
        h: 80,
        kind: "lake",
        durability: 99,
        maxDurability: 99,
        waves: [],
      },
    ];
    dodge(r, cmd);
    expect(r.player.dashUntil).toBe(0.18);
    hurt(r, 20);
    expect(r.player.hp).toBeLessThan(90);
    r.player.dashReady = 0;
    r.obstacles[0].kind = "tree";
    dodge(r, cmd);
    expect(r.player.dashReady).toBe(2);
  });
});
describe("C10–18 元素、卡池、地圖与 Boss", () => {
  it("冰霜 15 累積、Boss 第二半減第三免疫", () => {
    const r = arena(),
      e = actor(9, 6, 300, 320);
    r.enemies = [e];
    for (let i = 0; i < 7; i++)
      hit(r, e, 1, context(r, 15, "basic", ["ice"], true));
    expect(e.controlUntil).toBe(0.75);
    r.time = 1;
    control(r, e, 0.75);
    expect(e.controlUntil).toBe(1.375);
    r.time = 2;
    control(r, e, 0.75);
    expect(e.ccImmune).toBe(4);
  });
  it("燃燒不疊傷；水對冰電易傷只一次", () => {
    const r = arena(),
      e = r.enemies[0];
    hit(r, e, 0, context(r, 19, "basic", ["fire"], true, 0.2));
    hit(r, e, 0, context(r, 19, "basic", ["fire"], true, 1));
    expect(e.burn).toHaveLength(2);
    e.wetUntil = 3;
    expect(
      hit(
        r,
        e,
        20,
        context(r, 38, "skill", ["ice", "fire"], false, 1, false, "none"),
      ),
    ).toBe(25);
  });
  it("兩元素融合不騰 slot 且初階留池", () => {
    const r = arena();
    r.phase = "UPGRADE_CHOICE";
    r.pendingLevels = 2;
    r.choices = [19, 24, 1];
    choose(r, 19);
    r.choices = [24, 1, 2];
    choose(r, 24);
    expect(r.fusion).toBe("steam");
    expect(eligible(r, cards[14])).toBe(false);
    expect(eligible(r, cards[19])).toBe(true);
    expect(eligible(r, cards[31])).toBe(true);
  });
  it("三選一先色後池、不同卡、職業與資格，持續卡不重抽", () => {
    for (let seed = 1; seed <= 400; seed++) {
      const r = newRun("sword", seed);
      drawChoices(r);
      expect(new Set(r.choices).size).toBe(3);
      expect(
        r.choices.every((id) =>
          eligible(
            r,
            cards.find((c) => c.id === id)!,
          ),
        ),
      ).toBe(true);
      expect(r.choices.every((id) => id < 48 || id >= 60)).toBe(true);
      const frozen = clone(r);
      expect(
        validate({ version: 1, revision: 0, current: frozen, entry: frozen })
          .current.choices,
      ).toEqual(r.choices);
    }
  });
  it("第六級起採邊際加算", () => {
    expect(skillFactor(5)).toBeCloseTo(1.8);
    expect(skillFactor(6)).toBeCloseTo(1.9);
    expect(skillFactor(11)).toBeCloseTo(2.3666667);
  });
  it("六模板左到右與全部合法區域連通", () => {
    for (let i = 0; i < 6; i++) {
      const r = arena();
      r.obstacles = makeObstacles(i);
      const q = [{ x: 112, y: 320 }],
        seen = new Set<string>();
      for (let j = 0; j < q.length && j < 2000; j++) {
        const p = q[j];
        for (const delta of [
          [32, 0],
          [-32, 0],
          [0, 32],
          [0, -32],
        ]) {
          const n = { x: p.x + delta[0], y: p.y + delta[1] },
            key = `${n.x},${n.y}`;
          if (
            !seen.has(key) &&
            legal(r, n, 14) &&
            !lineBlocked(r, p, n, true)
          ) {
            seen.add(key);
            q.push(n);
          }
        }
      }
      expect([...seen].some((k) => Number(k.split(",")[0]) >= 900)).toBe(true);
    }
  });
  it("Boss 50% 转场无溢伤，旧弹不删除", () => {
    const r = arena(),
      e = actor(9, 6, 600, 320);
    r.enemies = [e];
    basic(r, idleCommand(r));
    const n = r.projectiles.length;
    hit(r, e, 10000, context(r, 1));
    expect(e.hp).toBe(e.maxHP / 2);
    expect(e.phase).toBe(2);
    expect(e.transition).toBe(2);
    expect(r.projectiles).toHaveLength(n);
    hit(r, e, 10000, context(r, 1));
    expect(e.hp).toBe(e.maxHP / 2);
  });
  it("掩體Boss四擊、同波不重傷、兩秒保護與碎裂碰撞同步", () => {
    const r = arena();
    r.obstacles = makeObstacles(0, 1);
    const o = r.obstacles[0],
      p = { x: o.x, y: o.y };
    r.player.x = p.x;
    r.player.y = p.y;
    damageCover(r, p, 30, 7, "boss");
    damageCover(r, p, 30, 7, "boss");
    damageCover(r, p, 30, 8, "boss");
    expect(o.durability).toBe(15);
    r.time = 2;
    damageCover(r, p, 30, 7, "boss");
    expect(o.durability).toBe(15);
    for (let i = 0; i < 3; i++) {
      r.time = 2 + i * 2;
      damageCover(r, p, 30, 10 + i, "boss");
    }
    expect(o.durability).toBe(0);
    expect(legal(r, { x: o.x + 16, y: o.y + 16 })).toBe(true);
  });
  it("700 速不会穿过薄墙；湖不阻弹", () => {
    const r = arena("bow");
    r.player.x = 100;
    r.obstacles = [
      {
        id: 1,
        x: 106,
        y: 280,
        w: 2,
        h: 80,
        kind: "tree",
        durability: 5,
        maxDurability: 5,
        waves: [],
      },
    ];
    basic(r, idleCommand(r));
    updateProjectiles(r, DT);
    expect(r.projectiles).toHaveLength(0);
  });
});
describe("C22–26 清算与保存", () => {
  it("战斗可拾取、仅清关可穿戴、背包满物品保留与同 ID 不复制", () => {
    const r = arena();
    const item = itemFor(r, 90, 0)!;
    item.x = r.player.x;
    item.y = r.player.y;
    r.items = [item];
    expect(pickup(r)).toBe(true);
    expect(equip(r, item.id)).toBe(false);
    r.phase = "POST_CLEAR";
    expect(equip(r, item.id)).toBe(true);
    expect(r.bag).toHaveLength(0);
    expect(r.items).toHaveLength(0);
    expect(r.equipment[item.slot]?.id).toBe(item.id);
    r.bag = Array.from({ length: 12 }, (_, i) => ({ ...item, id: String(i) }));
    r.items = [{ ...item, id: "floor" }];
    expect(pickup(r)).toBe(false);
    expect(r.items).toHaveLength(1);
  });
  it("seed 固定装备，不随击杀顺序；卡组持久化与损坏检测", () => {
    const a = arena(),
      b = arena();
    expect(itemFor(a, 90, 0)).toEqual(itemFor(b, 90, 0));
    a.phase = "UPGRADE_CHOICE";
    a.pendingLevels = 1;
    drawChoices(a);
    const saved = { version: 1 as const, revision: 4, current: a, entry: b };
    expect(validate(saved).current.choices).toEqual(a.choices);
    a.items = [{ ...itemFor(a, 90, 0)! }];
    a.bag = clone(a.items);
    expect(() => validate(saved)).toThrow("重複");
  });
  it("确定性命令 trace 与普通战斗 600 ticks", () => {
    const a = arena(),
      b = clone(a);
    const cmd = { ...idleCommand(a), attack: true };
    for (let i = 0; i < 600; i++) {
      step(a, cmd);
      step(b, cmd);
    }
    expect(a).toEqual(b);
    expect(a.tick).toBeGreaterThan(0);
  });
});
