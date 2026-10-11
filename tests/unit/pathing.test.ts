import { it, expect } from "vitest";
import { newRun, startRoom, step, idleCommand } from "../../src/game/core/run";
it("50 seeded ordinary rooms progress without AI pathing stalls", () => {
  for (let seed = 1; seed < 51; seed++) {
    const r = newRun("mage", seed);
    startRoom(r);
    const cmd = idleCommand(r);
    for (let i = 0; i < 240; i++) {
      step(r, cmd);
    }
    expect(r.tick).toBe(240);
  }
}, 20000);
