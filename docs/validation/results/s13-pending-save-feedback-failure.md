# S13保存中離頁與測試dialog失敗

這是實際失敗記錄；trace確認第一次beforeunload消耗once handler，第二次confirm被自動dismiss。測試修正為清關後先等saving結束，保留正式離頁保護。

# Test info

- Name: feedback.spec.ts >> 清算先吸附再選卡，地面裝備與出口提示可互動
- Location: tests/browser/feedback.spec.ts:125:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByRole('status')
Expected substring: "匯入成功"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" getByRole('status') with timeout 5000ms
  - waiting for getByRole('status')

```

```yaml
- banner:
    - link "SOLARIA REMASTER":
        - /url: "#"
    - text: 日蝕之後 · 尋回日光
    - button "全螢幕"
    - button "測試"
    - text: 音量
    - slider "音效音量": "0.25"
    - button "音效 開"
- main:
    - text: 日蝕之後 · 尋回日光
    - heading "SOLARIA" [level=1]
    - paragraph: 在暮色之中，尋回日光。
    - button "開始新局"
    - button "繼續旅程"
    - button "操作與製作資訊"
    - button "卡片圖鑑 · 85"
    - button "成就與外觀"
    - button "旅人手冊"
    - button "匯入存檔"
    - text: 三職業 · 六重秘境 · 日光之旅 製作者：Mori Fang
    - complementary "角色屬性與裝備":
        - text: 旅人手札
        - heading "日光邊境" [level=2]
        - paragraph: 六重秘境，日光在前。 以選卡塑造你的戰鬥風格。
        - paragraph: WASD 移動 左鍵持續普攻 右鍵職業技能 空白閃避 E 拾取／進門
        - paragraph: 看清蓄力方向，再橫向閃避。 掩體能阻擋敵我彈道。
    - text: WASD 移動 · 左鍵普攻 · 右鍵職技 · 空白閃避 · E 拾取／進門 · Esc 暫停
```

# Test source

```ts
  1   | import { test, expect, type Page } from "@playwright/test";
  2   | import { newRun, settle } from "../../src/game/core/run";
  3   | import type { Run } from "../../src/game/core/types";
  4   | import { actor } from "../../src/game/data/world";
  5   | async function loadFixture(page: Page, r: Run) {
  6   |   await page.goto("/");
  7   |   await page.getByRole("button", { name: "匯入存檔", exact: true }).click();
  8   |   await page.locator("#import-file").setInputFiles({
  9   |     name: "fixture.json",
  10  |     mimeType: "application/json",
  11  |     buffer: Buffer.from(
  12  |       JSON.stringify({ version: 1, revision: 0, current: r, entry: r }),
  13  |     ),
  14  |   });
> 15  |   await expect(page.getByRole("status")).toContainText("匯入成功");
      |                                          ^ Error: expect(locator).toContainText(expected) failed
  16  |   await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
  17  |   await expect(page.locator("#hud .status")).toBeVisible();
  18  | }
  19  | for (const cls of ["sword", "bow", "mage"] as const)
  20  |   test(`${cls} 清關後左鍵連射同時右鍵技能與 E 進門`, async ({ page }) => {
  21  |     const errors: string[] = [];
  22  |     page.on("pageerror", (e) => errors.push(e.message));
  23  |     const r = newRun(cls, 122);
  24  |     r.phase = "POST_CLEAR";
  25  |     r.enemies = [];
  26  |     r.reserves = [];
  27  |     r.obstacles = [];
  28  |     r.player.x = 900;
  29  |     r.player.y = 320;
  30  |     await loadFixture(page, r);
  31  |     const box = (await page.locator("canvas").boundingBox())!;
  32  |     await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.5);
  33  |     await page.mouse.down({ button: "left" });
  34  |     await page.waitForTimeout(300);
  35  |     await page.mouse.down({ button: "right" });
  36  |     await page.mouse.up({ button: "right" });
  37  |     await expect(page.locator("#sidebar")).toContainText(/冷卻 \d/);
  38  |     await page.waitForTimeout(600);
  39  |     await page.screenshot({ path: `test-results/${cls}-attack.png` });
  40  |     await page.keyboard.press("Escape");
  41  |     const download = page.waitForEvent("download");
  42  |     await page.getByRole("button", { name: "匯出存檔", exact: true }).click();
  43  |     const d = await download;
  44  |     const { readFile } = await import("node:fs/promises");
  45  |     const exported = JSON.parse(await readFile((await d.path())!, "utf8"));
  46  |     expect(exported.current.player.skillCast).toBeGreaterThan(0);
  47  |     expect(exported.current.player.casts).toBeGreaterThan(1);
  48  |     await page.mouse.up({ button: "left" });
  49  |     await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
  50  |     await page.waitForTimeout(200);
  51  |     await expect(page.locator("#hud")).toContainText("第 1 / 31");
  52  |     await page.keyboard.press("KeyE");
  53  |     await expect(page.locator("#hud")).toContainText("第 2 / 31");
  54  |     expect(errors).toEqual([]);
  55  |   });
  56  | test("卡片整張呈現稀有度色，1920／1366／1280 視窗不需捲動", async ({
  57  |   page,
  58  | }) => {
  59  |   const r = newRun("mage", 76);
  60  |   r.phase = "UPGRADE_CHOICE";
  61  |   r.pendingLevels = 1;
  62  |   r.enemies = [];
  63  |   r.reserves = [];
  64  |   r.choices = [1, 9, 13];
  65  |   await loadFixture(page, r);
  66  |   const backgrounds = await page
  67  |     .locator(".card")
  68  |     .evaluateAll((nodes) =>
  69  |       nodes.map((n) => getComputedStyle(n).backgroundImage),
  70  |     );
  71  |   expect(new Set(backgrounds).size).toBe(3);
  72  |   await expect(page.locator(".card .rarity")).not.toContainText([
  73  |     "藍",
  74  |     "紫",
  75  |     "黃",
  76  |   ]);
  77  |   await page.screenshot({ path: "test-results/rarity-cards.png" });
  78  |   for (const [width, height] of [
  79  |     [1920, 1080],
  80  |     [1366, 768],
  81  |     [1280, 720],
  82  |   ]) {
  83  |     await page.setViewportSize({ width, height });
  84  |     const box = (await page.locator("canvas").boundingBox())!;
  85  |     expect(box.width / box.height).toBeCloseTo(1.6, 2);
  86  |     expect(box.height).toBeGreaterThan(height * 0.8);
  87  |     expect(box.y + box.height).toBeLessThanOrEqual(height);
  88  |     expect(
  89  |       await page.evaluate(() => document.documentElement.scrollHeight),
  90  |     ).toBeLessThanOrEqual(height);
  91  |     await expect(page.locator("#sidebar")).toBeVisible();
  92  |   }
  93  | });
  94  | for (const kind of [6, 7])
  95  |   test(`草原 Boss ${kind} 與元素場景 WebGL 可見`, async ({ page }) => {
  96  |     const errors: string[] = [];
  97  |     page.on("pageerror", (e) => errors.push(e.message));
  98  |     const r = newRun("mage", 84);
  99  |     r.room = 5;
  100 |     r.boss = kind - 5;
  101 |     r.enemies = [actor(101, kind, 750, 330)];
  102 |     r.reserves = [];
  103 |     r.phase = "ROOM_INTRO";
  104 |     r.elements = ["fire", "ice"];
  105 |     r.cards = { 19: 1, 15: 1, 20: 1, 17: 1, 39: 1 };
  106 |     r.fusion = "frostfire";
  107 |     r.player.invulnerable = 999;
  108 |     await loadFixture(page, r);
  109 |     await page.getByRole("button", { name: "進入戰鬥" }).click();
  110 |     const box = (await page.locator("canvas").boundingBox())!;
  111 |     await page.mouse.move(box.x + box.width * 0.65, box.y + box.height * 0.5);
  112 |     await page.mouse.down();
  113 |     await page.mouse.click(box.x + box.width * 0.65, box.y + box.height * 0.5, {
  114 |       button: "right",
  115 |     });
```
