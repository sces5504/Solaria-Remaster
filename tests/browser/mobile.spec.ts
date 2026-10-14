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
    await pointer(page, "interact", 1);
    await pointer(page, "interact", 1, "pointerup");
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
      expect(a.x + a.width <= b.x + 1 || a.x >= b.x + b.width - 1).toBe(true);
    }
    await page.screenshot({ path: info.outputPath("landscape.png") });
    const moveStarts = (await diag(page)).core.time;
    await pointer(page, "move", 6, "pointerdown", 35);
    await expect
      .poll(async () => (await diag(page)).core.time)
      .toBeGreaterThan(moveStarts + 0.6);
    await pointer(page, "move", 6, "pointerup");
    await pointer(page, "interact", 7);
    await pointer(page, "interact", 7, "pointerup");
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
