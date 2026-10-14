import { expect, it } from "vitest";
import { newRun } from "../../src/game/core/run";
import { bosses } from "../../src/game/data/bosses";
import {
  beginBossAttack,
  executeBossMode,
  placeBoss,
} from "../../src/game/systems/biome-bosses";
import { context, hit, updateAreas } from "../../src/game/systems/combat";

const movementAttacks = Object.values(bosses).flatMap((b) =>
  b.attacks
    .flat()
    .filter(
      (a) =>
        ["teleport", "burrow"].includes(a.pattern) || a.id.includes("leap"),
    )
    .map((a) => ({ boss: b, attack: a })),
);
it.each(movementAttacks)(
  "$attack.id 移動只更新座標，兩段及舊目標快照不覆蓋Boss血量／半徑／狀態",
  ({ boss, attack }) => {
    const r = newRun("mage", 134);
    r.obstacles = [];
    r.player.x = 480;
    r.player.y = 320;
    r.player.hp = 37;
    r.player.radius = 12;
    const e = placeBoss(r, boss.id);
    r.enemies = [e];
    e.phase = 2;
    e.hp = e.maxHP / 2 - 123;
    e.armor = 83;
    const expected = {
      hp: e.hp,
      maxHP: e.maxHP,
      radius: e.radius,
      armor: e.armor,
      phase: e.phase,
    };
    beginBossAttack(r, e, attack);
    const m = r.modes[0];
    // Legacy saves contain full player objects here despite the Vec type.
    m.target = { ...r.player };
    for (let i = 0; i < attack.groups; i++) {
      r.time = m.next;
      executeBossMode(r, m, e);
      expect({
        hp: e.hp,
        maxHP: e.maxHP,
        radius: e.radius,
        armor: e.armor,
        phase: e.phase,
      }).toEqual(expected);
      expect(e.x).toBe(r.player.x);
      expect(e.y).toBe(r.player.y);
    }
    expect(r.player.hp).toBe(37);
  },
);
it.each(Object.values(bosses))(
  "$name 過量傷害不跨階段，轉換期間連擊／百分比／持續傷害均無效",
  (boss) => {
    const r = newRun("sword", 134);
    const e = placeBoss(r, boss.id);
    r.enemies = [e];
    const total = e.maxHP;
    hit(r, e, total * 100, context(r, 1, "basic", [], false, 1, false, "none"));
    expect(e.phase).toBe(2);
    expect(r.enemies.reduce((sum, b) => sum + b.hp, 0)).toBe(total / 2);
    for (const b of r.enemies)
      for (const kind of ["basic", "dot", "percent"] as const)
        expect(
          hit(r, b, total, context(r, 1, kind, [], false, 1, false, "none")),
        ).toBe(0);
    expect(r.enemies.reduce((sum, b) => sum + b.hp, 0)).toBe(total / 2);
  },
);
it.each([10, 13])(
  "Boss %s 落雷延後0.5秒，延後前無傷害、落下仍正常命中",
  (id) => {
    const r = newRun("sword", 134);
    r.obstacles = [];
    const e = placeBoss(r, id);
    r.enemies = [e];
    const a = bosses[id].attacks
      .flat()
      .find((a) => /thunder|storm/.test(a.id))!;
    beginBossAttack(r, e, a);
    expect(r.areas.map((a) => a.starts)).toEqual([1.1, 1.35, 1.6]);
    expect(r.modes[0].starts).toBeCloseTo(1.1);
    r.time = 0.61;
    const hp = r.player.hp;
    updateAreas(r);
    expect(r.player.hp).toBe(hp);
    r.time = 1.1;
    updateAreas(r);
    expect(r.player.hp).toBeLessThan(hp);
  },
);
