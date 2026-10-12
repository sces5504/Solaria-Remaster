import { monsters } from "./biomes";
import { bosses } from "./bosses";
import { eventMonsters, eventBosses } from "./event-content";
// Ordinary content counts stay separate; combat shares a typed lookup.
export const combatMonsters = { ...monsters, ...eventMonsters };
export const combatBosses = { ...bosses, ...eventBosses };
