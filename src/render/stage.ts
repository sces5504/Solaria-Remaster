import { glowExposureScales, GLOW_GRID_SIZE } from "./glow-exposure";
import { terrainSize } from "./terrain-presentation";
import { AdventureArt } from "./adventure-art";
import { AdventureEffects } from "./adventure-effects";
import { castleStatueMark } from "./hazard-markers";
import { RetainedPool } from "./retained-pool";
import { bossBeam } from "./boss-beams";
import { bossAction } from "./boss-actions";
import { bossProjectile } from "./boss-projectiles";
import { solarLandscape } from "./solar-landscape";
import { eventProjectile, eventImpact } from "./event-effects";
import { eventLandscape } from "./event-landscape";
import { eventMonsters } from "../game/data/event-content";
import { equipmentProjectile } from "./equipment-projectiles";
import { equipmentEffect, equipmentAura } from "./equipment-effects";
import { pumpkin } from "../game/systems/companion";
import { advancedEffect } from "./advanced-effects";
import { enemyImpact } from "./enemy-impact";
import { bossTelegraph } from "./boss-telegraph";
import {
  Application,
  Assets,
  Container,
  Graphics,
  Sprite,
  Texture,
  Rectangle,
  BitmapText,
  BitmapFont,
} from "pixi.js";
import type { Run } from "../game/core/types";
import {
  areaEffect,
  bolt,
  diamond,
  elementColor,
  elementMotif,
  visualEffect,
} from "./effects";
import {
  MeadowLighting,
  sceneLights,
  skillCooldownProgress,
  creatureEmission,
  themeLightColor,
} from "./lighting";
import { cameraFeedback } from "./feedback";
import { biomeLandscape } from "./biome-landscape";
const names = [
  "sword",
  "bow",
  "mage",
  "wolf",
  "slime",
  "knife",
  "archer",
  "shaman",
  "wolfking",
  "goatking",
  "tree",
  "rock",
  "pillar",
  "lake",
  "door",
  "heal",
  "xp",
];
const hash = (x: number, y: number, seed: number) => {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 0.017) * 43758.5453;
  return n - Math.floor(n);
};
export class Stage {
  constructor(private assetResolver?: (path: string) => string) {}
  private asset(path: string) {
    return this.assetResolver?.(path) ?? `${import.meta.env.BASE_URL}${path}`;
  }
  private adventure: AdventureArt | null = null;
  private artEffects: AdventureEffects | null = null;
  private ground = new Sprite(Texture.EMPTY);
  app = new Application();
  private terrain = new Graphics();
  private objects = new Container();
  private shadows = new Graphics();
  private lighting!: MeadowLighting;
  private lights = new Container();
  private friendly = new Graphics();
  private danger = new Graphics();
  private numbers = new Container();
  private heroFront = new Container();
  private heroEffects: AdventureEffects | null = null;
  private projectileContrast = new Graphics();
  private hostileCount = 0;
  private sprites = new Map<string, Sprite>();
  private glows: Sprite[] = [];
  private glowCount = 0;
  private limitedGlows = 0;
  private glowGrid = new Float32Array(GLOW_GRID_SIZE);
  private glowTexture!: Texture;
  private texts = new Map<number, BitmapText>();
  private textures: Record<string, Texture[]> = {};
  private previewTextures: Record<string, Texture> = {};
  private previewGround = new Sprite(Texture.EMPTY);
  /** Isolated art-review entry only; the ordinary game never calls this. */
  setPreviewArt(textures: Record<string, Texture>, ground: Texture | null) {
    this.previewTextures = textures;
    this.previewGround.texture = ground ?? Texture.EMPTY;
    this.previewGround.visible = ground !== null;
    this.previewGround.width = 1024;
    this.previewGround.height = 640;
  }
  private spritePool = new RetainedPool(
    () => new Sprite(Texture.EMPTY),
    (s) => {
      s.visible = false;
      s.removeFromParent();
    },
    (s) => s.destroy(),
    80,
  );
  private textPool = new RetainedPool(
    () =>
      new BitmapText({
        text: "",
        style: { fontFamily: "SolariaNumbers", fontSize: 16, fill: 0xffffff },
      }),
    (t) => {
      t.visible = false;
      t.removeFromParent();
    },
    (t) => t.destroy(),
    256,
  );
  inspect() {
    return {
      sprites: this.sprites.size,
      cachedSprites: this.spritePool.retained,
      createdSprites: this.spritePool.created,
      texts: this.texts.size,
      cachedTexts: this.textPool.retained,
      createdTexts: this.textPool.created,
      glows: this.glows.length,
      activeGlows: this.glowCount,
      limitedGlows: this.limitedGlows,
      positions: this.positions.size,
      artStyle: this.adventure ? "精雕冒險像素" : "選樣",
      artIdentities: this.adventure
        ? Object.keys(this.adventure.textures).length
        : 0,
      artEffects: this.artEffects?.inspect() ?? null,
      heroForeground: this.sprites.get("player")?.parent === this.heroFront,
      hostileMarkers: this.hostileCount,
      isolatedPixels: this.adventure?.isolatedPixels ?? {},
      renderer: this.app.renderer.name,
    };
  }
  private roomKey = "";
  private positions = new Map<string, { x: number; y: number }>();
  async init(host: HTMLElement) {
    await this.app.init({
      width: 1024,
      height: 640,
      background: 0x152832,
      preference: "webgl",
      antialias: false,
      resolution: 1,
    });
    host.appendChild(this.app.canvas);
    this.app.canvas.setAttribute("aria-label", "Solaria 遊戲畫布");
    if (!this.assetResolver) {
      this.adventure = new AdventureArt();
      await this.adventure.load((path) => this.asset(path));
      this.textures = this.adventure.textures;
      this.ground.texture = this.adventure.ground;
      this.ground.width = 1024;
      this.ground.height = 640;
      this.artEffects = new AdventureEffects(this.adventure.effects);
      this.heroEffects = new AdventureEffects(this.adventure.effects);
    } else {
      const atlas = await Assets.load<Texture>(
        this.asset("assets/solaria-atlas.png"),
      );
      atlas.source.scaleMode = "nearest";
      for (let row = 0; row < names.length; row++)
        this.textures[names[row]] = Array.from(
          { length: 6 },
          (_, i) =>
            new Texture({
              source: atlas.source,
              frame: new Rectangle(i * 96, row * 96, 96, 96),
            }),
        );
      for (const prefix of ["biome", "boss", "event"]) {
        const expansion = await Assets.load<Texture>(
          this.asset(`assets/${prefix}-atlas.png`),
        );
        const metadata = await fetch(
          this.asset(`assets/${prefix}-atlas.json`),
        ).then(async (response) => {
          if (!response.ok) throw new Error("無法載入圖像索引");
          return (await response.json()) as { names: string[] };
        });
        expansion.source.scaleMode = "nearest";
        metadata.names.forEach((name, row) => {
          this.textures[name] = Array.from(
            { length: 6 },
            (_, i) =>
              new Texture({
                source: expansion.source,
                frame: new Rectangle(i * 96, row * 96, 96, 96),
              }),
          );
        });
      }
    }
    BitmapFont.install({
      name: "SolariaNumbers",
      style: { fontFamily: "monospace", fontSize: 18, fill: 0xffffff },
      chars: "0123456789+−",
    });
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext("2d")!,
      gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, "#ffffffb0");
    gradient.addColorStop(0.2, "#ffffff55");
    gradient.addColorStop(0.55, "#ffffff14");
    gradient.addColorStop(1, "#ffffff00");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    this.glowTexture = Texture.from(canvas);
    this.lighting = new MeadowLighting();
    this.objects.sortableChildren = true;
    this.app.stage.addChild(
      this.ground,
      this.terrain,
      this.previewGround,
      this.shadows,
      this.objects,
      this.lighting.sprite,
      this.lights,
      this.friendly,
      ...(this.artEffects ? [this.artEffects.layer] : []),
      this.heroFront,
      ...(this.heroEffects ? [this.heroEffects.layer] : []),
      this.danger,
      this.projectileContrast,
      ...(this.artEffects ? [this.artEffects.hostileLayer] : []),
      this.numbers,
    );
  }
  private glow(
    x: number,
    y: number,
    radius: number,
    color: number,
    alpha = 0.5,
  ) {
    let s = this.glows[this.glowCount++];
    if (!s) {
      s = new Sprite(this.glowTexture);
      s.anchor.set(0.5);
      s.blendMode = "add";
      this.lights.addChild(s);
      this.glows.push(s);
    }
    s.visible = true;
    s.position.set(x, y);
    s.width = s.height = Math.min(264, radius) * 2;
    s.tint = color;
    s.alpha = alpha;
  }
  private sprite(
    key: string,
    name: string,
    x: number,
    y: number,
    w = 64,
    h = 64,
    frame = 0,
  ) {
    let s = this.sprites.get(key);
    if (!s) {
      s = this.spritePool.take();
      s.anchor.set(0.5);
      this.objects.addChild(s);
      this.sprites.set(key, s);
    }
    s.visible = true;
    s.texture =
      this.previewTextures[name] ??
      this.textures[name]?.[frame] ??
      Texture.EMPTY;
    s.position.set(x, y);
    s.width = w;
    s.height = h;
    s.alpha = 1;
    s.rotation = 0;
    s.tint = 0xffffff;
    s.zIndex = name.endsWith("lake") ? 0 : y;
    return s;
  }
  private pose(key: string, x: number, y: number, time: number) {
    const old = this.positions.get(key),
      moving = old && Math.hypot(old.x - x, old.y - y) > 0.02;
    this.positions.set(key, { x, y });
    return moving ? 1 + (Math.floor(time * 8) % 2) : 0;
  }
  private landscape(r: Run) {
    const g = this.terrain;
    if (this.adventure) {
      g.clear();
      this.adventure.drawGround(r);
      return;
    }
    if (r.biome && r.biome !== "meadow") {
      biomeLandscape(g, r);
      return;
    }
    const profile =
      r.room % 5 === 0 ? (r.boss === 2 ? 5 : 2) : r.templates[(r.room - 1) % 5];
    const palette = [
      [0x294b43, 0x91b5a0, 0xbacddd],
      [0x394943, 0xb0ae98, 0xc9c8ad],
      [0x233e37, 0x7c9c77, 0xb2cca1],
      [0x355348, 0xbac5a0, 0xe8dfad],
      [0x3c4d3d, 0xb7a97c, 0xd6b187],
      [0x304444, 0x9cafa9, 0xb9c7bd],
    ][profile] || [0x2b4c42, 0x99a981, 0xd8c48b];
    g.clear().rect(0, 0, 1024, 640).fill(0x173338);
    // Fine mottled meadow, winding light path, moss, stones, flowers and hand-cut banks.
    g.rect(32, 64, 960, 544).fill(palette[0]);
    for (let y = 64; y < 608; y += 16)
      for (let x = 32; x < 992; x += 16) {
        const n = hash(x, y, r.seed + r.room);
        if (n < 0.3)
          g.rect(x, y, 12, 8).fill({
            color: n < 0.1 ? 0x53735b : 0x203f39,
            alpha: 0.15,
          });
      }
    const route = r.route || [
      { x: 48, y: 320 },
      { x: 980, y: 320 },
    ];
    for (let i = 1; i < route.length; i++) {
      const a = route[i - 1],
        b = route[i];
      g.moveTo(a.x, a.y)
        .lineTo(b.x, b.y)
        .stroke({
          color: palette[1],
          width: profile === 5 ? 58 : 48,
          alpha: profile === 5 ? 0.17 : 0.12,
        });
    }
    for (let i = 0; i < 480; i++) {
      const x = 40 + hash(i, 1, r.seed + r.room) * 940,
        y = 76 + hash(i, 2, r.seed + r.room) * 515,
        n = hash(i, 3, r.seed);
      if (Math.abs(y - 320) < 28 && n < 0.75) {
        g.rect(x, y, 2 + n * 3, 1).fill({ color: 0xa6b190, alpha: 0.4 });
        continue;
      }
      if (n < 0.7)
        g.moveTo(x - 3, y + 3)
          .lineTo(x - 2, y - 2)
          .lineTo(x, y + 1)
          .lineTo(x + 2, y - 4)
          .stroke({
            color: n < 0.35 ? 0x8ca878 : 0x426e57,
            width: 1,
            alpha: 0.65,
          });
      else if (n < 0.85) {
        g.ellipse(x, y, 3, 2).fill(0x4b6563);
        g.rect(x - 1, y - 2, 2, 1).fill(0x90a28b);
      } else {
        g.rect(x, y, 1, 5).fill(0x628361);
        g.rect(x - 2, y - 2, 5, 3).fill(n > 0.96 ? 0xc0adce : palette[2]);
        g.rect(x, y - 1, 1, 1).fill(0xffecc4);
      }
    }
    g.rect(0, 0, 1024, 64)
      .fill(0x132a31)
      .rect(0, 608, 1024, 32)
      .fill(0x122a30)
      .rect(0, 64, 32, 544)
      .fill(0x132d31)
      .rect(992, 64, 32, 544)
      .fill(0x132d31);
    for (let x = 0; x < 1024; x += 20) {
      const h = 5 + hash(x, 12, r.seed) * 12;
      g.poly([x, 64, x + 14, 64, x + 18, 64 + h, x + 4, 64 + h + 4]).fill(
        0x405c51,
      );
      g.rect(x, 608, 14, 3).fill(0x4e675b);
    }
    for (let y = 66; y < 610; y += 24) {
      g.rect(24, y, 8, 17).fill(0x405c51);
      g.rect(992, y, 8, 17).fill(0x405c51);
    }
  }
  private weapon(r: Run) {
    const p = r.player,
      g = this.friendly,
      aim = p.aim || 0;
    if (this.adventure && this.artEffects) {
      const x = p.x + Math.cos(aim) * 26,
        y = p.y + Math.sin(aim) * 26;
      const name = `weapon-${r.classId}`;
      (this.sprites.get("player")?.parent === this.heroFront
        ? this.heroEffects!
        : this.artEffects
      ).stamp(
        name,
        x,
        y,
        r.classId === "bow" ? 36 : 50,
        r.classId === "bow" ? 52 : 30,
        1,
        aim,
      );
      return;
    }
    const slash = [...r.visuals]
      .reverse()
      .find(
        (v) =>
          v.kind === "slash" &&
          Math.hypot(v.x - p.x, v.y - p.y) < 75 &&
          v.until > r.time,
      );
    const attack = slash ? 1 - (slash.until - r.time) / 0.3 : 0;
    const a = slash
      ? slash.angle - slash.value / 2 + attack * slash.value
      : aim;
    const pt = (x: number, y: number) => ({
      x: p.x + Math.cos(a) * x - Math.sin(a) * y,
      y: p.y + Math.sin(a) * x + Math.cos(a) * y,
    });
    const poly = (points: number[], color: number) => {
      const v: number[] = [];
      for (let i = 0; i < points.length; i += 2) {
        const q = pt(points[i], points[i + 1]);
        v.push(q.x, q.y);
      }
      g.poly(v).fill(color);
    };
    const line = (
      x: number,
      y: number,
      tx: number,
      ty: number,
      color: number,
      width: number,
    ) => {
      const a = pt(x, y),
        b = pt(tx, ty);
      g.moveTo(a.x, a.y).lineTo(b.x, b.y).stroke({ color, width });
    };
    const color = elementColor(
      r.elements,
      r.classId === "mage" ? 0xc8a3ff : 0xffe3a1,
    );
    if (r.classId === "sword") {
      poly([15, -4, 42, -4, 50, 0, 42, 4, 15, 4], 0xebf7e7);
      line(18, 0, 43, 0, 0x8ec2d5, 1.5);
      line(15, -9, 15, 9, 0xe6bd74, 3);
      line(5, 0, 14, 0, 0x976e51, 4);
      if (slash) {
        const q = pt(45, 0);
        this.glow(q.x, q.y, 22, color, 0.4);
      }
    } else if (r.classId === "bow") {
      const points = [
        pt(17, -20),
        pt(28, -9),
        pt(30, 0),
        pt(28, 9),
        pt(17, 20),
      ];
      g.moveTo(points[0].x, points[0].y);
      for (const q of points.slice(1)) g.lineTo(q.x, q.y);
      g.stroke({ color: 0xdeba7b, width: 3 });
      const release = Math.max(
        0,
        1 - (r.time - (p.attackNext - 1 / r.stats.attackRate)) / 0.22,
      );
      const stringX = 17 - release * 8;
      line(17, -20, stringX, 0, 0xe6efcf, 1);
      line(stringX, 0, 17, 20, 0xe6efcf, 1);
      line(8, 0, 37, 0, 0xe5f5bc, 1.5);
      poly([36, -3, 42, 0, 36, 3], 0xffe9b6);
      if (p.rapid.remaining) this.glow(p.x, p.y, 42, 0xe2ef9d, 0.35);
    } else {
      line(9, 0, 31, 0, 0xb9916b, 4);
      const q = pt(35, 0);
      diamond(g, q.x, q.y, 12, 0xcdb7fa);
      diamond(g, q.x, q.y, 5, 0xffffff);
      const flare = Math.max(
        0,
        1 - (r.time - (p.attackNext - 1 / r.stats.attackRate)) / 0.25,
      );
      this.glow(q.x, q.y, 30 + flare * 12, color, 0.65 + flare * 0.2);
      for (let i = 0; i < 3; i++)
        diamond(
          g,
          q.x + Math.cos(r.time * 5 + i * 2.1) * 16,
          q.y + Math.sin(r.time * 5 + i * 2.1) * 16,
          2,
          color,
          0.7,
        );
    }
  }
  draw(r: Run | null, feedback = true, cosmetic = 0xffdf98) {
    const recoil = r ? cameraFeedback(r, feedback) : { x: 0, y: 0 };
    this.app.stage.position.set(recoil.x, recoil.y);
    const f = this.friendly,
      d = this.danger;
    f.clear();
    d.clear();
    this.artEffects?.begin();
    this.heroEffects?.begin();
    this.projectileContrast.clear();
    this.hostileCount = 0;
    this.ground.visible = !!r;
    for (const s of this.sprites.values()) s.visible = false;
    for (const s of this.glows) s.visible = false;
    this.glowCount = 0;
    this.limitedGlows = 0;
    this.lighting.sprite.visible = !!r;
    this.numbers.visible = !!r;
    this.shadows.clear();
    if (!r) {
      for (const s of this.sprites.values()) this.spritePool.release(s);
      for (const t of this.texts.values()) this.textPool.release(t);
      this.sprites.clear();
      this.texts.clear();
      this.positions.clear();
      this.roomKey = "";
      this.terrain.clear().rect(0, 0, 1024, 640).fill(0x182e35);
      return;
    }
    const key = `${r.runId}-${r.room}-${r.event?.id ?? r.biome ?? "meadow"}-${r.loop ?? 1}`;
    const theme = r.event?.theme ?? r.biome;
    if (this.roomKey !== key) {
      this.roomKey = key;
      this.positions.clear();
      this.landscape(r.event ? { ...r, biome: r.event.theme } : r);
      if (!this.adventure) {
        eventLandscape(this.terrain, r);
        solarLandscape(this.terrain, r);
      }
    }
    if (this.adventure) {
      const eventArt: Record<string, string[]> = {
        christmas: ["event-pine", "gift"],
        bloodmoon: ["blood-crystal"],
        halloween: ["gravestone", "pumpkin-lantern"],
        alien: ["alien-beacon", "alien-landing"],
        meteor: ["meteor-crater"],
        army: ["camp-tent", "camp-banner"],
      };
      const decor = r.event ? (eventArt[r.event.id] ?? ["camp-tent"]) : [];
      for (let i = 0; i < (decor.length ? 8 : 0); i++) {
        const x = 190 + i * 95 + Math.sin(r.seed + i * 3) * 18,
          y = i % 2 ? 553 : 106;
        this.sprite(`landmark-${i}`, decor[i % decor.length], x, y, 74, 88);
      }
      // Quiet boundary architecture establishes size without creating collision.
      if (!r.event && theme && this.textures[`banner-${theme}`])
        for (let i = 0; i < 4; i++)
          this.sprite(
            `border-${i}`,
            `banner-${theme}`,
            i % 2 ? 978 : 46,
            i < 2 ? 120 : 568,
            60,
            94,
          );
      if (theme === "volcano" && this.artEffects)
        for (const o of r.obstacles)
          if (o.durability > 0 && o.kind === "lake")
            for (let i = 0; i < 3; i++)
              this.artEffects.flame(
                o.x + o.w * (0.2 + i * 0.3),
                o.y + o.h * 0.6,
                24,
                r.time,
                0.55,
                o.id + i,
              );
    }
    for (const o of r.obstacles) {
      if (o.durability > 0 && o.kind !== "lake") {
        const sx = o.x + o.w / 2,
          sy = o.y + o.h * 0.7;
        const length = o.kind === "tree" ? 42 : Math.max(24, o.w * 0.35);
        this.shadows
          .poly([
            sx - 16,
            sy,
            sx + 16,
            sy,
            sx + 16 + length,
            sy + length * 0.55,
            sx - 10 + length,
            sy + length * 0.55,
          ])
          .fill({ color: 0x071922, alpha: 0.19 });
      }
      if (o.durability <= 0) {
        for (let i = 0; i < 6; i++)
          f.poly([
            o.x + (i * o.w) / 6,
            o.y + o.h / 2,
            o.x + (i * o.w) / 6 + 5,
            o.y + o.h / 2 - 4,
            o.x + (i * o.w) / 6 + 8,
            o.y + o.h / 2 + 5,
          ]).fill({ color: 0x82928a, alpha: 0.5 });
        continue;
      }
      if (o.kind === "lake")
        this.sprite(
          `ob-${o.id}`,
          theme && theme !== "meadow" ? `${theme}-${o.kind}` : o.kind,
          o.x + o.w / 2,
          o.y + o.h / 2,
          o.w + 6,
          o.h + 6,
          Math.floor(r.time * 2) % 3,
        );
      else {
        const tall = o.kind === "tree" || o.kind === "pillar";
        const { width, height } = terrainSize(
          o,
          (theme || "meadow") as import("../game/data/biomes").BiomeId,
          Boolean(this.adventure),
        );
        const s = this.sprite(
          `ob-${o.id}`,
          theme && theme !== "meadow" ? `${theme}-${o.kind}` : o.kind,
          o.x + o.w / 2,
          o.y + o.h / 2 - (this.adventure && tall ? height * 0.26 : 0),
          width,
          height,
        );
        s.zIndex = o.y + o.h / 2;
        // Canopies fade around actors underneath; warning geometry stays above.
        const underCanopy = (x: number, y: number) =>
          Math.abs(x - s.x) < width * 0.45 && y < o.y && y > o.y - height * 0.7;
        if (
          this.adventure &&
          tall &&
          (underCanopy(r.player.x, r.player.y) ||
            r.enemies.some((e) => e.hp > 0 && underCanopy(e.x, e.y)))
        )
          s.alpha = 0.58;
        const ratio = o.durability / o.maxDurability;
        s.tint = ratio > 0.65 ? 0xffffff : ratio > 0.3 ? 0xb0a394 : 0x827a75;
        if (ratio < 0.65)
          f.moveTo(o.x + o.w * 0.4, o.y + 4)
            .lineTo(o.x + o.w * 0.6, o.y + 12)
            .lineTo(o.x + o.w * 0.42, o.y + o.h - 4)
            .stroke({ color: 0x22313b, width: 2 });
      }
      if (
        o.kind !== "lake" &&
        (r.room % 5 === 0 || r.room === 31 || o.durability < o.maxDurability)
      )
        f.rect(
          o.x,
          o.y + o.h + 2,
          (o.w * o.durability) / o.maxDurability,
          2,
        ).fill(0xd8cb9c);
    }
    for (const h of r.hazards ?? []) {
      const pulse = 0.6 + Math.sin(r.time * 2) * 0.15;
      if (this.artEffects && h.kind === "vent")
        this.artEffects.flame(h.x, h.y, 28, r.time, 0.8, h.x + h.y);
      if (h.kind === "sand") {
        for (let i = 0; i < 4; i++)
          f.ellipse(
            h.x,
            h.y,
            h.radius - i * 7,
            (h.radius - i * 7) * 0.55,
          ).stroke({ color: 0xd6ba7b, width: 2, alpha: 0.3 });
      } else if (h.kind === "frost") {
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3;
          f.moveTo(h.x, h.y)
            .lineTo(h.x + Math.cos(a) * h.radius, h.y + Math.sin(a) * h.radius)
            .stroke({ color: 0xd3f4ff, width: 2, alpha: 0.4 });
        }
      } else if (h.kind === "blood") {
        f.ellipse(h.x, h.y, h.radius, h.radius * 0.75).fill({
          color: 0x801f42,
          alpha: 0.55,
        });
        for (let i = 0; i < 3; i++)
          f.ellipse(h.x, h.y, h.radius - i * 9, h.radius * 0.75 - i * 6).stroke(
            { color: 0xff779c, width: 1, alpha: 0.3 },
          );
      } else if (h.kind === "statue") {
        castleStatueMark(f, h, pulse);
        this.glow(h.x, h.y, 26, 0xc69aff, pulse * 0.35);
      } else if (h.kind === "rift") {
        f.poly([
          h.x - 25,
          h.y + 16,
          h.x - 4,
          h.y - 22,
          h.x + 18,
          h.y - 7,
          h.x + 4,
          h.y + 27,
        ])
          .fill({ color: 0x161326, alpha: 0.8 })
          .stroke({ color: 0xc289ff, width: 2, alpha: pulse });
      } else if (h.kind === "thorns") {
        const grass = this.sprite(
          `ground-grass-${h.x}-${h.y}`,
          "jungle-grass",
          h.x,
          h.y,
          88,
          48,
        );
        grass.zIndex = 0;
      } else {
        for (let i = 0; i < 5; i++) {
          const a = (i * Math.PI * 2) / 5;
          f.moveTo(h.x + Math.cos(a) * 16, h.y + Math.sin(a) * 16)
            .lineTo(h.x + Math.cos(a + 2.5) * 16, h.y + Math.sin(a + 2.5) * 16)
            .stroke({
              color: h.kind === "vent" ? 0xffab62 : 0xb9d8ff,
              width: 2,
              alpha: 0.4,
            });
        }
      }
    }
    const open = r.phase === "POST_CLEAR";
    this.sprite("door", "door", 928, 320, 70, 86, open ? 1 : 0).tint = open
      ? 0xffffff
      : 0x9d9488;
    if (open) {
      this.glow(928, 320, 65, 0xa2e9d0, 0.65);
      for (let i = 0; i < 7; i++)
        diamond(
          f,
          913 + Math.sin(i + r.time) * 12,
          345 - ((r.time * 22 + i * 9) % 60),
          2,
          0xecffd5,
          0.7,
        );
    }
    const p = r.player,
      pose = this.pose("player", p.x, p.y, r.time),
      attack = p.attackNext - r.time > 0.15;
    const frame =
      r.phase === "DEAD" ? 5 : p.invulnerable > r.time ? 4 : attack ? 3 : pose;
    if (cosmetic !== 0xffdf98) {
      f.moveTo(p.x - 17, p.y + 21)
        .lineTo(p.x - 11, p.y + 26)
        .lineTo(p.x + 11, p.y + 26)
        .lineTo(p.x + 17, p.y + 21)
        .stroke({ color: cosmetic, width: 2, alpha: 0.8 });
      this.glow(p.x, p.y - 10, 38, cosmetic, 0.22);
    }
    equipmentAura(f, r);
    const ally = pumpkin(r);
    if (ally) {
      this.glow(ally.x, ally.y - 12, 48, 0xffb76f, 0.32);
      const pose =
        ally.hp <= 0
          ? 5
          : ally.invulnerable > r.time
            ? 4
            : ally.attackNext - r.time > 0.7
              ? 3
              : this.pose("ally", ally.x, ally.y, r.time);
      const sprite = this.sprite(
        "companion",
        "pumpkin-knight",
        ally.x,
        ally.y,
        56,
        56,
        pose,
      );
      sprite.scale.x =
        Math.abs(sprite.scale.x) * (Math.cos(ally.aim ?? 0) < 0 ? -1 : 1);
      f.rect(ally.x - 20, ally.y + 24, 40, 4).fill({ color: 0x18242e });
      f.rect(
        ally.x - 20,
        ally.y + 24,
        40 * Math.max(0, ally.hp / ally.maximum),
        4,
      ).fill({ color: 0xffb47e });
      if (ally.hp <= 0) {
        for (let i = 0; i < 3; i++)
          diamond(
            f,
            ally.x + Math.sin(r.time * 2 + i) * 16,
            ally.y - 10 - i * 5,
            3,
            0xa6b7db,
            0.5,
          );
      }
    }
    const ps = this.sprite(
      "player",
      r.classId,
      p.x,
      p.y,
      this.adventure ? 72 : 60,
      this.adventure ? 72 : 60,
      frame,
    );
    const auraActive = r.areas.some(
      (a) =>
        !a.enemy &&
        a.follow &&
        a.shape === "circle" &&
        r.time >= a.starts &&
        r.time <= a.ends,
    );
    const playerLayer = auraActive ? this.heroFront : this.objects;
    if (ps.parent !== playerLayer) playerLayer.addChild(ps);
    ps.scale.x = Math.abs(ps.scale.x) * (Math.cos(p.aim || 0) < 0 ? -1 : 1);
    ps.alpha =
      p.invulnerable > r.time && Math.floor(r.time * 20) % 2 ? 0.55 : 1;
    if (p.dashUntil > r.time && r.cards[47]) {
      ps.rotation = Math.cos(p.dashAngle) < 0 ? -0.13 : 0.13;
      this.glow(p.x, p.y, 45, 0xffd988, 0.65);
    }
    if (r.phase !== "DEAD") this.weapon(r);
    for (const e of r.enemies) {
      if (e.sealPillar) {
        const hp = e.hp / e.maxHP,
          pulse = 0.7 + Math.sin(r.time * 4 + e.id) * 0.2;
        this.glow(e.x, e.y, 70, 0xffe2a2, pulse * 0.6);
        if (this.adventure)
          this.sprite(
            `enemy-pillar-${e.id}`,
            "solar-pillar",
            e.x,
            e.y - 22,
            84,
            132,
          );
        else {
          f.poly([
            e.x - 23,
            e.y + 20,
            e.x - 17,
            e.y - 30,
            e.x,
            e.y - 53,
            e.x + 17,
            e.y - 30,
            e.x + 23,
            e.y + 20,
          ])
            .fill(0x4b4849)
            .stroke({ color: 0xffda91, width: 3 });
          f.poly([
            e.x - 8,
            e.y - 23,
            e.x,
            e.y - 37,
            e.x + 8,
            e.y - 23,
            e.x,
            e.y + 9,
          ]).fill({ color: 0xfff0bd, alpha: pulse });
          for (let i = 0; i < 3; i++)
            f.moveTo(e.x - 14, e.y - 15 + i * 11)
              .lineTo(e.x + 14, e.y - 15 + i * 11)
              .stroke({ color: 0xfbd399, width: 2, alpha: pulse });
        }
        f.ellipse(e.x, e.y + 22, 31, 10).stroke({
          color: 0xffde96,
          width: 2,
          alpha: 0.6,
        });
        f.rect(e.x - 24, e.y - 62, 48, 4)
          .fill(0x202832)
          .rect(e.x - 24, e.y - 62, 48 * hp, 4)
          .fill(0xffe4a1);
        continue;
      }
      if (e.rally) {
        d.moveTo(e.x + 20, e.y + 7)
          .lineTo(e.x + 20, e.y - 62)
          .stroke({ color: 0xe4c78c, width: 3 });
        d.poly([e.x + 22, e.y - 62, e.x + 55, e.y - 54, e.x + 22, e.y - 37])
          .fill(0xdb784e)
          .stroke({ color: 0xffdaa2, width: 2 });
        d.moveTo(e.x + 31, e.y - 53)
          .lineTo(e.x + 43, e.y - 48)
          .stroke({ color: 0xffecbe, width: 3 });
      }
      const active = r.modes.find((m) => m.actor === e.id),
        size =
          e.kind > 5
            ? this.adventure
              ? 148
              : 128
            : e.elite
              ? 78
              : this.adventure
                ? 66
                : 58;
      const frame =
        e.transition > r.time || e.controlUntil > r.time
          ? 4
          : e.rushUntil > r.time || (active && r.time >= active.starts)
            ? 3
            : this.pose(`e-${e.id}`, e.x, e.y, r.time);
      const s = this.sprite(
        `enemy-${e.id}`,
        e.summonRole === "totem"
          ? "totem"
          : e.summonRole === "blood"
            ? "blood-relic"
            : e.solarisBar
              ? "boss19"
              : e.bossId
                ? e.bossId === 20
                  ? "frost-santa"
                  : e.bossId === 21
                    ? "pumpkin-lord"
                    : `boss${String(e.bossId).padStart(2, "0")}`
                : e.monsterId
                  ? (eventMonsters[e.monsterId]?.art ??
                    `mon${String(e.monsterId).padStart(2, "0")}`)
                  : names[e.kind + 2],
        e.x,
        e.y -
          (e.bossId === 20 && this.adventure ? (size * 48) / 256 : 0) -
          (e.leap
            ? Math.sin(
                Math.PI *
                  Math.max(
                    0,
                    Math.min(
                      1,
                      (r.time - e.leap.starts) / (e.leap.ends - e.leap.starts),
                    ),
                  ),
              ) * 65
            : 0),
        size,
        e.bossId === 20 && this.adventure ? (size * 176) / 128 : size,
        frame,
      );
      s.scale.x = Math.abs(s.scale.x) * (r.player.x < e.x ? -1 : 1);
      if (active && active.starts > r.time) {
        s.scale.y *= 0.95 + Math.sin(r.time * 18) * 0.025;
      } else if (e.rushUntil > r.time) {
        s.scale.y *= 0.9;
        s.rotation = Math.cos(e.moveAngle) < 0 ? -0.08 : 0.08;
      }
      s.tint =
        (e.freezeUntil || 0) > r.time
          ? 0xbcefff
          : e.phase === 2
            ? 0xffc7a1
            : e.elite
              ? 0xffd9a1
              : 0xffffff;
      if (e.burn.some((b) => b.until > r.time)) {
        this.glow(e.x, e.y, e.radius + 22, 0xff8c41, 0.45);
        if (this.artEffects)
          for (let i = 0; i < 3; i++)
            this.artEffects.flame(
              e.x + (i - 1) * e.radius * 0.6,
              e.y + e.radius * 0.6,
              30,
              r.time,
              0.75,
              e.id + i,
            );
        else elementMotif(f, e.x, e.y, e.radius * 0.8, ["fire"], r.time, 0.55);
      }
      const body = creatureEmission(e.monsterId, e.bossId, !!e.solarisBar);
      if (this.artEffects && body?.color === 0xff9b45) {
        this.artEffects.flame(
          e.x,
          e.y - e.radius * 0.25,
          e.bossId ? 28 : 18,
          r.time,
          0.7,
          e.id,
        );
      }
      const frozen = (e.freezeUntil || 0) > r.time;
      if (e.iceUntil > r.time) {
        s.tint = frozen ? 0xb6f7ff : 0xd6edee;
        if (frozen)
          elementMotif(f, e.x, e.y + 5, e.radius * 0.9, ["ice"], r.time, 0.75);
        else
          for (const sign of [-1, 1])
            diamond(f, e.x + sign * (e.radius + 2), e.y + 10, 3, 0xc6f7ff, 0.7);
      }
      if ((e.stunUntil || 0) > r.time) {
        s.tint = 0xa9eaff;
        s.x += Math.sin(r.time * 95 + e.id) * 1.7;
        this.glow(e.x, e.y, e.radius + 20, 0x49baff, 0.5);
        for (let i = 0; i < 3; i++) {
          const a = r.time * 6 + (i * Math.PI * 2) / 3;
          bolt(
            f,
            e.x + Math.cos(a) * 12,
            e.y - 18 + Math.sin(a) * 9,
            e.x + Math.cos(a + 0.8) * 27,
            e.y - 18 + Math.sin(a + 0.8) * 18,
            r.time + i,
            0x49baff,
            0.9,
          );
        }
      }
      if (e.wetUntil > r.time)
        f.ellipse(e.x, e.y + 15, e.radius + 5, 6).stroke({
          color: 0x88dfff,
          width: 2,
          alpha: 0.6,
        });
      if (e.kind > 5) {
        this.glow(
          e.x,
          e.y,
          70,
          e.kind === 6 ? 0x9fd5ed : 0xdbaaee,
          0.25 + Math.sin(r.time * 2) * 0.06,
        );
        if (e.transition > r.time) {
          f.circle(e.x, e.y, 64).stroke({
            color: 0xffd68d,
            width: 3,
            alpha: 0.6,
          });
          for (let i = 0; i < 6; i++)
            diamond(
              f,
              e.x + Math.cos(r.time + i) * 70,
              e.y + Math.sin(r.time + i) * 55,
              5,
              0xffe9bc,
            );
        }
      }
      if (e.elite) {
        diamond(f, e.x, e.y - size * 0.48, 5, 0xffd18e);
        this.glow(e.x, e.y, 35, 0xd9a4f7, 0.18);
      }
      if (e.hp < e.maxHP && e.kind <= 5)
        f.rect(e.x - 18, e.y - size * 0.47, 36, 3)
          .fill(0x172932)
          .rect(e.x - 18, e.y - size * 0.47, (36 * e.hp) / e.maxHP, 3)
          .fill(0xe1b199);
      if (frozen) {
        this.glow(e.x, e.y, 34, 0x8fd8ff, 0.25);
        for (const sign of [-1, 1])
          diamond(f, e.x + sign * 19, e.y + 7, 10, 0xc6f7ff, 0.7);
      }
      if (frozen)
        f.poly([
          e.x - 20,
          e.y + 15,
          e.x - 22,
          e.y - 20,
          e.x,
          e.y - 36,
          e.x + 22,
          e.y - 20,
          e.x + 20,
          e.y + 15,
        ])
          .fill({ color: 0xbbf5ff, alpha: 0.22 })
          .stroke({ color: 0xd3fcff, width: 1 });
      if (e.wetUntil > r.time) {
        f.ellipse(e.x, e.y + 15, 22, 7).stroke({
          color: 0x8ccffa,
          width: 2,
          alpha: 0.75,
        });
        for (let i = 0; i < 3; i++)
          diamond(
            f,
            e.x - 12 + i * 12,
            e.y - 14 + Math.sin(r.time * 5 + i) * 7,
            3,
            0xa7e6ff,
            0.7,
          );
      }
      if (!this.adventure && e.burn.length) {
        this.glow(e.x, e.y, 35, 0xffa15c, 0.35);
        for (let i = 0; i < 6; i++) {
          const y = e.y + 10 - ((r.time * 40 + i * 11) % 42),
            x = e.x + Math.sin(i * 3 + r.time * 6) * 15;
          f.poly([x - 3, y + 3, x, y - 8, x + 4, y + 2]).fill({
            color: i % 2 ? 0xffae4e : 0xffe88d,
            alpha: 0.8,
          });
        }
      }
    }
    f.rect(p.x - 21, p.y + 27, 42, 6)
      .fill(0x0c2029)
      .rect(p.x - 20, p.y + 28, 40 * skillCooldownProgress(r), 4)
      .fill(p.skillReady <= r.time ? 0xffe4a2 : 0x9fb9dd);
    if (p.blockUntil > r.time) {
      this.glow(p.x, p.y, 46, 0xffe1a0, 0.45);
      f.circle(p.x, p.y, 29).stroke({ color: 0xffedbd, width: 3 });
      for (let i = 0; i < 4; i++)
        diamond(
          f,
          p.x + Math.cos((i * Math.PI) / 2 + r.time) * 31,
          p.y + Math.sin((i * Math.PI) / 2 + r.time) * 31,
          4,
          0xfff6d4,
        );
    }
    if (p.shields.length) {
      this.glow(p.x, p.y, 40, 0xb7e7fa, 0.25);
      f.circle(p.x, p.y, 27).stroke({ color: 0xc4efff, width: 2 });
    }
    if (p.dashUntil > r.time)
      for (let i = 1; i < 5; i++) {
        const x = p.x - Math.cos(p.dashAngle) * i * 11,
          y = p.y - Math.sin(p.dashAngle) * i * 11;
        f.ellipse(x, y, 9 - i, 12 - i).fill({
          color: 0xcae8db,
          alpha: 0.25 - i * 0.04,
        });
      }
    for (const item of r.items) {
      const color =
        (
          {
            藍: 0x8acbff,
            紫: 0xc9a2ff,
            黃: 0xffdc80,
            橘: 0xffaa50,
            紅: 0xff7f9e,
          } as Record<string, number>
        )[item.rarity] || 0xffdc80;
      const high = ["黃", "橘", "紅"].includes(item.rarity),
        height = high ? 105 : item.rarity === "紫" ? 75 : 50;
      const pulse = 0.7 + Math.sin(r.time * 3 + item.x) * 0.15;
      this.glow(item.x, item.y, high ? 48 : 34, color, 0.7);
      // Tapered shaft with bright core, animated ascending motes and a ground halo.
      f.poly([
        item.x - 13,
        item.y,
        item.x - 3,
        item.y - height,
        item.x + 3,
        item.y - height,
        item.x + 13,
        item.y,
      ]).fill({ color, alpha: 0.15 * pulse });
      f.moveTo(item.x, item.y)
        .lineTo(item.x, item.y - height)
        .stroke({ color, width: 3, alpha: 0.5 * pulse });
      f.moveTo(item.x, item.y)
        .lineTo(item.x, item.y - height * 0.65)
        .stroke({ color: 0xfff5d7, width: 1, alpha: 0.9 });
      for (let i = 0; i < 4; i++) {
        const y = item.y - ((r.time * 32 + i * 23) % height);
        diamond(f, item.x + Math.sin(i * 3 + r.time) * 7, y, 2, color, 0.7);
      }
      const y = item.y + Math.sin(r.time * 3) * 2;
      if (item.slot === "ring") {
        f.circle(item.x, y, 7).stroke({ color, width: 3 });
        diamond(f, item.x, y - 7, 3, 0xfff7d9);
      } else if (item.slot === "armor")
        f.poly([
          item.x - 8,
          y - 7,
          item.x - 4,
          y - 10,
          item.x + 4,
          y - 10,
          item.x + 8,
          y - 7,
          item.x + 6,
          y + 8,
          item.x - 6,
          y + 8,
        ])
          .fill(color)
          .stroke({ color: 0xffefd1, width: 1 });
      else {
        diamond(f, item.x, y, 10, color);
        diamond(f, item.x, y, 4, 0xfff9db);
      }
      f.ellipse(item.x, item.y + 13, 15, 5).stroke({
        color,
        width: 2,
        alpha: 0.75,
      });
    }
    for (const drop of r.drops) {
      this.sprite(
        `drop-${drop.id}`,
        drop.kind === "heal" ? "heal" : "xp",
        drop.x,
        drop.y + Math.sin(r.time * 3 + drop.id) * 2,
        drop.kind === "heal" ? 30 : 16,
        drop.kind === "heal" ? 30 : 16,
      );
      this.glow(
        drop.x,
        drop.y,
        drop.kind === "heal" ? 22 : 12,
        drop.kind === "heal" ? 0xbbedab : 0x91efd5,
        0.3,
      );
    }
    for (const b of r.projectiles) {
      if (b.enemy) {
        this.hostileCount++;
        // Dual contour works on sand, lava, snow and dark starfield alike.
        // Visual radius only; collision and original element colours unchanged.
        this.projectileContrast
          .circle(b.x, b.y, b.radius + 3)
          .fill({ color: 0x10212d, alpha: 0.9 })
          .stroke({ color: 0xfff4da, width: 1.7, alpha: 0.95 });
      }
      if (this.artEffects?.projectile(b, r)) continue;
      if (eventProjectile(d, b, r.time)) {
        this.glow(
          b.x,
          b.y,
          24,
          b.eventGlyph === "plasma" ? 0x68dbff : 0xffdbad,
          0.4,
        );
        continue;
      }
      if (bossProjectile(d, b, r.time)) {
        this.glow(
          b.x,
          b.y,
          24,
          b.enemyTheme === "sun"
            ? 0xffdda0
            : b.enemyTheme === "icefield"
              ? 0x8beaff
              : 0xc0b3ec,
          0.35,
        );
        continue;
      }
      if (equipmentProjectile(f, b, r.time)) {
        this.glow(b.x, b.y, 30, 0xa5d9ff, 0.3);
        continue;
      }
      const g = b.enemy ? d : f,
        els = b.context?.elementMask || [],
        color = b.enemy
          ? 0xffb196
          : elementColor(els, r.classId === "bow" ? 0xe4eeb2 : 0xc7abff),
        a = Math.atan2(b.vy, b.vx),
        scale = b.context?.chainScale ?? 1,
        alpha = scale < 1 ? 0.55 : 1;
      this.glow(b.x, b.y, b.enemy ? 17 : 32, color, alpha * 0.45);
      const owner = r.enemies.find((e) => e.id === b.owner),
        arrow = b.enemy
          ? owner?.kind === 4
          : !els.length && r.classId === "bow";
      const tx = b.x - Math.cos(a) * (arrow ? 28 : 23),
        ty = b.y - Math.sin(a) * (arrow ? 28 : 23);
      for (const [width, fade] of [
        [b.enemy ? 7 : 12, 0.16],
        [b.enemy ? 3 : 5, 0.45],
        [1, 0.9],
      ])
        g.moveTo(tx, ty)
          .lineTo(b.x, b.y)
          .stroke({ color, width, alpha: fade * alpha });
      if (arrow) {
        g.moveTo(tx, ty)
          .lineTo(b.x, b.y)
          .stroke({ color: 0xfff1c4, width: 2, alpha });
        const px = -Math.sin(a) * 4,
          py = Math.cos(a) * 4;
        g.poly([
          b.x + Math.cos(a) * 7,
          b.y + Math.sin(a) * 7,
          b.x + px,
          b.y + py,
          b.x - px,
          b.y - py,
        ]).fill({ color, alpha });
      } else if (els.includes("ice")) {
        diamond(g, b.x, b.y, 8, 0xd7fbff, alpha);
      } else if (els.includes("lightning")) {
        bolt(g, tx, ty, b.x, b.y, r.time, color, alpha);
        diamond(g, b.x, b.y, 6, color, alpha);
      } else {
        diamond(g, b.x, b.y, b.radius + (b.enemy ? 3 : 5), color, alpha);
        g.circle(b.x, b.y, b.radius * 0.5).fill({ color: 0xfff6d9, alpha });
        if (els.includes("fire"))
          g.poly([
            tx - 4,
            ty + 3,
            tx - 8,
            ty - 7,
            b.x,
            b.y,
            tx + 5,
            ty + 4,
          ]).fill({ color: 0xffaa58, alpha: 0.5 });
      }
    }
    for (const a of r.areas) {
      this.artEffects?.area(r, a, a.enemy ? d : f);
      if (a.ability === 215) {
        const phase = (r.time - a.starts) / 2;
        for (let i = 0; i < 4; i++) {
          const theta = r.time * 3 + (i * Math.PI) / 2;
          const radius = a.radius * (0.3 + 0.5 * (1 - phase));
          f.moveTo(
            a.x + Math.cos(theta) * radius,
            a.y + Math.sin(theta) * radius,
          )
            .quadraticCurveTo(
              a.x + Math.cos(theta + 0.8) * radius * 0.6,
              a.y + Math.sin(theta + 0.8) * radius * 0.6,
              a.x + Math.cos(theta + 1.6) * radius * 0.3,
              a.y + Math.sin(theta + 1.6) * radius * 0.3,
            )
            .stroke({ color: 0x8bd2c7, width: 3, alpha: 0.7 });
        }
        f.ellipse(a.x, a.y, 18, 9).fill({ color: 0x131c36, alpha: 0.9 });
        diamond(f, a.x, a.y, 7, 0xe1ffcf, 0.9);
      } else if (!bossBeam(a.enemy ? d : f, r, a))
        areaEffect(a.enemy ? d : f, r, a, !!this.adventure);
      if (r.time >= a.starts && a.shape !== "cone")
        this.glow(
          a.x,
          a.y,
          Math.min(180, a.radius + 20),
          a.enemy ? 0xff9b7c : elementColor(a.context?.elementMask),
          0.16,
        );
    }
    for (const m of r.modes)
      if (m.starts > r.time) {
        const e = r.enemies.find((e) => e.id === m.actor);
        if (!e) continue;
        if (bossTelegraph(d, r, e, m)) continue;
        if (m.type === "rush" || m.type === "slash") {
          const length = m.type === "rush" ? (e.kind > 5 ? 186 : 96) : 70,
            x = e.x + Math.cos(m.angle) * length,
            y = e.y + Math.sin(m.angle) * length;
          d.moveTo(e.x, e.y)
            .lineTo(x, y)
            .stroke({ color: 0xffb28b, width: e.radius * 2 + 6, alpha: 0.1 })
            .moveTo(e.x, e.y)
            .lineTo(x, y)
            .stroke({ color: 0xffd8a5, width: 2, alpha: 0.9 });
          diamond(d, x, y, 7, 0xffdda9, 0.9);
        } else if (m.type === "mark")
          d.circle(m.target.x, m.target.y, e.kind > 5 ? 65 : 55).stroke({
            color: 0xffd5a3,
            width: 2,
          });
        else
          d.circle(e.x, e.y, e.radius + 9).stroke({
            color: 0xffd5a3,
            width: 2,
          });
        this.glow(e.x, e.y, e.radius + 20, 0xffb180, 0.3);
      }
    const emission = sceneLights(r);
    this.lighting.draw(r, emission);
    for (const light of emission)
      this.glow(
        light.x,
        light.y,
        light.radius * 1.1,
        light.color,
        light.strength * (light.bloom ?? 0.22),
      );
    const active = new Set<number>();
    for (const v of r.visuals) {
      const progress = Math.max(
        0,
        Math.min(1, (v.until - r.time) / (v.duration || 0.45)),
      );
      if (v.kind === "damage" || v.kind === "heal") {
        active.add(v.id);
        let text = this.texts.get(v.id);
        if (!text) {
          text = this.textPool.take();
          text.text = `${v.kind === "heal" ? "+" : ""}${Math.abs(v.value)}`;
          text.style.fontSize = v.radius === 22 ? 22 : 16;
          text.tint = v.color;
          text.visible = true;
          this.texts.set(v.id, text);
          this.numbers.addChild(text);
        }
        text.position.set(v.x + 6, v.y - 16 - (1 - progress) * 22);
        text.alpha = progress;
      } else {
        const glowColor =
          v.kind === "thunder" || v.kind === "arc"
            ? 0x49baff
            : themeLightColor(v.enemyTheme, v.color);
        if (
          this.artEffects?.visual(r, v, v.enemy ? d : f) ||
          bossAction(v.enemy ? d : f, v, r.time) ||
          eventImpact(v.enemy ? d : f, v, r.time) ||
          equipmentEffect(v.enemy ? d : f, v, r.time) ||
          advancedEffect(v.enemy ? d : f, v, r.time)
        ) {
        } else if (v.enemyTheme && v.kind === "burst")
          enemyImpact(d, v, r.time, v.enemyTheme);
        else visualEffect(v.enemy ? d : f, r, v);
        if (v.kind === "thunder")
          for (let i = 1; i <= 5; i++) {
            const y = Math.max(14, v.y - i * 42);
            this.glow(
              v.x + Math.sin(i * 13 + r.time * 29) * 9,
              y,
              24 + progress * 15,
              glowColor,
              progress * 0.35,
            );
          }
        this.glow(
          v.x,
          v.y,
          Math.min(220, v.radius + 45),
          glowColor,
          progress *
            (v.kind === "burst"
              ? v.periodic
                ? 0.12
                : 0.32
              : v.kind === "thunder"
                ? 0.6
                : 0.25),
        );
      }
    }
    for (const [id, text] of this.texts)
      if (!active.has(id)) {
        this.textPool.release(text);
        this.texts.delete(id);
      }
    for (const [key, s] of this.sprites)
      if (
        !s.visible &&
        (key.startsWith("enemy") ||
          key.startsWith("drop") ||
          key.startsWith("hazard-") ||
          key.startsWith("ob-"))
      ) {
        this.spritePool.release(s);
        this.sprites.delete(key);
        if (key.startsWith("enemy-"))
          this.positions.delete(`e-${key.slice(6)}`);
      }
    const exposure = glowExposureScales(
      this.glows
        .slice(0, this.glowCount)
        .map((s) => ({ x: s.x, y: s.y, radius: s.width / 2, alpha: s.alpha })),
      this.glowGrid,
    );
    exposure.scales.forEach((scale, i) => {
      if (scale < 1) this.limitedGlows++;
      this.glows[i].alpha *= scale;
    });
  }
}
