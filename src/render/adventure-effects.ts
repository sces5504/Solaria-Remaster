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
    const name =
      b.eventGlyph === "gift"
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
                            : "arcane-orb";
    const size = Math.max(22, b.radius * 3.4);
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
  area(r: Run, a: Area) {
    if (r.time < a.starts || r.time > a.ends || a.effect === "steam") return;
    const els =
      a.context?.elementMask ??
      a.enemyElements ??
      (a.enemyElement ? [a.enemyElement] : []);
    if (a.shape === "cone") {
      for (let i = 0; i < 13; i++) {
        const phase = ((r.time - a.starts) * 2 + i * 0.153) % 1;
        const angle = a.angle + Math.sin(i * 7.3) * a.width * 0.42;
        const dist = 12 + phase * (a.radius - 24);
        this.stamp(
          "fireball",
          a.x + Math.cos(angle) * dist,
          a.y + Math.sin(angle) * dist,
          28 + phase * 28,
          18 + phase * 24,
          0.8 - phase * 0.35,
          angle,
        );
      }
    } else if (a.shape !== "beam") {
      for (let i = 0; i < 6; i++) {
        const angle = i * 2.39996 + r.time * 0.4;
        const radius = a.radius * (0.35 + (i % 3) * 0.2);
        const x = a.x + Math.cos(angle) * radius,
          y = a.y + Math.sin(angle) * radius;
        const element = els[i % Math.max(1, els.length)];
        if (element === "fire") this.flame(x, y, 22, r.time, 0.72, i);
        else
          this.stamp(
            element === "ice"
              ? "ice-shard"
              : element === "water"
                ? "water-orb"
                : element === "lightning"
                  ? "electric-orb"
                  : a.enemy
                    ? "spark"
                    : "arcane-orb",
            x,
            y,
            14,
            undefined,
            0.7,
            angle,
            a.enemy && !els.length ? themeLightColor(a.enemyTheme) : 0xffffff,
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
      const frame = Math.min(5, Math.floor(age * 6));
      const size = Math.max(50, v.radius * (1.5 + age * 0.4));
      this.stamp(
        `explosion-${frame}`,
        v.x,
        v.y,
        size,
        size,
        Math.min(1, fade * 2.8),
        0,
        v.kind === "thunder"
          ? 0xa6e5ff
          : v.enemyTheme
            ? themeLightColor(v.enemyTheme)
            : elementColor(v.elements, v.color || 0xffffff),
      );
      for (let i = 0; i < 8; i++) {
        const a = i * 2.39996 + v.id,
          d = v.radius * (0.3 + age * 0.7);
        this.stamp(
          v.elements?.includes("fire") ? "ember" : "spark",
          v.x + Math.cos(a) * d,
          v.y + Math.sin(a) * d - age * 20,
          8 * fade + 3,
          undefined,
          fade,
          a,
        );
      }
      // The authored bloom supports the original branching electrical strike.
      if (v.kind === "thunder") {
        bolt(
          g,
          v.x,
          Math.max(14, v.y - 230),
          v.x,
          v.y,
          r.time,
          0x49baff,
          fade,
          1.8,
        );
        for (const side of [-1, 1])
          bolt(
            g,
            v.x,
            v.y - 75,
            v.x + side * 65,
            v.y - 30,
            r.time + side,
            0x49baff,
            fade * 0.65,
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
      this.stamp(
        "slash",
        v.x + Math.cos(v.angle) * v.radius * 0.4,
        v.y + Math.sin(v.angle) * v.radius * 0.4,
        v.radius * 1.5,
        v.radius * 1.25,
        fade,
        v.angle,
      );
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
