import { writeFile } from "node:fs/promises";
import { test, expect, type Page } from "@playwright/test";
interface Diagnostics {
  render: {
    sprites: number;
    cachedSprites: number;
    texts: number;
    cachedTexts: number;
    positions: number;
    glows: number;
    createdSprites: number;
    createdTexts: number;
    renderer: string;
  };
  core: {
    tick: number;
    phase: string;
    projectiles: number;
    damageNumbers: number;
    originalBasics: number;
  } | null;
}
async function inspect(page: Page): Promise<Diagnostics> {
  return page.evaluate(() =>
    (
      window as unknown as { solariaDiagnostics: () => Diagnostics }
    ).solariaDiagnostics(),
  );
}
async function start(page: Page, role: string) {
  await page.getByRole("button", { name: "開始新局", exact: true }).click();
  if (await page.getByRole("button", { name: "選擇旅人", exact: true }).count())
    await page.getByRole("button", { name: "選擇旅人", exact: true }).click();
  const confirm = page.getByRole("button", { name: "確認新局", exact: true });
  if (await confirm.count()) await confirm.click();
  await page.locator(`[data-action="class:${role}"]`).click();
  const skip = page.getByRole("button", { name: "略過導引", exact: true });
  if (await skip.count()) await skip.click();
  await page.getByRole("button", { name: "進入戰鬥", exact: true }).click();
  await expect(page.locator("#overlay")).toHaveClass(/hidden/);
}
test("Cloud Chromium十次實際restart的渲染清理與GC後JS記憶體，不冒充硬體GPU驗收", async ({
  page,
  context,
}, info) => {
  const restarts = Number(process.env.SOLARIA_RESTARTS ?? 10);
  test.setTimeout(Math.max(180000, restarts * 12000));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "SOLARIA", exact: true }),
  ).toBeVisible();
  const cdp = await context.newCDPSession(page);
  const samples = [];
  for (let n = 0; n < restarts; n++) {
    await start(page, ["sword", "bow", "mage"][n % 3]);
    const box = (await page.getByLabel("Solaria 遊戲畫布").boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.5);
    await page.mouse.down();
    await page.waitForTimeout(1000);
    await page.mouse.up();
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "回主選單", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "SOLARIA", exact: true }),
    ).toBeVisible();
    await expect.poll(async () => (await inspect(page)).render.sprites).toBe(0);
    const d = await inspect(page);
    expect(d.render.texts).toBe(0);
    expect(d.render.positions).toBe(0);
    expect(d.render.cachedSprites).toBeLessThanOrEqual(80);
    expect(d.render.cachedTexts).toBeLessThanOrEqual(256);
    await cdp.send("HeapProfiler.collectGarbage");
    const heap = await cdp.send("Runtime.getHeapUsage");
    samples.push({
      restart: n + 1,
      heapBytes: heap.usedSize,
      render: d.render,
    });
  }
  const warm = samples[2].heapBytes,
    last = samples.at(-1)!.heapBytes;
  expect(last).toBeLessThan(warm * 1.3 + 4 * 1024 * 1024);
  const report = JSON.stringify(
    {
      environment: "Cloud headless Chromium",
      hardwareGpuAcceptance: "NOT_RUN",
      method:
        "十次UI新局、實際攻擊、回主選單、CDP GC後JS heap；活躍視覺不設上限",
      samples,
    },
    null,
    2,
  );
  const path = info.outputPath("restart-memory.json");
  await writeFile(path, report);
  await info.attach("restart-memory.json", {
    path,
    contentType: "application/json",
  });
});
test("失焦清除持續輸入且暫停，回來不追補隱藏時間攻擊", async ({
  page,
}, info) => {
  await page.goto("/");
  await start(page, "mage");
  const box = (await page.getByLabel("Solaria 遊戲畫布").boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.5);
  await page.mouse.down();
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await expect(
    page.getByRole("heading", { name: "日光，等你歸來" }),
  ).toBeVisible();
  const before = await inspect(page);
  await page.waitForTimeout(1200);
  const after = await inspect(page);
  expect(after.core!.tick).toBe(before.core!.tick);
  const resumed = await page.evaluate(async () => {
    document
      .querySelector<HTMLButtonElement>('[data-action="resume"]')!
      .click();
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve()),
    );
    return (
      window as unknown as { solariaDiagnostics: () => Diagnostics }
    ).solariaDiagnostics();
  });
  expect(resumed.core!.tick - before.core!.tick).toBeLessThanOrEqual(2);
  expect(resumed.core!.originalBasics).toBe(before.core!.originalBasics);
  await page.mouse.up();
  await info.attach("focus-resume.json", {
    body: Buffer.from(JSON.stringify({ before, after, resumed })),
    contentType: "application/json",
  });
});
