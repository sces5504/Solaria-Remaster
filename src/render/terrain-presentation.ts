import type { Obstacle } from "../game/core/types";
import type { BiomeId } from "../game/data/biomes";
export function terrainSize(o: Obstacle, biome: BiomeId, adventure = true) {
  if (!adventure)
    return {
      width: o.kind === "tree" ? 56 : 48,
      height: o.kind === "tree" ? 60 : 48,
    };
  if (biome === "meadow")
    return {
      width:
        o.kind === "tree"
          ? Math.max(96, o.w + 48)
          : o.kind === "pillar"
            ? Math.max(68, o.w + 24)
            : Math.max(60, o.w + 18),
      height:
        o.kind === "tree"
          ? 120
          : o.kind === "pillar"
            ? 108
            : Math.max(56, o.h + 16),
    };
  if (o.kind === "tree")
    return {
      width: Math.max(120, o.w + 64),
      height: 164 + Math.max(0, o.w - 64) * 0.5,
    };
  if (o.kind === "pillar")
    return {
      width: Math.max(88, o.w + 24),
      height: biome === "castle" ? 144 : 128,
    };
  return {
    width: Math.max(96, o.w + 24),
    height: Math.max(
      88,
      o.h + (biome === "volcano" || biome === "icefield" ? 48 : 32),
    ),
  };
}
