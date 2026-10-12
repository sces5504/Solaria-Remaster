import { test, expect, type Page } from "@playwright/test";
import { newRun } from "../../src/game/core/run";
import { basic } from "../../src/game/systems/skills";
import { idleCommand } from "../../src/game/core/run";
import { visual, updateAreas } from "../../src/game/systems/combat";
import { grantTestCard } from "../../src/game/systems/progression";
import type { Run } from "../../src/game/core/types";
test.beforeEach(async ({ page }) => {
  page.on("dialog", (d) => d.accept());
});
async function fixture(page: Page, r: Run) {
  await page.goto("/");
  await page.getByRole("button", { name: "匯入存檔", exact: true }).click();
  await page.locator("#import-file").setInputFiles({
    name: "last-polish.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({ version: 1, revision: 0, current: r, entry: r }),
    ),
  });
  await expect(page.getByRole("status")).toContainText("匯入成功");
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
  await expect(page.locator("#hud .status")).toBeVisible();
  await page.locator("#overlay").evaluate((n) => {
    (n as HTMLElement).style.visibility = "hidden";
  });
}
// Inspect an actual composited WebGL screenshot via a separate 2D image, without
// changing renderer internals or relying on a discarded WebGL backbuffer.
async function pixels(page: Page, shot: Buffer, mode: "light" | "bar") {
  return page.evaluate(
    async ({ base64, mode }) => {
      const img = new Image();
      img.src = `data:image/png;base64,${base64}`;
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      if (mode === "light") {
        const x = Math.floor((558 / 1024) * img.width),
          y = Math.floor((357 / 640) * img.height);
        const data = ctx.getImageData(x - 3, y - 3, 7, 7).data;
        let sum = 0;
        for (let i = 0; i < data.length; i += 4)
          sum += data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722;
        return sum / 49;
      }
      const y = Math.floor((349 / 640) * img.height);
      const data = ctx.getImageData(0, y, img.width, 1).data;
      let longest = 0,
        current = 0;
      for (let x = 0; x < img.width; x++) {
        const i = x * 4;
        current =
          data[i] > 165 && data[i + 1] > 150 && data[i + 2] > 90
            ? current + 1
            : 0;
        longest = Math.max(longest, current);
      }
      return (longest / img.width) * 1024;
    },
    { base64: shot.toString("base64"), mode },
  );
}
test("發光藍雷實際照亮附近地面，長時間就緒冷卻條不超出角色腳下", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const r = newRun("sword", 951);
  r.phase = "ROOM_INTRO";
  r.time = 100;
  r.player.x = 430;
  r.enemies = [];
  r.reserves = [];
  r.obstacles = [];
  await fixture(page, r);
  const before = await page.locator("canvas").screenshot();
  const dark = await pixels(page, before, "light");
  expect(await pixels(page, before, "bar")).toBeLessThanOrEqual(44);
  visual(r, "thunder", { x: 500, y: 320 }, 0, 0x49baff, 40, 0, { enemy: true });
  await fixture(page, r);
  const lit = await page
    .locator("canvas")
    .screenshot({ path: "test-results/meadow-local-light.png" });
  expect(await pixels(page, lit, "light")).toBeGreaterThan(dark * 1.15);
  expect(errors).toEqual([]);
});
test("扇形噴火、蒸氣水柱、強光藍雷與無黑邊石門的實際畫面", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const r = newRun("sword", 952);
  r.phase = "ROOM_INTRO";
  r.enemies = [];
  r.reserves = [];
  r.player.x = 230;
  grantTestCard(r, 20);
  basic(r, { ...idleCommand(r), pointerWorld: { x: 500, y: 320 } });
  r.time = 0.15;
  updateAreas(r);
  visual(r, "steam", { x: 610, y: 380 }, 0, 0xb9f5ff, 150, 0, {
    duration: 0.7,
  });
  visual(r, "thunder", { x: 760, y: 250 }, 0, 0x49baff, 60, 0, { enemy: true });
  r.time = 0.28;
  await fixture(page, r);
  await page.screenshot({
    path: "test-results/final-flame-steam-blue-door.png",
  });
  const alpha = await page.evaluate(async () => {
    const img = new Image();
    img.src = new URL("assets/solaria-atlas.png", location.href).href;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 96;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 14 * 96, 96, 96, 0, 0, 96, 96);
    const data = ctx.getImageData(0, 0, 96, 96).data;
    let ink = 0;
    for (let i = 0; i < data.length; i += 4)
      if (
        data[i] === 17 &&
        data[i + 1] === 35 &&
        data[i + 2] === 43 &&
        data[i + 3]
      )
        ink++;
    return {
      ink,
      corner: data[3],
      outerStoneAlpha: ctx.getImageData(12, 50, 1, 1).data[3],
    };
  });
  expect(alpha).toEqual({ ink: 0, corner: 0, outerStoneAlpha: 255 });
  expect(errors).toEqual([]);
});
