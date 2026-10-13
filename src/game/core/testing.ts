import type { Run } from "./types";
import { selectSegment } from "../data/journey";
import { populate } from "../data/world";
import { createHazards } from "../systems/hazards";
import { equipmentCatalog, type EquipmentAbility } from "../data/equipment";
import { slotRestriction } from "../systems/ability-policies";
import { derive, itemFor, equip } from "../systems/progression";

/** Jump within the existing seeded journey. Never grants a clear or a new loop. */
export function jumpToRoom(r: Run, room: number) {
  if (
    !Number.isInteger(room) ||
    room < 1 ||
    room > 31 ||
    r.player.hp <= 0 ||
    [
      "DEAD",
      "RUN_END",
      "UPGRADE_CHOICE",
      "FUSION_CHOICE",
      "EQUIPMENT_SLOT_CHOICE",
    ].includes(r.phase)
  )
    return false;
  r.testing = true;
  r.room = room;
  r.event = undefined;
  r.solaris = undefined;
  r.choices = [];
  r.pendingLevels = 0;
  r.player.shields = [];
  r.player.invulnerable = 0;
  r.player.controlUntil =
    r.player.iceUntil =
    r.player.wetUntil =
    r.player.burnUntil =
      0;
  r.player.skillReady = r.player.dashReady = r.time;
  r.phase = "ROOM_INTRO";
  selectSegment(r);
  r.stats = derive(r);
  populate(r);
  createHazards(r);
  return true;
}

/** Uses the real affix rolls; restricted slots stay in the bag instead of bypassing red costs. */
export function grantTestEquipment(r: Run, ability: string) {
  if (
    !Object.hasOwn(equipmentCatalog, ability) ||
    ["DEAD", "RUN_END"].includes(r.phase)
  )
    return false;
  const item = itemFor(r, r.nextId++, 1, ability as EquipmentAbility)!;
  r.testing = true;
  if (r.bag.length >= 12) {
    r.items.push({ ...item, x: r.player.x, y: r.player.y });
    return true;
  }
  r.bag.push(item);
  if (!slotRestriction(r, item.slot)) {
    const phase = r.phase;
    try {
      r.phase = "POST_CLEAR";
      equip(r, item.id);
    } finally {
      r.phase = phase;
    }
  }
  return true;
}
