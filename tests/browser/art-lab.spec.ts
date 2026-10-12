import { test, expect, type Page } from "@playwright/test";
import { createHash } from "node:crypto";
const diagnostics = (page: Page) =>
  page.evaluate(() =>
    (
      window as unknown as {
        solariaArtDiagnostics: () => {
          style: string;
          time: number;
          tick: number;
          paused: boolean;
          comparison: boolean;
          player: { x: number; y: number };
          originalBasics?: number;
          enemies: {
            kind: number;
            monsterId?: number;
            bossId?: number;
            phase: number;
          }[];
          renderer: { renderer: string };
        };
      }
    ).solariaArtDiagnostics(),
  );
async function ready(page: Page) {
  await page.goto(process.env.SOLARIA_ART_REVIEW_URL ?? "./art-lab.html");
  await expect(page.locator("#loading")).toBeHidden({ timeout: 30000 });
}
test("三種原創風格在同一刻切換，三款並排與細節放大", async ({ page }, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await ready(page);
  const initial = await diagnostics(page),
    images: string[] = [];
  expect(initial.renderer.renderer).toBe("webgl");
  for (const style of ["adventure", "gothic", "sculpted"]) {
    await page.locator(`[data-style=${style}]`).click();
    const state = await diagnostics(page);
    expect(state.style).toBe(style);
    expect(state.tick).toBe(initial.tick);
    expect(state.player).toEqual(initial.player);
    expect(state.enemies).toEqual(initial.enemies);
    const screenshot = await page
      .locator("#viewport")
      .screenshot({ path: info.outputPath(`${style}-meadow.png`) });
    images.push(createHash("sha256").update(screenshot).digest("hex"));
  }
  expect(new Set(images).size).toBe(3);
  await page.getByRole("button", { name: "三款並排", exact: true }).click();
  await expect(page.locator("#comparison img")).toHaveCount(3);
  expect((await diagnostics(page)).tick).toBe(initial.tick);
  const sources = await page
    .locator("#comparison img")
    .evaluateAll((elements) =>
      elements.map((e) => (e as HTMLImageElement).src),
    );
  expect(new Set(sources).size).toBe(3);
  await page.locator(".compare-card").first().click();
  expect((await diagnostics(page)).style).toBe("adventure");
  expect((await diagnostics(page)).comparison).toBe(false);
  await page.getByRole("button", { name: "放大素材細節", exact: true }).click();
  await expect(page.locator("#details")).toBeVisible();
  await page.locator("#asset").selectOption("boss18");
  await expect(page.locator("#detail-cards canvas")).toHaveCount(3);
  await page.screenshot({ path: info.outputPath("boss-detail.png") });
  await page.getByRole("button", { name: "關閉", exact: true }).click();
  expect(errors).toEqual([]);
});
test("三地形、八種怪物與六王兩階段全部能切換", async ({ page }, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await ready(page);
  const matrix = {
    meadow: { mon: [1, 2], boss: [1, 2] },
    volcano: { mon: [12, 13, 14], boss: [7, 8] },
    castle: { mon: [27, 28, 29], boss: [17, 18] },
  };
  for (const [biome, { mon, boss }] of Object.entries(matrix)) {
    await page.locator("#biome").selectOption(biome);
    for (const id of mon) {
      await page.locator("#subject").selectOption(`mon${id}`);
      const d = await diagnostics(page);
      expect(d.enemies).toHaveLength(4);
      expect(d.enemies.every((e) => (e.monsterId ?? e.kind) === id)).toBe(true);
    }
    for (const id of boss) {
      await page.locator("#subject").selectOption(`boss${id}`);
      await page.locator("#phase").selectOption("2");
      const d = await diagnostics(page);
      expect(d.enemies).toHaveLength(1);
      expect(d.enemies[0].phase).toBe(2);
      expect(d.enemies[0].bossId ?? d.enemies[0].kind - 5).toBe(id);
    }
    await page.locator("#subject").selectOption("mixed");
    await page.locator("#phase").selectOption("1");
    for (const style of ["adventure", "gothic", "sculpted"]) {
      await page.locator(`[data-style=${style}]`).click();
      await page
        .locator("#viewport")
        .screenshot({ path: info.outputPath(`${style}-${biome}.png`) });
    }
  }
  expect(errors).toEqual([]);
});
test("真實核心手動移動、普攻、暫停保時且不改存檔與音量設定", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("solaria-volume", "0.7");
    localStorage.setItem("solaria-last-volume", "0.6");
  });
  await ready(page);
  await page.locator("#mode").selectOption("manual");
  await page.getByRole("button", { name: "播放演示", exact: true }).click();
  const before = await diagnostics(page);
  await page.keyboard.down("KeyD");
  await expect
    .poll(async () => (await diagnostics(page)).player.x)
    .toBeGreaterThan(before.player.x + 15);
  await page.keyboard.up("KeyD");
  const canvas = page.locator("#stage canvas"),
    box = (await canvas.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.5);
  await page.mouse.down();
  await expect
    .poll(async () => (await diagnostics(page)).originalBasics ?? 0)
    .toBeGreaterThan(0);
  await page.mouse.up();
  await page.mouse.click(box.x + box.width * 0.7, box.y + box.height * 0.5, {
    button: "right",
  });
  await page.getByRole("button", { name: "暫停畫面", exact: true }).click();
  const stopped = await diagnostics(page);
  await page.locator("[data-style=gothic]").click();
  await page.locator("[data-style=sculpted]").click();
  expect((await diagnostics(page)).tick).toBe(stopped.tick);
  await page.getByRole("button", { name: "音效 關", exact: true }).click();
  expect(
    await page.evaluate(() => [
      localStorage.getItem("solaria-volume"),
      localStorage.getItem("solaria-last-volume"),
    ]),
  ).toEqual(["0.7", "0.6"]);
  expect(await page.evaluate(async () => await indexedDB.databases())).toEqual(
    [],
  );
});
test("窄與寬畫面都保持8:5且控制項可用", async ({ page }) => {
  await ready(page);
  for (const size of [
    { width: 1280, height: 900 },
    { width: 1920, height: 1080 },
    { width: 680, height: 1000 },
  ]) {
    await page.setViewportSize(size);
    const box = (await page.locator("#viewport").boundingBox())!;
    expect(box.width / box.height).toBeCloseTo(1.6, 2);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test("點風格按鈕後快捷鍵可用，並排進入全螢幕保持畫布8:5", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await ready(page);
  await page.locator("[data-style=gothic]").click();
  await page.keyboard.press("Digit3");
  expect((await diagnostics(page)).style).toBe("sculpted");
  await page.getByRole("button", { name: "三款並排", exact: true }).click();
  await page.getByRole("button", { name: "全螢幕", exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => Boolean(document.fullscreenElement)))
    .toBe(true);
  expect((await diagnostics(page)).comparison).toBe(false);
  for (const size of [
    { width: 1280, height: 900 },
    { width: 1920, height: 1080 },
  ]) {
    // Chromium forbids resizing a native fullscreen window. Restore it first,
    // resize the normal window, then verify the actual canvas in fullscreen.
    await page.evaluate(() => document.exitFullscreen());
    await expect
      .poll(() => page.evaluate(() => Boolean(document.fullscreenElement)))
      .toBe(false);
    await page.setViewportSize(size);
    await page.getByRole("button", { name: "全螢幕", exact: true }).click();
    await expect
      .poll(() => page.evaluate(() => Boolean(document.fullscreenElement)))
      .toBe(true);
    const box = (await page.locator("#stage canvas").boundingBox())!;
    expect(box.width / box.height).toBeCloseTo(1.6, 2);
  }
  await page.evaluate(() => document.exitFullscreen());
  expect(errors).toEqual([]);
});
