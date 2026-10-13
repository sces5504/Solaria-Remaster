import { roomThemes } from "./room-themes";
import type { Element, Run } from "../core/types";

export type BiomeId =
  | "meadow"
  | "desert"
  | "icefield"
  | "volcano"
  | "jungle"
  | "corruption"
  | "crimson"
  | "stars"
  | "castle";
export interface BiomeDefinition {
  name: string;
  tier: number;
  palette: [number, number, number];
  monsters: number[];
  themes: string[];
  hazard:
    | "sand"
    | "frost"
    | "vent"
    | "thorns"
    | "rift"
    | "blood"
    | "meteor"
    | "statue"
    | null;
  period: number;
}
export const biomes: Record<BiomeId, BiomeDefinition> = {
  meadow: {
    name: "暮光草原",
    tier: 0,
    palette: [0x294b43, 0x91b5a0, 0xbacddd],
    monsters: [1, 2, 3, 4, 5],
    themes: roomThemes.meadow.map((t) => t.name),
    hazard: null,
    period: 6,
  },
  desert: {
    name: "流砂荒漠",
    tier: 1,
    palette: [0x685644, 0xd4ac70, 0xffe1a8],
    monsters: [6, 7, 8],
    themes: roomThemes.desert.map((t) => t.name),
    hazard: "sand",
    period: 6,
  },
  icefield: {
    name: "永霜冰原",
    tier: 1,
    palette: [0x344b60, 0x92cddd, 0xe3faff],
    monsters: [9, 10, 11],
    themes: roomThemes.icefield.map((t) => t.name),
    hazard: "frost",
    period: 6,
  },
  volcano: {
    name: "熔火山脈",
    tier: 2,
    palette: [0x392d32, 0xc1633d, 0xffc977],
    monsters: [12, 13, 14],
    themes: roomThemes.volcano.map((t) => t.name),
    hazard: "vent",
    period: 5.5,
  },
  jungle: {
    name: "荊棘叢林",
    tier: 2,
    palette: [0x233d39, 0x8bb169, 0xdaeaaa],
    monsters: [15, 16, 17],
    themes: roomThemes.jungle.map((t) => t.name),
    hazard: "thorns",
    period: 5.5,
  },
  corruption: {
    name: "腐敗裂境",
    tier: 3,
    palette: [0x302e49, 0xa782be, 0xe7bdff],
    monsters: [18, 19, 20],
    themes: roomThemes.corruption.map((t) => t.name),
    hazard: "rift",
    period: 5,
  },
  crimson: {
    name: "猩紅領域",
    tier: 3,
    palette: [0x482c39, 0xae5e71, 0xffbcc4],
    monsters: [21, 22, 23],
    themes: roomThemes.crimson.map((t) => t.name),
    hazard: "blood",
    period: 2,
  },
  stars: {
    name: "星空之境",
    tier: 4,
    palette: [0x222d4b, 0x829dd2, 0xd4e5ff],
    monsters: [24, 25, 26],
    themes: roomThemes.stars.map((t) => t.name),
    hazard: "meteor",
    period: 4.5,
  },
  castle: {
    name: "魔王城",
    tier: 5,
    palette: [0x303740, 0x8c94a2, 0xe1c7a1],
    monsters: [27, 28, 29],
    themes: roomThemes.castle.map((t) => t.name),
    hazard: "statue",
    period: 5,
  },
};
export interface MonsterDefinition {
  id: number;
  name: string;
  archetype: 1 | 2 | 3 | 4 | 5;
  speed: number;
  interval: number;
  attacks: (
    "rush" | "slash" | "mark" | "fan" | "ring" | "cross" | "rows" | "laser"
  )[];
  shots: number;
  groups: number;
  spread: number;
  element: Element | null;
  reach: number;
  radius: number;
}
const mon = (
  id: number,
  name: string,
  archetype: MonsterDefinition["archetype"],
  speed: number,
  interval: number,
  attacks: MonsterDefinition["attacks"],
  shots: number,
  groups = 1,
  spread = 80,
  element: Element | null = null,
  reach = 160,
  radius = 14,
): MonsterDefinition => ({
  id,
  name,
  archetype,
  speed,
  interval,
  attacks,
  shots,
  groups,
  spread,
  element,
  reach,
  radius,
});
export const monsters: Record<number, MonsterDefinition> = Object.fromEntries(
  [
    mon(6, "沙刃刺客", 3, 106, 2, ["rush"], 1, 1, 90, null, 140),
    mon(7, "沙棘蠍", 4, 62, 2.2, ["fan"], 3, 1, 30, null, 180, 18),
    mon(8, "古砂祭司", 5, 48, 2.5, ["mark", "ring"], 6),
    mon(9, "霜牙狼", 1, 104, 2, ["rush"], 1, 1, 90, "ice", 180),
    mon(10, "冰晶哨兵", 4, 48, 2.2, ["fan"], 5, 1, 80, "ice"),
    mon(11, "雪幕幽魂", 5, 51, 2.5, ["fan"], 6, 2, 100, "ice"),
    mon(12, "熔甲獸", 3, 70, 2.5, ["slash"], 1, 1, 120, null, 120, 20),
    mon(13, "噴焰蜥蜴", 4, 65, 2, ["fan"], 1, 3, 0, "fire"),
    mon(14, "灰燼術士", 5, 51, 2.5, ["mark", "ring"], 8, 1, 360, "fire"),
    mon(15, "荊棘獵豹", 1, 115, 1.8, ["rush"], 1, 1, 90, null, 160),
    mon(16, "葉刃獵手", 4, 72, 2, ["fan"], 5, 1, 60),
    mon(17, "孢子花", 5, 0, 2.2, ["ring"], 8, 1, 360, null, 160, 18),
    mon(18, "虛空潛蟲", 2, 79, 2.5, ["mark"], 1, 1, 90, null, 170, 18),
    mon(19, "腐化射手", 4, 70, 2, ["fan"], 3, 1, 20),
    mon(20, "裂隙看守", 5, 55, 2.5, ["fan"], 6, 2, 110),
    mon(21, "血爪獵犬", 1, 119, 1.8, ["rush"], 1, 1, 90, null, 160),
    mon(22, "血矛侍從", 4, 73, 2, ["fan"], 1, 3, 0),
    mon(23, "猩紅眼魔", 5, 57, 2.5, ["cross"], 12, 2, 360),
    mon(24, "隕星掠食者", 2, 100, 2.2, ["mark"], 1, 1, 90, null, 200, 18),
    mon(25, "星輝巡弋者", 4, 85, 2, ["rows"], 4, 2, 0),
    mon(26, "軌道水母", 5, 63, 2.5, ["ring"], 8, 2, 360, null, 160, 18),
    mon(27, "白骨騎士", 3, 106, 2, ["slash", "rush"], 1, 1, 120, null, 140, 18),
    mon(28, "魔城弩手", 4, 76, 2, ["fan"], 1, 5, 0),
    mon(29, "黑曜咒術師", 5, 60, 2.5, ["fan", "laser"], 6),
  ].map((m) => [m.id, m]),
);
export const currentBiome = (r: Run) => biomes[r.biome ?? "meadow"];
export const enemyHPScale = (r: Run) =>
  [1, 1.7, 2.7, 4, 5.8, 8][currentBiome(r).tier] * 1.6 ** ((r.loop ?? 1) - 1);
export const enemyDamageScale = (r: Run) =>
  (r.room === 31 ? 3 : [1, 1.25, 1.5, 1.8, 2.15, 2.5][currentBiome(r).tier]) *
  1.2 ** ((r.loop ?? 1) - 1);

// Biome-specific ecology shares reachability checks and footprint rules.
export { terrainLayout as biomeLayout } from "./terrain-layout";
