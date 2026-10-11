import { test, expect } from "vitest";
import { writeFileSync, mkdirSync } from "node:fs";
import { newRun, startRoom, idleCommand, step } from "../../src/game/core/run";
import {
  choose,
  chooseFusion,
  chooseEquipmentSlot,
  equip,
} from "../../src/game/systems/progression";
import { cards } from "../../src/game/data/cards";
import { legal, lineBlocked, coneHit } from "../../src/game/systems/geometry";
import { distance, segmentDistance } from "../../src/game/core/primitives";
import type { Run, ClassId } from "../../src/game/core/types";

// This bot only issues normal commands and selects offered choices. Its death
// is evidence about this bot, never an assertion about a human player's skill.
import { command, pick, waypoint } from "./bot";
test("三職普通與偏攻構築命令式探測，保存實際死亡或完成，不授卡不改敵血", () => {
  const results = [];
  const roles = (process.env.SOLARIA_PROBE_ROLE?.split(",") ?? [
    "sword",
    "bow",
    "mage",
  ]) as ClassId[];
  for (const classId of roles)
    for (const strong of [false, true]) {
      const r = newRun(classId, 0x501a);
      const rooms = [];
      let roomStart = 0,
        oldRoom = 1,
        hurt = 0,
        healed = 0;
      const seconds = Number(process.env.SOLARIA_PROBE_SECONDS ?? 3600);
      for (
        let tick = 0;
        tick < seconds * 60 && r.phase !== "DEAD" && r.phase !== "RUN_END";
        tick++
      ) {
        const hp = r.player.hp;
        if (r.phase === "ROOM_INTRO") {
          startRoom(r);
          roomStart = r.time;
          oldRoom = r.room;
        } else if (r.phase === "UPGRADE_CHOICE") choose(r, pick(r, strong));
        else if (r.phase === "FUSION_CHOICE")
          chooseFusion(r, r.fusionChoices![0]);
        else if (r.phase === "EQUIPMENT_SLOT_CHOICE")
          chooseEquipmentSlot(r, "armor");
        else if (r.phase === "POST_CLEAR") {
          if (!rooms.some((x) => x.room === oldRoom))
            rooms.push({
              room: oldRoom,
              seconds: r.time - roomStart,
              level: r.level,
              hp: r.player.hp,
            });
          for (const item of [...r.bag]) {
            const old = r.equipment[item.slot];
            if (
              !old ||
              ["藍", "紫", "黃", "橘", "紅"].indexOf(item.rarity) >
                ["藍", "紫", "黃", "橘", "紅"].indexOf(old.rarity)
            )
              equip(r, item.id);
          }
          const c = idleCommand(r);
          const target = r.items.find(
            (i) => r.bag.length < 12 && i.x > 44 && i.x < 980,
          ) ?? {
            x: 920,
            y: 320,
          };
          const goal = waypoint(r, target, true) ?? target;
          c.move = {
            x:
              Math.abs(goal.x - r.player.x) > 3
                ? Math.sign(goal.x - r.player.x)
                : 0,
            y:
              Math.abs(goal.y - r.player.y) > 3
                ? Math.sign(goal.y - r.player.y)
                : 0,
          };
          c.interact = true;
          step(r, c);
        } else step(r, command(r));
        if (r.player.hp < hp) hurt += hp - r.player.hp;
        else healed += r.player.hp - hp;
      }
      expect(Number.isFinite(r.time)).toBe(true);
      expect(r.player.hp).toBeGreaterThanOrEqual(0);
      results.push({
        classId,
        build: strong ? "偏攻抽選" : "一般抽選",
        seed: r.seed,
        phase: r.phase,
        room: r.room,
        seconds: r.time,
        level: r.level,
        kills: r.kills,
        player: { x: r.player.x, y: r.player.y, hp: r.player.hp },
        items: r.items,
        obstacles: r.obstacles,
        remainingEnemies: r.enemies.map((e) => ({
          id: e.id,
          hp: e.hp,
          maxHP: e.maxHP,
          x: e.x,
          y: e.y,
        })),
        hurt,
        healed,
        cards: Object.entries(r.cards).map(([id, count]) => ({
          id: Number(id),
          name: cards.find((c) => c.id === Number(id))?.name,
          count,
        })),
        rooms,
      });
    }
  mkdirSync("/tmp/solaria-balance", { recursive: true });
  writeFileSync(
    process.env.SOLARIA_PROBE_REPORT ??
      "/tmp/solaria-balance/command-probe.json",
    JSON.stringify(
      {
        kind: "AUTOMATED_COMMAND_PROBE",
        humanBalance: "NOT_RUN",
        generated: new Date().toISOString(),
        results,
      },
      null,
      2,
    ),
  );
});
