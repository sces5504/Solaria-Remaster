import type { Command, Run } from "../game/core/types";
/** Hit areas are measured on screen, then resolved to a specific world object. */
export function touchTarget(
  r: Run,
  x: number,
  y: number,
  scale: number,
): Command["interactTarget"] {
  const radius = Math.max(24, 22 / Math.max(0.01, scale));
  const item = r.items
    .filter((i) => Math.abs(i.x - x) <= radius && Math.abs(i.y - y) <= radius)
    .sort(
      (a, b) =>
        Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y) ||
        a.id.localeCompare(b.id),
    )[0];
  const door =
    r.phase === "POST_CLEAR" &&
    Math.abs(x - 928) <= Math.max(30, 22 / scale) &&
    Math.abs(y - 320) <= Math.max(48, 36 / scale);
  if (
    door &&
    (!item || Math.hypot(x - 928, y - 320) < Math.hypot(x - item.x, y - item.y))
  )
    return { kind: "door" };
  if (item) return { kind: "item", id: item.id };
  return undefined;
}
