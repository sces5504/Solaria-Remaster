import { it, expect } from "vitest";
import { newRun, startRoom, step, idleCommand } from "../../src/game/core/run";
import {
  drawChoices,
  reroll,
  choose,
  derive,
} from "../../src/game/systems/progression";
import {
  hurt,
  context,
  burst,
  area,
  updateAreas,
} from "../../src/game/systems/combat";
import { actor, makeObstacles } from "../../src/game/data/world";
import { cameraFeedback } from "../../src/render/feedback";
import { validate } from "../../src/game/persistence/checkpoint";
import { catalog } from "../../src/ui/view";
import { cardArt } from "../../src/ui/card-art";
import { cards } from "../../src/game/data/cards";
it("每次三選一僅刷新一次，存檔保留使用狀態，下次升級重置", () => {
  const r = newRun("sword", 851);
  r.phase = "UPGRADE_CHOICE";
  r.pendingLevels = 2;
  drawChoices(r);
  const rng = r.cardRng;
  expect(reroll(r)).toBe(true);
  expect(r.cardRng).not.toBe(rng);
  expect(new Set(r.choices).size).toBe(3);
  const saved = validate({
    version: 1,
    revision: 0,
    current: r,
    entry: r,
  }).current;
  const offers = [...saved.choices];
  expect(reroll(saved)).toBe(false);
  expect(saved.choices).toEqual(offers);
  expect(choose(saved, offers[0])).toBe(true);
  expect(saved.rerollUsed).toBe(false);
  expect(reroll(saved)).toBe(true);
  saved.phase = "COMBAT";
  saved.rerollUsed = false;
  expect(reroll(saved)).toBe(false);
});
it("格擋成功只有一次反饋；受傷有輕微震動，純渲染不改世界", () => {
  const r = newRun("sword", 851);
  r.player.blockUntil = 0.6;
  expect(hurt(r, 30)).toBe(false);
  expect(hurt(r, 30)).toBe(false);
  expect(r.visuals.filter((v) => v.kind === "block")).toHaveLength(1);
  expect(r.player.hp).toBe(150);
  r.player.blockUntil = 0;
  hurt(r, 30);
  r.time = 0.025;
  const before = JSON.stringify(r);
  const offset = cameraFeedback(r);
  expect(Math.abs(offset.x)).toBeGreaterThan(0);
  expect(Math.abs(offset.x)).toBeLessThanOrEqual(3.5);
  expect(cameraFeedback(r, false)).toEqual({ x: 0, y: 0 });
  expect(JSON.stringify(r)).toBe(before);
  r.time = 1;
  expect(cameraFeedback(r)).toEqual({ x: 0, y: 0 });
});
it("衝鋒斬有獨立拖尾動畫，普通閃避不冒充斬擊", () => {
  for (const charged of [false, true]) {
    const r = newRun("sword", 852);
    r.obstacles = [];
    r.enemies = [];
    r.reserves = [];
    startRoom(r);
    if (charged) r.cards[47] = 1;
    step(r, { ...idleCommand(r), dodge: true });
    expect(r.visuals.some((v) => v.kind === "charge")).toBe(charged);
  }
});
it("爆炸持續可見並保留元素；預告落雷有雷柱事件", () => {
  const r = newRun("mage", 853);
  burst(r, r.player, 100, 40, context(r, 21, "skill", ["fire"]));
  const fx = r.visuals.find((v) => v.kind === "burst")!;
  expect(fx.until - r.time).toBeGreaterThanOrEqual(0.6);
  expect(fx.elements).toEqual(["fire"]);
  area(r, r.player, 65, 30, 0.6, 0.01, 1, null, { effect: "thunder" });
  r.time = 0.59;
  updateAreas(r);
  expect(r.visuals.some((v) => v.kind === "thunder")).toBe(false);
  r.time = 0.6;
  updateAreas(r);
  expect(r.visuals.some((v) => v.kind === "thunder" && v.enemy)).toBe(true);
});
it("未知圖鑑不洩漏卡名／能力，取得後亮起；所有已實作卡均有能力圖案", () => {
  const hidden = catalog();
  for (const c of cards) expect(hidden).not.toContain(c.name);
  const unlocked = catalog([47]);
  expect(unlocked).toContain("衝鋒斬");
  expect(unlocked).not.toContain("炎龍噴射");
  const arts = cards.map((c) => cardArt(c.id));
  expect(new Set(arts).size).toBe(cards.length);
  expect(
    arts.every((svg) => svg.includes("<path") && !svg.includes("undefined")),
  ).toBe(true);
});
it("房間主題區分林廊／岩岸／遺跡，水域成片不阻塞主通道", () => {
  for (let seed = 1; seed <= 20; seed++) {
    const grove = makeObstacles(2, 0, seed),
      rocks = makeObstacles(1, 0, seed),
      ruins = makeObstacles(5, 0, seed),
      lake = makeObstacles(0, 0, seed);
    expect(
      grove.filter((o) => o.kind === "tree").length / grove.length,
    ).toBeGreaterThan(0.6);
    expect(
      rocks.filter((o) => o.kind === "rock").length / rocks.length,
    ).toBeGreaterThan(0.4);
    expect(ruins.some((o) => o.kind === "pillar")).toBe(true);
    expect(lake.filter((o) => o.kind === "lake")).toHaveLength(2);
    expect(
      lake
        .filter((o) => o.kind === "lake")
        .every((o) => o.w === 64 && o.h === 64),
    ).toBe(true);
  }
});
