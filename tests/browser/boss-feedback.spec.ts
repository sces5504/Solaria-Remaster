import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { newRun } from "../../src/game/core/run";
import { bosses } from "../../src/game/data/bosses";
import {
  placeBoss,
  beginBossAttack,
} from "../../src/game/systems/biome-bosses";

for (const [id, attackId] of [
  [4, "assassin-swap"],
  [11, "worm-double"],
  [8, "beast-leap"],
] as const)
  test(`Boss位移：${attackId} 載入舊目標快照、實際施放不偷換玩家血量`, async ({
    page,
  }) => {
    const r = newRun("mage", 134);
    r.biome = bosses[id].biome;
    r.room = 5;
    r.boss = id;
    r.obstacles = [];
    r.reserves = [];
    r.hazards = [];
    r.player.x = 480;
    r.player.y = 320;
    r.player.hp = 37;
    r.player.invulnerable = 100;
    const e = placeBoss(r, id);
    e.phase = 2;
    e.hp = e.maxHP / 2 - 123;
    e.nextAttack = 100;
    r.enemies = [e];
    const a = bosses[id].attacks.flat().find((a) => a.id === attackId)!;
    beginBossAttack(r, e, a);
    r.modes[0].target = { ...r.player };
    const expectedHP = e.hp;
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("dialog", (d) => d.accept());
    await page.goto("./");
    await page.getByRole("button", { name: "匯入存檔", exact: true }).click();
    await page.locator("#import-file").setInputFiles({
      name: "boss-feedback.json",
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
        () =>
          page.evaluate(() => (window as any).solariaDiagnostics().core.time),
        { timeout: 60000 },
      )
      .toBeGreaterThan(4);
    await page.keyboard.press("Escape");
    await expect(page.locator("#overlay")).toHaveAttribute(
      "data-screen",
      "pause",
    );
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "匯出存檔", exact: true }).click();
    const saved = JSON.parse(
      await readFile((await (await download).path())!, "utf8"),
    );
    const boss = saved.current.enemies.find((b: any) => b.id === e.id);
    expect(boss.hp).toBe(expectedHP);
    expect(boss.radius).toBe(e.radius);
    expect(boss.phase).toBe(2);
    expect(saved.current.player.hp).toBe(37);
    expect(errors).toEqual([]);
  });
