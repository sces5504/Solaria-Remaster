import { isolateProp } from "./prop-isolation";
import { paintRoomGround, grassCanvas } from "./room-ground";
import { isolateActor } from "./actor-isolation";
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
  readonly isolatedPixels: Record<string, number> = {};
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
      const image = new Image();
      image.src = asset(`assets/adventure/actors-${batch}.png`);
      await image.decode();
      const isolated = document.createElement("canvas");
      isolated.width = image.width;
      isolated.height = image.height;
      const ctx = isolated.getContext("2d")!;
      ctx.drawImage(image, 0, 0);
      const cellSize = image.width / 6;
      for (let row = 0; row < 4; row++)
        for (let col = 0; col < 6; col++) {
          const data = ctx.getImageData(
            col * cellSize,
            row * cellSize,
            cellSize,
            cellSize,
          );
          const actorIndex = batch * 8 + row * 2 + Math.floor(col / 3);
          const name = catalog.actors[actorIndex][0];
          this.isolatedPixels[name] =
            (this.isolatedPixels[name] ?? 0) +
            isolateActor(data.data, cellSize, cellSize);
          ctx.putImageData(data, col * cellSize, row * cellSize);
        }
      const atlas = Texture.from(isolated);
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
        // Santa's hats extend above the nominal last-row cell. Sample the
        // authored overflow from the original atlas before normal isolation.
        if (name === "frost-santa")
          for (let pose = 0; pose < 3; pose++) {
            const portrait = document.createElement("canvas");
            portrait.width = cell;
            portrait.height = cell + 48;
            const pc = portrait.getContext("2d")!;
            pc.drawImage(
              image,
              pose * cell,
              3 * cell - 48,
              cell,
              cell + 48,
              0,
              0,
              cell,
              cell + 48,
            );
            const data = pc.getImageData(0, 0, cell, cell + 48);
            isolateActor(data.data, cell, cell + 48);
            pc.putImageData(data, 0, 0);
            poses[pose] = Texture.from(portrait);
            poses[pose].source.scaleMode = "nearest";
          }
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
      const image = new Image();
      image.src = url;
      await image.decode();
      const isolated = document.createElement("canvas");
      isolated.width = image.width;
      isolated.height = image.height;
      const ctx = isolated.getContext("2d")!;
      ctx.drawImage(image, 0, 0);
      const cell = image.width / 6;
      props.slice(batch * 24, batch * 24 + 24).forEach(([name], i) => {
        if (name.startsWith("floor-")) return;
        const x = (i % 6) * cell,
          y = Math.floor(i / 6) * cell;
        const data = ctx.getImageData(x, y, cell, cell);
        this.isolatedPixels[name] = isolateProp(data.data, cell, cell, name);
        ctx.putImageData(data, x, y);
      });
      const atlas = Texture.from(isolated);
      atlas.source.scaleMode = "nearest";
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
    const grass = Texture.from(grassCanvas());
    grass.source.scaleMode = "nearest";
    this.textures["jungle-grass"] = Array(6).fill(grass);
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
    const semantic = await Assets.load<Texture>(
      asset("assets/adventure/semantic-effects.png"),
    );
    semantic.source.scaleMode = "nearest";
    const names = [
      "snowflake",
      "frost-wind",
      "ice-spike",
      "water-swirl",
      "electric-arc",
      "electric-ring",
      "phoenix",
      "sword-wave",
      "star-blade",
      "star-echo",
      "charged-splash",
      "arcane-pulse",
      "fire-ring",
      "frostfire-ring",
      "gravity-swirl",
      "meteor-trail",
      "ice-flash",
      "water-splash",
      "leaf-blades",
      "gift-impact",
      "blood-splash",
      "void-pulse",
      "blue-slash",
      "snowflakes",
    ];
    const sc = semantic.width / 6;
    names.forEach((name, i) => {
      this.effects[name] = new Texture({
        source: semantic.source,
        frame: new Rectangle((i % 6) * sc, Math.floor(i / 6) * sc, sc, sc),
      });
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
    paintRoomGround(ctx, r.scenery ?? [], biome);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "#c4bc94";
    ctx.globalAlpha = 0.25;
    ctx.lineWidth = 2;
    ctx.strokeRect(33, 65, 958, 542);
    ctx.globalAlpha = 1;
    this.ground.source.update();
  }
}
