import type { Element } from "../game/core/types";

export type AbilityPresentation =
  | "explosion"
  | "electric"
  | "snow"
  | "hail"
  | "fire-ring"
  | "vortex"
  | "storm-vortex"
  | "tidal-pulse"
  | "frostfire"
  | "gravity"
  | "arcane"
  | "meteor"
  | "steam";

// Source identity takes precedence over infused damage elements: an enchanted
// planetary blast remains a blast, while static discharge never becomes one.
const sources: Record<number, AbilityPresentation> = {
  17: "hail",
  18: "snow",
  20: "fire-ring",
  21: "explosion",
  22: "fire-ring",
  23: "explosion",
  26: "vortex",
  30: "electric",
  31: "electric",
  32: "steam",
  33: "steam",
  35: "tidal-pulse",
  36: "storm-vortex",
  37: "tidal-pulse",
  39: "frostfire",
  56: "explosion",
  58: "explosion",
  59: "arcane",
  158: "explosion",
  204: "explosion",
  209: "explosion",
  211: "explosion",
  212: "explosion",
  215: "gravity",
  216: "meteor",
};

export function abilityPresentation(
  source: number | undefined,
  elements: Element[] = [],
  periodic = false,
): AbilityPresentation {
  if (source && sources[source]) return sources[source];
  if (elements.includes("lightning"))
    return elements.includes("water") ? "storm-vortex" : "electric";
  if (elements.includes("ice"))
    return elements.includes("fire") ? "frostfire" : "snow";
  if (elements.includes("water"))
    return elements.includes("fire") ? "steam" : "vortex";
  if (elements.includes("fire")) return periodic ? "fire-ring" : "explosion";
  return periodic ? "arcane" : "explosion";
}
