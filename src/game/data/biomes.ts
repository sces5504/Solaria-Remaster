import { COVER_DURABILITY } from "../core/cover-rules";
import { random, seedFor, type Vec } from "../core/primitives";
import type { Element, Obstacle, Run } from "../core/types";

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
    themes: [
      "林蔭湖畔",
      "碎岩之岸",
      "雙林長廊",
      "鏡水草甸",
      "四季樹庭",
      "風語遺跡",
    ],
    hazard: null,
    period: 6,
  },
  desert: {
    name: "流砂荒漠",
    tier: 1,
    palette: [0x685644, 0xd4ac70, 0xffe1a8],
    monsters: [6, 7, 8],
    themes: [
      "流砂環丘",
      "砂柱雙岸",
      "風蝕石脊",
      "三重綠洲",
      "蜿蜒砂峽",
      "日輪廢墟",
    ],
    hazard: "sand",
    period: 6,
  },
  icefield: {
    name: "永霜冰原",
    tier: 1,
    palette: [0x344b60, 0x92cddd, 0xe3faff],
    monsters: [9, 10, 11],
    themes: [
      "冰湖環道",
      "雪幕雙嶺",
      "碎晶迷徑",
      "三座霜庭",
      "冰川寬谷",
      "極光雪野",
    ],
    hazard: "frost",
    period: 6,
  },
  volcano: {
    name: "熔火山脈",
    tier: 2,
    palette: [0x392d32, 0xc1633d, 0xffc977],
    monsters: [12, 13, 14],
    themes: [
      "熔池環岸",
      "黑曜雙堤",
      "錯位熱孔",
      "三座熔臺",
      "玄岩折谷",
      "灰燼曠野",
    ],
    hazard: "vent",
    period: 5.5,
  },
  jungle: {
    name: "荊棘叢林",
    tier: 2,
    palette: [0x233d39, 0x8bb169, 0xdaeaaa],
    monsters: [15, 16, 17],
    themes: [
      "巨根環庭",
      "藤蔓雙廊",
      "層疊花圃",
      "三座孢林",
      "盤根曲徑",
      "林間祭壇",
    ],
    hazard: "thorns",
    period: 5.5,
  },
  corruption: {
    name: "腐敗裂境",
    tier: 3,
    palette: [0x302e49, 0xa782be, 0xe7bdff],
    monsters: [18, 19, 20],
    themes: [
      "裂口環臺",
      "虛空雙岸",
      "傾斜斷柱",
      "三重殘墟",
      "裂隙迴廊",
      "無光祭庭",
    ],
    hazard: "rift",
    period: 5,
  },
  crimson: {
    name: "猩紅領域",
    tier: 3,
    palette: [0x482c39, 0xae5e71, 0xffbcc4],
    monsters: [21, 22, 23],
    themes: [
      "血池環岸",
      "雙庭血脈",
      "血晶交錯",
      "三重骨庭",
      "猩紅曲廊",
      "赤月廣場",
    ],
    hazard: "blood",
    period: 2,
  },
  stars: {
    name: "星空之境",
    tier: 4,
    palette: [0x222d4b, 0x829dd2, 0xd4e5ff],
    monsters: [24, 25, 26],
    themes: [
      "軌道環臺",
      "雙星晶岸",
      "流星碎陣",
      "三重星庭",
      "星橋曲徑",
      "銀河曠野",
    ],
    hazard: "meteor",
    period: 4.5,
  },
  castle: {
    name: "魔王城",
    tier: 5,
    palette: [0x303740, 0x8c94a2, 0xe1c7a1],
    monsters: [27, 28, 29],
    themes: [
      "王座環廊",
      "雙列石柱",
      "錯位雕像",
      "三座內庭",
      "黑曜長廊",
      "蝕日大殿",
    ],
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

// The eight grammars produce different spatial shapes. Every placement preserves
// all walkable cells and reserves both the main route and a vertical escape lane.
export function biomeLayout(
  id: Exclude<BiomeId, "meadow">,
  profile: number,
  seed: number,
  boss = 0,
): { obstacles: Obstacle[]; route: Vec[] } {
  const rng = { rng: seedFor(seed, profile + boss * 31 + 5000) };
  const obstacles: Obstacle[] = [];
  const amplitude = [34, 48, 38, 54, 42, 48, 36, 28][
    Object.keys(biomes).indexOf(id) - 1
  ];
  const route: Vec[] = Array.from({ length: 13 }, (_, i) => ({
    x: 112 + i * 68,
    y:
      320 + (boss ? 0 : Math.sin((i / 12) * Math.PI * 2 + profile) * amplitude),
  }));
  route[12] = { x: 928, y: 320 };
  const connected = (candidate: Obstacle) => {
    const grid = new Uint8Array(640);
    let total = 0;
    for (let y = 3; y <= 17; y++)
      for (let x = 2; x <= 29; x++) {
        const px = x * 32 + 16,
          py = y * 32 + 16;
        if (
          [...obstacles, candidate].every(
            (o) =>
              px <= o.x - 18 ||
              px >= o.x + o.w + 18 ||
              py <= o.y - 18 ||
              py >= o.y + o.h + 18,
          )
        ) {
          grid[y * 32 + x] = 1;
          total++;
        }
      }
    const queue = [323];
    grid[323] = 2;
    for (let i = 0; i < queue.length; i++)
      for (const next of [
        queue[i] - 1,
        queue[i] + 1,
        queue[i] - 32,
        queue[i] + 32,
      ])
        if (grid[next] === 1) {
          grid[next] = 2;
          queue.push(next);
        }
    return queue.length === total && grid[348] === 2;
  };
  const family = Object.keys(biomes).indexOf(id);
  for (
    let attempt = 0;
    attempt < 1000 && obstacles.length < (boss ? 12 : 20 + profile);
    attempt++
  ) {
    const sector = Math.floor(random(rng) * 6),
      side = random(rng) < 0.5 ? -1 : 1;
    let x = 224 + sector * 104 + (random(rng) - 0.5) * 64;
    let y = 320 + side * (100 + random(rng) * 120);
    if (profile === 0) {
      const a = random(rng) * Math.PI * 2;
      x =
        520 +
        Math.cos(a) * (200 + random(rng) * 100) +
        (random(rng) - 0.5) * 56;
      y = 320 + Math.sin(a) * (140 + random(rng) * 70);
    }
    if (profile === 1)
      x =
        family % 2
          ? 300 + (sector % 2) * 420 + (random(rng) - 0.5) * 80
          : 240 + sector * 112;
    if (profile === 2) y = 320 + side * (100 + (sector % 3) * 35);
    if (profile === 3) x = 280 + (sector % 3) * 240 + (random(rng) - 0.5) * 80;
    if (profile === 4) y = 320 + side * (130 + Math.sin(sector + family) * 45);
    // Per-biome geometry changes both cell placement and dimensions.
    x = Math.round(x / 32) * 32;
    y = Math.round(y / 32) * 32;
    const w = family === 1 || family === 3 ? (random(rng) < 0.3 ? 64 : 32) : 32;
    const h = family === 2 || family === 8 ? (random(rng) < 0.3 ? 64 : 32) : 32;
    const near = route.reduce((a, b) =>
      Math.abs(b.x - x - w / 2) < Math.abs(a.x - x - w / 2) ? b : a,
    );
    if (
      x < 192 ||
      x + w > 928 ||
      y < 96 ||
      y + h > 576 ||
      Math.abs(y + h / 2 - near.y) < 72 ||
      (x < 560 && x + w > 480)
    )
      continue;
    const kind: Obstacle["kind"] =
      id === "jungle"
        ? "tree"
        : id === "castle" || id === "desert"
          ? "pillar"
          : "rock";
    const low =
      (id === "volcano" || id === "icefield") &&
      obstacles.filter((o) => o.kind === "lake").length < 2;
    const o: Obstacle = {
      id: obstacles.length + 1,
      x,
      y,
      w: low ? 64 : w,
      h: low ? 64 : h,
      kind: low ? "lake" : kind,
      durability: low ? 999 : COVER_DURABILITY,
      maxDurability: low ? 999 : COVER_DURABILITY,
      waves: [],
    };
    if (
      obstacles.some(
        (a) =>
          o.x < a.x + a.w + 8 &&
          o.x + o.w + 8 > a.x &&
          o.y < a.y + a.h + 8 &&
          o.y + o.h + 8 > a.y,
      )
    )
      continue;
    if (connected(o)) obstacles.push(o);
  }
  for (let y = 96; y <= 544 && obstacles.length < 16; y += 64)
    for (let x = 224; x <= 864 && obstacles.length < 16; x += 64) {
      if (Math.abs(y - 320) < 96 || (x >= 480 && x <= 544)) continue;
      const near = route.reduce((a, b) =>
        Math.abs(b.x - x) < Math.abs(a.x - x) ? b : a,
      );
      if (Math.abs(y + 16 - near.y) < 72) continue;
      const kind: Obstacle["kind"] =
        id === "jungle"
          ? "tree"
          : id === "castle" || id === "desert"
            ? "pillar"
            : "rock";
      const durability = COVER_DURABILITY;
      const o: Obstacle = {
        id: obstacles.length + 1,
        x,
        y,
        w: 32,
        h: 32,
        kind,
        durability,
        maxDurability: durability,
        waves: [],
      };
      if (
        obstacles.some(
          (a) =>
            o.x < a.x + a.w + 8 &&
            o.x + o.w + 8 > a.x &&
            o.y < a.y + a.h + 8 &&
            o.y + o.h + 8 > a.y,
        )
      )
        continue;
      if (connected(o)) obstacles.push(o);
    }
  return { obstacles, route };
}
