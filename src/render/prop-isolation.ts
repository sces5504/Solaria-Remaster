import { isolateActor } from "./actor-isolation";
/** The palm above the ice obelisk crosses its atlas cell and touches the tip.
 * Separate that known top seam before connected-component isolation. */
export function isolateProp(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  name: string,
) {
  let removed = 0;
  if (name === "icefield-pillar")
    for (let y = 0; y < Math.ceil(height * 0.18); y++)
      for (let x = 0; x < width; x++) {
        const at = (y * width + x) * 4;
        if (!data[at + 3]) continue;
        const warm =
          data[at] > data[at + 2] * 1.2 && data[at + 1] > data[at + 2] * 1.1;
        const outside = x < width * 0.38 || x > width * 0.7;
        if (warm || outside) {
          data[at + 3] = 0;
          removed++;
        }
      }
  if (name === "volcano-pillar")
    for (let y = 0; y < Math.ceil(height * 0.18); y++)
      for (let x = 0; x < width; x++) {
        const at = (y * width + x) * 4;
        const cold =
          data[at + 2] > data[at] * 0.9 && data[at + 2] > data[at + 1] * 0.95;
        const snow = data[at] > 150 && data[at + 1] > 150 && data[at + 2] > 150;
        if (data[at + 3] && (cold || snow)) {
          data[at + 3] = 0;
          removed++;
        }
      }
  if (name === "jungle-tree")
    for (let y = 0; y < Math.ceil(height * 0.16); y++)
      for (let x = 0; x < width; x++) {
        const at = (y * width + x) * 4;
        const ice =
          data[at + 2] > data[at] * 1.05 && data[at + 2] > data[at + 1] * 0.9;
        const snow = data[at] > 120 && data[at + 1] > 120 && data[at + 2] > 120;
        if (data[at + 3] && (ice || snow)) {
          data[at + 3] = 0;
          removed++;
        }
      }
  const clean = ["icefield-pillar", "volcano-pillar"].includes(name)
    ? data.slice()
    : null;
  const isolated = isolateActor(data, width, height);
  // Single blue tip pixels may detach when the touching palm seam is removed.
  if (clean)
    for (let y = 0; y < Math.ceil(height * 0.18); y++)
      for (let x = 0; x < width; x++) {
        const at = (y * width + x) * 4;
        const tipColor =
          name === "icefield-pillar"
            ? clean[at + 2] >= clean[at] * 1.15 &&
              clean[at + 2] >= clean[at + 1] * 0.95
            : clean[at] > clean[at + 2] * 1.2 &&
              clean[at + 1] > clean[at + 2] * 1.1;
        if (data[at + 3] || !clean[at + 3] || !tipColor) continue;
        let near = false;
        for (let dy = -3; dy <= 3; dy++)
          for (let dx = -3; dx <= 3; dx++) {
            const nx = x + dx,
              ny = y + dy;
            if (
              nx >= 0 &&
              nx < width &&
              ny >= 0 &&
              ny < height &&
              dx * dx + dy * dy <= 9 &&
              data[(ny * width + nx) * 4 + 3]
            )
              near = true;
          }
        if (near) data[at + 3] = clean[at + 3];
      }
  return removed + isolated;
}
