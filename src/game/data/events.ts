import type { BiomeId } from "./biomes";
import { random, seedFor } from "../core/primitives";
export type EventId =
  "christmas" | "bloodmoon" | "halloween" | "alien" | "meteor" | "army";
export interface EventDefinition {
  name: string;
  theme: BiomeId;
  reward: string;
  boss?: number;
  waves: readonly (readonly number[])[];
}
export const eventDefinitions: Record<EventId, EventDefinition> = {
  christmas: {
    name: "邪惡聖誕",
    theme: "icefield",
    reward: "frostBell",
    boss: 20,
    waves: [
      [31, 30, 30],
      [30, 31, 30],
      [31, 30, 31],
    ],
  },
  bloodmoon: {
    name: "血月",
    theme: "crimson",
    reward: "redMoon",
    waves: [
      [32, 32, 33],
      [33, 32, 33],
      [32, 33, 33],
    ],
  },
  halloween: {
    name: "萬聖夜",
    theme: "corruption",
    reward: "ghostArmor",
    boss: 21,
    waves: [
      [34, 35, 34],
      [35, 34, 35],
      [34, 35, 35],
    ],
  },
  alien: {
    name: "外星入侵",
    theme: "stars",
    reward: "gravity",
    waves: [
      [36, 36, 36],
      [37, 36, 37],
      [38, 36, 38],
    ],
  },
  meteor: {
    name: "流星雨",
    theme: "stars",
    reward: "fallingStar",
    waves: [
      [39, 39, 40],
      [40, 39, 40],
      [39, 40, 40],
    ],
  },
  army: {
    name: "哥布林軍隊",
    theme: "meadow",
    reward: "legion",
    waves: [
      [3, 3, 3],
      [4, 4, 4],
      [5, 5, 3],
    ],
  },
};
export const eventChance = (eligibleRooms: number) =>
  [0, 1, 1, 5, 5, 10, 10, 15, 15, 20][Math.min(9, Math.max(0, eligibleRooms))] /
  100;
// Event RNG is independent of the combat/layout streams. Call once per room entry.
export function rollEvent(
  seed: number,
  loop: number,
  room: number,
  eligibleRooms: number,
  seen: readonly EventId[],
): EventId | null {
  const available = (Object.keys(eventDefinitions) as EventId[]).filter(
    (id) => !seen.includes(id),
  );
  if (!available.length) return null;
  const state = { rng: seedFor(seed, 16000 + loop * 37 + room) };
  for (let i = 0; i < 3; i++) random(state);
  if (random(state) >= eventChance(eligibleRooms)) return null;
  return available[Math.floor(random(state) * available.length)];
}
