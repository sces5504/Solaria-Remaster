import { describe, expect, it } from "vitest";
import { abilityPresentation } from "../../src/render/ability-presentation";
import { isolateActor } from "../../src/render/actor-isolation";
import { newRun, idleCommand } from "../../src/game/core/run";
import { castSkill, updateSkills } from "../../src/game/systems/skills";
import { updateAreas } from "../../src/game/systems/combat";

describe("ability presentation provenance", () => {
  it("real skill casts distinguish elemental fields from planetary explosions", () => {
    const r = newRun("mage", 42);
    r.cards = { 17: 1, 18: 1, 22: 1, 26: 1, 30: 1, 36: 1, 37: 1, 39: 1, 59: 1 };
    r.player.capacitor = 3;
    castSkill(r, idleCommand(r));
    r.time = 0.31;
    updateAreas(r);
    const names = r.visuals
      .filter((v) => v.kind === "burst")
      .map((v) =>
        abilityPresentation(v.sourceAbilityId, v.elements, v.periodic),
      );
    expect(names).toEqual(
      expect.arrayContaining([
        "explosion",
        "hail",
        "snow",
        "fire-ring",
        "vortex",
        "electric",
        "storm-vortex",
        "tidal-pulse",
        "frostfire",
      ]),
    );
    expect(r.visuals.find((v) => v.sourceAbilityId === 30)?.periodic).toBe(
      true,
    );
  });
  it("infused planetary explosions retain their identity; old saves fall back by element", () => {
    expect(abilityPresentation(158, ["lightning"])).toBe("explosion");
    expect(abilityPresentation(undefined, ["ice"], true)).toBe("snow");
    expect(abilityPresentation(undefined, ["lightning"])).toBe("electric");
    expect(abilityPresentation(215)).toBe("gravity");
    expect(abilityPresentation(216)).toBe("meteor");
  });
  it("successful sword counterattack exports its own identity", () => {
    const r = newRun("sword", 42);
    r.time = 1;
    r.player.counterAt = 0.5;
    updateSkills(r, idleCommand(r));
    expect(r.visuals.find((v) => v.kind === "slash")).toMatchObject({
      sourceAbilityId: 144,
      color: 0x64ceff,
    });
  });
});

it("atlas sampling removes distant neighbour debris but preserves body and detached weapon", () => {
  const width = 32,
    data = new Uint8ClampedArray(width * width * 4);
  const rect = (x: number, y: number, w: number, h: number, alpha = 255) => {
    for (let yy = y; yy < y + h; yy++)
      for (let xx = x; xx < x + w; xx++)
        data[(yy * width + xx) * 4 + 3] = alpha;
  };
  rect(10, 10, 10, 14);
  rect(22, 12, 2, 8);
  rect(0, 0, 3, 2);
  rect(9, 12, 1, 2, 8);
  expect(isolateActor(data, width, width)).toBe(6);
  expect(data[3]).toBe(0);
  expect(data[(12 * width + 22) * 4 + 3]).toBe(255);
  expect(data[(12 * width + 9) * 4 + 3]).toBe(8);
});

it("empty bounding-box corners do not count as attached silhouette", () => {
  const w = 40,
    data = new Uint8ClampedArray(w * w * 4);
  const rect = (x: number, y: number, width: number, height: number) => {
    for (let yy = y; yy < y + height; yy++)
      for (let xx = x; xx < x + width; xx++) data[(yy * w + xx) * 4 + 3] = 255;
  };
  rect(10, 5, 4, 25);
  rect(10, 5, 17, 4);
  rect(23, 23, 3, 3); // Inside body bounds, but far from actual body pixels.
  rect(29, 6, 2, 4); // Genuine nearby detached weapon.
  expect(isolateActor(data, w, w)).toBe(9);
  expect(data[(23 * w + 23) * 4 + 3]).toBe(0);
  expect(data[(6 * w + 29) * 4 + 3]).toBe(255);
});
