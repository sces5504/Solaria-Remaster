import type { BiomeId } from "./biomes";
import type { Obstacle } from "../core/types";
export type BossPattern =
  | "rush"
  | "fan"
  | "ring"
  | "spiral"
  | "mark"
  | "mine"
  | "laser"
  | "sweep"
  | "slash"
  | "summon"
  | "teleport"
  | "field"
  | "burrow"
  | "cross"
  | "rows"
  | "heal";
export interface BossAttack {
  id: string;
  name: string;
  pattern: BossPattern;
  warning: number;
  duration: number;
  interval: number;
  shots: number;
  groups: number;
  arms: number;
  spread: number;
  radius: number;
  damage: number;
  speed: number;
  rotation: number;
  summon?: "minion" | "totem" | "blood";
}
export interface BossDefinition {
  id: number;
  name: string;
  biome: BiomeId;
  hp: number;
  speed: number;
  radius: number;
  layout: "rays" | "lanes" | "arcs" | "groves" | "islands" | "columns";
  attacks: [BossAttack[], BossAttack[]];
}
const a = (
  id: string,
  name: string,
  pattern: BossPattern,
  options: Partial<Omit<BossAttack, "id" | "name" | "pattern">> = {},
): BossAttack => ({
  id,
  name,
  pattern,
  warning:
    pattern === "rush"
      ? 0.8
      : pattern === "laser" || pattern === "sweep"
        ? 0.8
        : pattern === "slash"
          ? 0.45
          : 0.6,
  duration:
    pattern === "spiral"
      ? 1.8
      : pattern === "ring"
        ? 1.4
        : pattern === "fan"
          ? 1.2
          : pattern === "field"
            ? 4
            : pattern === "rush"
              ? 0.65
              : 1.2,
  interval: 0.24,
  shots: 14,
  groups: 1,
  arms: 2,
  spread: 120,
  radius: 65,
  damage: 18,
  speed: 235,
  rotation: 0,
  ...options,
});
const boss = (
  id: number,
  name: string,
  biome: BiomeId,
  hp: number,
  speed: number,
  radius: number,
  layout: BossDefinition["layout"],
  attacks: BossDefinition["attacks"],
): BossDefinition => ({ id, name, biome, hp, speed, radius, layout, attacks });
export const bosses: Record<number, BossDefinition> = Object.fromEntries(
  [
    boss(3, "金字塔神", "desert", 9500, 35, 44, "rays", [
      [
        a("pyramid-rotate", "旋轉雷射", "sweep", {
          arms: 1,
          rotation: Math.PI / 2,
          damage: 24,
        }),
        a("pyramid-rings", "分層環彈", "ring", {
          groups: 3,
          interval: 0.3,
          shots: 12,
        }),
        a("pyramid-brand", "太陽烙印", "mark", {
          groups: 3,
          radius: 70,
          damage: 36,
        }),
      ],
      [
        a("pyramid-rays", "多向雷射", "laser", { arms: 3, damage: 24 }),
        a("pyramid-blast", "地面爆破", "mark", {
          groups: 5,
          radius: 75,
          damage: 36,
        }),
        a("pyramid-mines", "砂紋雷陣", "mine", {
          groups: 5,
          radius: 65,
          damage: 36,
        }),
      ],
    ]),
    boss(4, "沙塵暴刺客", "desert", 9500, 100, 28, "lanes", [
      [
        a("assassin-dash", "突進", "rush", { damage: 30 }),
        a("assassin-blades", "弧刃", "fan", { shots: 7, spread: 100 }),
        a("assassin-trap", "沙刃陷阱", "mine", { groups: 3, damage: 36 }),
      ],
      [
        a("assassin-swap", "換位", "teleport", { groups: 2, damage: 30 }),
        a("assassin-dust", "移動沙塵", "field", { radius: 100, damage: 12 }),
        a("assassin-cross", "交錯飛刃", "cross", {
          shots: 12,
          groups: 4,
          rotation: Math.PI / 8,
        }),
      ],
    ]),
    boss(5, "冰龍", "icefield", 9500, 58, 44, "arcs", [
      [
        a("dragon-breath", "冰息", "slash", {
          radius: 160,
          spread: 80,
          damage: 30,
          duration: 1,
        }),
        a("dragon-spears", "冰矛散射", "fan", { shots: 7, spread: 110 }),
        a("dragon-fall", "冰隕落擊", "mark", {
          groups: 3,
          radius: 70,
          damage: 36,
        }),
      ],
      [
        a("dragon-blizzard", "冰風暴", "field", { radius: 140, damage: 12 }),
        a("dragon-dive", "俯衝", "rush", { damage: 30 }),
        a("dragon-ring", "環形冰彈", "ring", { shots: 14, groups: 5 }),
      ],
    ]),
    boss(6, "冰川巨魔", "icefield", 9500, 48, 40, "islands", [
      [
        a("troll-slam", "砸地", "slash", {
          radius: 130,
          spread: 160,
          damage: 36,
        }),
        a("troll-block", "冰塊", "rows", { shots: 8, groups: 2 }),
        a("troll-shards", "碎冰扇射", "fan", { shots: 9, spread: 130 }),
      ],
      [
        a("troll-leap", "躍擊", "mark", { radius: 85, damage: 36 }),
        a("troll-spikes", "冰刺", "cross", { shots: 12, groups: 4 }),
        a("troll-mines", "冰脊雷陣", "mine", { groups: 5, damage: 36 }),
      ],
    ]),
    boss(7, "火山熔爐怪", "volcano", 13500, 35, 44, "rays", [
      [
        a("furnace-balls", "火彈", "fan", { shots: 5, groups: 4 }),
        a("furnace-vents", "熱孔", "mark", { groups: 4, damage: 36 }),
        a("furnace-mines", "熔渣地雷", "mine", { groups: 4, damage: 36 }),
      ],
      [
        a("furnace-ray", "雷射", "sweep", {
          arms: 2,
          rotation: Math.PI / 2,
          damage: 24,
        }),
        a("furnace-slags", "熔渣怪", "summon", { groups: 2, summon: "minion" }),
        a("furnace-rings", "錯位火環", "ring", {
          groups: 5,
          rotation: Math.PI / 12,
        }),
      ],
    ]),
    boss(8, "火炎獸", "volcano", 13500, 90, 40, "lanes", [
      [
        a("beast-firepath", "火路衝撞", "rush", { damage: 30 }),
        a("beast-fireball", "火球", "fan", { shots: 5, spread: 90 }),
        a("beast-tail", "甩尾", "slash", {
          radius: 150,
          spread: 180,
          damage: 30,
        }),
      ],
      [
        a("beast-leap", "躍擊", "mark", { radius: 85, damage: 36 }),
        a("beast-ring", "擴散火環", "ring", { groups: 5 }),
        a("beast-rain", "熔火落爆", "mark", {
          groups: 5,
          radius: 75,
          damage: 36,
        }),
      ],
    ]),
    boss(9, "食人花怪", "jungle", 13500, 0, 44, "groves", [
      [
        a("flower-vine", "藤鞭", "slash", {
          radius: 160,
          spread: 140,
          damage: 30,
        }),
        a("flower-seeds", "種子彈", "fan", { shots: 7 }),
        a("flower-minions", "小怪花", "summon", {
          groups: 3,
          summon: "minion",
        }),
      ],
      [
        a("flower-heads", "花頭齊射", "cross", { shots: 12, groups: 4 }),
        a("flower-wave", "種子波", "rows", { shots: 16, groups: 4 }),
        a("flower-lashes", "交錯藤鞭", "slash", {
          groups: 3,
          radius: 160,
          spread: 100,
          damage: 30,
        }),
      ],
    ]),
    boss(10, "邪惡巫醫", "jungle", 13500, 53, 32, "groves", [
      [
        a("witch-bolts", "咒彈", "fan", { shots: 7, groups: 4 }),
        a("witch-spirits", "靈體", "summon", { groups: 2, summon: "minion" }),
        a("witch-thunder", "靈咒落雷", "mark", { groups: 3, damage: 36 }),
      ],
      [
        a("witch-runes", "符文", "mine", { groups: 4, damage: 36 }),
        a("witch-totem", "回血圖騰", "heal", { groups: 1, summon: "totem" }),
        a("witch-spiral", "旋轉咒彈", "spiral", { shots: 6, interval: 0.14 }),
      ],
    ]),
    boss(11, "虛空蠕蟲", "corruption", 18000, 60, 42, "islands", [
      [
        a("worm-burrow", "破土", "burrow", {
          groups: 1,
          radius: 90,
          damage: 36,
        }),
        a("worm-acid", "腐蝕散射", "fan", { shots: 7 }),
        a("worm-mines", "裂口地雷", "mine", { groups: 4, damage: 36 }),
      ],
      [
        a("worm-double", "連續破土", "burrow", {
          groups: 2,
          radius: 90,
          damage: 36,
        }),
        a("worm-rifts", "裂隙彈", "cross", { shots: 12, groups: 4 }),
        a("worm-rays", "交叉虛空束", "laser", { arms: 2, damage: 24 }),
      ],
    ]),
    boss(12, "眼球怪", "corruption", 18000, 76, 36, "arcs", [
      [
        a("eye-charge", "衝刺", "rush", { damage: 30 }),
        a("eye-waves", "三路眼波", "fan", { shots: 3, spread: 70 }),
        a("eye-gaze", "凝視爆點", "mark", { groups: 3, damage: 36 }),
      ],
      [
        a("eye-double", "雙體衝刺", "rush", { damage: 30 }),
        a("eye-complement", "互補彈幕", "ring", {
          shots: 12,
          groups: 4,
          rotation: Math.PI / 12,
        }),
        a("eye-beams", "輪替光束", "laser", { arms: 1, damage: 24 }),
      ],
    ]),
    boss(13, "血腥浮空腦袋", "crimson", 18000, 58, 36, "rays", [
      [
        a("brain-blood", "血彈", "ring", { shots: 12, groups: 4 }),
        a("brain-needles", "血針", "fan", { shots: 9, spread: 90 }),
        a("brain-storm", "腦電落擊", "mark", { groups: 3, damage: 36 }),
      ],
      [
        a("brain-shift", "瞬移", "teleport", { groups: 2 }),
        a("brain-diamond", "菱形針陣", "cross", { shots: 12, groups: 5 }),
        a("brain-network", "血脈雷網", "laser", { arms: 3, damage: 24 }),
      ],
    ]),
    boss(14, "德古拉血魔", "crimson", 18000, 84, 34, "lanes", [
      [
        a("dracula-lunge", "吸血撲擊", "rush", { damage: 30 }),
        a("dracula-blades", "血刃", "fan", { shots: 7, spread: 110 }),
        a("dracula-mines", "暗紅地雷", "mine", { groups: 4, damage: 36 }),
      ],
      [
        a("dracula-bats", "血蝠", "summon", { groups: 3, summon: "minion" }),
        a("dracula-orbs", "回血血球", "heal", { groups: 3, summon: "blood" }),
        a("dracula-moon", "血月光束", "sweep", {
          arms: 2,
          rotation: Math.PI / 2,
          damage: 24,
        }),
      ],
    ]),
    boss(15, "異星女王", "stars", 24000, 58, 36, "rays", [
      [
        a("queen-spiral", "螺旋彈", "spiral", { shots: 6, interval: 0.14 }),
        a("queen-aim", "瞄準雷射", "laser", { arms: 1, damage: 24 }),
        a("queen-stars", "繁星落擊", "mark", { groups: 5, damage: 36 }),
      ],
      [
        a("queen-shifted", "錯位雷射", "laser", { arms: 3, damage: 24 }),
        a("queen-larvae", "幼體", "summon", { groups: 2, summon: "minion" }),
        a("queen-cross", "交叉彈幕", "cross", { shots: 12, groups: 5 }),
      ],
    ]),
    boss(16, "異星鯨魚", "stars", 24000, 66, 48, "arcs", [
      [
        a("whale-ram", "游弋撞擊", "rush", { damage: 30 }),
        a("whale-wave", "星浪", "rows", { shots: 16, groups: 4 }),
        a("whale-tail", "尾鰭橫掃", "slash", {
          radius: 160,
          spread: 180,
          damage: 30,
        }),
      ],
      [
        a("whale-sweep", "掃射雷射", "sweep", {
          arms: 1,
          rotation: Math.PI / 2,
          damage: 24,
        }),
        a("whale-vortex", "旋流彈", "spiral", {
          arms: 3,
          shots: 9,
          interval: 0.14,
          rotation: -Math.PI / 10,
        }),
        a("whale-leap", "躍擊", "mark", { radius: 85, damage: 36 }),
      ],
    ]),
    boss(17, "白骨攝政王", "castle", 30000, 78, 38, "columns", [
      [
        a("regent-sweep", "橫掃", "slash", {
          radius: 150,
          spread: 170,
          damage: 30,
        }),
        a("regent-spear", "骨矛", "fan", { shots: 7, spread: 100 }),
        a("regent-skeletons", "骷髏", "summon", {
          groups: 3,
          summon: "minion",
        }),
      ],
      [
        a("regent-ring", "骨環", "ring", { shots: 14, groups: 5 }),
        a("regent-charge", "突進斬", "rush", { damage: 30 }),
        a("regent-heavy", "重擊掩體", "slash", {
          radius: 160,
          spread: 180,
          damage: 36,
        }),
      ],
    ]),
    boss(18, "蝕星大法師", "castle", 30000, 52, 32, "columns", [
      [
        a("archmage-rings", "錯角環彈", "ring", {
          groups: 5,
          rotation: Math.PI / 12,
        }),
        a("archmage-rays", "三束雷射", "laser", { arms: 3, damage: 24 }),
        a("archmage-servants", "侍從", "summon", {
          groups: 2,
          summon: "minion",
        }),
      ],
      [
        a("archmage-star", "星形彈", "spiral", {
          arms: 5,
          shots: 15,
          interval: 0.16,
        }),
        a("archmage-runes", "符文爆破", "mine", { groups: 5, damage: 36 }),
        a("archmage-meteors", "落星", "mark", {
          groups: 5,
          radius: 80,
          damage: 36,
        }),
      ],
    ]),
  ].map((b) => [b.id, b]),
);

// Boss arenas reserve a 144px combat lane and broad side escapes. The cover
// clusters match the attack geometry: ray shelters, charge lanes, arcs, roots,
// burrow islands or the castle's paired columns.
export function bossArena(id: number, seed: number) {
  const b = bosses[id],
    columns: Record<BossDefinition["layout"], number[][]> = {
      rays: [
        [256, 144],
        [480, 112],
        [704, 144],
        [864, 176],
        [288, 480],
        [512, 496],
        [736, 480],
        [864, 448],
      ],
      lanes: [
        [224, 128],
        [384, 128],
        [576, 144],
        [800, 128],
        [224, 496],
        [384, 496],
        [576, 480],
        [800, 496],
      ],
      arcs: [
        [224, 176],
        [384, 128],
        [576, 112],
        [800, 144],
        [224, 448],
        [384, 496],
        [576, 512],
        [800, 480],
      ],
      groves: [
        [256, 128],
        [320, 144],
        [512, 112],
        [576, 128],
        [800, 144],
        [256, 496],
        [320, 480],
        [512, 512],
        [576, 496],
        [800, 480],
      ],
      islands: [
        [224, 144],
        [416, 176],
        [608, 128],
        [832, 160],
        [256, 480],
        [416, 448],
        [640, 496],
        [832, 464],
      ],
      columns: [
        [256, 128],
        [448, 128],
        [640, 128],
        [864, 128],
        [256, 496],
        [448, 496],
        [640, 496],
        [864, 496],
      ],
    };
  const kind: Obstacle["kind"] =
    b.biome === "jungle"
      ? "tree"
      : b.biome === "castle" || b.biome === "desert"
        ? "pillar"
        : "rock";
  const durability = kind === "tree" ? 5 : kind === "rock" ? 10 : 15;
  const shift = ((seed % 3) - 1) * 8;
  const obstacles = columns[b.layout].flatMap(([x, y], i) => {
    const parts =
      i % 2 === id % 2
        ? [
            [0, 0],
            [40, y < 320 ? -24 : 24],
          ]
        : [[0, 0]];
    return parts.map(([dx, dy]) => ({
      id: i * 2 + (dx ? 2 : 1),
      x: x + dx + shift,
      y: y + dy,
      w: 32,
      h: 32,
      kind,
      durability,
      maxDurability: durability,
      waves: [] as number[],
    }));
  });
  return {
    obstacles,
    route: [
      { x: 112, y: 320 },
      { x: 928, y: 320 },
    ],
  };
}
