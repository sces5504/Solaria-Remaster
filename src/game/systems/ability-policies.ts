import type { ClassId, Run, Slot } from "../core/types";
export type RestrictedRun = Run & { selectedEquipmentSlot?: Slot };
export function maximumRecovery(r: Run) {
  return r.stats.maxHP * (r.cards[79] ? 0.4 : 1);
}
export function recoverHP(r: Run, amount: number) {
  // A recovery ceiling never lowers existing health when it is already above the ceiling.
  const gain = Math.max(0, Math.min(amount, maximumRecovery(r) - r.player.hp));
  r.player.hp += gain;
  return gain;
}
export function actionRestriction(r: Run, action: "basic" | "skill" | "dodge") {
  if (r.cards[78] && (action === "basic" || action === "dodge"))
    return "偏執狂封印了這個動作";
  if (r.cards[83] && action === "skill") return "寂靜之誓封印了職技";
  return "";
}
export function slotRestriction(r: RestrictedRun, slot: Slot) {
  if (r.cards[80] && slot === "armor") return "元素使不能穿戴裝甲";
  if (r.cards[85] && r.selectedEquipmentSlot !== slot)
    return r.selectedEquipmentSlot
      ? "命運賭徒只保留選定裝備欄"
      : "先選定命運賭徒的裝備欄";
  return "";
}
const rightOnly = new Set([
  17, 18, 21, 22, 26, 30, 31, 33, 34, 36, 37, 39, 40, 44, 45, 46, 52, 53, 58,
  59, 65, 67, 71, 77, 78, 82,
]);
const leftOnly: Record<ClassId, Set<number>> = {
  sword: new Set([41, 43]),
  bow: new Set(), // Rapid shots retain their real basic-hit/cast proxies and learned bow upgrades.
  mage: new Set([54, 55, 56, 57]),
};
export function cardRestriction(r: Run, id: number) {
  if (r.cards[83] && rightOnly.has(id)) return "職技已封印，這項升級暫時失效";
  if (
    r.cards[78] &&
    (leftOnly[r.classId].has(id) ||
      id === 47 ||
      id === 62 ||
      id === 72 ||
      id === 84 ||
      id === 70)
  )
    return "觸發動作已封印，這項升級暫時失效";
  if ((id === 78 && r.cards[83]) || (id === 83 && r.cards[78]))
    return "偏執狂與寂靜之誓互斥";
  return "";
}
export function applyEquipmentRestrictions(r: RestrictedRun) {
  for (const slot of ["armor", "ring", "amulet"] as Slot[]) {
    const item = r.equipment[slot];
    if (!item || !slotRestriction(r, slot)) continue;
    delete r.equipment[slot];
    if (r.bag.length < 12) r.bag.push(item);
    else r.items.push({ ...item, x: r.player.x, y: r.player.y });
  }
}
