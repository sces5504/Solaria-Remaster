/** Budget only additive glow sprites; authored art, shadows and danger markers stay intact. */
export interface GlowSample {
  x: number;
  y: number;
  radius: number;
  alpha: number;
}
export const GLOW_EXPOSURE_LIMIT = 0.65;
export const GLOW_GRID_SIZE = 32 * 20;
const cell = 32,
  margin = (Math.SQRT2 * cell) / 2;
// Matches the existing glow texture's four alpha stops.
const falloff = (t: number) =>
  t < 0.2
    ? 0.69 + ((0.333 - 0.69) * t) / 0.2
    : t < 0.55
      ? 0.333 + ((0.078 - 0.333) * (t - 0.2)) / 0.35
      : (0.078 * (1 - t)) / 0.45;
function samples(g: GlowSample, visit: (i: number, weight: number) => void) {
  const reach = g.radius + margin;
  for (
    let y = Math.max(0, Math.floor((g.y - reach) / cell));
    y <= Math.min(19, Math.floor((g.y + reach) / cell));
    y++
  )
    for (
      let x = Math.max(0, Math.floor((g.x - reach) / cell));
      x <= Math.min(31, Math.floor((g.x + reach) / cell));
      x++
    ) {
      // Account for every pixel in this cell, rather than missing close lights between samples.
      const d = Math.max(
        0,
        Math.hypot(x * cell + cell / 2 - g.x, y * cell + cell / 2 - g.y) -
          margin,
      );
      if (d < g.radius) visit(y * 32 + x, falloff(d / g.radius));
    }
}
export function glowExposureScales(
  glows: readonly GlowSample[],
  grid = new Float32Array(GLOW_GRID_SIZE),
) {
  grid.fill(0);
  for (const g of glows)
    samples(g, (i, w) => {
      grid[i] += g.alpha * w;
    });
  let peak = 0;
  for (const v of grid) peak = Math.max(peak, v);
  const scales = glows.map((g) => {
    let demand = 0;
    samples(g, (i) => {
      demand = Math.max(demand, grid[i]);
    });
    return demand > GLOW_EXPOSURE_LIMIT ? GLOW_EXPOSURE_LIMIT / demand : 1;
  });
  return { scales, peak };
}
