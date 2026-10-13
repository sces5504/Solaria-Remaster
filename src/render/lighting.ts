import { Sprite, Texture } from "pixi.js";
import type { Run } from "../game/core/types";
import { elementColor } from "./effects";

export interface LightSource {
  x: number;
  y: number;
  radius: number;
  color: number;
  strength: number;
  bloom?: number;
}
export function themeLightColor(
  theme: string | undefined,
  fallback = 0xffb08a,
) {
  return (
    (
      {
        meadow: 0xb5e0a1,
        desert: 0xffd392,
        icefield: 0x8beaff,
        volcano: 0xff984d,
        jungle: 0xa9dc89,
        corruption: 0xbe94ff,
        crimson: 0xff86a8,
        stars: 0x94dfff,
        castle: 0xbe9bf2,
        sun: 0xffdfa2,
      } as Record<string, number>
    )[theme ?? ""] ?? fallback
  );
}

export function creatureEmission(monsterId = 0, bossId = 0, solaris = false) {
  if (monsterId === 23) return { color: 0xff97ad, radius: 88, strength: 0.55 };
  if ([2, 5].includes(monsterId))
    return {
      color: 0x9be37f,
      radius: monsterId === 2 ? 65 : 95,
      strength: 0.5,
    };
  if (solaris || bossId === 19)
    return { color: 0xffd273, radius: 165, strength: 0.95 };
  if ([12, 13, 14, 33, 35].includes(monsterId) || [7, 8, 21].includes(bossId))
    return { color: 0xff9b45, radius: bossId ? 155 : 92, strength: 0.9 };
  if (
    [10, 11, 36, 37, 38, 39, 40].includes(monsterId) ||
    [5, 15, 16].includes(bossId)
  )
    return { color: 0x76dfff, radius: bossId ? 140 : 86, strength: 0.7 };
  if ([18, 20, 29, 34].includes(monsterId) || [11, 12, 18].includes(bossId))
    return { color: 0xc28bff, radius: bossId ? 135 : 80, strength: 0.7 };
  if ([17, 23, 24, 25, 26].includes(monsterId) || [3, 10, 13].includes(bossId))
    return {
      color: monsterId === 17 || bossId === 10 ? 0xb4e18d : 0x89d6ef,
      radius: 88,
      strength: 0.55,
    };
  return null;
}

// Emission reads the simulation; lights do not change hitboxes or gameplay RNG.
export function sceneLights(r: Run): LightSource[] {
  const sources: LightSource[] = [];
  const add = (
    x: number,
    y: number,
    radius: number,
    color: number,
    strength = 0.9,
    bloom = 0.22,
  ) => sources.push({ x, y, radius, color, strength, bloom });
  const p = r.player;
  add(p.x, p.y, 105, 0xccece2, 0.6);
  if (r.classId === "mage")
    add(
      p.x + Math.cos(p.aim || 0) * 35,
      p.y + Math.sin(p.aim || 0) * 35,
      130,
      elementColor(r.elements, 0xc6a8ff),
    );
  if (r.phase === "POST_CLEAR") add(928, 320, 145, 0xa2e9d0);
  for (const v of r.visuals) {
    if (
      v.until <= r.time ||
      ![
        "burst",
        "thunder",
        "arc",
        "steam",
        "block",
        "charge",
        "relic",
        "ghost",
        "resonance",
      ].includes(v.kind)
    )
      continue;
    const fade = Math.min(1, (v.until - r.time) / (v.duration || 0.3));
    const blue = v.kind === "thunder" || v.kind === "arc";
    add(
      v.x,
      v.y,
      Math.min(
        240,
        Math.max(
          110,
          (v.kind === "relic" && v.value === 218 ? 24 : v.radius) * 1.7,
        ),
      ),
      blue
        ? 0x49baff
        : v.kind === "steam"
          ? 0xb9f5ff
          : themeLightColor(v.enemyTheme, v.color),
      fade * (v.kind === "burst" ? (v.periodic ? 0.35 : 0.72) : 1),
      v.kind === "burst" ? 0.25 : 0.65,
    );
    if (v.kind === "arc")
      add(
        v.x + Math.cos(v.angle) * v.value,
        v.y + Math.sin(v.angle) * v.value,
        100,
        0x49baff,
        fade,
        0.5,
      );
  }
  for (const a of r.areas) {
    if (r.time < a.starts || r.time > a.ends) continue;
    const cone = a.shape === "cone";
    add(
      a.x + (cone ? Math.cos(a.angle) * a.radius * 0.55 : 0),
      a.y + (cone ? Math.sin(a.angle) * a.radius * 0.55 : 0),
      Math.min(210, a.radius * (cone ? 0.65 : 1.35)),
      a.enemy
        ? a.effect === "thunder"
          ? 0x49baff
          : themeLightColor(a.enemyTheme, 0xff9b7c)
        : elementColor(a.context?.elementMask),
      0.8,
      0.4,
    );
  }
  for (const e of r.enemies) {
    if (e.hp <= 0) continue;
    if (e.summonRole)
      add(e.x, e.y, 85, e.summonRole === "totem" ? 0xa5df8a : 0xff88aa, 0.65);
    if (e.sealPillar) add(e.x, e.y - 20, 130, 0xffd98c, 0.9);
    const body = creatureEmission(
      e.monsterId ?? (e.kind <= 5 ? e.kind : 0),
      e.bossId,
      !!e.solarisBar,
    );
    if (body)
      add(
        e.x,
        e.y - e.radius * 0.25,
        body.radius,
        body.color,
        body.strength * (0.94 + 0.06 * Math.sin(r.time * 8 + e.id)),
      );
    if (e.burn.some((b) => b.until > r.time)) add(e.x, e.y, 95, 0xff9a54);
    if ((e.stunUntil || 0) > r.time) add(e.x, e.y, 85, 0x49baff);
  }
  const theme = r.event?.theme ?? r.biome ?? "meadow";
  for (const o of r.obstacles) {
    if (o.durability <= 0) continue;
    if (theme === "volcano")
      add(
        o.x + o.w / 2,
        o.y + o.h / 2,
        o.kind === "lake" ? 155 : 80,
        0xff963e,
        o.kind === "lake" ? 0.95 : 0.65,
      );
    else if ((theme === "stars" || theme === "corruption") && o.kind !== "tree")
      add(
        o.x + o.w / 2,
        o.y + o.h / 2,
        o.kind === "lake" ? 115 : 60,
        theme === "stars" ? 0x72dfff : 0xb68afa,
        0.55,
      );
  }
  for (const h of r.hazards ?? []) {
    if (["vent", "rift", "statue", "meteor"].includes(h.kind))
      add(
        h.x,
        h.y,
        Math.max(65, h.radius * 1.8),
        h.kind === "vent"
          ? 0xffa54b
          : h.kind === "meteor"
            ? 0x80daff
            : 0xba93ff,
        0.6,
      );
  }
  for (const item of r.items)
    add(
      item.x,
      item.y,
      ["黃", "橘", "紅"].includes(item.rarity) ? 130 : 90,
      (
        {
          藍: 0x8acbff,
          紫: 0xc9a2ff,
          黃: 0xffdc80,
          橘: 0xffaa50,
          紅: 0xff7f9e,
        } as Record<string, number>
      )[item.rarity] || 0xffdc80,
    );
  for (const drop of r.drops)
    add(drop.x, drop.y, drop.kind === "heal" ? 65 : 48, 0x91efd5, 0.65);
  for (const b of r.projectiles)
    if (!b.enemy || b.enemyElement || b.enemyTheme || b.eventGlyph) {
      const color = b.enemy
        ? b.enemyElement === "lightning" || b.eventGlyph === "plasma"
          ? 0x49baff
          : b.enemyTheme === "volcano" ||
              b.enemyTheme === "sun" ||
              b.enemyElement === "fire"
            ? 0xff9b45
            : b.enemyTheme === "icefield"
              ? 0x8beaff
              : b.enemyTheme === "crimson"
                ? 0xff779b
                : 0xb89aff
        : elementColor(b.context?.elementMask);
      add(
        b.x,
        b.y,
        b.context?.elementMask.includes("lightning") ? 100 : 70,
        color,
        b.enemy ? 0.55 : 0.7,
      );
    }
  // Decorative lighting has a budget; no attack/projectile is removed to meet it.
  return sources.slice(0, 64);
}

export function skillCooldownProgress(r: Run) {
  const remaining = r.player.skillReady - r.time;
  if (remaining <= 0) return 1;
  return Math.max(
    0,
    Math.min(1, 1 - remaining / Math.max(0.001, r.stats.skillCD)),
  );
}

// Reusable half-resolution shadow/light map: opaque shade over terrain/actors,
// radial emission cuts away shade so the world itself is lit, then colored bloom.
// Friendly attacks, enemy telegraphs and HUD remain above this layer.
export class MeadowLighting {
  readonly sprite: Sprite;
  private base = document.createElement("canvas");
  private canvas = document.createElement("canvas");
  private scene = "";
  private lastDraw = "";
  constructor() {
    this.base.width = this.canvas.width = 512;
    this.base.height = this.canvas.height = 320;
    this.sprite = new Sprite(Texture.from(this.canvas));
    this.sprite.width = 1024;
    this.sprite.height = 640;
  }
  draw(r: Run, sources: LightSource[]) {
    const signature = `${r.runId}:${r.room}:${r.event?.theme ?? r.biome}:${r.obstacles.map((o) => o.durability).join(",")}`;
    const frame = `${signature}:${sources.map((l) => `${l.x},${l.y},${l.radius},${l.strength}`).join(";")}`;
    if (frame === this.lastDraw) return;
    this.lastDraw = frame;
    if (signature !== this.scene) {
      this.scene = signature;
      const ctx = this.base.getContext("2d")!;
      ctx.clearRect(0, 0, 512, 320);
      const dusk = ctx.createLinearGradient(0, 0, 512, 320);
      dusk.addColorStop(0, "rgba(9,18,29,.08)");
      dusk.addColorStop(1, "rgba(9,18,29,.20)");
      ctx.fillStyle = dusk;
      ctx.fillRect(0, 0, 512, 320);
      for (const o of r.obstacles) {
        if (o.durability <= 0 || o.kind === "lake") continue;
        const x = (o.x + o.w * 0.6) / 2,
          y = (o.y + o.h * 0.7) / 2;
        const radius = (o.kind === "tree" ? 100 : 58) / 2;
        const shadow = ctx.createRadialGradient(x, y, 0, x, y, radius);
        shadow.addColorStop(0, "rgba(3,12,22,.22)");
        shadow.addColorStop(1, "rgba(3,12,22,0)");
        ctx.fillStyle = shadow;
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
      }
    }
    const ctx = this.canvas.getContext("2d")!;
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, 512, 320);
    ctx.drawImage(this.base, 0, 0);
    ctx.globalCompositeOperation = "destination-out";
    for (const l of sources) {
      const x = l.x / 2,
        y = l.y / 2,
        radius = l.radius / 2;
      const light = ctx.createRadialGradient(x, y, 0, x, y, radius);
      light.addColorStop(0, `rgba(0,0,0,${l.strength})`);
      light.addColorStop(0.35, `rgba(0,0,0,${l.strength * 0.8})`);
      light.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = light;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    this.sprite.texture.source.update();
  }
}
