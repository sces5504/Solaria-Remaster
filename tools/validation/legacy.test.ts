import { it, expect } from "vitest";
import { writeFileSync } from "node:fs";
import {
  newRun,
  startRoom,
  idleCommand,
  step,
} from "../../../Solaria-Remaster-legacy-verification/src/game/core/run";
import {
  grantTestCard,
  derive,
} from "../../../Solaria-Remaster-legacy-verification/src/game/systems/progression";
import { validate as oldValidate } from "../../../Solaria-Remaster-legacy-verification/src/game/persistence/checkpoint";
import { validate } from "../../src/game/persistence/checkpoint";
it("53691bf原始核心產生的schema1快照可由v1遷移，不依賴v1新Run模擬舊資料", () => {
  const r = newRun("bow", 5504);
  grantTestCard(r, 15);
  grantTestCard(r, 50);
  r.stats = derive(r);
  const entry = structuredClone(r);
  startRoom(r);
  for (let tick = 0; tick < 120 && r.phase === "COMBAT"; tick++)
    step(r, {
      ...idleCommand(r),
      attack: true,
      pointerWorld: { x: 740, y: 320 },
    });
  const saved = {
    version: 1,
    revision: 7,
    current: r,
    entry,
    discovered: [15, 50],
  };
  expect(oldValidate(saved).entry.cards[50]).toBe(1);
  const imported = validate(structuredClone(saved));
  expect(imported.entry.classId).toBe("bow");
  expect(imported.entry.cards[50]).toBe(1);
  expect(imported.entry.elements).toEqual(entry.elements);
  writeFileSync("/tmp/solaria-53691bf-save.json", JSON.stringify(saved));
  writeFileSync(
    "/tmp/solaria-53691bf-expected.json",
    JSON.stringify({
      source: "53691bf925df3c39a5f20613ff7acdba900b1bb7",
      seed: entry.seed,
      cards: entry.cards,
      elements: entry.elements,
      hp: entry.player.hp,
      room: entry.room,
      phase: entry.phase,
      testing: true,
    }),
  );
});
