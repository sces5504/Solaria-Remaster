/** Isolate an atlas cell's actor from disconnected artwork spilling in from
 * neighbouring cells. Keep nearby detached hands/weapons and translucent edges.
 * Original PNGs stay untouched; this is a one-time texture sampling boundary. */
export function isolateActor(
  data: Uint8ClampedArray,
  width: number,
  height: number,
) {
  const seen = new Uint8Array(width * height);
  const components: {
    pixels: number[];
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  }[] = [];
  for (let start = 0; start < seen.length; start++) {
    if (seen[start] || data[start * 4 + 3] < 12) continue;
    const pixels = [start];
    seen[start] = 1;
    let minX = width,
      minY = height,
      maxX = 0,
      maxY = 0;
    for (let cursor = 0; cursor < pixels.length; cursor++) {
      const index = pixels[cursor],
        x = index % width,
        y = Math.floor(index / width);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx,
            ny = y + dy,
            next = ny * width + nx;
          if (
            nx < 0 ||
            nx >= width ||
            ny < 0 ||
            ny >= height ||
            seen[next] ||
            data[next * 4 + 3] < 12
          )
            continue;
          seen[next] = 1;
          pixels.push(next);
        }
    }
    components.push({ pixels, minX, minY, maxX, maxY });
  }
  if (!components.length) return 0;
  const body = components.reduce((a, b) =>
    a.pixels.length > b.pixels.length ? a : b,
  );
  const keep = new Uint8Array(width * height);
  let removed = 0;
  for (const part of components) {
    const gap = Math.hypot(
      Math.max(0, body.minX - part.maxX, part.minX - body.maxX),
      Math.max(0, body.minY - part.maxY, part.minY - body.maxY),
    );
    const attached =
      part === body ||
      (gap <= 3 && part.pixels.length >= 2) ||
      (gap <= 7 && part.pixels.length >= body.pixels.length * 0.1);
    if (attached) for (const index of part.pixels) keep[index] = 1;
    else removed += part.pixels.length;
  }
  // Keep faint antialiased pixels immediately surrounding retained material.
  for (let index = 0; index < seen.length; index++) {
    if (keep[index] || !data[index * 4 + 3]) continue;
    const x = index % width,
      y = Math.floor(index / width);
    let edge = false;
    if (data[index * 4 + 3] < 12)
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          if (
            x + dx >= 0 &&
            x + dx < width &&
            y + dy >= 0 &&
            y + dy < height &&
            keep[(y + dy) * width + x + dx]
          )
            edge = true;
        }
    if (!edge) data[index * 4 + 3] = 0;
  }
  return removed;
}
