import { Texture, Assets, Rectangle } from "pixi.js";
import type { Run } from "../game/core/types";
import { assetURL } from "./asset-url";
export const styles = [
  {
    id: "adventure",
    title: "精雕冒險",
    tag: "清楚輪廓 · 溫暖色階",
    description:
      "俐落外緣、成簇葉叢與柔和金色亮點。保留經典像素冒險感，優先照顧戰鬥辨識。",
    pixels: 96,
    shade: 0.08,
    accent: "#d9bc79",
  },
  {
    id: "gothic",
    title: "暗黑哥德",
    tag: "雕刻材質 · 集中發光",
    description:
      "修長銳利的身形、古銅雕花與深色石材。亮點集中在眼睛、熔核與術式，氣氛更沉著。",
    pixels: 128,
    shade: 0.24,
    accent: "#b997d2",
  },
  {
    id: "sculpted",
    title: "立體精緻",
    tag: "立體受光 · 細緻質感",
    description:
      "以明暗切面塑造厚度，減少黑色外框。金屬、皮毛與岩石有更細的高光，呈現精緻微縮感。",
    pixels: 160,
    shade: 0.06,
    accent: "#8fcabb",
  },
] as const;
export type StyleId = (typeof styles)[number]["id"];
const names = [
  "mage",
  "wolf",
  "slime",
  "wolfking",
  "goatking",
  "tree",
  "mon12",
  "mon13",
  "mon14",
  "boss07",
  "boss08",
  "volcano-rock",
  "mon27",
  "mon28",
  "mon29",
  "boss17",
  "boss18",
  "castle-pillar",
  "floor-meadow",
  "floor-volcano",
  "floor-castle",
  "rock",
  "lake",
  "door",
];
export interface Artwork {
  textures: Record<string, Texture>;
  source: HTMLImageElement;
  ground: (r: Run) => Texture;
}
export async function loadArtwork(
  style: (typeof styles)[number],
): Promise<Artwork> {
  const url = assetURL(`assets/art-lab/${style.id}.png`);
  const raw = await Assets.load<Texture>(url);
  // Rendering resolution is intentional: each direction has its own pixel density.
  const source = new Image();
  source.src = url;
  await source.decode();
  const canvas = document.createElement("canvas");
  canvas.width = style.pixels * 6;
  canvas.height = style.pixels * 4;
  const context = canvas.getContext("2d")!;
  context.imageSmoothingEnabled = false;
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  const atlas = Texture.from(canvas);
  atlas.source.scaleMode = "nearest";
  const textures: Record<string, Texture> = {};
  names.forEach(
    (name, i) =>
      (textures[name] = new Texture({
        source: atlas.source,
        frame: new Rectangle(
          (i % 6) * style.pixels + 2,
          Math.floor(i / 6) * style.pixels + 2,
          style.pixels - 4,
          style.pixels - 4,
        ),
      })),
  );
  // The sample covers these exact identities; other game assets retain their originals.
  textures.pillar = textures["castle-pillar"];
  textures.mon01 = textures.wolf;
  textures.mon02 = textures.slime;
  textures["castle-rock"] = textures.rock;
  // A molten basin is rendered from the same sampled rock material, never blue water.
  const lava = document.createElement("canvas");
  lava.width = lava.height = 64;
  const l = lava.getContext("2d")!;
  l.imageSmoothingEnabled = false;
  l.fillStyle = "#241d24";
  l.fillRect(2, 6, 60, 50);
  l.drawImage(source, 256 + 34, 798, 186, 186, 0, 0, 64, 64);
  l.fillStyle = "#782e26";
  l.fillRect(6, 10, 52, 44);
  l.fillStyle = "#ed6927";
  l.fillRect(9, 13, 46, 38);
  for (let y = 14; y < 50; y += 3)
    for (let x = 10; x < 54; x += 3) {
      const n = (x * 17 + y * 31) % 11;
      l.fillStyle = n < 4 ? "#ffc766" : n < 7 ? "#ff9837" : "#d3421f";
      l.fillRect(x, y, 3, 3);
    }
  textures["volcano-lake"] = Texture.from(lava);
  textures["volcano-lake"].source.scaleMode = "nearest";
  textures["castle-tree"] = textures.tree;
  textures["volcano-pillar"] = textures["volcano-rock"];
  raw.source.scaleMode = "nearest";
  return {
    textures,
    source,
    ground(r) {
      const c = document.createElement("canvas");
      c.width = 512;
      c.height = 320;
      const ctx = c.getContext("2d")!;
      ctx.imageSmoothingEnabled = false;
      const biome = r.biome ?? "meadow";
      const column = biome === "meadow" ? 0 : biome === "volcano" ? 1 : 2;
      const colors =
        biome === "meadow"
          ? ["#193a30", "#708764", "#b1b282"]
          : biome === "volcano"
            ? ["#211c22", "#765044", "#db9157"]
            : ["#1b2029", "#465060", "#a99b7d"];
      ctx.fillStyle = colors[0];
      ctx.fillRect(0, 0, 512, 320);
      ctx.save();
      ctx.beginPath();
      ctx.rect(16, 32, 480, 272);
      ctx.clip();
      for (let y = 32; y < 304; y += 48)
        for (let x = 16; x < 496; x += 48) {
          ctx.save();
          ctx.translate(x + 24, y + 24);
          if (biome !== "castle")
            ctx.scale((x + y) % 3 ? 1 : -1, (x * y) % 5 ? 1 : -1);
          ctx.drawImage(
            source,
            column * 256 + 56,
            820,
            144,
            144,
            -24,
            -24,
            48,
            48,
          );
          ctx.restore();
        }
      // Quiet the ground so actors, hit flashes and danger remain legible.
      ctx.fillStyle = colors[0];
      ctx.globalAlpha = 0.28 + style.shade;
      ctx.fillRect(16, 32, 480, 272);
      ctx.globalAlpha = 1;
      if (biome !== "castle") {
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.beginPath();
        (r.route ?? []).forEach((p, i) =>
          i ? ctx.lineTo(p.x / 2, p.y / 2) : ctx.moveTo(p.x / 2, p.y / 2),
        );
        ctx.strokeStyle = colors[1];
        ctx.globalAlpha = 0.2;
        ctx.lineWidth = 25;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      if (biome === "volcano")
        for (const o of r.obstacles)
          if (o.kind === "lake") {
            const x = o.x / 2,
              y = o.y / 2,
              w = o.w / 2,
              h = o.h / 2;
            ctx.fillStyle = "#d95824";
            ctx.fillRect(x, y, w, h);
            ctx.fillStyle = "#ffbd51";
            ctx.fillRect(x + 4, y + 4, w - 8, h - 8);
          }
      ctx.restore();
      // Cut-stone boundary has the same collision footprint as the live arena.
      for (let x = 0; x < 512; x += 16) {
        ctx.fillStyle = colors[1];
        ctx.fillRect(x + 1, 27, 14, 5);
        ctx.fillRect(x + 1, 304, 14, 5);
        ctx.fillStyle = colors[2];
        ctx.globalAlpha = 0.35;
        ctx.fillRect(x + 2, 27, 12, 1);
        ctx.fillRect(x + 2, 304, 12, 1);
        ctx.globalAlpha = 1;
      }
      for (let y = 32; y < 304; y += 16) {
        ctx.fillStyle = colors[1];
        ctx.fillRect(11, y + 1, 5, 14);
        ctx.fillRect(496, y + 1, 5, 14);
      }
      const ground = Texture.from(c);
      ground.source.scaleMode = "nearest";
      return ground;
    },
  };
}
