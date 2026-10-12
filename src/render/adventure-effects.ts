import {
  abilityPresentation,
  type AbilityPresentation,
} from "./ability-presentation";
import { themeLightColor } from "./lighting";
import { Container, Sprite, Texture, type Graphics } from "pixi.js";
import type { Area, Projectile, Run, Visual } from "../game/core/types";
import { elementColor, bolt } from "./effects";

/** Retained pixel illustrations complement exact, unobscured danger geometry. */
export class AdventureEffects {
  readonly layer = new Container();
  private sprites: Sprite[] = [];
  private used = 0;
  private activeNames = new Set<string>();
  constructor(private textures: Record<string, Texture>) {}
  begin() {
    for (const sprite of this.sprites) sprite.visible = false;
    this.used = 0;
    this.activeNames.clear();
  }
  inspect() {
    return {
      retained: this.sprites.length,
      active: this.used,
      names: [...this.activeNames],
    };
  }
  stamp(
    name: string,
    x: number,
    y: number,
    w: number,
    h = w,
    alpha = 1,
    angle = 0,
    tint = 0xffffff,
  ) {
    this.activeNames.add(name);
    let s = this.sprites[this.used++];
    if (!s) {
      s = new Sprite();
      s.anchor.set(0.5);
      this.sprites.push(s);
      this.layer.addChild(s);
    }
    s.texture = this.textures[name];
    s.position.set(x, y);
    s.width = w;
    s.height = h;
    s.alpha = Math.max(0, Math.min(1, alpha));
    s.rotation = angle;
    s.tint = tint;
    s.visible = true;
  }
  flame(x: number, y: number, size: number, time: number, alpha = 1, seed = 0) {
    const pulse = 0.93 + Math.sin(time * 13 + seed) * 0.1;
    this.stamp(
      Math.floor(time * 9 + seed) % 2 ? "flame" : "flame-small",
      x,
      y - size * 0.32,
      size * 0.75,
      size * pulse,
      alpha,
    );
    for (let i = 0; i < 2; i++) {
      const t = (time * 0.9 + i * 0.43 + seed * 0.07) % 1;
      this.stamp(
        "ember",
        x + Math.sin(seed + i * 4 + t) * size * 0.18,
        y - size * t,
        5 + 4 * (1 - t),
        undefined,
        (1 - t) * alpha,
      );
    }
  }
  projectile(b: Projectile, r: Run) {
    const els =
        b.context?.elementMask ??
        b.enemyElements ??
        (b.enemyElement ? [b.enemyElement] : []),
      a = Math.atan2(b.vy, b.vx);
    // Mundane arrows retain their aimed shaft; each magical projectile has artwork.
    if (
      !els.length &&
      !b.enemy &&
      r.classId === "bow" &&
      ![75, 206, 217].includes(b.context?.sourceAbilityId ?? 0)
    )
      return false;
    if (
      b.enemy &&
      !b.enemyTheme &&
      !b.eventGlyph &&
      !els.length &&
      r.enemies.find((e) => e.id === b.owner)?.kind === 4
    )
      return false;
    const theme = b.enemyTheme;
    const source = b.context?.sourceAbilityId;
    const authoredProjectile: Record<number, string> = {
      21: "phoenix",
      25: "water-orb",
      32: "water-orb",
      35: "charged-splash",
      43: "sword-wave",
      75: "star-echo",
      206: "star-blade",
      217: "weapon-sword",
    };
    const name =
      authoredProjectile[source ?? 0] ??
      (b.eventGlyph === "gift"
        ? "gift"
        : b.eventGlyph === "ghost"
          ? "ghost"
          : b.eventGlyph === "comet"
            ? "meteor"
            : b.context?.sourceAbilityId === 217
              ? "weapon-sword"
              : b.context?.sourceAbilityId === 206
                ? "spark"
                : els.includes("lightning") || b.eventGlyph === "plasma"
                  ? "electric-orb"
                  : els.includes("ice") || theme === "icefield"
                    ? "ice-shard"
                    : els.includes("fire") ||
                        theme === "volcano" ||
                        theme === "sun"
                      ? "fireball"
                      : els.includes("water")
                        ? "water-orb"
                        : theme === "crimson"
                          ? "blood-orb"
                          : theme === "corruption"
                            ? "void-orb"
                            : "arcane-orb");
    const size = Math.max(
      source === 21 ? 42 : source === 43 ? 34 : 22,
      b.radius * 3.4,
    );
    const scale = b.context?.chainScale ?? 1,
      alpha = scale < 1 ? 0.65 : 1;
    this.stamp(
      name,
      b.x - Math.cos(a) * size * 0.18,
      b.y - Math.sin(a) * size * 0.18,
      size * 1.35,
      size,
      alpha,
      a,
    );
    // Short luminous fragments follow velocity; the collision head stays explicit.
    for (let i = 1; i <= 2; i++)
      this.stamp(
        "spark",
        b.x - Math.cos(a) * (9 + i * 7),
        b.y - Math.sin(a) * (9 + i * 7),
        8 - i * 2,
        undefined,
        alpha * (0.5 - i * 0.1),
        a,
        name === "electric-orb"
          ? 0x8bdcff
          : name === "fireball"
            ? 0xffc38c
            : 0xd8ddff,
      );
    return true;
  }
  area(r: Run, a: Area, g: Graphics) {
    if (r.time < a.starts || r.time > a.ends || a.effect === "steam") return;
    const els =
      a.effect === "thunder"
        ? ["lightning" as const]
        : (a.context?.elementMask ??
          a.enemyElements ??
          (a.enemyElement
            ? [a.enemyElement]
            : a.enemyTheme === "icefield"
              ? ["ice" as const]
              : a.enemyTheme === "volcano" || a.enemyTheme === "sun"
                ? ["fire" as const]
                : []));
    if (a.shape === "cone") {
      for (let i = 0; i < 13; i++) {
        const phase = ((r.time - a.starts) * 2 + i * 0.153) % 1;
        const angle = a.angle + Math.sin(i * 7.3) * a.width * 0.42;
        const dist = 12 + phase * (a.radius - 24);
        this.stamp(
          els.includes("ice")
            ? "ice-spike"
            : els.includes("water")
              ? "water-splash"
              : "fireball",
          a.x + Math.cos(angle) * dist,
          a.y + Math.sin(angle) * dist,
          28 + phase * 28,
          18 + phase * 24,
          0.8 - phase * 0.35,
          angle,
        );
      }
    } else if (a.shape !== "beam") {
      // Ongoing fields have one persistent motif, not a new full blast per tick.
      this.motif(
        abilityPresentation(a.ability, els, true),
        a.x,
        a.y,
        a.radius,
        r.time - a.starts,
        0.62,
        a.id,
        g,
      );
    }
  }
  private motif(
    kind: AbilityPresentation,
    x: number,
    y: number,
    radius: number,
    time: number,
    alpha: number,
    seed: number,
    g?: Graphics,
  ) {
    this.activeNames.add(`ability-${kind}`);
    const ring = {
      electric: "electric-ring",
      snow: "frost-wind",
      hail: "frost-wind",
      "fire-ring": "fire-ring",
      vortex: "water-swirl",
      "storm-vortex": "water-swirl",
      "tidal-pulse": "charged-splash",
      frostfire: "frostfire-ring",
      gravity: "gravity-swirl",
      arcane: "arcane-pulse",
      steam: "steam",
    }[kind as Exclude<AbilityPresentation, "meteor" | "explosion">];
    if (ring)
      this.stamp(
        ring,
        x,
        y,
        radius * 1.95,
        radius * 1.95,
        alpha * (kind === "steam" ? 0.2 : 0.48),
        time * (kind === "electric" ? 0.1 : 0.35),
      );
    const count = kind === "snow" || kind === "hail" ? 16 : 9;
    for (let i = 0; i < count; i++) {
      const angle =
        i * 2.39996 +
        seed * 0.3 +
        time * (kind === "vortex" || kind === "storm-vortex" ? 1.5 : 0.16);
      const phase = (time * 0.7 + i * 0.173) % 1;
      const distance =
        radius * (kind === "fire-ring" ? 0.85 : 0.32 + (i % 4) * 0.18);
      const px = x + Math.cos(angle) * distance,
        py = y + Math.sin(angle) * distance;
      if (
        kind === "electric" ||
        kind === "storm-vortex" ||
        kind === "tidal-pulse"
      ) {
        this.stamp("spark", px, py, 8, undefined, alpha, angle, 0x8bdeff);
        if (g && i % 2 === 0) {
          const inner = kind === "electric" ? 0.22 : 0.65;
          bolt(
            g,
            x + Math.cos(angle - 0.2) * distance * inner,
            y + Math.sin(angle - 0.2) * distance * inner,
            px,
            py,
            time + i,
            0x49baff,
            alpha,
            0.38,
          );
        }
        if (kind === "electric") continue;
      }
      if (kind === "snow" || kind === "hail" || kind === "frostfire") {
        if (kind === "frostfire" && i % 2)
          this.flame(px, py, 18, time, alpha, i);
        else {
          this.stamp(
            kind === "hail" ? "ice-spike" : "snowflake",
            px,
            py - (kind === "hail" ? 20 * (1 - phase) : phase * 9),
            kind === "hail" ? 19 : 11,
            kind === "hail" ? 28 : 15,
            alpha * (0.55 + phase * 0.3),
            -0.3,
          );
          this.stamp(
            "spark",
            px + 8,
            py - phase * 14,
            5,
            undefined,
            alpha * 0.65,
            angle,
            0xddfaff,
          );
        }
      } else if (kind === "fire-ring") this.flame(px, py, 22, time, alpha, i);
      else if (["vortex", "storm-vortex", "tidal-pulse"].includes(kind))
        this.stamp(
          "water-splash",
          px,
          py,
          15,
          10,
          alpha * 0.75,
          angle + Math.PI / 2,
        );
      else if (kind === "steam")
        this.stamp("steam", px, py - phase * 15, 24, 30, alpha * 0.4, angle);
      else if (kind === "gravity" || kind === "arcane") {
        this.stamp("spark", px, py, 6, undefined, alpha * 0.7, angle, 0xd0aaff);
        if (i === 0)
          this.stamp(
            "rune",
            x,
            y,
            radius * 1.6,
            radius * 1.15,
            alpha * 0.22,
            -time * 0.35,
            0xbc8eff,
          );
      }
    }
  }

  visual(r: Run, v: Visual, g: Graphics) {
    const age = Math.max(
        0,
        Math.min(1, 1 - (v.until - r.time) / (v.duration || 0.3)),
      ),
      fade = 1 - age;
    if (["burst", "thunder"].includes(v.kind)) {
      // Keep bespoke boss/event actions in their existing semantic renderer.
      if (v.enemy && v.eventAbility && /^(santa|pumpkin)-/.test(v.eventAbility))
        return false;
      const elements = v.elements?.length
        ? v.elements
        : v.enemyTheme === "icefield"
          ? ["ice" as const]
          : v.enemyTheme === "volcano" || v.enemyTheme === "sun"
            ? ["fire" as const]
            : [];
      const kind =
        v.kind === "thunder"
          ? "electric"
          : abilityPresentation(v.sourceAbilityId, elements, v.periodic);
      if (
        kind !== "explosion" &&
        !(kind === "frostfire" && !v.periodic) &&
        kind !== "meteor"
      ) {
        // Periodic ticks provide only a brief accent; the area owns its field.
        this.motif(
          kind,
          v.x,
          v.y,
          v.radius,
          age + r.time * 0.2,
          fade * (v.periodic ? 0.3 : 0.75),
          v.id,
          g,
        );
        if (v.kind === "thunder")
          bolt(
            g,
            v.x,
            Math.max(14, v.y - 230),
            v.x,
            v.y,
            r.time,
            0x49baff,
            fade,
            1.2,
          );
        return true;
      }
      const frame = Math.min(5, Math.floor(age * 6));
      // Sparse peripheral fragments carry range; the opaque central drawing
      // is smaller and fades quickly so enemies and projectiles remain legible.
      const size = Math.max(30, v.radius * (0.9 + age * 0.22));
      this.stamp(
        `explosion-${frame}`,
        v.x,
        v.y,
        size,
        size,
        Math.min(0.48, fade * fade * 0.72),
        0,
        v.enemyTheme
          ? themeLightColor(v.enemyTheme)
          : elementColor(v.elements, v.color || 0xffffff),
      );
      if (kind === "meteor" && age < 0.35)
        this.stamp(
          "meteor",
          v.x - (1 - age / 0.35) * 45,
          v.y - (1 - age / 0.35) * 85,
          42,
          70,
          fade * 0.8,
          0.4,
        );
      for (let i = 0; i < 6; i++) {
        const angle = i * 2.39996 + v.id,
          d = v.radius * (0.55 + age * 0.45);
        this.stamp(
          v.elements?.includes("fire") ? "ember" : "spark",
          v.x + Math.cos(angle) * d,
          v.y + Math.sin(angle) * d - age * 12,
          5 * fade + 2,
          undefined,
          fade * 0.7,
          angle,
          elementColor(v.elements, v.color),
        );
      }
      return true;
    }
    if (v.kind === "impact" || v.kind === "hit") {
      this.stamp(
        "spark",
        v.x,
        v.y,
        Math.max(20, v.radius * 2),
        undefined,
        fade,
        v.angle,
      );
      return true;
    }
    if (v.kind === "cast" || v.kind === "phase") {
      this.stamp(
        "rune",
        v.x,
        v.y,
        Math.max(24, v.radius * (1 + age * 0.6)),
        undefined,
        fade * 0.65,
        v.angle + age * 0.3,
      );
      return true;
    }
    if (v.kind === "ghost") {
      this.stamp(
        "ghost",
        v.x + Math.cos(v.angle) * v.radius * 0.55,
        v.y + Math.sin(v.angle) * v.radius * 0.55,
        48 + age * 25,
        undefined,
        fade,
        v.angle,
      );
      return true;
    }
    if (v.kind === "slash") {
      if (v.enemy && v.eventAbility) return false;
      this.stamp(
        v.sourceAbilityId === 144 ? "blue-slash" : "slash",
        v.x + Math.cos(v.angle) * v.radius * 0.4,
        v.y + Math.sin(v.angle) * v.radius * 0.4,
        v.radius * 1.5,
        v.radius * 1.25,
        fade,
        v.angle,
        0xffffff,
      );
      if (v.sourceAbilityId === 144) {
        this.activeNames.add("counter-slash-blue");
        for (let i = 0; i < 5; i++) {
          const angle = v.angle - v.value / 2 + (v.value * i) / 4;
          this.stamp(
            "spark",
            v.x + Math.cos(angle) * v.radius * 0.78,
            v.y + Math.sin(angle) * v.radius * 0.78,
            9,
            undefined,
            fade,
            angle,
            0x9ae8ff,
          );
        }
      }
      return true;
    }
    if (v.kind === "resonance" || v.kind === "relic") {
      this.stamp(
        "rune",
        v.x,
        v.y,
        v.radius * (1.1 + age * 0.7),
        undefined,
        fade * 0.85,
        age,
      );
      return v.kind !== "relic" || v.value < 201;
    }
    if (v.kind === "block") {
      this.stamp("shield", v.x, v.y - 8, 62, 76, fade);
      return true;
    }
    return false;
  }
}
