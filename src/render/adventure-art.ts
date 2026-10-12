import { Assets, Rectangle, Texture } from "pixi.js";
import type { Run } from "../game/core/types";
import type { BiomeId } from "../game/data/biomes";
import landmarks from "../../tools/adventure/landmarks.json";
import catalog from "../../tools/adventure/catalog.json";

/** Ready, step and attack poses are authored, never palette swaps of legacy art.
 * Wind-up, facing, hit and leap still follow the simulation's six states. */
export class AdventureArt {
  readonly textures: Record<string, Texture[]> = {};
  readonly effects: Record<string, Texture> = {};
  private floors: Record<string, HTMLCanvasElement[]> = {};
  private canvas = document.createElement("canvas");
  readonly ground: Texture;
  constructor() {
    this.canvas.width = 1024;
    this.canvas.height = 640;
    this.ground = Texture.from(this.canvas);
    this.ground.source.scaleMode = "nearest";
  }
  async load(asset: (path: string) => string) {
    for (let batch = 0; batch < 8; batch++) {
      const atlas = await Assets.load<Texture>(
        asset(`assets/adventure/actors-${batch}.png`),
      );
      atlas.source.scaleMode = "nearest";
      const cell = atlas.width / 6;
      catalog.actors.slice(batch * 8, batch * 8 + 8).forEach(([name], i) => {
        const poses = Array.from(
          { length: 3 },
          (_, pose) =>
            new Texture({
              source: atlas.source,
              frame: new Rectangle(
                ((i % 2) * 3 + pose) * cell,
                Math.floor(i / 2) * cell,
                cell,
                cell,
              ),
            }),
        );
        this.textures[name] = [
          poses[0],
          poses[0],
          poses[1],
          poses[2],
          poses[0],
          poses[2],
        ];
      });
    }
    const heroes = await Assets.load<Texture>(
      asset("assets/adventure/heroes.png"),
    );
    heroes.source.scaleMode = "nearest";
    const heroCell = heroes.width / 6;
    ["sword", "bow", "mage", "pumpkin-knight"].forEach((name, row) => {
      this.textures[name] = Array.from(
        { length: 6 },
        (_, col) =>
          new Texture({
            source: heroes.source,
            frame: new Rectangle(
              col * heroCell,
              row * heroCell,
              heroCell,
              heroCell,
            ),
          }),
      );
    });
    const props = [...catalog.props, ...catalog.floors];
    for (let batch = 0; batch < 2; batch++) {
      const url = asset(`assets/adventure/world-${batch}.png`);
      const atlas = await Assets.load<Texture>(url);
      atlas.source.scaleMode = "nearest";
      const cell = atlas.width / 6;
      const image = new Image();
      image.src = url;
      await image.decode();
      props.slice(batch * 24, batch * 24 + 24).forEach(([name], i) => {
        const x = (i % 6) * cell,
          y = Math.floor(i / 6) * cell;
        const texture = new Texture({
          source: atlas.source,
          frame: new Rectangle(x, y, cell, cell),
        });
        this.textures[name] = Array(6).fill(texture);
        if (name.startsWith("floor-")) {
          const tile = document.createElement("canvas");
          tile.width = tile.height = 64;
          const ctx = tile.getContext("2d")!;
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(
            image,
            x + cell * 0.16,
            y + cell * 0.16,
            cell * 0.68,
            cell * 0.68,
            0,
            0,
            64,
            64,
          );
          this.floors[name.slice(6)] = [tile];
        }
      });
    }
    const floorImage = new Image();
    floorImage.src = asset("assets/adventure/floors.png");
    await floorImage.decode();
    const floorCell = floorImage.width / 6;
    catalog.floors.forEach(([name], i) => {
      this.floors[name.slice(6)] = [0, 1].map((variant) => {
        const index = i + variant * 9,
          tile = document.createElement("canvas");
        tile.width = tile.height = 64;
        const ctx = tile.getContext("2d")!;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
          floorImage,
          (index % 6) * floorCell + floorCell * 0.04,
          Math.floor(index / 6) * floorCell + floorCell * 0.04,
          floorCell * 0.92,
          floorCell * 0.92,
          0,
          0,
          64,
          64,
        );
        return tile;
      });
    });
    const landmarkAtlas = await Assets.load<Texture>(
      asset("assets/adventure/landmarks.png"),
    );
    landmarkAtlas.source.scaleMode = "nearest";
    const landmarkCell = landmarkAtlas.width / 6;
    landmarks.forEach(([name], i) => {
      const texture = new Texture({
        source: landmarkAtlas.source,
        frame: new Rectangle(
          (i % 6) * landmarkCell,
          Math.floor(i / 6) * landmarkCell,
          landmarkCell,
          landmarkCell,
        ),
      });
      this.textures[name] = Array(6).fill(texture);
      this.effects[name] = texture;
    });
    for (const name of ["tree", "rock", "pillar", "lake"])
      this.textures[name] = this.textures[`meadow-${name}`];
    for (const [i, name] of [
      "wolf",
      "slime",
      "knife",
      "archer",
      "shaman",
    ].entries())
      this.textures[`mon0${i + 1}`] = this.textures[name];
    this.textures.boss01 = this.textures.wolfking;
    this.textures.boss02 = this.textures.goatking;
    const atlas = await Assets.load<Texture>(
      asset("assets/adventure/effects.png"),
    );
    atlas.source.scaleMode = "nearest";
    const cell = atlas.width / 6;
    catalog.fx.forEach((name, i) => {
      const x = (i % 6) * cell,
        y = Math.floor(i / 6) * cell;
      // Authored glows can extend beyond the nominal grid. Explicit source
      // windows isolate each effect instead of sampling a neighbour's glow.
      const frame =
        name === "explosion-0"
          ? new Rectangle(
              x + cell * 0.125,
              y + cell * 0.125,
              cell * 0.75,
              cell * 0.75,
            )
          : name === "arcane-orb"
            ? new Rectangle(x, y + cell * 0.06, cell * 1.09, cell * 0.88)
            : name === "slash"
              ? new Rectangle(
                  x - cell * 0.06,
                  y + cell * 0.06,
                  cell * 0.86,
                  cell * 0.88,
                )
              : new Rectangle(x, y, cell, cell);
      this.effects[name] = new Texture({ source: atlas.source, frame });
    });
  }
  drawGround(r: Run) {
    const biome: BiomeId =
      r.room === 31 ? "castle" : (r.event?.theme ?? r.biome ?? "meadow");
    const ctx = this.canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    const palette: Record<BiomeId, string> = {
      meadow: "#355d43",
      desert: "#94784f",
      icefield: "#6d94a5",
      volcano: "#423b3c",
      jungle: "#294d3d",
      corruption: "#454056",
      crimson: "#593744",
      stars: "#303f57",
      castle: "#454951",
    };
    ctx.fillStyle = "#172a2e";
    ctx.fillRect(0, 0, 1024, 640);
    ctx.fillStyle = palette[biome];
    ctx.fillRect(32, 64, 960, 544);
    const tiles = this.floors[biome];
    if (tiles) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(32, 64, 960, 544);
      ctx.clip();
      for (let y = 64; y < 608; y += 64)
        for (let x = 32; x < 992; x += 64) {
          ctx.save();
          ctx.translate(x + 32, y + 32);
          if (biome !== "castle")
            ctx.scale((x / 32 + y / 32) % 3 ? 1 : -1, (x / 32) % 3 ? 1 : -1);
          ctx.drawImage(
            tiles[
              (Math.floor(x / 64) + Math.floor(y / 64) + r.room) % tiles.length
            ],
            -32,
            -32,
          );
          ctx.restore();
        }
      ctx.fillStyle = palette[biome];
      ctx.globalAlpha = biome === "volcano" || biome === "stars" ? 0.44 : 0.36;
      ctx.fillRect(32, 64, 960, 544);
      ctx.restore();
    }
    const route = r.route ?? [
      { x: 112, y: 320 },
      { x: 928, y: 320 },
    ];
    ctx.beginPath();
    route.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.strokeStyle = biome === "volcano" ? "#948878" : "#d6cbb0";
    ctx.lineWidth = 64;
    ctx.globalAlpha = 0.075;
    ctx.lineJoin = ctx.lineCap = "round";
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "#c4bc94";
    ctx.globalAlpha = 0.25;
    ctx.lineWidth = 2;
    ctx.strokeRect(33, 65, 958, 542);
    ctx.globalAlpha = 1;
    this.ground.source.update();
  }
}
