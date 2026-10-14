import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { newRun } from "../../src/game/core/run";
import type { Run, Visual } from "../../src/game/core/types";
async function load(page: Page, r: Run) {
  page.removeAllListeners("dialog");
  page.on("dialog", (d) => d.accept());
  await page.goto("./");
  await page.getByRole("button", { name: "匯入存檔", exact: true }).click();
  await page.locator("#import-file").setInputFiles({
    name: "health-light.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({ version: 1, revision: 0, current: r, entry: r }),
    ),
  });
  await expect(page.getByRole("status")).toContainText("匯入成功");
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
  await expect(page.locator("#overlay")).toHaveAttribute("data-screen", "game");
}
async function exported(page: Page) {
  await expect(page.locator("#overlay")).toHaveAttribute("data-screen", "game");
  await page.keyboard.press("Escape");
  await expect(page.locator("#overlay")).toHaveAttribute(
    "data-screen",
    "pause",
  );
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "匯出存檔", exact: true }).click();
  return JSON.parse(await readFile((await (await pending).path())!, "utf8"));
}
test("生命曲線：舊Lv30保存實際升至31、加血、匯出重載不再次回血", async ({
  page,
}) => {
  const r = newRun("sword", 13310);
  delete r.healthGrowthVersion;
  r.level = 30;
  r.xp = 680;
  r.player.hp = 75;
  r.phase = "SETTLEMENT";
  r.settledOnce = true;
  r.settlementEnds = 0.15;
  r.enemies = [];
  r.reserves = [];
  r.hazards = [];
  r.drops = [];
  await load(page, r);
  await expect
    .poll(
      () =>
        page.evaluate(() => (window as any).solariaDiagnostics().core.phase),
      { timeout: 60000 },
    )
    .toBe("UPGRADE_CHOICE");
  await expect(page.locator("#hud")).toContainText("Lv.31");
  await expect(page.locator("#hud")).toContainText("300 / 375");
  const a = await exported(page);
  expect(a.current.level).toBe(31);
  expect(a.current.player.hp).toBeCloseTo(300);
  expect(a.current.stats.maxHP).toBe(375);
  await page.waitForFunction(
    () => !document.querySelector("#overlay")?.classList.contains("saving"),
  );
  await page.reload();
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
  const b = await exported(page);
  expect(b.current.player.hp).toBeCloseTo(300);
});
test("光效曝光：連鎖閃電＋霜鈴＋傳奇能力重疊仍保留輪廓，普通場景不壓暗", async ({
  page,
}, info) => {
  const r = newRun("mage", 13311);
  r.enemies = [];
  r.reserves = [];
  r.obstacles = [];
  r.hazards = [];
  r.scenery = [];
  await load(page, r);
  await expect(
    page.getByRole("button", { name: "進入戰鬥", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => (window as any).solariaDiagnostics().render.limitedGlows,
    ),
  ).toBe(0);
  await page
    .locator("#overlay")
    .evaluate((n) => ((n as HTMLElement).style.visibility = "hidden"));
  await page
    .getByLabel("Solaria 遊戲畫布")
    .screenshot({ path: info.outputPath("ordinary.png") });
  const v = (
    id: number,
    kind: Visual["kind"],
    value: number,
    radius: number,
  ): Visual => ({
    id,
    kind,
    value,
    radius,
    x: 512,
    y: 320,
    color: kind === "arc" ? 0x49baff : 0xffdebd,
    angle: 0,
    until: 1,
    duration: 1,
  });
  r.visuals = [
    ...Array.from({ length: 12 }, (_, i) => v(900 + i, "arc", 180, 8)),
    ...Array.from({ length: 8 }, (_, i) => v(920 + i, "relic", 212, 720)),
    ...Array.from({ length: 8 }, (_, i) => v(940 + i, "resonance", 0, 42)),
    v(980, "relic", 218, 850),
  ];
  await load(page, r);
  await expect(
    page.getByRole("button", { name: "進入戰鬥", exact: true }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as any).solariaDiagnostics().render.limitedGlows,
      ),
    )
    .toBeGreaterThan(0);
  await page
    .locator("#overlay")
    .evaluate((n) => ((n as HTMLElement).style.visibility = "hidden"));
  await page
    .getByLabel("Solaria 遊戲畫布")
    .screenshot({ path: info.outputPath("overlap-bounded.png") });
  await page
    .locator("#overlay")
    .evaluate((n) => ((n as HTMLElement).style.visibility = ""));
  const saved = await exported(page);
  expect(saved.current.visuals).toEqual(r.visuals);
  expect(saved.current.rng).toBe(r.rng);
});
