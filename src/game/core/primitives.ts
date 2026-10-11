export const DT = 1 / 60;
export type Vec = { x: number; y: number };
export const distance = (a: Vec, b: Vec) => Math.hypot(a.x - b.x, a.y - b.y);
export const angle = (a: Vec, b: Vec) => Math.atan2(b.y - a.y, b.x - a.x);
export const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));
export const clone = <T>(v: T): T => structuredClone(v);
export function random(state: { rng: number }) {
  let x = state.rng | 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  state.rng = x >>> 0;
  return state.rng / 4294967296;
}
export function seedFor(seed: number, stream: number) {
  return (seed ^ Math.imul(stream + 1, 0x9e3779b9)) >>> 0 || 1;
}
export function segmentDistance(p: Vec, a: Vec, b: Vec) {
  const dx = b.x - a.x,
    dy = b.y - a.y;
  const t = clamp(
    ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1),
    0,
    1,
  );
  return distance(p, { x: a.x + t * dx, y: a.y + t * dy });
}
export class FixedClock {
  private accumulator = 0;
  advance(seconds: number, paused: boolean, step: () => void) {
    if (paused) {
      this.accumulator = 0;
      return;
    }
    this.accumulator += Math.min(seconds, 0.1);
    while (this.accumulator >= DT) {
      step();
      this.accumulator -= DT;
    }
  }
  reset() {
    this.accumulator = 0;
  }
}
