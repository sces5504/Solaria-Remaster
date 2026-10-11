import { test, expect } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import { newRun } from "../../src/game/core/run";
import { actor } from "../../src/game/data/world";
import { grantTestCard, derive } from "../../src/game/systems/progression";
import { equipmentCatalog } from "../../src/game/data/equipment";
import { shoot } from "../../src/game/systems/combat";
import { syncPumpkin } from "../../src/game/systems/companion";

test("600彈／十二目標／五級分裂鏈禮物／多職技場的Cloud WebGL壓力，保留獨立傷字", async ({
  page,
}, info) => {
  test.setTimeout(90000);
  const r = newRun("bow", 712);
  r.obstacles = [];
  r.reserves = [];
  for (const id of [15, 28, 74]) grantTestCard(r, id);
  for (const id of [50, 51, 52, 29, 17, 18])
    for (let level = 0; level < 5; level++) grantTestCard(r, id);
  r.enemies = Array.from({ length: 12 }, (_, i) => {
    const e = actor(
      20000 + i,
      1,
      460 + (i % 4) * 40,
      210 + Math.floor(i / 4) * 75,
    );
    e.hp = e.maxHP = 1e8;
    return e;
  });
  for (const ability of ["ghostArmor", "frostBell", "starFlow"] as const) {
    const d = equipmentCatalog[ability];
    r.equipment[d.slot] = {
      id: ability,
      slot: d.slot,
      rarity: d.rarity,
      ability,
      name: d.name,
      affixes: ability === "frostBell" ? [{ stat: "crit", value: 3 }] : [],
      x: 0,
      y: 0,
    };
  }
  r.stats = derive(r);
  r.player.x = 330;
  r.player.y = 320;
  r.player.invulnerable = 1e6;
  syncPumpkin(r);
  for (let i = 0; i < 600; i++)
    shoot(
      r,
      { x: 650 + (i % 300), y: 90 + (i % 480) },
      Math.PI,
      10,
      140,
      2000,
      null,
      1,
      true,
    );
  await page.goto("/");
  await page.getByRole("button", { name: "匯入存檔", exact: true }).click();
  await page.locator("#import-file").setInputFiles({
    name: "isolated-render-stress.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({ version: 1, revision: 0, current: r, entry: r }),
    ),
  });
  await expect(page.getByRole("status")).toContainText("匯入成功");
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "進入戰鬥", exact: true }),
  ).toBeVisible();
  const initial = await page.evaluate(() =>
    (
      window as unknown as { solariaDiagnostics: () => any }
    ).solariaDiagnostics(),
  );
  expect(initial.core.enemyProjectiles).toBe(600);
  await page.getByRole("button", { name: "進入戰鬥", exact: true }).click();
  const box = (await page.getByLabel("Solaria 遊戲畫布").boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.52, box.y + box.height * 0.45);
  await page.mouse.down();
  await page.mouse.click(box.x + box.width * 0.52, box.y + box.height * 0.45, {
    button: "right",
  });
  const measurement = await page.evaluate(async () => {
    const diagnostics = () =>
      (
        window as unknown as { solariaDiagnostics: () => any }
      ).solariaDiagnostics();
    const frames: number[] = [];
    let last = performance.now(),
      start = last,
      peakNumbers = 0,
      peakProjectiles = 0,
      peakFields = 0;
    while (performance.now() - start < 10000) {
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
      const now = performance.now();
      frames.push(now - last);
      last = now;
      const d = diagnostics();
      peakNumbers = Math.max(peakNumbers, d.core.damageNumbers);
      peakProjectiles = Math.max(peakProjectiles, d.core.projectiles);
      peakFields = Math.max(peakFields, d.core.areas);
      if (d.core.damageNumbers !== d.render.texts)
        throw Error("有效傷字未逐次呈現");
    }
    frames.sort((a, b) => a - b);
    const gl =
      document.querySelector("canvas")!.getContext("webgl2") ??
      document.querySelector("canvas")!.getContext("webgl");
    const ext = gl?.getExtension("WEBGL_debug_renderer_info");
    return {
      kind: "CLOUD_WEBGL_SYNTHETIC_STRESS",
      hardwareGpuAcceptance: "NOT_RUN",
      fixture: "保護觀測角色並保持目標生命，僅壓力場景，不通關或當平衡驗收",
      seconds: (last - start) / 1000,
      frameCount: frames.length,
      meanFrameMs: frames.reduce((a, b) => a + b, 0) / frames.length,
      p95FrameMs: frames[Math.floor(frames.length * 0.95)],
      peakNumbers,
      peakProjectiles,
      peakFields,
      renderer: ext ? gl!.getParameter(ext.UNMASKED_RENDERER_WEBGL) : "未提供",
      last: diagnostics(),
    };
  });
  await page.mouse.up();
  expect(measurement.peakNumbers).toBeGreaterThan(10);
  expect(measurement.peakFields).toBeGreaterThanOrEqual(2);
  const path = info.outputPath("dense-webgl.json");
  await writeFile(path, JSON.stringify({ initial, measurement }, null, 2));
  await info.attach("dense-webgl.json", {
    path,
    contentType: "application/json",
  });
  await page
    .getByLabel("Solaria 遊戲畫布")
    .screenshot({ path: info.outputPath("dense-webgl.png") });
});
