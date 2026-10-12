import type { Run } from "../game/core/types";
// Render-only recoil: never changes world coordinates, collision or input mapping.
export function cameraFeedback(r: Run, enabled = true) {
  let strength = 0;
  if (enabled)
    for (const v of r.visuals) {
      const remaining = (v.until - r.time) / (v.duration || 0.3);
      const amount =
        v.kind === "impact"
          ? v.value
          : v.kind === "block"
            ? 1.8
            : ["burst", "thunder"].includes(v.kind) && v.radius >= 65
              ? 1.3
              : 0;
      strength = Math.max(
        strength,
        amount * Math.max(0, Math.min(1, remaining)) ** 2,
      );
    }
  strength = Math.min(3.5, strength);
  if (strength === 0) return { x: 0, y: 0 };
  return {
    x: Math.sin(r.time * 173) * strength,
    y: Math.cos(r.time * 137) * strength * 0.7,
  };
}
