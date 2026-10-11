import type { Run } from "../core/types";
import type { BiomeId } from "./biomes";
import { random, seedFor } from "../core/primitives";

export interface JourneySegment {
  biome: BiomeId;
  templates: number[];
  boss: number;
}
const pairs: Record<BiomeId, number> = {
  meadow: 1,
  desert: 3,
  icefield: 5,
  volcano: 7,
  jungle: 9,
  corruption: 11,
  crimson: 13,
  stars: 15,
  castle: 17,
};
export function journeyFor(seed: number, loop = 1): JourneySegment[] {
  const state = { rng: seedFor(seed, 7000 + loop) };
  // Mix correlated numeric seeds before sampling route branches.
  for (let i = 0; i < 4; i++) random(state);
  const route: BiomeId[] = [
    "meadow",
    random(state) < 0.5 ? "desert" : "icefield",
    random(state) < 0.5 ? "volcano" : "jungle",
    random(state) < 0.5 ? "corruption" : "crimson",
    "stars",
    "castle",
  ];
  return route.map((biome) => {
    const rng = { rng: seedFor(seed, 7100 + loop * 19 + pairs[biome]) };
    const templates = [0, 1, 2, 3, 4, 5];
    for (let i = 5; i > 0; i--) {
      const j = Math.floor(random(rng) * (i + 1));
      [templates[i], templates[j]] = [templates[j], templates[i]];
    }
    return {
      biome,
      templates: templates.slice(0, 4),
      boss: pairs[biome] + Math.floor(random(rng) * 2),
    };
  });
}
export const isBossRoom = (r: Run) => r.room === 31 || r.room % 5 === 0;
export function restoreJourney(r: Run) {
  if (r.journey) return;
  r.loop ??= 1;
  r.journey = journeyFor(r.seed, r.loop);
  // A migrated meadow checkpoint keeps its accepted layout and selected boss.
  r.journey[0] = { biome: "meadow", templates: [...r.templates], boss: r.boss };
  r.biome ??= "meadow";
}
export function selectSegment(r: Run) {
  restoreJourney(r);
  const segment = r.journey![Math.min(5, Math.floor((r.room - 1) / 5))];
  r.biome = segment.biome;
  r.templates = [...segment.templates];
  r.boss = segment.boss;
}
