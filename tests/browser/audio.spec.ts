import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";

test("實際音效合成以OfflineAudioContext核對職業、蒸氣、雷電、格擋與結局波形", async ({
  page,
}, info) => {
  await page.goto("/");
  const source = stripTypeScriptTypes(
    await readFile("src/audio/sound-bank.ts", "utf8"),
  ).replace("export function playSound", "function playSound");
  const result = await page.evaluate(async (code) => {
    const play = new Function(`${code};return playSound;`)() as (
      ctx: OfflineAudioContext,
      output: AudioNode,
      kind: string,
      role: string,
      elements: string[],
      ability: number,
    ) => void;
    const cases = [
      { kind: "cast", role: "sword" },
      { kind: "cast", role: "bow" },
      { kind: "cast", role: "mage" },
      { kind: "steam", role: "mage" },
      { kind: "thunder", role: "mage" },
      { kind: "block", role: "sword" },
      { kind: "victory", role: "mage" },
      { kind: "death", role: "mage" },
    ];
    const results = [];
    for (const c of cases) {
      const ctx = new OfflineAudioContext(1, 72000, 48000);
      play(ctx, ctx.destination, c.kind, c.role, [], 0);
      const buffer = await ctx.startRendering(),
        wave = buffer.getChannelData(0);
      let hash = 2166136261,
        peak = 0,
        power = 0,
        activeSamples = 0;
      for (const v of wave) {
        hash = Math.imul(hash ^ Math.round(v * 32767), 16777619);
        peak = Math.max(peak, Math.abs(v));
        power += v * v;
        if (Math.abs(v) > 1e-6) activeSamples++;
      }
      results.push({
        key: `${c.kind}:${c.role}`,
        hash: hash >>> 0,
        peak,
        rms: Math.sqrt(power / Math.max(1, activeSamples)),
      });
    }
    return results;
  }, source);
  await info.attach("audio-fingerprints.json", {
    body: JSON.stringify(result, null, 2),
    contentType: "application/json",
  });
  expect(new Set(result.map((r) => r.hash)).size).toBe(result.length);
  for (const r of result) {
    expect(r.peak, r.key).toBeGreaterThan(0.005);
    expect(r.peak, r.key).toBeLessThan(1);
    expect(r.rms, r.key).toBeGreaterThan(0.001);
  }
});
