import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { newRun } from "../../src/game/core/run";
import { bosses } from "../../src/game/data/bosses";
import {
  placeBoss,
  beginBossAttack,
} from "../../src/game/systems/biome-bosses";
test.skip(
  !process.env.SOLARIA_DOWNLOAD,
  "Only run with a built download artifact",
);
const file = pathToFileURL(
  resolve(
    process.env.SOLARIA_DOWNLOAD ||
      "/tmp/solaria-release-1.3.3/Solaria-Remaster-v1.3.3.html",
  ),
).href;
test("下載版：file離線啟動、三職肖像、戰鬥與存檔重載", async ({ page }) => {
  const errors: string[] = [];
  const external: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route(/^https?:/, (r) => {
    external.push(r.request().url());
    return r.abort();
  });
  await page.goto(file);
  await page.getByRole("button", { name: "開始新局", exact: true }).click();
  await page.getByRole("button", { name: "選擇旅人", exact: true }).click();
  await expect(page.locator(".class-card img")).toHaveCount(3);
  expect(
    await page
      .locator(".class-card img")
      .evaluateAll((imgs) =>
        imgs.every(
          (img) =>
            (img as HTMLImageElement).complete &&
            (img as HTMLImageElement).naturalWidth > 0,
        ),
      ),
  ).toBe(true);
  await page.locator('[data-action="class:mage"]').click();
  await expect(
    page.getByRole("button", { name: "進入戰鬥", exact: true }),
  ).toBeVisible();
  await expect(page.locator("#overlay")).not.toHaveClass(/saving/);
  await page.reload();
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
  await page.getByRole("button", { name: "進入戰鬥", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(() => (window as any).solariaDiagnostics().core.time),
    )
    .toBeGreaterThan(0.2);
  await page.keyboard.down("d");
  await page.waitForTimeout(350);
  await page.keyboard.up("d");
  await page.keyboard.press("Escape");
  await expect(page.locator("#overlay")).toHaveAttribute(
    "data-screen",
    "pause",
  );
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "匯出存檔", exact: true }).click();
  const saved = JSON.parse(
    await readFile((await (await pending).path())!, "utf8"),
  );
  expect(saved.current.classId).toBe("mage");
  expect(saved.current.player.x).toBeGreaterThan(saved.entry.player.x);
  expect(saved.current.time).toBeGreaterThan(0.2);
  expect(external).toEqual([]);
  expect(errors).toEqual([]);
});
test("下載版：匯入舊目標、Boss連續瞬移血量保持", async ({ page }) => {
  const r = newRun("mage", 133);
  r.room = 5;
  r.boss = 4;
  r.biome = "desert";
  r.obstacles = [];
  r.hazards = [];
  r.reserves = [];
  r.player.hp = 37;
  r.player.invulnerable = 100;
  const e = placeBoss(r, 4);
  e.phase = 2;
  e.hp = e.maxHP / 2 - 123;
  e.nextAttack = 100;
  r.enemies = [e];
  beginBossAttack(r, e, bosses[4].attacks[1][0]);
  r.modes[0].target = { ...r.player };
  page.on("dialog", (d) => d.accept());
  await page.route(/^https?:/, (r) => r.abort());
  await page.goto(file);
  await page.getByRole("button", { name: "匯入存檔", exact: true }).click();
  await page.locator("#import-file").setInputFiles({
    name: "download-boss.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({ version: 1, revision: 0, current: r, entry: r }),
    ),
  });
  await expect(page.getByRole("status")).toContainText("匯入成功");
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
  await page.getByRole("button", { name: "進入戰鬥", exact: true }).click();
  await expect
    .poll(
      () => page.evaluate(() => (window as any).solariaDiagnostics().core.time),
      { timeout: 60000 },
    )
    .toBeGreaterThan(3);
  await page.keyboard.press("Escape");
  await expect(page.locator("#overlay")).toHaveAttribute(
    "data-screen",
    "pause",
  );
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "匯出存檔", exact: true }).click();
  const saved = JSON.parse(
    await readFile((await (await pending).path())!, "utf8"),
  );
  expect(saved.current.enemies.find((b: any) => b.id === e.id).hp).toBe(e.hp);
});
