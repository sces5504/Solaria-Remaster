import { it, expect } from "vitest";
import { journeyFor } from "../../../src/game/data/journey";
import { seedFor, random } from "../../../src/game/core/primitives";
import { writeFileSync, mkdirSync } from "node:fs";
it("量測實際路線條件下九個Boss池，保留原始頻次", () => {
  const reports = [];
  for (const loop of [1, 2, 5, 10]) {
    const counts: Record<string, Record<number, number>> = {};
    const patterns = new Set<string>();
    const state = { rng: seedFor(5504, 991) };
    for (let i = 0; i < 20000; i++) {
      const seed = Math.floor(random(state) * 4294967296);
      const journey = journeyFor(seed, loop);
      patterns.add(journey.map((s) => `${s.biome}:${s.boss}`).join("/"));
      for (const s of journey) {
        const pool = (counts[s.biome] ??= {});
        pool[s.boss] = (pool[s.boss] ?? 0) + 1;
      }
    }
    reports.push({ loop, counts, patterns: patterns.size });
  }
  mkdirSync("/tmp/solaria-boss-pool", { recursive: true });
  writeFileSync(
    "/tmp/solaria-boss-pool/probe.json",
    JSON.stringify(reports, null, 2) + "\n",
  );
  console.log(JSON.stringify(reports));
  expect(reports).toHaveLength(4);
});
