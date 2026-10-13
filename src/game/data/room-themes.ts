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
  | "scatter"
  | "crescent"
  | "steps"
  | "islands"
  | "fan"
  | "braid"
  | "fork";
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
    theme(
      "月牙林灣",
      "crescent",
      ["tree", "rock"],
      "flowers",
      "none",
      "gravel",
    ),
    theme("階田花徑", "steps", ["tree", "rock"], "flowers", "none", "gravel"),
    theme(
      "雙島芳洲",
      "islands",
      ["tree", "rock"],
      "flowers",
      "mirror",
      "gravel",
    ),
    theme("風扇樹列", "fan", ["tree", "rock"], "flowers", "none", "gravel"),
    theme("交織溪庭", "braid", ["tree", "rock"], "flowers", "none", "gravel"),
    theme("岔路古木", "fork", ["tree", "rock"], "flowers", "none", "gravel"),
  ],
  desert: [
    theme("流砂環丘", "ring", ["rock"], "dunes"),
    theme("砂柱雙岸", "banks", ["pillar", "rock"], "dunes", "banks"),
    theme("風蝕石脊", "ridge", ["rock"], "gravel", "none", "gravel"),
    theme("三重綠洲", "three", ["tree", "rock"], "leaves", "three"),
    theme("蜿蜒砂峽", "winding", ["rock"], "dunes", "none", "gravel"),
    theme("日輪廢墟", "ruins", ["pillar", "rock"], "rubble", "none", "paving"),
    theme(
      "弦月砂灣",
      "crescent",
      ["rock", "pillar"],
      "dunes",
      "none",
      "gravel",
    ),
    theme("層階砂臺", "steps", ["rock", "pillar"], "dunes", "none", "gravel"),
    theme(
      "雙島綠洲",
      "islands",
      ["rock", "pillar"],
      "dunes",
      "mirror",
      "gravel",
    ),
    theme("放射石扇", "fan", ["rock", "pillar"], "dunes", "none", "gravel"),
    theme("交織沙脊", "braid", ["rock", "pillar"], "dunes", "none", "gravel"),
    theme("分岔石門", "fork", ["rock", "pillar"], "dunes", "none", "gravel"),
  ],
  icefield: [
    theme("冰湖環道", "ring", ["rock", "tree"], "snow", "center", "gravel"),
    theme("雪幕雙嶺", "banks", ["rock", "tree"], "snow"),
    theme("碎晶迷徑", "ridge", ["rock", "pillar"], "gravel", "none", "gravel"),
    theme("三座霜庭", "three", ["pillar", "tree"], "snow"),
    theme("冰川寬谷", "winding", ["rock"], "snow", "banks"),
    theme("極光雪野", "clearing", ["tree", "rock"], "snow"),
    theme("霜月冰灣", "crescent", ["rock", "pillar"], "snow", "none", "gravel"),
    theme("階雪晶臺", "steps", ["rock", "pillar"], "snow", "none", "gravel"),
    theme(
      "雙島霜澤",
      "islands",
      ["rock", "pillar"],
      "snow",
      "mirror",
      "gravel",
    ),
    theme("冰晶扇陣", "fan", ["rock", "pillar"], "snow", "none", "gravel"),
    theme("交織雪嶺", "braid", ["rock", "pillar"], "snow", "none", "gravel"),
    theme("岔谷冰門", "fork", ["rock", "pillar"], "snow", "none", "gravel"),
  ],
  volcano: [
    theme("熔池環岸", "ring", ["rock"], "cracks", "center"),
    theme("黑曜雙堤", "banks", ["rock", "pillar"], "ash", "banks"),
    theme("錯位熱孔", "scatter", ["rock"], "cracks"),
    theme("三座熔臺", "three", ["rock", "pillar"], "ash", "three"),
    theme("玄岩折谷", "winding", ["rock"], "gravel", "none", "gravel"),
    theme("灰燼曠野", "clearing", ["rock"], "ash"),
    theme("月弧熔灣", "crescent", ["rock", "pillar"], "ash", "none", "gravel"),
    theme("階層火臺", "steps", ["rock", "pillar"], "ash", "none", "gravel"),
    theme("雙島熔湖", "islands", ["rock", "pillar"], "ash", "mirror", "gravel"),
    theme("噴岩扇丘", "fan", ["rock", "pillar"], "ash", "none", "gravel"),
    theme("交織玄脊", "braid", ["rock", "pillar"], "ash", "none", "gravel"),
    theme("岔流灰門", "fork", ["rock", "pillar"], "ash", "none", "gravel"),
  ],
  jungle: [
    theme("巨根環庭", "ring", ["tree"], "leaves"),
    theme("藤蔓雙廊", "avenue", ["tree"], "leaves", "none", "leaves"),
    theme("層疊花圃", "ridge", ["tree", "rock"], "flowers"),
    theme("三座孢林", "three", ["tree"], "fungi"),
    theme("盤根曲徑", "winding", ["tree", "rock"], "leaves", "none", "gravel"),
    theme("林間祭壇", "ruins", ["pillar", "tree"], "fungi", "none", "paving"),
    theme("月牙藤灣", "crescent", ["tree", "rock"], "fungi", "none", "gravel"),
    theme("層階蕨庭", "steps", ["tree", "rock"], "fungi", "none", "gravel"),
    theme("雙島孢澤", "islands", ["tree", "rock"], "fungi", "mirror", "gravel"),
    theme("展葉林扇", "fan", ["tree", "rock"], "fungi", "none", "gravel"),
    theme("交織巨根", "braid", ["tree", "rock"], "fungi", "none", "gravel"),
    theme("分岔藤門", "fork", ["tree", "rock"], "fungi", "none", "gravel"),
  ],
  corruption: [
    theme("裂口環臺", "ring", ["rock", "pillar"], "cracks", "center"),
    theme("虛空雙岸", "banks", ["rock"], "cracks", "banks"),
    theme("傾斜斷柱", "ridge", ["pillar", "rock"], "rubble"),
    theme("三重殘墟", "three", ["pillar", "rock"], "rubble"),
    theme("裂隙迴廊", "winding", ["pillar"], "cracks", "banks", "paving"),
    theme("無光祭庭", "ruins", ["pillar"], "cracks", "none", "paving"),
    theme(
      "殘月裂灣",
      "crescent",
      ["pillar", "rock"],
      "cracks",
      "none",
      "paving",
    ),
    theme("斷階祭臺", "steps", ["pillar", "rock"], "cracks", "none", "paving"),
    theme(
      "雙島虛澤",
      "islands",
      ["pillar", "rock"],
      "cracks",
      "mirror",
      "paving",
    ),
    theme("碎柱扇陣", "fan", ["pillar", "rock"], "cracks", "none", "paving"),
    theme("交織裂脊", "braid", ["pillar", "rock"], "cracks", "none", "paving"),
    theme("岔隙幽門", "fork", ["pillar", "rock"], "cracks", "none", "paving"),
  ],
  crimson: [
    theme("血池環岸", "ring", ["rock"], "veins", "center"),
    theme("雙庭血脈", "banks", ["pillar", "rock"], "veins", "mirror"),
    theme("血晶交錯", "ridge", ["rock"], "veins"),
    theme("三重骨庭", "three", ["pillar", "rock"], "rubble"),
    theme("猩紅曲廊", "winding", ["pillar"], "veins", "none", "paving"),
    theme("赤月廣場", "clearing", ["pillar"], "veins", "none", "paving"),
    theme(
      "赤弦血灣",
      "crescent",
      ["pillar", "rock"],
      "veins",
      "none",
      "paving",
    ),
    theme("骨階赤臺", "steps", ["pillar", "rock"], "veins", "none", "paving"),
    theme(
      "雙島血澤",
      "islands",
      ["pillar", "rock"],
      "veins",
      "mirror",
      "paving",
    ),
    theme("骨柱扇庭", "fan", ["pillar", "rock"], "veins", "none", "paving"),
    theme("交織血脊", "braid", ["pillar", "rock"], "veins", "none", "paving"),
    theme("岔脈骨門", "fork", ["pillar", "rock"], "veins", "none", "paving"),
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
    theme(
      "月弧星灣",
      "crescent",
      ["pillar", "rock"],
      "stars",
      "none",
      "paving",
    ),
    theme("階層晶臺", "steps", ["pillar", "rock"], "stars", "none", "paving"),
    theme(
      "雙島星澤",
      "islands",
      ["pillar", "rock"],
      "stars",
      "mirror",
      "paving",
    ),
    theme("放射星扇", "fan", ["pillar", "rock"], "stars", "none", "paving"),
    theme("交織星軌", "braid", ["pillar", "rock"], "stars", "none", "paving"),
    theme("岔路星門", "fork", ["pillar", "rock"], "stars", "none", "paving"),
  ],
  castle: [
    theme("王座環廊", "ring", ["pillar"], "paving", "none", "paving"),
    theme("雙列石柱", "avenue", ["pillar"], "paving", "none", "paving"),
    theme("錯位雕像", "ridge", ["pillar", "rock"], "rubble", "none", "paving"),
    theme("三座內庭", "three", ["pillar"], "paving", "none", "paving"),
    theme("黑曜長廊", "avenue", ["pillar", "rock"], "paving", "none", "paving"),
    theme("蝕日大殿", "ruins", ["pillar"], "paving", "none", "paving"),
    theme(
      "弦月柱庭",
      "crescent",
      ["pillar", "rock"],
      "paving",
      "none",
      "paving",
    ),
    theme("階層露臺", "steps", ["pillar", "rock"], "paving", "none", "paving"),
    theme(
      "雙座花庭",
      "islands",
      ["pillar", "rock"],
      "paving",
      "none",
      "paving",
    ),
    theme("放射柱廳", "fan", ["pillar", "rock"], "paving", "none", "paving"),
    theme("交織石廊", "braid", ["pillar", "rock"], "paving", "none", "paving"),
    theme("分岔門庭", "fork", ["pillar", "rock"], "paving", "none", "paving"),
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
  } else if (t.pattern === "crescent") {
    anchors = Array.from({ length: 10 }, (_, i) => {
      const a = -Math.PI * 0.8 + (i * Math.PI * 1.6) / 9;
      return { x: 480 + Math.cos(a) * 270, y: 320 + Math.sin(a) * 200 };
    });
  } else if (t.pattern === "steps") {
    anchors = [240, 384, 528, 672, 816].flatMap((x, i) => [
      { x, y: 120 + i * 20 },
      { x, y: 440 + i * 16 },
    ]);
  } else if (t.pattern === "islands") {
    anchors = [288, 736].flatMap((x) =>
      [128, 464].flatMap((y) => [-56, 56].map((dx) => ({ x: x + dx, y }))),
    );
  } else if (t.pattern === "fan") {
    anchors = [240, 376, 512, 648, 784].flatMap((x, i) => [
      { x, y: 112 + Math.abs(i - 2) * 44 },
      { x, y: 496 - Math.abs(i - 2) * 36 },
    ]);
  } else if (t.pattern === "braid") {
    anchors = [240, 384, 528, 672, 816].flatMap((x, i) => [
      { x, y: 128 + (i % 2) * 80 },
      { x, y: 496 - (i % 2) * 80 },
    ]);
    route = [
      { x: 112, y: 320 },
      ...[288, 448, 608, 768].map((x, i) => ({
        x,
        y: 320 + (i % 2 ? -48 : 48),
      })),
      { x: 928, y: 320 },
    ];
  } else if (t.pattern === "fork") {
    anchors = [
      { x: 240, y: 160 },
      { x: 240, y: 464 },
      { x: 400, y: 208 },
      { x: 400, y: 432 },
      { x: 592, y: 144 },
      { x: 592, y: 480 },
      { x: 784, y: 112 },
      { x: 784, y: 512 },
    ];
  } else {
    anchors = [240, 384, 640, 784].flatMap((x) => [
      { x, y: 128 },
      { x, y: 464 },
    ]);
  }
  // Bounded translation preserves each motif, straight rows and fixed entry/exit.
  let mixed = Math.imul(seed ^ (seed >>> 16), 0x85ebca6b);
  mixed = Math.imul(mixed ^ (mixed >>> 13), 0xc2b2ae35);
  const variant = ((mixed ^ (mixed >>> 16)) >>> 0) % 9;
  const dx = ((variant % 3) - 1) * 16;
  const dy = (Math.floor(variant / 3) - 1) * 16;
  anchors = anchors.map((p) => ({ x: p.x + dx, y: p.y + dy }));
  route = route.map((p, i) =>
    i === 0 || i === route.length - 1 ? p : { x: p.x + dx, y: p.y + dy },
  );
  return { anchors, route };
}
