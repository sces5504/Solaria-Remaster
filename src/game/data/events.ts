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
      [9, 9, 10],
      [10, 10, 11],
      [9, 10, 11],
    ],
  },
  bloodmoon: {
    name: "血月",
    theme: "crimson",
    reward: "redMoon",
    waves: [
      [21, 21, 22],
      [22, 23, 21],
      [21, 22, 23],
    ],
  },
  halloween: {
    name: "萬聖夜",
    theme: "corruption",
    reward: "ghostArmor",
    boss: 21,
    waves: [
      [18, 18, 19],
      [19, 20, 18],
      [18, 19, 20],
    ],
  },
  alien: {
    name: "外星入侵",
    theme: "stars",
    reward: "gravity",
    waves: [
      [25, 25, 26],
      [26, 29, 25],
      [25, 26, 29],
    ],
  },
  meteor: {
    name: "流星雨",
    theme: "stars",
    reward: "fallingStar",
    waves: [
      [24, 24, 25],
      [25, 26, 24],
      [24, 25, 26],
    ],
  },
  army: {
    name: "哥布林軍隊",
    theme: "meadow",
    reward: "legion",
    waves: [
      [1, 3, 1],
      [4, 4, 3],
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
