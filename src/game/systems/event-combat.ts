import type { Actor, Run } from "../core/types";
import { distance } from "../core/primitives";
export function rallyFactor(r: Run, e: Actor, mode: "damage" | "speed") {
  return r.event?.id === "army" &&
    r.enemies.some(
      (flag) => flag.rally && flag.hp > 0 && distance(flag, e) <= 180,
    )
    ? mode === "damage"
      ? 1.15
      : 1.12
    : 1;
}
