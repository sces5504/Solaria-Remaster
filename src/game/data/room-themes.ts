import type { Vec } from "../core/primitives";
import type { BiomeId } from "./biomes";
import type { Obstacle } from "../core/types";

export type GroundKind =
  | "gravel"
  | "flowers"
  | "dunes"
  | "snow"
  | "ash"
  | "leaves"
  | "fungi"
  | "cracks"
  | "veins"
  | "stars"
  | "paving"
  | "rubble";
export interface GroundFeature {
  kind: GroundKind;
  points: Vec[];
  width: number;
  seed: number;
  path?: boolean;
}
type Pattern =
  | "ring"
  | "banks"
  | "ridge"
  | "three"
  | "winding"
  | "ruins"
  | "avenue"
  | "groves"
  | "clearing"
  | "scatter";
export interface RoomTheme {
  name: string;
  pattern: Pattern;
  cover: Obstacle["kind"][];
  ground: GroundKind;
  trail?: GroundKind;
  pools: "center" | "banks" | "three" | "mirror" | "none";
}
const theme = (
  name: string,
  pattern: Pattern,
  cover: Obstacle["kind"][],
  ground: GroundKind,
  pools: RoomTheme["pools"] = "none",
  trail?: GroundKind,
): RoomTheme => ({ name, pattern, cover, ground, pools, trail });
// One explicit recipe per displayed room name. Similar geography still uses its
// own materials, distribution and non-colliding ground details.
export const roomThemes: Record<BiomeId, RoomTheme[]> = {
  meadow: [
    theme(
      "林蔭湖畔",
      "banks",
      ["tree", "tree", "rock"],
      "leaves",
      "banks",
      "gravel",
    ),
    theme("碎岩之岸", "ridge", ["rock", "rock", "tree"], "gravel", "banks"),
    theme("雙林長廊", "avenue", ["tree"], "leaves", "none", "gravel"),
    theme("鏡水草甸", "clearing", ["tree", "rock"], "flowers", "mirror"),
    theme("四季樹庭", "groves", ["tree"], "flowers"),
    theme(
      "風語遺跡",
      "ruins",
      ["pillar", "rock", "tree"],
      "rubble",
      "none",
      "gravel",
    ),
  ],
  desert: [
    theme("流砂環丘", "ring", ["rock"], "dunes"),
    theme("砂柱雙岸", "banks", ["pillar", "rock"], "dunes", "banks"),
    theme("風蝕石脊", "ridge", ["rock"], "gravel", "none", "gravel"),
    theme("三重綠洲", "three", ["tree", "rock"], "leaves", "three"),
    theme("蜿蜒砂峽", "winding", ["rock"], "dunes", "none", "gravel"),
    theme("日輪廢墟", "ruins", ["pillar", "rock"], "rubble", "none", "paving"),
  ],
  icefield: [
    theme("冰湖環道", "ring", ["rock", "tree"], "snow", "center", "gravel"),
    theme("雪幕雙嶺", "banks", ["rock", "tree"], "snow"),
    theme("碎晶迷徑", "ridge", ["rock", "pillar"], "gravel", "none", "gravel"),
    theme("三座霜庭", "three", ["pillar", "tree"], "snow"),
    theme("冰川寬谷", "winding", ["rock"], "snow", "banks"),
    theme("極光雪野", "clearing", ["tree", "rock"], "snow"),
  ],
  volcano: [
    theme("熔池環岸", "ring", ["rock"], "cracks", "center"),
    theme("黑曜雙堤", "banks", ["rock", "pillar"], "ash", "banks"),
    theme("錯位熱孔", "scatter", ["rock"], "cracks"),
    theme("三座熔臺", "three", ["rock", "pillar"], "ash", "three"),
    theme("玄岩折谷", "winding", ["rock"], "gravel", "none", "gravel"),
    theme("灰燼曠野", "clearing", ["rock"], "ash"),
  ],
  jungle: [
    theme("巨根環庭", "ring", ["tree"], "leaves"),
    theme("藤蔓雙廊", "avenue", ["tree"], "leaves", "none", "leaves"),
    theme("層疊花圃", "ridge", ["tree", "rock"], "flowers"),
    theme("三座孢林", "three", ["tree"], "fungi"),
    theme("盤根曲徑", "winding", ["tree", "rock"], "leaves", "none", "gravel"),
    theme("林間祭壇", "ruins", ["pillar", "tree"], "fungi", "none", "paving"),
  ],
  corruption: [
    theme("裂口環臺", "ring", ["rock", "pillar"], "cracks", "center"),
    theme("虛空雙岸", "banks", ["rock"], "cracks", "banks"),
    theme("傾斜斷柱", "ridge", ["pillar", "rock"], "rubble"),
    theme("三重殘墟", "three", ["pillar", "rock"], "rubble"),
    theme("裂隙迴廊", "winding", ["pillar"], "cracks", "banks", "paving"),
    theme("無光祭庭", "ruins", ["pillar"], "cracks", "none", "paving"),
  ],
  crimson: [
    theme("血池環岸", "ring", ["rock"], "veins", "center"),
    theme("雙庭血脈", "banks", ["pillar", "rock"], "veins", "mirror"),
    theme("血晶交錯", "ridge", ["rock"], "veins"),
    theme("三重骨庭", "three", ["pillar", "rock"], "rubble"),
    theme("猩紅曲廊", "winding", ["pillar"], "veins", "none", "paving"),
    theme("赤月廣場", "clearing", ["pillar"], "veins", "none", "paving"),
  ],
  stars: [
    theme("軌道環臺", "ring", ["pillar", "rock"], "stars"),
    theme("雙星晶岸", "banks", ["rock", "pillar"], "stars", "banks"),
    theme("流星碎陣", "scatter", ["rock"], "rubble"),
    theme("三重星庭", "three", ["pillar"], "stars"),
    theme(
      "星橋曲徑",
      "winding",
      ["pillar", "rock"],
      "stars",
      "banks",
      "paving",
    ),
    theme("銀河曠野", "clearing", ["rock"], "stars"),
  ],
  castle: [
    theme("王座環廊", "ring", ["pillar"], "paving", "none", "paving"),
    theme("雙列石柱", "avenue", ["pillar"], "paving", "none", "paving"),
    theme("錯位雕像", "ridge", ["pillar", "rock"], "rubble", "none", "paving"),
    theme("三座內庭", "three", ["pillar"], "paving", "none", "paving"),
    theme("黑曜長廊", "avenue", ["pillar", "rock"], "paving", "none", "paving"),
    theme("蝕日大殿", "ruins", ["pillar"], "paving", "none", "paving"),
  ],
};
export function themeGeometry(t: RoomTheme, seed: number) {
  const s = ((seed % 3) - 1) * 16;
  let anchors: Vec[] = [];
  let route: Vec[] = [
    { x: 112, y: 320 },
    { x: 928, y: 320 },
  ];
  if (t.pattern === "ring") {
    anchors = Array.from({ length: 10 }, (_, i) => ({
      x: 512 + Math.cos((i * Math.PI) / 5 + Math.PI / 10) * 300,
      y: 320 + Math.sin((i * Math.PI) / 5 + Math.PI / 10) * 200,
    }));
    if (t.pools === "center")
      route = [
        { x: 112, y: 320 },
        { x: 256, y: 304 },
        { x: 352, y: 192 },
        { x: 672, y: 192 },
        { x: 768, y: 304 },
        { x: 928, y: 320 },
      ];
  } else if (t.pattern === "avenue") {
    anchors = [160, 448].flatMap((y) =>
      [240, 368, 496, 624, 752, 848].map((x) => ({ x, y })),
    );
    if (t.name === "黑曜長廊")
      anchors = anchors.map((p) => ({ x: p.x, y: p.y < 320 ? 192 : 416 }));
  } else if (t.pattern === "three") {
    anchors = [
      { x: 272, y: 160 },
      { x: 752, y: 160 },
      { x: 512, y: 464 },
    ].flatMap((p) => [-56, 56].map((dx) => ({ x: p.x + dx, y: p.y })));
  } else if (t.pattern === "groves") {
    anchors = [
      { x: 288, y: 160 },
      { x: 736, y: 160 },
      { x: 288, y: 480 },
      { x: 736, y: 480 },
    ].flatMap((p) => [-48, 48].map((dx) => ({ x: p.x + dx, y: p.y })));
  } else if (t.pattern === "ridge" || t.pattern === "winding") {
    anchors = [240, 384, 528, 672, 816].flatMap((x, i) => [
      { x, y: 144 + (i % 2) * 64 },
      { x: x + s, y: 448 - (i % 2) * 48 },
    ]);
    route = [
      { x: 112, y: 320 },
      ...[256, 400, 544, 688, 832].map((x, i) => ({
        x,
        y: 320 + (i % 2 ? -1 : 1) * (t.pattern === "winding" ? 64 : 32),
      })),
      { x: 928, y: 320 },
    ];
  } else if (t.pattern === "clearing") {
    anchors = [
      { x: 240, y: 128 },
      { x: 784, y: 128 },
      { x: 240, y: 480 },
      { x: 784, y: 480 },
      { x: 416, y: 144 },
      { x: 608, y: 464 },
    ];
  } else if (t.pattern === "scatter") {
    anchors = [
      { x: 240, y: 144 },
      { x: 448, y: 112 },
      { x: 720, y: 192 },
      { x: 848, y: 128 },
      { x: 288, y: 480 },
      { x: 560, y: 416 },
      { x: 784, y: 480 },
    ];
  } else if (t.pattern === "ruins") {
    anchors = [
      { x: 256, y: 176 },
      { x: 384, y: 112 },
      { x: 640, y: 112 },
      { x: 768, y: 176 },
      { x: 256, y: 448 },
      { x: 384, y: 496 },
      { x: 640, y: 496 },
      { x: 768, y: 448 },
    ];
  } else {
    anchors = [240, 384, 640, 784].flatMap((x) => [
      { x, y: 128 },
      { x, y: 464 },
    ]);
  }
  return { anchors, route };
}
