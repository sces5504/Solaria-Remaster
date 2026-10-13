import type { GroundFeature } from "../game/data/room-themes";
import type { BiomeId } from "../game/data/biomes";

/** Authored room details are floor only: no collision, damage or cover objects. */
export function paintRoomGround(
  ctx: CanvasRenderingContext2D,
  features: GroundFeature[],
  biome: BiomeId,
) {
  const colors: Record<GroundFeature["kind"], string[]> = {
    gravel: ["#50554d", "#747969", "#858878"],
    flowers: ["#426343", "#7b9159", "#b79965", "#866b9b"],
    dunes: ["#9b7947", "#b08c58", "#70573c"],
    snow: ["#688a99", "#92adba", "#acc1ca"],
    ash: ["#342d2d", "#59504a", "#766858"],
    leaves: ["#203f30", "#426a3b", "#67904a"],
    fungi: ["#324e37", "#746284", "#a28e65"],
    cracks: ["#25222c", "#675265", "#7c5a76"],
    veins: ["#4b2336", "#714353", "#885564"],
    stars: ["#42526b", "#697f99", "#a0b5c3"],
    paving:
      biome === "castle"
        ? ["#30343a", "#53565a", "#626567"]
        : biome === "stars"
          ? ["#344253", "#526681", "#688299"]
          : ["#4c5248", "#686c5c", "#797c6e"],
    rubble: ["#3f4444", "#69706b", "#858677"],
  };
  ctx.save();
  ctx.beginPath();
  ctx.rect(32, 64, 960, 544);
  ctx.clip();
  for (const feature of features) {
    let state = feature.seed >>> 0 || 1;
    const random = () => {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      return (state >>> 0) / 4294967296;
    };
    const centers = feature.path
      ? feature.points.flatMap((p, i) => {
          if (!i) return [p];
          const a = feature.points[i - 1],
            count = Math.ceil(Math.hypot(p.x - a.x, p.y - a.y) / 12);
          return Array.from({ length: count }, (_, j) => ({
            x: a.x + ((p.x - a.x) * (j + 1)) / count,
            y: a.y + ((p.y - a.y) * (j + 1)) / count,
          }));
        })
      : feature.points;
    for (const center of centers) {
      const density = feature.path ? 9 : 64;
      for (let i = 0; i < density; i++) {
        const x =
          Math.round((center.x + (random() - 0.5) * feature.width) / 2) * 2;
        const y =
          Math.round((center.y + (random() - 0.5) * feature.width * 0.6) / 2) *
          2;
        ctx.fillStyle =
          colors[feature.kind][
            Math.floor(random() * colors[feature.kind].length)
          ];
        ctx.globalAlpha =
          feature.kind === "paving"
            ? 0.34
            : feature.kind === "stars"
              ? 0.48
              : 0.38;
        if (feature.kind === "paving") {
          const tx = Math.round(x / 24) * 24,
            ty = Math.round(y / 16) * 16;
          ctx.fillRect(tx + 1, ty + 1, 22, 12);
          ctx.fillStyle = colors.paving[0];
          ctx.fillRect(tx + 1, ty + 12, 22, 2);
        } else if (
          feature.kind === "leaves" ||
          feature.kind === "flowers" ||
          feature.kind === "fungi"
        ) {
          ctx.fillRect(x, y, 4 + Math.floor(random() * 3) * 2, 2);
          ctx.fillRect(x + 2, y - 2, 4, 2);
          if (feature.kind === "flowers" && i % 6 === 0) {
            ctx.globalAlpha = 0.64;
            ctx.fillRect(x + 2, y - 4, 2, 2);
          }
          if (feature.kind === "fungi" && i % 5 === 0) {
            ctx.fillRect(x + 2, y + 2, 2, 4);
            ctx.fillRect(x, y - 2, 8, 2);
          }
        } else if (feature.kind === "cracks" || feature.kind === "veins") {
          ctx.fillRect(x, y, 2, 8);
          ctx.fillRect(x + 2, y + 6, 6, 2);
          ctx.fillRect(x + 6, y + 8, 2, 4);
        } else if (feature.kind === "stars") {
          ctx.fillRect(x, y, 2, 2);
          if (i % 7 === 0) {
            ctx.globalAlpha = 0.18;
            ctx.fillRect(x - 2, y, 6, 2);
            ctx.fillRect(x, y - 2, 2, 6);
          }
        } else if (
          feature.kind === "dunes" ||
          feature.kind === "snow" ||
          feature.kind === "ash"
        ) {
          ctx.globalAlpha = 0.14;
          ctx.fillRect(x, y, 12 + random() * 18, 2);
          ctx.fillRect(x + 4, y + 2, 14, 2);
        } else {
          ctx.fillRect(
            x,
            y,
            2 + Math.floor(random() * 4) * 2,
            2 + Math.floor(random() * 2) * 2,
          );
        }
      }
    }
  }
  ctx.restore();
}

/** Pixel foliage, shaded stems and leaf blades; decorative and non-colliding. */
export function grassCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = 96;
  canvas.height = 56;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  let state = 8167;
  const random = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
  ctx.fillStyle = "#102f25";
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < 45; i++)
    ctx.fillRect(12 + random() * 70, 36 + random() * 12, 8, 3);
  ctx.globalAlpha = 1;
  for (let i = 0; i < 65; i++) {
    const x = Math.round(12 + random() * 72),
      y = Math.round(30 + random() * 14),
      height = Math.round(8 + random() * 17),
      lean = random() < 0.5 ? -1 : 1;
    ctx.fillStyle = ["#244b2c", "#365f32", "#4b7540", "#638c49"][i % 4];
    for (let j = 0; j < height; j += 2)
      ctx.fillRect(
        x + Math.floor(j * 0.23) * lean,
        y - j,
        Math.max(1, 4 - Math.floor(j / 7)),
        2,
      );
    ctx.fillStyle = i % 3 ? "#769b50" : "#8ca764";
    ctx.fillRect(x + lean * 2, y - height + 2, 1, 4);
    if (i % 3 === 0) {
      ctx.fillStyle = "#50783c";
      ctx.fillRect(x - 4, y - 5, 5, 2);
      ctx.fillRect(x - 6, y - 7, 4, 2);
    }
  }
  return canvas;
}
