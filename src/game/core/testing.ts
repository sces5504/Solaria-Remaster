import type { Run } from "./types";
import { selectSegment } from "../data/journey";
import { populate } from "../data/world";
import { createHazards } from "../systems/hazards";
import { derive } from "../systems/progression";

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
