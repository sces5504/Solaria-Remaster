import { terrainLayout } from "./terrain-layout";
import type { BiomeId } from "./biomes";
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
  beamAngles?: number[];
  beamTurn?: number[];
  beamStagger?: number;
  rushSpeed?: number;
  rushTime?: number;
  ricochet?: boolean;
  volley?: "petals" | "sine" | "alternating" | "stack";
  mineDistance?: number;
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
  const b = bosses[id];
  const profiles = {
    rays: 0,
    lanes: 1,
    arcs: 2,
    groves: 3,
    islands: 4,
    columns: 5,
  };
  return terrainLayout(b.biome, profiles[b.layout], seed, id);
}

// v1.2.0: identity-specific geometry and timing, using the existing art contract.
const tune = (id: number, attackId: string, change: Partial<BossAttack>) => {
  const attack = bosses[id].attacks.flat().find((a) => a.id === attackId)!;
  Object.assign(attack, change);
};
const pi = Math.PI;
tune(3, "pyramid-rotate", { duration: 4, rotation: pi * 2 });
tune(3, "pyramid-rays", {
  pattern: "sweep",
  arms: 4,
  beamAngles: [0, pi / 2, pi, -pi / 2],
  beamStagger: 0,
  rotation: pi / 2,
  duration: 2.4,
});
tune(3, "pyramid-rings", { volley: "stack", rotation: pi / 12 });
tune(4, "assassin-dash", {
  groups: 3,
  rushSpeed: 390,
  rushTime: 0.7,
  duration: 3.2,
});
tune(4, "assassin-blades", { volley: "sine", groups: 3, interval: 0.3 });
tune(4, "assassin-swap", { radius: 165, spread: 140, duration: 3 });
tune(5, "dragon-breath", { radius: 190, groups: 3, interval: 0.3 });
tune(5, "dragon-spears", { volley: "stack", groups: 3, interval: 0.3 });
tune(5, "dragon-dive", { rushSpeed: 370, rushTime: 0.95, duration: 1.05 });
tune(6, "troll-slam", { radius: 160, spread: 300 });
tune(6, "troll-block", { volley: "stack", groups: 3, interval: 0.35 });
tune(6, "troll-spikes", { volley: "alternating", rotation: pi / 4 });
tune(7, "furnace-balls", { volley: "alternating", interval: 0.3 });
tune(7, "furnace-ray", {
  beamAngles: [-pi / 3, pi / 3],
  beamTurn: [pi / 3, -pi / 3],
  beamStagger: 0,
  duration: 2.4,
});
tune(7, "furnace-rings", { volley: "stack" });
tune(8, "beast-firepath", {
  rushSpeed: 360,
  rushTime: 1.6,
  duration: 1.7,
  ricochet: true,
});
tune(8, "beast-tail", {
  radius: 180,
  groups: 5,
  spread: 110,
  rotation: pi / 2,
  interval: 0.3,
  duration: 1.5,
});
tune(8, "beast-ring", { volley: "petals", rotation: pi / 10 });
tune(9, "flower-vine", { radius: 205, groups: 2, interval: 0.5 });
tune(9, "flower-seeds", { volley: "sine", groups: 4, interval: 0.3 });
tune(9, "flower-lashes", {
  radius: 205,
  rotation: (pi * 2) / 3,
  interval: 0.45,
});
tune(10, "witch-bolts", { volley: "alternating", rotation: pi / 7 });
tune(10, "witch-spiral", { volley: "sine", rotation: -pi / 9 });
tune(11, "worm-acid", { volley: "sine", groups: 3, interval: 0.3 });
tune(11, "worm-rays", {
  beamAngles: [pi / 4, (pi * 3) / 4, (pi * 5) / 4, (pi * 7) / 4],
  beamStagger: 0,
  arms: 4,
});
tune(12, "eye-charge", { rushSpeed: 365, rushTime: 0.9, duration: 1 });
tune(12, "eye-double", {
  groups: 2,
  rushSpeed: 365,
  rushTime: 0.7,
  duration: 2.2,
});
tune(12, "eye-complement", { volley: "alternating" });
tune(12, "eye-beams", { beamAngles: [0, pi], arms: 2, beamStagger: 0.45 });
tune(13, "brain-needles", { volley: "stack", groups: 3, interval: 0.35 });
tune(13, "brain-diamond", { rotation: pi / 8, volley: "alternating" });
tune(13, "brain-network", {
  beamAngles: [0, pi / 2, pi, -pi / 2],
  arms: 4,
  beamStagger: 0.3,
});
tune(14, "dracula-lunge", {
  groups: 2,
  rushSpeed: 380,
  rushTime: 0.75,
  duration: 2.3,
});
tune(14, "dracula-blades", { volley: "sine", groups: 3, interval: 0.3 });
tune(14, "dracula-moon", {
  beamAngles: [0, pi],
  beamStagger: 0,
  rotation: -pi,
  duration: 3,
});
tune(15, "queen-spiral", { volley: "petals", rotation: pi / 11 });
tune(15, "queen-shifted", {
  beamAngles: [-pi / 3, 0, pi / 3],
  beamStagger: 0.4,
});
tune(15, "queen-cross", { rotation: pi / 10, volley: "alternating" });
tune(16, "whale-ram", {
  rushSpeed: 350,
  rushTime: 1.4,
  duration: 1.5,
  ricochet: true,
});
tune(16, "whale-wave", { volley: "sine" });
tune(16, "whale-tail", { radius: 195, spread: 250 });
tune(16, "whale-sweep", {
  beamAngles: [pi / 2, -pi / 2],
  arms: 2,
  beamStagger: 0,
  rotation: pi,
  duration: 3,
});
tune(17, "regent-sweep", {
  radius: 180,
  groups: 4,
  spread: 120,
  rotation: pi / 2,
  interval: 0.35,
  duration: 1.5,
});
tune(17, "regent-spear", { volley: "stack", groups: 3, interval: 0.35 });
tune(17, "regent-charge", {
  groups: 3,
  rushSpeed: 385,
  rushTime: 0.65,
  duration: 3,
});
tune(17, "regent-heavy", { radius: 195, spread: 300 });
tune(18, "archmage-rings", { volley: "petals" });
tune(18, "archmage-rays", {
  pattern: "sweep",
  beamAngles: [0, (pi * 2) / 3, (pi * 4) / 3],
  beamStagger: 0,
  rotation: -pi,
  duration: 3,
});
tune(18, "archmage-star", { volley: "petals", rotation: -pi / 13 });
for (const id of [4, 5, 6, 8, 11, 12, 14, 16, 17]) bosses[id].speed *= 1.18;
