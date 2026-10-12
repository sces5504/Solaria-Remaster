import "./style.css";
import { Stage } from "../render/stage";
import { styles, loadArtwork, type StyleId, type Artwork } from "./artwork";
import { newRun, step, startRoom } from "../game/core/run";
import { populate, actor } from "../game/data/world";
import { biomes, type BiomeId } from "../game/data/biomes";
import { createHazards } from "../game/systems/hazards";
import { legal } from "../game/systems/geometry";
import { derive } from "../game/systems/progression";
import { Input } from "../input/keyboard";
import { FixedClock, clone } from "../game/core/primitives";
import { ReviewAudio } from "./audio";
import { hud } from "../ui/view";
import type { Run } from "../game/core/types";
import type { Texture } from "pixi.js";
import { assetURL } from "./asset-url";
const root = document.querySelector<HTMLDivElement>("#app")!;
root.innerHTML = `<header><a class="brand" href="#">SOLARIA <span>ART STUDY / 01</span></a><span class="edition">像素美術選樣 <b>獨立演示</b></span></header>
<main><div class="intro"><div><p class="eyebrow">同一片秘境，三種筆觸</p><h1>尋找下一道暮光。</h1></div><p>切換風格會保留同一刻的戰鬥。<br>先看全景，再看怪物與領主的細節。</p></div>
<nav class="styles" aria-label="美術風格">${styles.map((s, i) => `<button data-style="${s.id}" aria-pressed="${i === 0}"><span class="style-index">0${i + 1}</span><div><strong>${s.title}像素</strong><small>${s.tag}</small></div></button>`).join("")}</nav>
<div class="workbench"><section class="viewer"><div class="scene-bar"><span id="scene-name">暮光草原</span><div><button id="compare" aria-pressed="false">三款並排</button><button id="pause">播放演示</button><button id="reset">重播本場</button><button id="fullscreen">全螢幕</button></div></div><div id="viewport"><div id="stage"></div><div id="hud"></div><div id="loading" role="status">正在載入三套原創美術…</div><div id="paused-label">畫面已暫停 · 可切換比對</div></div><div id="comparison" hidden></div><div class="caption"><span id="style-caption"></span><span id="time">00:00</span></div></section>
<aside><p class="eyebrow">SCENE SELECT</p><h2>秘境與生物</h2><label for="biome">地形</label><select id="biome"><option value="meadow">暮光草原</option><option value="volcano">熔火山脈</option><option value="castle">魔王城</option></select><label for="subject">展示對象</label><select id="subject"></select><label for="phase">Boss 階段</label><select id="phase"><option value="1">第一階段</option><option value="2">第二階段</option></select><label for="mode">演示方式</label><select id="mode"><option value="auto">自動戰鬥演示</option><option value="manual">自己操作</option></select><label for="effect">旅人技能</label><select id="effect"><option value="plain">行星爆 · 基礎</option><option value="steam">蒸氣爆炸 · 水火融合</option><option value="lightning">雷電彈 · 強光藍雷</option></select><button id="detail">放大素材細節</button><button id="sound" aria-pressed="false">音效 關</button><div class="divider"></div><strong id="style-title"></strong><p id="style-description"></p><p class="note">這是選樣，不代表最終美術驗收。<br>樣本角色採單姿態與現有動態回饋；完整逐幀動畫待風格選定後製作。</p></aside></div>
<footer><span>WASD 移動 · 左鍵普攻 · 右鍵職技 · 空白閃避 · Esc 暫停</span><span>1 / 2 / 3 快速換風格 · P 播放／暫停</span></footer><p class="scope">草原 2 怪 / 2 王 · 火山 3 怪 / 2 王 · 魔王城 3 怪 / 2 王。使用 1.0.1 真實戰鬥核心、預警、光影與特效；展示配置不寫入旅程存檔。</p></main>
<dialog id="details"><div class="dialog-top"><div><p class="eyebrow">PIXEL / MATERIAL / SILHOUETTE</p><h2>同一素材，三種風格</h2></div><button id="close-detail">關閉</button></div><label for="asset">細節對象</label><select id="asset"><option value="mage">旅人</option><option value="tree">草原樹木</option><option value="wolfking">野狼王</option><option value="goatking">山羊王</option><option value="mon12">熔甲獸</option><option value="boss07">火山熔爐怪</option><option value="boss08">火炎獸</option><option value="castle-pillar">魔王城石柱</option><option value="boss17">白骨攝政王</option><option value="boss18">蝕星大法師</option></select><div id="detail-cards"></div></dialog>`;
const stage = new Stage(assetURL),
  clock = new FixedClock(),
  audio = new ReviewAudio();
let input: Input,
  run: Run,
  style: StyleId = "adventure",
  paused = true,
  comparison = false,
  last = 0,
  soundId = 0;
const art = new Map<StyleId, Artwork>(),
  grounds = new Map<StyleId, Texture>();
const el = <T extends HTMLElement>(id: string) =>
  document.getElementById(id) as T;
const biomeSelect = el<HTMLSelectElement>("biome"),
  subjectSelect = el<HTMLSelectElement>("subject"),
  phaseSelect = el<HTMLSelectElement>("phase"),
  modeSelect = el<HTMLSelectElement>("mode"),
  effectSelect = el<HTMLSelectElement>("effect");
const subjects: Record<string, [string, string][]> = {
  meadow: [
    ["mixed", "野狼王與草原怪物"],
    ["mon1", "野狼"],
    ["mon2", "史萊姆"],
    ["boss1", "野狼王"],
    ["boss2", "山羊王"],
  ],
  volcano: [
    ["mixed", "熔爐怪與火山怪物"],
    ["mon12", "熔甲獸"],
    ["mon13", "噴焰蜥蜴"],
    ["mon14", "灰燼術士"],
    ["boss7", "火山熔爐怪"],
    ["boss8", "火炎獸"],
  ],
  castle: [
    ["mixed", "攝政王與魔城怪物"],
    ["mon27", "白骨騎士"],
    ["mon28", "魔城弩手"],
    ["mon29", "黑曜咒術師"],
    ["boss17", "白骨攝政王"],
    ["boss18", "蝕星大法師"],
  ],
};
function updateSubjects() {
  subjectSelect.innerHTML = subjects[biomeSelect.value]
    .map(([id, name]) => `<option value="${id}">${name}</option>`)
    .join("");
}
function makeScene(): Run {
  const biome = biomeSelect.value as BiomeId,
    subject = subjectSelect.value;
  const r = newRun("mage", 42621);
  r.runId += `-art-${biome}-${subject}-${phaseSelect.value}`;
  r.biome = biome;
  r.templates = [2, 0, 4, 3];
  r.seenEvents = [
    "christmas",
    "bloodmoon",
    "halloween",
    "alien",
    "meteor",
    "army",
  ] as Run["seenEvents"];
  const mobIds = biome === "meadow" ? [1, 2] : biomes[biome].monsters;
  // Fixtures select existing definitions; their AI and attack timing remain the live game's.
  populate(r);
  const ordinary = [...r.enemies, ...(r.reserves ?? [])].filter((e) =>
    mobIds.includes(e.monsterId ?? e.kind),
  );
  if (subject === "mixed" || subject.startsWith("boss")) {
    r.room = 5;
    r.boss =
      subject === "mixed"
        ? biome === "meadow"
          ? 1
          : biome === "volcano"
            ? 7
            : 17
        : Number(subject.slice(4));
    populate(r);
    if (phaseSelect.value === "2")
      for (const boss of r.enemies) {
        boss.phase = 2;
        boss.transition = 0;
      }
    if (subject === "mixed") {
      for (let i = 0; i < 4; i++) {
        const source = ordinary.find(
          (e) => (e.monsterId ?? e.kind) === mobIds[i % mobIds.length],
        );
        const enemy = source
          ? clone(source)
          : actor(r.nextId++, mobIds[i % mobIds.length], 0, 0);
        enemy.id = r.nextId++;
        enemy.elite = false;
        enemy.nextAttack = 2 + i * 0.5;
        const points = [
          { x: 430, y: 260 },
          { x: 570, y: 380 },
          { x: 420, y: 390 },
          { x: 610, y: 260 },
          { x: 350, y: 320 },
        ];
        const p = points.find(
          (p) =>
            legal(r, p, enemy.radius) &&
            r.enemies.every((e) => Math.hypot(e.x - p.x, e.y - p.y) > 65),
        );
        if (p) {
          enemy.x = p.x;
          enemy.y = p.y;
          r.enemies.push(enemy);
        }
      }
    }
  } else {
    const id = Number(subject.slice(3)),
      source = ordinary.find((e) => (e.monsterId ?? e.kind) === id);
    r.enemies = source
      ? Array.from({ length: 4 }, (_, i) => ({
          ...clone(source),
          id: r.nextId++,
          x: 400 + i * 95,
          y: 320,
          nextAttack: 1.5 + i * 0.4,
        }))
      : [];
  }
  r.reserves = [];
  r.modifiers = [];
  r.player.x = 220;
  r.player.y = 320;
  r.level = 15;
  r.cards = { 1: 6, 2: 3, 3: 4, 4: 3 };
  if (effectSelect.value === "steam") {
    r.cards[19] = 1;
    r.cards[24] = 1;
    r.cards[33] = 1;
    r.elements = ["fire", "water"];
    r.fusion = "steam";
  }
  if (effectSelect.value === "lightning") {
    r.cards[28] = 1;
    r.cards[31] = 1;
    r.elements = ["lightning"];
  }
  r.stats = derive(r);
  r.player.hp = r.stats.maxHP;
  createHazards(r);
  startRoom(r);
  return r;
}
function applyStyle() {
  stage.setPreviewArt(art.get(style)!.textures, grounds.get(style)!);
  const s = styles.find((s) => s.id === style)!;
  document.documentElement.style.setProperty("--accent", s.accent);
  document
    .querySelectorAll<HTMLButtonElement>("[data-style]")
    .forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.style === style)),
    );
  el("style-title").textContent = s.title + "像素";
  el("style-description").textContent = s.description;
  el("style-caption").textContent =
    `${String(styles.indexOf(s) + 1).padStart(2, "0")} / ${s.title}像素 · ${s.tag}`;
}
function draw() {
  stage.draw(run, !paused);
  stage.app.renderer.render(stage.app.stage);
  el("hud").innerHTML = hud(run);
  el("time").textContent = `${Math.floor(run.time / 60)
    .toString()
    .padStart(2, "0")}:${Math.floor(run.time % 60)
    .toString()
    .padStart(2, "0")}`;
}
function compare() {
  const host = el("comparison");
  host.replaceChildren();
  const previous = style;
  for (const s of styles) {
    style = s.id;
    applyStyle();
    draw();
    const card = document.createElement("button");
    card.className = "compare-card";
    const image = new Image();
    image.src = stage.app.canvas.toDataURL("image/png");
    image.alt = `${s.title}像素 · 同一刻的實機畫面`;
    const name = document.createElement("strong");
    name.textContent = s.title + "像素";
    card.append(image, name);
    card.onclick = () => {
      style = s.id;
      setComparison(false);
      applyStyle();
      draw();
    };
    host.append(card);
  }
  style = previous;
  applyStyle();
  draw();
}
function setComparison(value: boolean) {
  comparison = value;
  if (comparison) setPaused(true);
  el("viewport").hidden = comparison;
  el("comparison").hidden = !comparison;
  el("compare").setAttribute("aria-pressed", String(comparison));
  if (comparison) compare();
}
function setPaused(value: boolean) {
  paused = value;
  clock.reset();
  input?.clear();
  last = 0;
  el("pause").textContent = paused ? "播放演示" : "暫停畫面";
  el("paused-label").hidden = !paused;
}
function reset() {
  run = makeScene();
  soundId = 0;
  clock.reset();
  input?.clear();
  last = 0;
  for (const t of grounds.values()) t.destroy(true);
  grounds.clear();
  for (const s of styles) grounds.set(s.id, art.get(s.id)!.ground(run));
  phaseSelect.disabled = !(
    subjectSelect.value === "mixed" || subjectSelect.value.startsWith("boss")
  );
  el("scene-name").textContent =
    `${biomes[run.biome!].name} / ${subjectSelect.selectedOptions[0].textContent}`;
  applyStyle();
  draw();
  if (comparison) compare();
}
function details() {
  const key = el<HTMLSelectElement>("asset").value,
    host = el("detail-cards");
  host.replaceChildren();
  for (const s of styles) {
    const a = art.get(s.id)!,
      t = a.textures[key];
    const card = document.createElement("article"),
      canvas = document.createElement("canvas");
    canvas.width = canvas.height = 384;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    // Use the exact reviewed runtime texture, enlarged with nearest sampling.
    const resource = t.source.resource as HTMLCanvasElement;
    ctx.drawImage(
      resource,
      t.frame.x,
      t.frame.y,
      t.frame.width,
      t.frame.height,
      0,
      0,
      384,
      384,
    );
    const name = document.createElement("strong");
    name.textContent = s.title + "像素";
    card.append(canvas, name);
    host.append(card);
  }
}
async function boot() {
  try {
    await stage.init(el("stage"));
    stage.app.ticker.stop();
    for (const s of styles) art.set(s.id, await loadArtwork(s));
    input = new Input(
      stage.app.canvas,
      (key) => {
        if (key === "Escape") setPaused(true);
      },
      () => setPaused(true),
    );
    const q = new URLSearchParams(location.search);
    if (styles.some((s) => s.id === q.get("style")))
      style = q.get("style") as StyleId;
    if (subjects[q.get("biome") ?? ""]) biomeSelect.value = q.get("biome")!;
    updateSubjects();
    if (subjects[biomeSelect.value].some(([id]) => id === q.get("subject")))
      subjectSelect.value = q.get("subject")!;
    reset();
    el("loading").hidden = true;
    document.querySelectorAll<HTMLButtonElement>("[data-style]").forEach(
      (b) =>
        (b.onclick = () => {
          style = b.dataset.style as StyleId;
          applyStyle();
          draw();
          if (comparison) compare();
        }),
    );
    biomeSelect.onchange = () => {
      updateSubjects();
      reset();
    };
    subjectSelect.onchange = reset;
    phaseSelect.onchange = reset;
    effectSelect.onchange = reset;
    modeSelect.onchange = () => {
      input.clear();
      clock.reset();
    };
    el("pause").onclick = () => {
      if (comparison) setComparison(false);
      audio.unlock();
      setPaused(!paused);
    };
    el("reset").onclick = reset;
    el("compare").onclick = () => setComparison(!comparison);
    el("detail").onclick = () => {
      setPaused(true);
      details();
      el<HTMLDialogElement>("details").showModal();
    };
    el("close-detail").onclick = () => el<HTMLDialogElement>("details").close();
    el<HTMLSelectElement>("asset").onchange = details;
    el("sound").onclick = () => {
      audio.unlock();
      audio.setVolume(audio.volume ? 0 : 0.35);
      el("sound").textContent = audio.volume ? "音效 開" : "音效 關";
      el("sound").setAttribute("aria-pressed", String(Boolean(audio.volume)));
    };
    audio.setVolume(0);
    el("fullscreen").onclick = async () => {
      try {
        if (comparison) setComparison(false);
        if (document.fullscreenElement) await document.exitFullscreen();
        else await el("viewport").requestFullscreen();
      } catch {
        el("style-caption").textContent =
          "此瀏覽器尚未開放全螢幕；可繼續在此比較。";
      }
    };
    window.addEventListener("keydown", (e) => {
      if (
        (e.target as HTMLElement).matches("select,input,textarea") ||
        el<HTMLDialogElement>("details").open
      )
        return;
      if (["Digit1", "Digit2", "Digit3"].includes(e.code)) {
        style = styles[Number(e.code.slice(-1)) - 1].id;
        applyStyle();
        draw();
        if (comparison) compare();
      }
      if (e.code === "KeyP") {
        if (comparison) setComparison(false);
        setPaused(!paused);
      }
    });
    requestAnimationFrame(frame);
  } catch (e) {
    el("loading").textContent =
      `無法載入選樣：${(e as Error).message}。請重新載入。`;
  }
}
function frame(ms: number) {
  const dt = last ? (ms - last) / 1000 : 0;
  last = ms;
  clock.advance(dt, paused || comparison, () => {
    const cmd = input.command(run);
    if (modeSelect.value === "auto") {
      const target =
        run.enemies.find((e) => e.kind > 5 && e.hp > 0) ??
        run.enemies.find((e) => e.hp > 0);
      const t = run.time;
      cmd.move = { x: 0, y: Math.cos(t * 0.6) * 0.45 };
      cmd.pointerWorld = target
        ? { x: target.x, y: target.y }
        : { x: 760, y: 320 };
      cmd.attack = true;
      cmd.skill = run.player.skillReady <= t;
      cmd.dodge = false;
    }
    step(run, cmd);
    input.consumeEdges();
  });
  if (!paused) {
    for (const v of run.visuals)
      if (v.id > soundId) {
        if (audio.volume) audio.play(v.kind, run.classId, v.elements ?? []);
        soundId = Math.max(soundId, v.id);
      }
    if (
      ["DEAD", "UPGRADE_CHOICE", "RUN_END", "POST_CLEAR"].includes(run.phase) ||
      run.time > 24
    )
      reset();
    draw();
  }
  requestAnimationFrame(frame);
}
Object.defineProperty(window, "solariaArtDiagnostics", {
  value: () => ({
    style,
    paused,
    comparison,
    biome: run?.biome,
    subject: subjectSelect.value,
    tick: run?.tick,
    time: run?.time,
    player: run ? { x: run.player.x, y: run.player.y } : null,
    enemies: run?.enemies.map((e) => ({
      id: e.id,
      kind: e.kind,
      monsterId: e.monsterId,
      bossId: e.bossId,
      phase: e.phase,
    })),
    projectiles: run?.projectiles.length,
    originalBasics: run?.player.originalBasics,
    renderer: stage.inspect(),
    textures: art.get(style) ? Object.keys(art.get(style)!.textures) : [],
  }),
});
void boot();
