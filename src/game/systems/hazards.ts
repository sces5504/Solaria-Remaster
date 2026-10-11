import type { Run } from "../core/types";
import { distance, angle, seedFor, random } from "../core/primitives";
import { currentBiome, enemyDamageScale } from "../data/biomes";
import { area, hurt } from "./combat";
import { legal } from "./geometry";

export function createHazards(r: Run) {
  r.hazards = [];
  const definition = currentBiome(r);
  if (!definition.hazard) return;
  const rng = { rng: seedFor(r.seed, r.room * 331) };
  for (let i = 0; i < 3; i++) {
    let point = { x: 0, y: 0 };
    for (let retry = 0; retry < 100; retry++) {
      point = { x: 250 + random(rng) * 600, y: 112 + random(rng) * 432 };
      if (legal(r, point, 45) && distance(point, r.player) > 180) break;
    }
    if (!legal(r, point, 45)) continue;
    r.hazards.push({
      ...point,
      kind: definition.hazard,
      radius: definition.hazard === "blood" ? 48 : 38,
      next: r.time + definition.period + i * 0.8,
    });
  }
}
export function updateHazards(r: Run) {
  r.player.terrainSlow = 1;
  for (const h of r.hazards ?? []) {
    const touching = distance(h, r.player) < h.radius + r.player.radius;
    if (touching && (h.kind === "sand" || h.kind === "frost"))
      r.player.terrainSlow = Math.min(
        r.player.terrainSlow,
        h.kind === "sand" ? 0.72 : 0.8,
      );
    if (r.phase !== "COMBAT" || r.time < h.next) continue;
    h.next =
      r.time + currentBiome(r).period * (r.modifiers.includes(6) ? 0.8 : 1);
    if (h.kind === "sand" || h.kind === "frost") continue;
    if (h.kind === "blood") {
      if (touching) hurt(r, 6 * enemyDamageScale(r));
      continue;
    }
    if (h.kind === "statue") {
      area(r, h, 1100, 6 * enemyDamageScale(r), 0.8, 0.6, 0.2, null, {
        owner: -1,
        shape: "beam",
        width: 8,
        angle: angle(h, r.player),
      });
    } else {
      const target = h.kind === "meteor" ? { x: r.player.x, y: r.player.y } : h;
      area(
        r,
        target,
        h.kind === "rift" ? 65 : h.radius,
        6 * enemyDamageScale(r),
        0.7,
        h.kind === "thorns" ? 0.8 : 0.01,
        0.4,
        null,
        { owner: -1, effect: h.kind === "meteor" ? "thunder" : undefined },
      );
    }
  }
}
