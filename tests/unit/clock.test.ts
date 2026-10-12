import { it, expect } from "vitest";
import { FixedClock, DT } from "../../src/game/core/primitives";
it("暂停清空累积，恢复不追赶历史时间", () => {
  const clock = new FixedClock();
  let ticks = 0;
  clock.advance(DT / 2, false, () => ticks++);
  clock.advance(30, true, () => ticks++);
  clock.advance(DT, false, () => ticks++);
  expect(ticks).toBe(1);
});
