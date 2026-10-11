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
import { beamEnd } from "../game/systems/geometry";
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
];
export class Stage {
  app = new Application();
  private terrain = new Graphics();
  private objects = new Container();
  private friendly = new Graphics();
  private danger = new Graphics();
  private numbers = new Container();
  private sprites = new Map<string, Sprite>();
  private texts = new Map<number, BitmapText>();
  private textures: Record<string, Texture[]> = {};
  private roomKey = "";
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
    const atlas = await Assets.load<Texture>(
      `${import.meta.env.BASE_URL}assets/solaria-atlas.png`,
    );
    atlas.source.scaleMode = "nearest";
    for (let row = 0; row < names.length; row++)
      this.textures[names[row]] = Array.from(
        { length: 6 },
        (_, i) =>
          new Texture({
            source: atlas.source,
            frame: new Rectangle(i * 48, row * 48, 48, 48),
          }),
      );
    BitmapFont.install({
      name: "SolariaNumbers",
      style: { fontFamily: "monospace", fontSize: 18, fill: 0xffffff },
      chars: "0123456789+−",
    });
    this.app.stage.addChild(
      this.terrain,
      this.objects,
      this.friendly,
      this.danger,
      this.numbers,
    );
  }
  private sprite(
    key: string,
    name: string,
    x: number,
    y: number,
    w = 48,
    h = 48,
    frame = 0,
  ) {
    let s = this.sprites.get(key);
    if (!s) {
      s = new Sprite(this.textures[name][frame]);
      s.anchor.set(0.5);
      this.objects.addChild(s);
      this.sprites.set(key, s);
    }
    s.visible = true;
    s.texture = this.textures[name][frame];
    s.position.set(x, y);
    s.width = w;
    s.height = h;
    return s;
  }
  draw(r: Run | null) {
    const g = this.terrain;
    for (const s of this.sprites.values()) s.visible = false;
    this.friendly.clear();
    this.danger.clear();
    if (!r) {
      g.clear().rect(0, 0, 1024, 640).fill(0x172a35);
      return;
    }
    const key = `${r.runId}-${r.room}`;
    if (this.roomKey !== key) {
      this.roomKey = key;
      g.clear().rect(0, 0, 1024, 640).fill(0x233e43);
      for (let y = 64; y < 608; y += 32)
        for (let x = 32; x < 992; x += 32) {
          const n = (x * 7 + y * 13 + r.seed) % 17;
          g.rect(x, y, 32, 32).fill(
            n < 4 ? 0x2b4547 : n < 10 ? 0x284244 : 0x263f43,
          );
          if (n < 5)
            g.moveTo(x + 8, y + 24)
              .lineTo(x + 10, y + 19)
              .lineTo(x + 12, y + 24)
              .stroke({ color: 0x648473, width: 1, alpha: 0.5 });
        }
      g.rect(0, 0, 1024, 64)
        .fill(0x14252d)
        .rect(0, 608, 1024, 32)
        .fill(0x172a30)
        .rect(0, 64, 32, 544)
        .fill(0x172a30)
        .rect(992, 64, 32, 544)
        .fill(0x172a30);
      g.rect(72, 294, 84, 52)
        .fill({ color: 0x9fc6b4, alpha: 0.12 })
        .rect(888, 294, 76, 52)
        .fill({ color: 0xd5c48b, alpha: 0.12 });
    }
    for (const o of r.obstacles) {
      if (o.durability <= 0) {
        this.friendly
          .rect(o.x, o.y, o.w, o.h)
          .fill({ color: 0x6b7d7b, alpha: 0.2 });
        continue;
      }
      const s = this.sprite(
        `ob-${o.id}`,
        o.kind,
        o.x + o.w / 2,
        o.y + o.h / 2,
        o.w + (o.kind === "tree" ? 24 : 0),
        o.h + (o.kind === "tree" ? 24 : 0),
        Math.floor(r.time * 2) % 2,
      );
      const ratio = o.durability / o.maxDurability;
      s.tint = ratio > 0.65 ? 0xffffff : ratio > 0.3 ? 0xb0a09b : 0x82757b;
      if (r.room === 5 && o.kind !== "lake") {
        this.friendly.rect(o.x, o.y + o.h + 2, o.w * ratio, 3).fill(0xa9b5a6);
      }
    }
    this.sprite(
      "door",
      "door",
      928,
      320,
      56,
      72,
      r.phase === "POST_CLEAR" ? 1 : 0,
    ).tint = r.phase === "POST_CLEAR" ? 0xffffff : 0x726d69;
    const p = r.player,
      frame =
        r.phase === "DEAD"
          ? 5
          : p.invulnerable > r.time
            ? 4
            : p.attackNext - r.time > 0.15
              ? 3
              : Math.floor(r.time * 6) % 3;
    const ps = this.sprite("player", r.classId, p.x, p.y, 42, 42, frame);
    ps.alpha = p.invulnerable > r.time && Math.floor(r.time * 20) % 2 ? 0.5 : 1;
    for (const e of r.enemies) {
      const name = names[e.kind + 2];
      const size = e.kind > 5 ? 90 : e.elite ? 56 : 42;
      const frame =
        e.transition > r.time
          ? 4
          : e.controlUntil > r.time
            ? 0
            : e.rushUntil > r.time
              ? 3
              : Math.floor(r.time * 5) % 3;
      const s = this.sprite(`enemy-${e.id}`, name, e.x, e.y, size, size, frame);
      s.tint =
        e.controlUntil > r.time
          ? 0x83e4f6
          : e.phase === 2
            ? 0xffb095
            : e.elite
              ? 0xffd58b
              : 0xffffff;
      if (e.hp < e.maxHP && e.kind <= 5) {
        this.friendly
          .rect(e.x - 18, e.y - 25, 36, 3)
          .fill(0x1b2630)
          .rect(e.x - 18, e.y - 25, (36 * e.hp) / e.maxHP, 3)
          .fill(0xc8947f);
      }
      if (e.iceUntil > r.time)
        this.friendly
          .circle(e.x, e.y, e.radius + 4)
          .stroke({ color: 0x9ee6f5, width: 1 });
      if (e.wetUntil > r.time)
        this.friendly
          .ellipse(e.x, e.y + e.radius, 16, 5)
          .stroke({ color: 0x65bbed, width: 2 });
      if (e.burn.length)
        this.friendly
          .circle(e.x, e.y - 20, 4 + Math.sin(r.time * 18) * 2)
          .fill({ color: 0xfbbc75, alpha: 0.7 });
    }
    const f = this.friendly,
      d = this.danger;
    f.rect(p.x - 20, p.y + 24, 40, 5)
      .fill(0x0d1c29)
      .rect(
        p.x - 20,
        p.y + 24,
        40 * Math.max(0, 1 - (p.skillReady - r.time) / r.stats.skillCD),
        5,
      )
      .fill(p.skillReady <= r.time ? 0xf5d98c : 0x7d91b3);
    if (p.blockUntil > r.time)
      f.circle(p.x, p.y, 26).stroke({ color: 0xfceac0, width: 3 });
    if (p.shields.length)
      f.circle(p.x, p.y, 24).stroke({ color: 0x9fdaeb, width: 2 });
    for (const item of r.items) {
      const color =
        item.rarity === "黃"
          ? 0xf4d480
          : item.rarity === "紫"
            ? 0xb29ee8
            : 0x8bbbed;
      f.circle(item.x, item.y, 9)
        .fill({ color, alpha: 0.25 })
        .rect(item.x - 4, item.y - 5, 8, 10)
        .fill(color);
    }
    for (const drop of r.drops)
      f.circle(drop.x, drop.y, drop.kind === "xp" ? 3 : 7).fill(
        drop.kind === "xp" ? 0xa9ceb5 : 0xe69791,
      );
    for (const projectile of r.projectiles) {
      const target = projectile.enemy ? d : f;
      const color = projectile.enemy
        ? 0xff8f86
        : projectile.context?.elementMask.includes("fire")
          ? 0xffc17b
          : projectile.context?.elementMask.includes("lightning")
            ? 0xcab3ff
            : 0xa1e5f4;
      target
        .moveTo(
          projectile.x - projectile.vx * 0.018,
          projectile.y - projectile.vy * 0.018,
        )
        .lineTo(projectile.x, projectile.y)
        .stroke({
          color,
          width: projectile.enemy ? 3 : 2,
          alpha:
            projectile.context?.chainScale && projectile.context.chainScale < 1
              ? 0.5
              : 1,
        });
      target.circle(projectile.x, projectile.y, projectile.radius).fill(color);
    }
    for (const a of r.areas) {
      const warning = r.time < a.starts;
      const target = a.enemy ? d : f;
      const color = a.enemy
        ? warning
          ? 0xffbc98
          : 0xff787e
        : a.context?.elementMask.includes("fire")
          ? 0xffbc7c
          : a.context?.elementMask.includes("lightning")
            ? 0xc8aaff
            : 0x83d6ed;
      if (a.shape === "beam") {
        const end = beamEnd(r, a, a.angle);
        target
          .moveTo(a.x, a.y)
          .lineTo(end.x, end.y)
          .stroke({
            color,
            width: warning ? 2 : a.width,
            alpha: warning ? 0.5 : 0.8,
          });
      } else if (a.shape === "cone") {
        target
          .moveTo(a.x, a.y)
          .arc(a.x, a.y, a.radius, a.angle - a.width / 2, a.angle + a.width / 2)
          .closePath()
          .fill({ color, alpha: 0.09 })
          .stroke({ color, width: 1 });
      } else {
        target
          .circle(a.x, a.y, a.radius)
          .fill({ color, alpha: warning ? 0.04 : 0.08 })
          .stroke({ color, width: warning ? 2 : 1, alpha: 0.75 });
        if (warning && a.enemy) {
          target
            .moveTo(a.x - 8, a.y)
            .lineTo(a.x + 8, a.y)
            .moveTo(a.x, a.y - 8)
            .lineTo(a.x, a.y + 8)
            .stroke({ color, width: 2 });
        }
      }
    }
    for (const m of r.modes)
      if (m.starts > r.time) {
        const e = r.enemies.find((e) => e.id === m.actor);
        if (!e) continue;
        if (m.type === "rush" || m.type === "slash") {
          const length = m.type === "rush" ? (e.kind > 5 ? 350 : 180) : 70;
          d.moveTo(e.x, e.y)
            .lineTo(
              e.x + Math.cos(m.angle) * length,
              e.y + Math.sin(m.angle) * length,
            )
            .stroke({ color: 0xffbd8c, width: 2 });
        } else
          d.circle(e.x, e.y, e.radius + 10).stroke({
            color: 0xffb994,
            width: 2,
          });
      }
    const active = new Set<number>();
    for (const v of r.visuals) {
      const progress = Math.max(0, (v.until - r.time) / 0.45);
      if (v.kind === "damage" || v.kind === "heal") {
        active.add(v.id);
        let text = this.texts.get(v.id);
        if (!text) {
          text = new BitmapText({
            text: `${v.kind === "heal" ? "+" : ""}${Math.abs(v.value)}`,
            style: {
              fontFamily: "SolariaNumbers",
              fontSize: v.radius === 22 ? 22 : 16,
              fill: v.color,
            },
          });
          this.texts.set(v.id, text);
          this.numbers.addChild(text);
        }
        text.position.set(v.x + 6, v.y - 16 - (1 - progress) * 22);
        text.alpha = progress;
      } else if (v.kind === "arc") {
        f.moveTo(v.x, v.y)
          .lineTo(
            v.x + Math.cos(v.angle) * v.value,
            v.y + Math.sin(v.angle) * v.value,
          )
          .stroke({ color: v.color, width: 2, alpha: progress });
      } else
        f.circle(v.x, v.y, v.radius * (1.1 - progress * 0.35)).stroke({
          color: v.color,
          width: 2,
          alpha: progress * 0.7,
        });
    }
    for (const [id, text] of this.texts)
      if (!active.has(id)) {
        text.destroy();
        this.texts.delete(id);
      }
    for (const [key, s] of this.sprites)
      if (!s.visible && key.startsWith("enemy")) {
        s.destroy();
        this.sprites.delete(key);
      }
  }
}
