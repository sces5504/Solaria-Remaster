import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { newRun } from "../../src/game/core/run";
import { actor } from "../../src/game/data/world";
import { drawChoices, itemFor } from "../../src/game/systems/progression";
import type { ClassId, Run } from "../../src/game/core/types";
const diag = (p: Page) =>
  p.evaluate(() => (window as any).solariaDiagnostics());
function arena(role: ClassId) {
  const r = newRun(role, 140);
  r.obstacles = [];
  r.reserves = [];
  r.hazards = [];
  r.player.x = 250;
  r.player.y = 320;
  r.player.invulnerable = 100;
  const e = actor(r.nextId++, 1, 500, 320);
  e.hp = e.maxHP = 100000;
  e.nextAttack = 100;
  r.enemies = [e];
  return r;
}
async function load(page: Page, r: Run) {
  page.removeAllListeners("dialog");
  page.on("dialog", (d) => d.accept());
  await page.goto("./");
  await page.getByRole("button", { name: "匯入存檔", exact: true }).click();
  await page.locator("#import-file").setInputFiles({
    name: "mobile.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({ version: 1, revision: 0, current: r, entry: r }),
    ),
  });
  await expect(page.getByRole("status")).toContainText("匯入成功");
  await page.getByRole("button", { name: "繼續旅程", exact: true }).click();
  await expect(page.locator("#overlay")).toHaveAttribute("data-screen", "game");
}
async function fight(page: Page, r: Run) {
  await load(page, r);
  await page.getByRole("button", { name: "進入戰鬥", exact: true }).click();
  await expect(page.locator("#overlay")).toHaveClass(/hidden/);
  await expect
    .poll(async () => (await diag(page)).mobile.controls.enabled)
    .toBe(true);
}
async function pointer(
  page: Page,
  control: string,
  id: number,
  type = "pointerdown",
  dx = 0,
  dy = 0,
) {
  const element = page.locator(`[data-touch="${control}"]`);
  const b = (await element.boundingBox()) ?? {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };
  await element.dispatchEvent(type, {
    pointerId: id,
    pointerType: "touch",
    clientX: b.x + b.width / 2 + dx,
    clientY: b.y + b.height / 2 + dy,
    bubbles: true,
  });
}
async function tapWorld(page: Page, x: number, y: number) {
  const b = (await page.getByLabel("Solaria 遊戲畫布").boundingBox())!;
  await page.touchscreen.tap(
    b.x + (x * b.width) / 1024,
    b.y + (y * b.height) / 640,
  );
}
async function exported(page: Page) {
  if ((await page.locator("#overlay").getAttribute("data-screen")) !== "pause")
    await pointer(page, "pause", 95);
  await expect(page.locator("#overlay")).toHaveAttribute(
    "data-screen",
    "pause",
  );
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "匯出存檔", exact: true }).click();
  return JSON.parse(await readFile((await (await pending).path())!, "utf8"));
}
for (const role of ["sword", "bow", "mage"] as const)
  test(`手機三職 ${role} 多點移動、連發、職技、閃避與自動瞄準`, async ({
    page,
  }, info) => {
    test.skip(info.project.name === "desktop");
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const r = arena(role);
    await fight(page, r);
    await pointer(page, "move", 1, "pointerdown", 25);
    await pointer(page, "attack", 2);
    await pointer(page, "skill", 3);
    await pointer(page, "dodge", 4);
    await expect
      .poll(async () => (await diag(page)).core.originalBasics)
      .toBeGreaterThan(1);
    await pointer(page, "attack", 2, "pointermove", 200, 0);
    await expect
      .poll(async () => (await diag(page)).mobile.controls.attack)
      .toBe(false);
    await pointer(page, "move", 1, "pointerup");
    await pointer(page, "attack", 2, "pointerup");
    await pointer(page, "skill", 3, "pointerup");
    await pointer(page, "dodge", 4, "pointerup");
    if (role === "mage")
      await page.screenshot({ path: info.outputPath("combat-target.png") });
    const saved = await exported(page);
    expect(saved.current.player.x).toBeGreaterThan(250);
    expect(saved.current.player.skillReady).toBeGreaterThan(0);
    expect(saved.current.player.dashReady).toBeGreaterThan(0);
    expect(saved.current.player.aim).toBeCloseTo(
      Math.atan2(
        saved.current.enemies[0].y - saved.current.player.y,
        saved.current.enemies[0].x - saved.current.player.x,
      ),
      0,
    );
    expect((await diag(page)).mobile.controls.pointers).toBe(0);
    expect(errors).toEqual([]);
  });
for (const role of ["sword", "bow", "mage"] as const)
  test(`手機完整戰場 ${role} 8:5、三選一、背包換裝／拾取／出口／重玩`, async ({
    page,
  }, info) => {
    test.skip(info.project.name === "desktop");
    test.setTimeout(180000);
    const r = arena(role);
    r.phase = "UPGRADE_CHOICE";
    r.pendingLevels = 1;
    r.level = 2;
    drawChoices(r, false);
    await load(page, r);
    await page.screenshot({ path: info.outputPath("choices.png") });
    await page.locator('[data-action^="choose:"]').first().tap();
    await expect(page.locator("#overlay")).toHaveClass(/hidden/);
    await expect(page.locator("#overlay")).not.toHaveClass(/saving/);
    // A cleared-room snapshot exercises real pickup/equip/door rules, without changing the core.
    const s = arena(role);
    s.phase = "POST_CLEAR";
    s.settledOnce = true;
    s.enemies = [];
    s.player.x = 820;
    s.player.y = 320;
    const item = itemFor(s, 1, 0)!;
    s.items = [{ ...item, x: 820, y: 320 }];
    await load(page, s);
    await expect
      .poll(async () => (await diag(page)).mobile.controls.enabled)
      .toBe(true);
    await tapWorld(page, 820, 320);
    await expect(page.locator("#world-hints .item-label")).toHaveCount(0);
    await expect(page.locator("#overlay")).not.toHaveClass(/saving/);
    await pointer(page, "inventory", 2);
    await expect(
      page.getByRole("heading", { name: "裝備與背包" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "穿戴", exact: true }).tap();
    await expect(page.locator("#overlay")).not.toHaveClass(/saving/);
    await page.getByRole("button", { name: "返回戰場", exact: true }).tap();
    const b = (await page.getByLabel("Solaria 遊戲畫布").boundingBox())!;
    expect(b.width / b.height).toBeCloseTo(1.6, 2);
    expect(b.x).toBeGreaterThanOrEqual(0);
    expect(b.y + b.height).toBeLessThanOrEqual(page.viewportSize()!.height + 1);
    for (const c of ["move", "attack", "skill", "dodge"]) {
      const a = (await page.locator(`[data-touch="${c}"]`).boundingBox())!;
      expect(a.x).toBeGreaterThanOrEqual(24);
      expect(a.x + a.width).toBeLessThanOrEqual(
        page.viewportSize()!.width - 24,
      );
    }
    await page.screenshot({ path: info.outputPath("landscape.png") });
    const moveStarts = (await diag(page)).core.time;
    await pointer(page, "move", 6, "pointerdown", 35);
    await expect
      .poll(async () => (await diag(page)).core.time)
      .toBeGreaterThan(moveStarts + 0.6);
    await pointer(page, "move", 6, "pointerup");
    await tapWorld(page, 928, 320);
    await expect.poll(async () => (await diag(page)).core.room).toBe(2);
    const dead = arena(role);
    dead.phase = "DEAD";
    dead.player.hp = 0;
    await load(page, dead);
    await page.getByRole("button", { name: "再踏旅途", exact: true }).tap();
    await page.getByRole("button", { name: "確認新局", exact: true }).tap();
    await expect(page.locator("#overlay")).toHaveAttribute(
      "data-screen",
      /tutorial|classes/,
    );
    if (
      await page.getByRole("button", { name: "選擇旅人", exact: true }).count()
    )
      await page.getByRole("button", { name: "選擇旅人", exact: true }).tap();
    await page.locator(`[data-action="class:${role}"]`).tap();
    await expect(
      page.getByRole("button", { name: "進入戰鬥", exact: true }),
    ).toBeVisible();
  });
test("手機遮擋優先、目標死亡切換、無敵人方向與法師落雷落點", async ({
  page,
}, info) => {
  test.skip(info.project.name === "desktop");
  const r = arena("mage");
  r.cards[58] = 1;
  r.player.x = 150;
  const near = r.enemies[0];
  near.x = 300;
  near.y = 320;
  near.controlUntil = 100;
  const far = actor(r.nextId++, 1, 150, 570);
  far.hp = far.maxHP = 100000;
  far.nextAttack = 100;
  far.controlUntil = 100;
  r.enemies.push(far);
  r.obstacles = [
    {
      id: 987,
      x: 215,
      y: 290,
      w: 35,
      h: 65,
      kind: "pillar",
      durability: 20,
      maxDurability: 20,
      waves: [],
    },
  ];
  await fight(page, r);
  await pointer(page, "skill", 1);
  await pointer(page, "skill", 1, "pointerup");
  await expect.poll(async () => (await diag(page)).mobile.target).toBe(far.id);
  const saved = await exported(page);
  const liveTarget = saved.current.enemies.find((e: any) => e.id === far.id);
  const mark = saved.current.areas.find(
    (a: any) => a.ability === 158 || a.ability === 58,
  );
  expect(
    mark,
    JSON.stringify({
      time: saved.current.time,
      areas: saved.current.areas,
      target: liveTarget,
      skillReady: saved.current.player.skillReady,
    }),
  ).toBeTruthy();
  expect(Math.hypot(mark.x - liveTarget.x, mark.y - liveTarget.y)).toBeLessThan(
    1,
  );
  const no = arena("mage");
  no.enemies = [];
  no.phase = "POST_CLEAR";
  no.settledOnce = true;
  no.player.aim = Math.PI / 2;
  await load(page, no);
  await pointer(page, "skill", 1);
  await pointer(page, "skill", 1, "pointerup");
  const empty = await exported(page);
  expect(empty.current.player.skillReady).toBeGreaterThan(0);
  expect(empty.current.player.aim).toBeCloseTo(Math.PI / 2);
});
test("手機旋轉、取消觸控與失焦清輸入，回橫屏手動繼續，音效與滿版回退", async ({
  page,
}, info) => {
  test.skip(info.project.name === "desktop");
  await page.addInitScript((reject) => {
    Object.defineProperty(document, "fullscreenEnabled", { get: () => reject });
    if (reject)
      HTMLElement.prototype.requestFullscreen = () =>
        Promise.reject(new Error("Fullscreen not allowed"));
  }, info.project.name === "iphone");
  await fight(page, arena("bow"));
  if (info.project.name === "iphone") {
    await page.locator('[data-system="fullscreen"]').tap();
    await expect(page.getByRole("status")).toContainText("旅程仍可繼續");
  } else await expect(page.locator('[data-system="fullscreen"]')).toBeHidden();
  await pointer(page, "move", 1, "pointerdown", 30);
  await pointer(page, "attack", 2);
  await pointer(page, "attack", 2, "pointercancel");
  await expect(page.locator("#overlay")).toHaveAttribute(
    "data-screen",
    "pause",
  );
  expect((await diag(page)).mobile.controls.pointers).toBe(0);
  await page.getByRole("button", { name: "繼續旅程", exact: true }).tap();
  await pointer(page, "attack", 3);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator("#orientation-gate")).toBeVisible();
  expect((await diag(page)).mobile.controls.attack).toBe(false);
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.locator("#orientation-gate")).toBeVisible();
  const t = (await diag(page)).core.time;
  await page.waitForTimeout(200);
  expect((await diag(page)).core.time).toBe(t);
  await page.locator("#orientation-gate button").tap();
  await expect(page.locator("#orientation-gate")).toBeHidden();
  await pointer(page, "attack", 4);
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await expect(page.locator("#overlay")).toHaveAttribute(
    "data-screen",
    "pause",
  );
  expect((await diag(page)).mobile.controls.attack).toBe(false);
  await expect
    .poll(async () => (await diag(page)).audio.state)
    .toBe("suspended");
  await page.getByRole("button", { name: "繼續旅程", exact: true }).tap();
  await expect.poll(async () => (await diag(page)).audio.state).toBe("running");
  await page.locator('[data-system="mute"]').tap();
  expect((await diag(page)).audio.volume).toBe(0);
  await page.locator('[data-system="mute"]').tap();
  expect((await diag(page)).audio.volume).toBeGreaterThan(0);
});
test("桌面維持原鍵鼠、無手機控制與自動瞄準", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop");
  const r = arena("bow");
  await load(page, r);
  await page.getByRole("button", { name: "進入戰鬥", exact: true }).click();
  expect((await diag(page)).mobile.enabled).toBe(false);
  await expect(page.locator("#touch-controls")).toBeHidden();
  const c = page.getByLabel("Solaria 遊戲畫布"),
    b = (await c.boundingBox())!;
  await page.mouse.move(b.x + b.width * 0.8, b.y + b.height * 0.5);
  await page.keyboard.down("d");
  await page.mouse.down();
  await expect
    .poll(async () => (await diag(page)).core.originalBasics)
    .toBeGreaterThan(0);
  await page.keyboard.up("d");
  await page.mouse.up();
  await page.keyboard.press("Escape");
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "匯出存檔", exact: true }).click();
  const saved = JSON.parse(
    await readFile((await (await pending).path())!, "utf8"),
  );
  expect(saved.current.player.x).toBeGreaterThan(250);
  expect((await diag(page)).mobile.target).toBeNull();
});

test("Android原生多指捕捉、滑出釋放、接上滑鼠鍵盤改用手動瞄準", async ({
  page,
  context,
}, info) => {
  test.skip(info.project.name !== "android");
  await fight(page, arena("bow"));
  const session = await context.newCDPSession(page);
  const point = async (control: string, id: number, dx = 0) => {
    const b = (await page.locator(`[data-touch="${control}"]`).boundingBox())!;
    return {
      id,
      x: b.x + b.width / 2 + dx,
      y: b.y + b.height / 2,
      radiusX: 4,
      radiusY: 4,
      force: 1,
    };
  };
  const move = await point("move", 1, 25),
    attack = await point("attack", 2),
    skill = await point("skill", 3),
    dodge = await point("dodge", 4);
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [move],
  });
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [move, attack],
  });
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [move, attack, skill, dodge],
  });
  await expect
    .poll(async () => (await diag(page)).core.originalBasics)
    .toBeGreaterThan(1);
  expect((await diag(page)).mobile.controls.pointers).toBe(4);
  await session.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [
      move,
      { ...attack, x: attack.x - 190, y: attack.y - 100 },
      skill,
      dodge,
    ],
  });
  await expect
    .poll(async () => (await diag(page)).mobile.controls.attack)
    .toBe(false);
  await session.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  expect((await diag(page)).mobile.controls.pointers).toBe(0);
  const b = (await page.getByLabel("Solaria 遊戲畫布").boundingBox())!;
  await page.mouse.move(b.x + b.width * 0.9, b.y + b.height * 0.2);
  await page.keyboard.press("d");
  expect((await diag(page)).mobile.touchAim).toBe(false);
  await expect(page.locator("#touch-target")).toBeHidden();
  await pointer(page, "attack", 10);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.locator("#overlay")).toHaveAttribute(
    "data-screen",
    "pause",
  );
  expect((await diag(page)).mobile.controls.attack).toBe(false);
});

test("寬幅觸控全螢幕仍隱藏桌面側欄，戰場完整且保留邊緣空間", async ({
  page,
}, info) => {
  test.skip(info.project.name !== "android");
  await page.setViewportSize({ width: 1280, height: 720 });
  await fight(page, arena("bow"));
  await page.locator('[data-system="fullscreen"]').tap();
  await page.waitForTimeout(150);
  if (!(await page.evaluate(() => Boolean(document.fullscreenElement))))
    test.skip(
      true,
      "Engine did not grant fullscreen; rejection fallback is covered separately",
    );
  if (await page.locator("#orientation-gate").isVisible())
    await page.locator("#orientation-gate button").tap();
  if ((await page.locator("#overlay").getAttribute("data-screen")) === "pause")
    await page.getByRole("button", { name: "繼續旅程", exact: true }).tap();
  await expect(page.locator("#sidebar")).toBeHidden();
  const b = (await page.getByLabel("Solaria 遊戲畫布").boundingBox())!;
  expect(b.width / b.height).toBeCloseTo(1.6, 2);
  for (const control of ["move", "attack", "skill", "dodge"]) {
    const p = await page.locator(`[data-touch="${control}"]`).boundingBox();
    expect(p).not.toBeNull();
    if (p) {
      expect(p.x).toBeGreaterThanOrEqual(24);
      expect(p.x + p.width).toBeLessThanOrEqual(
        page.viewportSize()!.width - 24,
      );
    }
  }
});

for (const size of [
  { width: 844, height: 390 },
  { width: 780, height: 360 },
  { width: 932, height: 430 },
])
  test(`手機版面 ${size.width}：放大完整戰場、透明操作與主要選單免捲動`, async ({
    page,
  }, info) => {
    test.skip(info.project.name === "desktop");
    test.setTimeout(180000);
    await page.addInitScript(() => localStorage.clear());
    async function fits(label: string) {
      const measure = () =>
        page.locator("#overlay").evaluate((overlay) => {
          const panel = overlay.querySelector<HTMLElement>(".panel, .menu")!;
          const o = overlay.getBoundingClientRect(),
            b = panel.getBoundingClientRect();
          return {
            scroll: panel.scrollHeight - panel.clientHeight,
            top: b.top - o.top,
            bottom: o.bottom - b.bottom,
            width: panel.scrollWidth - panel.clientWidth,
          };
        });
      await expect
        .poll(
          async () => {
            const m = await measure();
            return Math.max(m.scroll, m.width, -m.top, -m.bottom);
          },
          { message: label },
        )
        .toBeLessThanOrEqual(1);
      const sizes = await measure();
      if (label.endsWith("844"))
        await page.screenshot({
          path: info.outputPath(`${label.replaceAll(" ", "-")}.png`),
        });
      expect(sizes.scroll, label).toBeLessThanOrEqual(1);
      expect(sizes.width, label).toBeLessThanOrEqual(1);
      expect(sizes.top, label).toBeGreaterThanOrEqual(0);
      expect(sizes.bottom, label).toBeGreaterThanOrEqual(0);
    }
    await page.setViewportSize(size);
    await page.goto("./");
    const dismiss = page.getByRole("button", {
      name: "關閉加入主畫面提示",
      exact: true,
    });
    await expect(page.locator("#overlay")).toHaveAttribute(
      "data-screen",
      "menu",
    );
    if (await dismiss.isVisible()) {
      await fits(`menu-with-install-hint ${size.width}`);
      await dismiss.tap();
    }
    await expect(page.locator("#overlay")).toHaveAttribute(
      "data-screen",
      "menu",
    );
    await fits(`menu ${size.width}`);
    await page.getByRole("button", { name: "旅人手冊", exact: true }).tap();
    await fits(`tutorial ${size.width}`);
    await page.getByRole("button", { name: "返回", exact: true }).tap();
    await page.getByRole("button", { name: "開始新局", exact: true }).tap();
    const confirm = page.getByRole("button", { name: "確認新局", exact: true });
    if (await confirm.isVisible()) await confirm.tap();

    if (
      await page.getByRole("button", { name: "選擇旅人", exact: true }).count()
    )
      await page.getByRole("button", { name: "選擇旅人", exact: true }).tap();
    await expect(page.locator("#overlay")).toHaveAttribute(
      "data-screen",
      "classes",
    );
    await fits(`classes ${size.width}`);
    await page.locator('[data-action="class:mage"]').tap();
    await expect(
      page.getByRole("button", { name: "進入戰鬥", exact: true }),
    ).toBeVisible();
    await fits(`intro ${size.width}`);
    const r = arena("mage");
    r.phase = "UPGRADE_CHOICE";
    r.level = 10;
    r.pendingLevels = 1;
    // Long existing card descriptions and the upgrade note must remain readable.
    r.cards[54] = 1;
    r.choices = [54, 79, 85];
    await load(page, r);
    await fits(`choice ${size.width}`);
    if (size.width === 844)
      await page.screenshot({ path: info.outputPath("compact-choices.png") });
    await page.locator('[data-action="choose:54"]').tap();
    await expect(page.locator("#overlay")).toHaveClass(/hidden/);
    const b = (await page.getByLabel("Solaria 遊戲畫布").boundingBox())!;
    expect(b.width / b.height).toBeCloseTo(1.6, 2);
    expect(b.height).toBeGreaterThanOrEqual(size.height * 0.8);
    expect(b.y + b.height).toBeLessThanOrEqual(size.height + 1);
    for (const control of ["move", "attack", "skill", "dodge"]) {
      const el = page.locator(`[data-touch="${control}"]`),
        c = (await el.boundingBox())!;
      expect(c.x).toBeGreaterThanOrEqual(24);
      expect(c.x + c.width).toBeLessThanOrEqual(size.width - 24);
      const alpha = await el.evaluate((e) =>
        Number(getComputedStyle(e).backgroundColor.match(/[\d.]+/g)?.[3] ?? 1),
      );
      expect(alpha).toBeLessThan(0.7);
    }
    if (size.width === 844)
      await page.screenshot({
        path: info.outputPath("expanded-battlefield.png"),
      });
  });

test("手機新操作：頂部返回、背包構築與點選裝備／門", async ({ page }, info) => {
  test.skip(info.project.name === "desktop");
  test.setTimeout(120000);
  const r = arena("mage");
  r.phase = "POST_CLEAR";
  r.settledOnce = true;
  r.enemies = [];
  r.player.x = 400;
  const first = itemFor(r, 1, 0)!,
    second = itemFor(r, 1, 1)!;
  r.items = [
    { ...first, id: "near", x: 400, y: 320 },
    { ...second, id: "clicked", x: 440, y: 340 },
  ];
  await load(page, r);
  await expect
    .poll(async () => (await diag(page)).mobile.controls.enabled)
    .toBe(true);
  await expect(
    page.locator('[data-touch="interact"], [data-touch="stats"]'),
  ).toHaveCount(0);
  await tapWorld(page, 440, 340);
  await expect(page.locator("#world-hints .item-label")).toHaveCount(1);
  await expect
    .poll(async () => (await diag(page)).mobile.controls.enabled)
    .toBe(true);
  await pointer(page, "inventory", 80);
  await expect(
    page.getByRole("heading", { name: "裝備與背包", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "背包 1 / 12", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "匯出存檔", exact: true }),
  ).toHaveCount(0);
  const top = page.locator("#mobile-system button:last-child");
  await expect(top).toHaveText("返回戰場");
  expect((await top.boundingBox())!.y).toBeLessThan(42);
  await page.screenshot({ path: info.outputPath("inventory-top-return.png") });
  await page.getByRole("button", { name: "目前構築", exact: true }).tap();
  await expect(page.locator("#overlay")).toHaveAttribute(
    "data-screen",
    "stats",
  );
  await top.tap();
  await expect(page.locator("#overlay")).toHaveClass(/hidden/);
  const snapshot = await exported(page);
  expect(snapshot.current.bag.map((i: any) => i.id)).toEqual(["clicked"]);
  await page.getByRole("button", { name: "光的記憶", exact: true }).tap();
  await page
    .locator(".panel")
    .evaluate((el) => (el.scrollTop = el.scrollHeight));
  await expect(top).toHaveText("返回戰場");
  await top.tap();
  await expect(page.locator("#overlay")).toHaveClass(/hidden/);
  const door = arena("mage");
  door.phase = "POST_CLEAR";
  door.settledOnce = true;
  door.enemies = [];
  door.player.x = 820;
  door.items = [];
  await load(page, door);
  await expect(page.locator("#world-hints")).toContainText(
    "靠近點擊以通往下一關",
  );
  await tapWorld(page, 928, 320);
  expect((await diag(page)).core.room).toBe(1);
  const at = (await diag(page)).core.time;
  await pointer(page, "move", 90, "pointerdown", 35);
  await expect
    .poll(async () => (await diag(page)).core.time)
    .toBeGreaterThan(at + 0.6);
  await pointer(page, "move", 90, "pointerup");
  await tapWorld(page, 928, 320);
  await expect.poll(async () => (await diag(page)).core.room).toBe(2);
});

test("手機新佈局：縮放拖曳、保存與一鍵預設，編輯期間暫停", async ({
  page,
}, info) => {
  test.skip(info.project.name === "desktop");
  test.setTimeout(150000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await fight(page, arena("mage"));
  const field = page.getByLabel("Solaria 遊戲畫布"),
    initial = (await field.boundingBox())!;
  await pointer(page, "pause", 70);
  await page.getByRole("button", { name: "按鍵佈局", exact: true }).tap();
  await expect(page.locator("#layout-editor")).toBeVisible();
  const time = (await diag(page)).core.time;
  const range = async (name: string, value: number) => {
    await page.getByRole("slider", { name, exact: true }).evaluate((el, v) => {
      (el as HTMLInputElement).value = String(v);
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }, value);
  };
  await range("大小", 70);
  await range("水平位置", 0);
  expect((await field.boundingBox())!.width).toBeCloseTo(
    initial.width * 0.7,
    0,
  );
  await page.getByLabel("調整項目", { exact: true }).selectOption("attack");
  await range("大小", 130);
  await range("水平位置", 100);
  await range("垂直位置", 100);
  const attack = page.locator('[data-touch="attack"]'),
    before = (await attack.boundingBox())!;
  expect(before.width).toBeCloseTo(84 * 1.3, 0);
  await attack.dispatchEvent("pointerdown", {
    pointerId: 777,
    pointerType: "touch",
    clientX: before.x + 55,
    clientY: before.y + 55,
    bubbles: true,
  });
  await page.locator(".game-layout").dispatchEvent("pointermove", {
    pointerId: 777,
    pointerType: "touch",
    clientX: before.x + 25,
    clientY: before.y + 25,
    bubbles: true,
  });
  await page.locator(".game-layout").dispatchEvent("pointerup", {
    pointerId: 777,
    pointerType: "touch",
    bubbles: true,
  });
  const moved = (await attack.boundingBox())!;
  expect(moved.x).toBeLessThan(before.x - 20);
  expect((await diag(page)).core.time).toBe(time);
  expect((await diag(page)).mobile.controls.pointers).toBe(0);
  await page.screenshot({ path: info.outputPath("layout-editor.png") });
  await page.getByRole("button", { name: "完成佈局", exact: true }).tap();
  await page.getByRole("button", { name: "繼續旅程", exact: true }).tap();
  await fight(page, arena("mage"));
  expect((await field.boundingBox())!.width).toBeCloseTo(
    initial.width * 0.7,
    0,
  );
  expect((await attack.boundingBox())!.x).toBeCloseTo(moved.x, 0);
  await pointer(page, "pause", 71);
  await page.getByRole("button", { name: "按鍵佈局", exact: true }).tap();
  await page.getByRole("button", { name: "預設佈局", exact: true }).tap();
  expect((await field.boundingBox())!.width).toBeCloseTo(initial.width, 0);
  expect((await attack.boundingBox())!.width).toBeCloseTo(84, 0);
  await page.getByRole("button", { name: "完成佈局", exact: true }).tap();
  await page.getByRole("button", { name: "繼續旅程", exact: true }).tap();
  await pointer(page, "move", 1, "pointerdown", 25);
  await pointer(page, "attack", 2);
  await pointer(page, "skill", 3);
  await pointer(page, "dodge", 4);
  await expect
    .poll(async () => (await diag(page)).core.originalBasics)
    .toBeGreaterThan(0);
  await expect(page.locator('[data-touch="skill"]')).toHaveClass(/cooling/);
  expect(
    await page
      .locator('[data-touch="skill"]')
      .evaluate((e) => getComputedStyle(e, "::before").backgroundImage),
  ).toContain("linear-gradient");
  for (const [c, id] of [
    ["move", 1],
    ["attack", 2],
    ["skill", 3],
    ["dodge", 4],
  ] as const)
    await pointer(page, c, id, "pointerup");
  await page.screenshot({ path: info.outputPath("cooldown.png") });
  expect(errors).toEqual([]);
});

test("手機縮放防護：畫布外雙擊／多指、選單保留捲動", async ({ page }, info) => {
  test.skip(info.project.name === "desktop");
  await fight(page, arena("mage"));
  expect(
    await page.locator("body").evaluate((e) => getComputedStyle(e).touchAction),
  ).toBe("pan-y");
  const canceled = await page.evaluate(() => {
    return ["gesturestart", "gesturechange", "gestureend", "dblclick"].every(
      (type) =>
        !document.dispatchEvent(
          new Event(type, { cancelable: true, bubbles: true }),
        ),
    );
  });
  expect(canceled).toBe(true);
  const initialScale = await page.evaluate(() => visualViewport?.scale ?? 1);
  await page.touchscreen.tap(10, 150);
  await page.touchscreen.tap(10, 150);
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  expect(await page.evaluate(() => visualViewport?.scale ?? 1)).toBe(
    initialScale,
  );
  if (info.project.name === "android") {
    const cdp = await page.context().newCDPSession(page);
    const metrics = async () =>
      (await cdp.send("Page.getLayoutMetrics")).cssVisualViewport.scale;
    const original = await metrics();
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [
        { x: 10, y: 150, id: 1 },
        { x: 12, y: 200, id: 2 },
      ],
    });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [
        { x: 5, y: 110, id: 1 },
        { x: 15, y: 250, id: 2 },
      ],
    });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    expect(await metrics()).toBe(original);
  }
  await pointer(page, "pause", 15);
  await page.getByRole("button", { name: "光的記憶", exact: true }).tap();
  expect(
    await page
      .locator(".panel")
      .evaluate((e) => e.scrollHeight > e.clientHeight),
  ).toBe(true);
  if (info.project.name === "android") {
    const cdp = await page.context().newCDPSession(page);
    const b = (await page.locator(".panel").boundingBox())!;
    const x = b.x + b.width / 2,
      y = b.y + b.height - 20;
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x, y, id: 8 }],
    });
    for (let n = 1; n <= 5; n++) {
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x, y: y - n * 35, id: 8 }],
      });
      await page.evaluate(
        () =>
          new Promise<void>((resolve) =>
            requestAnimationFrame(() => resolve()),
          ),
      );
    }
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await expect
      .poll(async () => page.locator(".catalog").evaluate((e) => e.scrollTop))
      .toBeGreaterThan(0);
  } else
    await page
      .locator(".catalog")
      .evaluate((e) => (e.scrollTop = e.scrollHeight));
  expect(
    await page.locator(".catalog").evaluate((e) => e.scrollTop),
  ).toBeGreaterThan(0);
  await page.getByRole("button", { name: "返回戰場", exact: true }).tap();
  await expect(page.locator("#overlay")).toHaveClass(/hidden/);
});
