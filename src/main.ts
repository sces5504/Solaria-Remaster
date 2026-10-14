import { playtestBuild } from "./storage-namespace";
import { endingView, type EndingPhase } from "./ui/ending";
import { journal, tutorial } from "./ui/journal";
import { roomTitle, roomStory } from "./ui/room-copy";
import { eventDefinitions } from "./game/data/events";
import { cosmetics, type CosmeticId } from "./game/persistence/profile";
import { nextLoop } from "./game/core/run";
import { currentBiome } from "./game/data/biomes";
import "./style.css";
import { Stage } from "./render/stage";
import { TestingSequence } from "./input/testing-sequence";
import { jumpToRoom, grantTestEquipment } from "./game/core/testing";
import { Input } from "./input/keyboard";
import { MobileUI } from "./input/mobile-ui";
import { AudioMixer } from "./audio/mixer";
import { Checkpoints, validate } from "./game/persistence/checkpoint";
import { FixedClock, clone } from "./game/core/primitives";
import { newRun, startRoom, step } from "./game/core/run";
import {
  choose,
  chooseFusion,
  chooseEquipmentSlot,
  equip,
  discard,
  reroll,
  grantTestCard,
} from "./game/systems/progression";
import type { Run, ClassId, Slot } from "./game/core/types";
import { zh } from "./i18n/zh-TW";
import * as view from "./ui/view";
const root = document.querySelector<HTMLDivElement>("#app")!;
root.innerHTML =
  '<header><a class="brand" href="#">SOLARIA <span>REMASTER</span></a><span>日蝕之後 · 尋回日光</span><div class="sound"><button id="fullscreen" title="Esc 離開全螢幕">全螢幕</button><button id="testing" hidden>測試</button><label for="volume">音量</label><input id="volume" type="range" min="0" max="1" step="0.05" aria-label="音效音量"><button id="mute">音效</button></div></header><main><div class="game-layout"><div id="viewport"><div id="stage"></div><div id="hud"></div><div id="world-hints" aria-live="polite"></div><div id="event-arrival" aria-live="polite" aria-atomic="true" hidden></div><div id="overlay"></div><div id="toast" role="status"></div></div><aside id="sidebar" aria-label="角色屬性與裝備"></aside></div><footer>WASD 移動 · 左鍵普攻 · 右鍵職技 · 空白閃避 · E 拾取／進門 · Esc 暫停</footer></main><input type="file" id="import-file" accept="application/json,.json" hidden>';
if (playtestBuild) {
  document.title =
    import.meta.env.VITE_PLAYTEST === "mobile"
      ? "Solaria Remaster · 手機功能測試版"
      : "Solaria Remaster · 1.3.0 待確認測試版";
  document.querySelector("header > span")!.textContent =
    import.meta.env.VITE_PLAYTEST === "mobile"
      ? "手機功能測試版 · 存檔獨立"
      : "1.3.0 測試版 · 存檔獨立";
}
const stage = new Stage(),
  saves = new Checkpoints(),
  audio = new AudioMixer(),
  clock = new FixedClock();
const overlay = document.querySelector<HTMLDivElement>("#overlay")!,
  hud = document.querySelector<HTMLDivElement>("#hud")!,
  toast = document.querySelector<HTMLDivElement>("#toast")!;
let run: Run | null = null,
  saved: Run | null = null,
  input: Input,
  mobile: MobileUI,
  screen = "loading",
  selected = 0,
  lastSignature = "",
  saveBusy = false,
  actionBusy = false,
  saveChain = Promise.resolve(),
  menuBack = "menu",
  testBack = "game",
  testQuery = "",
  soundId = 0,
  lastTime = 0,
  lastHud = 0,
  warningId = 0,
  wasSkillReady = false,
  mobileDrawKey = "";
const testingSequence = new TestingSequence();
let testingUnlocked = false;
window.addEventListener("keydown", (event) => {
  if (testingUnlocked) return;
  const editable = (event.target as HTMLElement).closest(
    "input, textarea, select, [contenteditable=true]",
  );
  if (
    !run ||
    screen !== "game" ||
    actionBusy ||
    editable ||
    event.ctrlKey ||
    event.altKey ||
    event.metaKey ||
    event.shiftKey ||
    event.isComposing
  ) {
    testingSequence.reset();
    return;
  }
  if (event.repeat) return;
  if (testingSequence.press(event.code)) {
    testingUnlocked = true;
    document.querySelector<HTMLButtonElement>("#testing")!.hidden = false;
    input.clear();
    notify("旅人試驗場已開啟");
  }
});
window.addEventListener("blur", () => testingSequence.reset());
document.addEventListener("visibilitychange", () => {
  if (document.hidden) testingSequence.reset();
});
let endingKey = "",
  endingStarted = 0,
  endingPhase: EndingPhase = "cinematic";
let eventArrivalKey = "",
  eventArrivalStarted = 0;
const eventArrival = document.querySelector<HTMLDivElement>("#event-arrival")!;
const eventPhrases = {
  christmas: "冰鈴響起，雪夜裡的禮物藏著危機。",
  bloodmoon: "赤月升起，暮色之中傳來獵者的低鳴。",
  halloween: "鬼火甦醒，今夜的墓園不再寂靜。",
  alien: "天外來客降臨，陌生的光劃破長夜。",
  meteor: "繁星墜落，抬頭之時也別忘了腳下。",
  army: "軍旗獵獵，遠方的腳步聲正在逼近。",
};
function presentation(ms: number) {
  if (run?.phase === "RUN_END") {
    const key = `${run.runId}-${run.loop ?? 1}`;
    if (endingKey !== key) {
      endingKey = key;
      endingStarted = ms;
      endingPhase = "cinematic";
    }
    const age = (ms - endingStarted) / 1000;
    endingPhase = age < 6 ? "cinematic" : age < 22 ? "credits" : "done";
  } else endingKey = "";
  if (run?.event && screen === "game" && run.phase === "COMBAT") {
    const key = `${run.runId}-${run.loop ?? 1}-${run.room}-${run.event.id}`;
    if (eventArrivalKey !== key) {
      eventArrivalKey = key;
      eventArrivalStarted = ms;
      eventArrival.innerHTML = `<strong>遭遇事件 · ${eventDefinitions[run.event.id].name}</strong><p>${eventPhrases[run.event.id]}</p>`;
    }
    const age = (ms - eventArrivalStarted) / 1000;
    eventArrival.style.opacity = `${age <= 2 ? 1 : Math.max(0, 1 - (age - 2) / 0.8)}`;
    eventArrival.hidden = age >= 2.8;
  } else {
    eventArrival.hidden = true;
    if (!run?.event) eventArrivalKey = "";
  }
}
let toastTimeout: ReturnType<typeof setTimeout>;
function download(text: string, name: string) {
  const url = URL.createObjectURL(
      new Blob([text], { type: "application/json" }),
    ),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function notify(message: string) {
  toast.textContent = message;
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => (toast.textContent = ""), 4500);
}
function persist(entry = false) {
  if (!run) return;
  const snapshot = clone(run);
  saveBusy = true;
  saveChain = saveChain
    .then(async () => {
      const known = new Set(saves.profile.achievements);
      await saves.save(snapshot, entry);
      if (run?.runId === snapshot.runId) run.revision = snapshot.revision;
      if (saves.profile.achievements.some((id) => !known.has(id)))
        notify("星典留下了新的旅人足跡。");
      saved = clone(snapshot);
    })
    .catch((e) => {
      screen = "saveError";
      notify(e.message);
    })
    .finally(() => {
      saveBusy = false;
      refresh(true);
    });
}
function pause() {
  if (run && ["game", "inventory", "stats"].includes(screen)) {
    screen = "pause";
    input.clear();
    clock.reset();
    refresh(true);
  }
}
function refresh(force = false) {
  if (screen !== "game") testingSequence.reset();
  if (run?.phase === "RUN_END") {
    const key = `${run.runId}-${run.loop ?? 1}`;
    if (endingKey !== key) {
      endingKey = key;
      endingStarted = performance.now();
      endingPhase = "cinematic";
    }
  }
  const sig = [
    screen,
    run?.phase === "RUN_END" ? endingPhase : "",
    run?.phase,
    run?.room,
    run?.choices.join(","),
    run?.rerollUsed,
    selected,
    saveBusy,
    actionBusy,
    run?.bag.length,
    run
      ? Object.values(run.equipment)
          .map((i) => i?.id)
          .join(",")
      : "",
    Boolean(saved),
  ].join("|");
  if (!force && sig === lastSignature) return;
  lastSignature = sig;
  let html = "";
  if (screen === "loading")
    html =
      '<section class="panel"><h2>喚醒暮光…</h2><p>旅人與暮光即將甦醒</p></section>';
  else if (screen === "menu") html = view.menu(Boolean(saved));
  else if (screen === "classes") html = view.classSelect();
  else if (screen === "confirm")
    html = `<section class="panel"><h2>開始新旅程？</h2><p>將覆蓋這個瀏覽器未完成的本局存檔。永久紀錄會保留。</p>${view.button("確認新局", "confirmNew")}${view.button("保留旅程", "menu")}</section>`;
  else if (screen === "catalog") html = view.catalog(saves.discovered);
  else if (screen === "journal") html = journal(saves.profile, saves.records);
  else if (screen === "tutorial") html = tutorial(menuBack === "classes");
  else if (screen === "inventory" && run) html = view.inventory(run);
  else if (screen === "test" && run) html = view.testing(run, testQuery);
  else if (screen === "stats" && run) html = view.stats(run);
  else if (screen === "pause" && run) html = view.pauseView(run);
  else if (screen === "saveError")
    html = `<section class="panel"><h2>存檔需要處理</h2><p>上一份有效存檔仍保留。請先匯出目前資料；若另一分頁已更新，回主選單讀取最新版本。</p>${view.button("匯出備份", "exportRaw", saves.ready ? "" : "disabled")}${view.button("匯入備份", "import")}${view.button("重新讀取", "reloadSave")}</section>`;
  else if (screen === "error")
    html = `<section class="panel"><h2>無法載入遊戲</h2><p>畫面或美術資源載入失敗。請檢查網路，並使用支援 WebGL 的瀏覽器；既有存檔保留。</p>${view.button("重試", "reload")}</section>`;
  else if (run) {
    if (run.phase === "ROOM_INTRO")
      html = `<section class="panel"><div class="eyebrow">${run.event ? eventDefinitions[run.event.id].name : currentBiome(run).name} · 第 ${run.room} / 31 房 · 第 ${run.loop ?? 1} 周目</div><h2>${roomTitle(run)}</h2><p>${roomStory(run)}</p><p class="fine">${zh.controls}</p>${!saves.profile.tutorialSeen ? `<aside class="first-tip"><strong>第一次啟程</strong><p>WASD 走位，滑鼠瞄準；左右鍵可同時使用。空白閃避，靠近物品與右門按 E。</p>${view.button("略過導引", "skipTutorial")}${view.button("查看旅人手冊", "tutorial")}</aside>` : ""}${view.button("進入戰鬥", "start", saveBusy ? "disabled" : "")}</section>`;
    if (run.phase === "FUSION_CHOICE") html = view.fusionChoice(run);
    if (run.phase === "EQUIPMENT_SLOT_CHOICE")
      html = view.equipmentSlotChoice();
    if (run.phase === "UPGRADE_CHOICE") html = view.choiceView(run, selected);
    if (run.phase === "DEAD")
      html = `<section class="panel"><div class="eyebrow">旅程紀錄</div><h2>暮光收留了你</h2><p>${zh.classes[run.classId]} · Lv.${run.level}<br>抵達第 ${run.room} 房 · ${Math.floor(run.time / 60)} 分 ${Math.floor(run.time % 60)} 秒</p><p>這次的構築告一段落，下一次旅程仍有所有職業與卡片。</p>${view.button("再踏旅途", "new")}${view.button("主選單", "menu")}</section>`;
    if (run.phase === "RUN_END")
      html = endingView(
        run,
        endingPhase,
        (performance.now() - endingStarted) / 1000,
      );
  }
  if (mobile?.platform.enabled)
    html = html
      .replaceAll(
        zh.controls,
        "左側搖桿移動 · 右側普攻／職技／閃避 · 目標自動瞄準",
      )
      .replaceAll(
        "WASD 移動、滑鼠瞄準。左鍵普攻與右鍵職技，兩者可同時使用。空白鍵閃避沒有無敵",
        "左側搖桿移動，右側按鈕施放普攻、職業技能與閃避；普攻可按住連發，多指可同時操作。自動瞄準優先選擇通道暢通的近敵，仍須主動按下招式。閃避沒有無敵",
      )
      .replaceAll(
        "左右鍵選擇 · Enter 確認 · 滑鼠點擊",
        "點擊卡片，選擇下一份力量",
      )
      .replaceAll(
        "WASD 走位，滑鼠瞄準；左右鍵可同時使用。空白閃避，靠近物品與右門按 E。",
        "左側搖桿移動；右側可同時按住普攻、施技與閃避。靠近物品或出口後，點擊「拾取／出口」。",
      )
      .replaceAll("按 E", "點「拾取／出口」")
      .replaceAll("I 開背包、C 看構築", "點「背包」整備、點「構築」查看力量");
  const wasModal = !overlay.classList.contains("hidden");
  overlay.innerHTML = html;
  overlay.classList.toggle("hidden", !html);
  overlay.dataset.screen = screen;
  if (actionBusy)
    for (const btn of overlay.querySelectorAll<HTMLButtonElement>(
      "button[data-action]",
    ))
      btn.disabled = true;
  if (saveBusy)
    for (const btn of overlay.querySelectorAll<HTMLButtonElement>(
      'button[data-action^="choose:"],button[data-action^="fusion:"],button[data-action^="slot:"],button[data-action^="equip:"],button[data-action^="discard:"],button[data-action^="grant:"],button[data-action^="gearGrant:"],button[data-action="jump"],button[data-action="reroll"],button[data-action="nextLoop"]',
    ))
      btn.disabled = true;
  if (saveBusy) overlay.classList.add("saving");
  else overlay.classList.remove("saving");
  if (wasModal !== Boolean(html)) input?.clear();
}
async function action(value: string) {
  if (
    actionBusy ||
    (mobile?.platform.blocked &&
      ["start", "resume", "nextLoop"].includes(value.split(":")[0]))
  )
    return;
  actionBusy = true;
  const [act, arg] = value.split(":");
  try {
    audio.unlock();
    audio.play("ui");
    if (act === "new") {
      screen = saved
        ? "confirm"
        : saves.profile.tutorialSeen
          ? "classes"
          : "tutorial";
      if (screen === "tutorial") menuBack = "classes";
    } else if (act === "confirmNew") {
      await saveChain;
      await saves.clear();
      saved = null;
      run = null;
      screen = saves.profile.tutorialSeen ? "classes" : "tutorial";
      if (screen === "tutorial") menuBack = "classes";
    } else if (act === "class") {
      audio.unlock();
      run = newRun(
        arg as ClassId,
        crypto.getRandomValues(new Uint32Array(1))[0] || 1,
      );
      screen = "game";
      selected = 0;
      soundId = run.nextId - 1;
      warningId = run.nextId - 1;
      wasSkillReady = true;
      persist(true);
    } else if (act === "continue") {
      screen = "loading";
      refresh(true);
      run = await saves.load();
      if (saves.recoveryNotice) notify(saves.recoveryNotice);
      if (run) {
        screen = "game";
        soundId = warningId = run.nextId - 1;
        wasSkillReady = run.player.skillReady <= run.time;
        audio.unlock();
        clock.reset();
      }
    } else if (act === "start" && run && !saveBusy) {
      if (!saves.profile.tutorialSeen)
        await saves.preference({ tutorialSeen: true });
      startRoom(run);
      persist();
    } else if (act === "choose" && run && !saveBusy) {
      if (choose(run, Number(arg))) {
        audio.play("choice");
        selected = 0;
        persist();
      }
    } else if (act === "fusion" && run && !saveBusy) {
      if (chooseFusion(run, arg as NonNullable<Run["fusion"]>)) persist();
    } else if (act === "slot" && run && !saveBusy) {
      if (chooseEquipmentSlot(run, arg as Slot)) persist();
    } else if (act === "reroll" && run && !saveBusy) {
      if (reroll(run)) {
        audio.play("choice");
        selected = 0;
        persist();
      }
    } else if (
      act === "gearGrant" &&
      testingUnlocked &&
      screen === "test" &&
      run &&
      !saveBusy
    ) {
      if (grantTestEquipment(run, arg)) {
        persist(true);
        notify("已取得裝備 · 測試構築已保存");
      }
    } else if (act === "grant" && screen === "test" && run && !saveBusy) {
      if (grantTestCard(run, Number(arg))) {
        selected = 0;
        if (["FUSION_CHOICE", "EQUIPMENT_SLOT_CHOICE"].includes(run.phase))
          screen = "game";
        persist(true);
        notify("已給予卡片 · 測試構築已保存");
      }
    } else if (
      act === "jump" &&
      testingUnlocked &&
      screen === "test" &&
      run &&
      !saveBusy
    ) {
      const room = Number(
        document.querySelector<HTMLSelectElement>("#test-room")!.value,
      );
      if (jumpToRoom(run, room)) {
        screen = testBack = "game";
        input.clear();
        clock.reset();
        soundId = warningId = run.nextId - 1;
        selected = 0;
        persist(true);
        notify(`已抵達第 ${room} / 31 關 · 第 ${run.loop ?? 1} 周目`);
      }
    } else if (act === "testBack") {
      screen = testBack;
      input.clear();
      clock.reset();
    } else if (act === "resume") {
      screen = "game";
      input.clear();
      clock.reset();
      lastTime = 0;
    } else if (["catalog", "journal", "tutorial"].includes(act)) {
      menuBack = screen;
      screen = act;
    } else if (act === "back") {
      if (screen === "tutorial" && menuBack === "classes")
        await saves.preference({ tutorialSeen: true });
      screen = menuBack;
    } else if (act === "equip" && run && !saveBusy) {
      if (equip(run, arg)) {
        audio.play("equip");
        persist();
      }
    } else if (act === "discard" && run && !saveBusy) {
      if (discard(run, arg)) persist();
    } else if (act === "returnMenu" || act === "menu") {
      await saveChain;
      screen = "menu";
      run = null;
      saved = await saves.load();
    } else if (act === "skipEnding" && run?.phase === "RUN_END") {
      endingStarted = performance.now() - 22001;
      endingPhase = "done";
    } else if (act === "nextLoop" && run && !saveBusy) {
      if (nextLoop(run)) persist(true);
    } else if (act === "finish" && run) {
      await saveChain;
      await saves.clear(run);
      saved = null;
      run = null;
      screen = "menu";
    } else if (act === "skipTutorial") {
      await saves.preference({ tutorialSeen: true });
    } else if (act === "cosmetic") {
      await saves.preference({ cosmetic: arg as CosmeticId });
    } else if (["exportProfile", "exportRaw"].includes(act)) {
      await saveChain;
      download(
        act === "exportRaw"
          ? JSON.stringify(
              {
                ...JSON.parse(await saves.exportRaw()),
                working: run ? JSON.parse(saves.export(run)) : undefined,
              },
              null,
              2,
            )
          : saves.exportProfile(),
        act === "exportRaw" ? "solaria-recovery.json" : "solaria-profile.json",
      );
    } else if (act === "export" && run) {
      await saveChain;
      download(saves.export(run), "solaria-checkpoint.json");
    } else if (act === "import") {
      document.querySelector<HTMLInputElement>("#import-file")!.click();
    } else if (act === "reloadSave") {
      if (!saves.ready) await saves.open();
      saved = await saves.load();
      run = null;
      screen = "menu";
    } else if (act === "reload") location.reload();
    refresh(true);
  } catch (error) {
    screen = "saveError";
    notify((error as Error).message);
    refresh(true);
  } finally {
    actionBusy = false;
    refresh(true);
  }
}
overlay.addEventListener("click", (event) => {
  const btn = (event.target as HTMLElement).closest<HTMLButtonElement>(
    "button[data-action]",
  );
  if (btn && !btn.disabled) void action(btn.dataset.action!);
});
document
  .querySelector("#import-file")!
  .addEventListener("change", async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || actionBusy) return;
    actionBusy = true;
    refresh(true);
    try {
      await saveChain;
      const text = await file.text();
      if (text.length > 20_000_000) throw new Error("備份檔案過大");
      const data = JSON.parse(text);
      if (data.kind === "solaria-profile") {
        await saves.importProfile(text);
      } else {
        if (saved && !confirm("匯入將覆蓋目前未完成旅程，是否繼續？")) return;
        if (data.kind === "solaria-recovery") {
          let candidate;
          for (const value of [data.working, data.latest, data.previous]) {
            try {
              candidate = validate(value);
              break;
            } catch {}
          }
          if (!candidate) throw new Error("備份內沒有有效旅程，原始資料保留。");
          saved = await saves.import(
            JSON.stringify({
              ...candidate,
              discovered: candidate.discovered ?? data.discovered,
              profile: candidate.profile ?? data.journal,
              records: candidate.records ?? data.records,
            }),
          );
        } else saved = await saves.import(text);
      }
      run = null;
      if (data.kind === "solaria-profile") saved = await saves.load();
      screen = "menu";
      notify("匯入成功");
      refresh(true);
    } catch (error) {
      notify((error as Error).message);
    } finally {
      actionBusy = false;
      refresh(true);
      (event.target as HTMLInputElement).value = "";
    }
  });
document.querySelector<HTMLButtonElement>("#fullscreen")!.onclick =
  async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else
        await document
          .querySelector<HTMLElement>(".game-layout")!
          .requestFullscreen();
      if (mobile?.platform.enabled && document.fullscreenElement) {
        try {
          await (
            window.screen.orientation as ScreenOrientation & {
              lock?: (value: string) => Promise<void>;
            }
          ).lock?.("landscape");
        } catch {
          /* Fullscreen and orientation lock are optional. */
        }
      }
    } catch {
      notify("這個瀏覽器尚未開放全螢幕；旅程仍可繼續。");
    }
  };
document.querySelector<HTMLButtonElement>("#testing")!.onclick = () => {
  if (!testingUnlocked) return;
  if (!run || ["DEAD", "RUN_END"].includes(run.phase)) {
    notify("先選擇旅人、開始旅程，再開啟測試構築。");
    return;
  }
  if (screen === "test") return;
  testBack = screen;
  screen = "test";
  input.clear();
  clock.reset();
  refresh(true);
};
overlay.addEventListener("input", (event) => {
  const target = event.target as HTMLInputElement;
  if (target.id !== "test-search") return;
  testQuery = target.value;
  const query = testQuery.trim().toLowerCase();
  for (const n of overlay.querySelectorAll<HTMLElement>(".test-card"))
    n.hidden = !n.dataset.search!.toLowerCase().includes(query);
});
const mute = document.querySelector<HTMLButtonElement>("#mute")!;
function muteLabel() {
  mute.textContent = audio.volume ? "音效 開" : "音效 關";
}
mute.onclick = () => {
  audio.unlock();
  audio.toggleMute();
  volume.value = String(audio.volume);
  muteLabel();
};
muteLabel();
const volume = document.querySelector<HTMLInputElement>("#volume")!;
volume.value = String(audio.volume);
volume.addEventListener("input", () => {
  audio.unlock();
  audio.setVolume(Number(volume.value));
  muteLabel();
});
function key(code: string) {
  if (actionBusy) return;
  if (code === "Escape") {
    if (screen === "test") {
      void action("testBack");
    } else if (screen === "game") pause();
    else if (["pause", "inventory", "stats"].includes(screen)) {
      screen = "game";
      clock.reset();
      refresh(true);
    }
    return;
  }
  if (run?.phase === "UPGRADE_CHOICE" && screen === "game") {
    if (code === "ArrowLeft") selected = (selected + 2) % 3;
    if (code === "ArrowRight") selected = (selected + 1) % 3;
    if (code === "Enter") void action(`choose:${run.choices[selected]}`);
    refresh();
    return;
  }
  if (screen === "test") return;
  if (code === "Enter" && run?.phase === "ROOM_INTRO") void action("start");
  if (code === "KeyI" && run) {
    if (run.phase === "POST_CLEAR") {
      screen = screen === "inventory" ? "game" : "inventory";
      refresh(true);
    } else notify("需要先清關，才能整理裝備。");
  }
  if (code === "KeyC" && run) {
    screen = screen === "stats" ? "game" : "stats";
    refresh(true);
  }
}
async function boot() {
  try {
    await stage.init(document.querySelector("#stage")!);
    input = new Input(stage.app.canvas, key, pause);
    mobile = new MobileUI(
      input,
      () => {
        input.clear();
        audio.suspend();
        pause();
      },
      () => {
        if (screen === "pause") void action("resume");
      },
      (value) => {
        if (value === "inventory") key("KeyI");
        else if (value === "stats") key("KeyC");
        else if (value === "pause") pause();
        else document.querySelector<HTMLButtonElement>(`#${value}`)?.click();
      },
      () => audio.unlock(),
    );
    input.touchAim = mobile.platform.enabled;
    document.addEventListener("pointerdown", () => audio.unlock(), {
      capture: true,
    });
    document.addEventListener("keydown", () => audio.unlock(), {
      capture: true,
    });
    window.addEventListener("blur", () => audio.suspend());
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) audio.suspend();
    });
    try {
      await saves.open();
      saved = await saves.load();
    } catch (e) {
      notify((e as Error).message);
      screen = "saveError";
      refresh(true);
      requestAnimationFrame(frame);
      return;
    }
    screen = "menu";
    if (saves.recoveryNotice) notify(saves.recoveryNotice);
    refresh(true);
    requestAnimationFrame(frame);
  } catch (error) {
    screen = "error";
    notify((error as Error).message);
    refresh(true);
  }
}
function frame(ms: number) {
  const seconds = lastTime ? (ms - lastTime) / 1000 : 0;
  lastTime = ms;
  if (run) {
    const prev = run.phase,
      items = run.items.length,
      bag = run.bag.length;
    const cmd = input.command(run);
    if (mobile?.platform.enabled && input.touchAim)
      cmd.pointerWorld = mobile.aim.select(
        run,
        cmd.skill && run.classId === "mage"
          ? Math.min(720, 450 * run.stats.range)
          : undefined,
      );
    else if (mobile?.platform.enabled) mobile.aim.manual(run, cmd.pointerWorld);
    clock.advance(
      seconds,
      screen !== "game" ||
        mobile?.platform.blocked ||
        saveBusy ||
        !["COMBAT", "SETTLEMENT", "POST_CLEAR"].includes(run.phase),
      () => {
        step(run!, cmd);
        input.consumeEdges();
        cmd.skill = false;
        cmd.dodge = false;
        cmd.interact = false;
      },
    );
    if (prev !== run.phase) {
      input.clear();
      if (run.phase === "DEAD") {
        audio.play("death");
        const dead = clone(run);
        saveChain = saveChain
          .then(() => saves.clear(dead))
          .then(() => {
            saved = null;
            refresh(true);
          })
          .catch((e) => notify(e.message));
      } else {
        if (run.phase === "RUN_END") audio.play("victory");
        persist(run.phase === "ROOM_INTRO");
      }
    }
    if (
      prev === run.phase &&
      ((items !== run.items.length && run.phase === "POST_CLEAR") ||
        bag !== run.bag.length)
    )
      persist();
    if (run.message) {
      notify(
        run.message === "bagFull" ? "背包已滿，物品仍留在地上。" : run.message,
      );
      run.message = "";
    }
    for (const v of run.visuals)
      if (v.id > soundId) {
        audio.play(
          v.kind,
          run.classId,
          v.elements ?? [],
          v.kind === "relic" ? v.value : 0,
        );
        soundId = Math.max(soundId, v.id);
      }
  }
  if (run) {
    for (const m of run.modes)
      if (m.id > warningId && m.starts > run.time) {
        audio.play("warning");
        warningId = Math.max(warningId, m.id);
      }
    const ready = run.player.skillReady <= run.time && !run.cards[83];
    if (ready && !wasSkillReady && screen === "game") audio.play("ready");
    wasSkillReady = ready;
  }
  const mobileActive =
    screen === "game" &&
    !saveBusy &&
    !mobile?.platform.blocked &&
    Boolean(run && ["COMBAT", "SETTLEMENT", "POST_CLEAR"].includes(run.phase));
  const drawKey = `${lastSignature}|${screen}|${run?.phase}|${saves.profile.cosmetic}|${innerWidth}x${innerHeight}`;
  // A paused mobile scene is unchanged; keep its canvas instead of redrawing it every RAF.
  if (!mobile?.platform.enabled || mobileActive || drawKey !== mobileDrawKey) {
    stage.draw(
      run,
      screen === "game" && !saveBusy,
      cosmetics[saves.profile.cosmetic].color,
    );
    mobileDrawKey = drawKey;
  }
  if (ms - lastHud > 80) {
    hud.innerHTML = run
      ? view
          .hud(run)
          .replaceAll(
            mobile?.platform.enabled ? "E 拾取／進門" : "\u0000",
            "點拾取／出口",
          )
      : "";
    document.querySelector("#world-hints")!.innerHTML = run
      ? mobile?.platform.enabled
        ? view
            .worldHints(run)
            .replaceAll("<kbd>E</kbd>", "點拾取")
            .replaceAll("按 E", "點拾取／出口")
        : view.worldHints(run)
      : "";
    if (!mobile?.platform.enabled)
      document.querySelector("#sidebar")!.innerHTML = run
        ? view.sidebar(run)
        : view.sidebarIntro();
    lastHud = ms;
  }
  mobile?.update(run, input, screen, saveBusy, audio.volume);
  presentation(ms);
  refresh();
  requestAnimationFrame(frame);
}
refresh(true);
void boot();

window.addEventListener("beforeunload", (event) => {
  if (saveBusy) {
    event.preventDefault();
    event.returnValue = "";
  }
});

Object.defineProperty(window, "solariaDiagnostics", {
  value: () => ({
    mobile: mobile
      ? {
          enabled: mobile.platform.enabled,
          blocked: mobile.platform.blocked,
          target: mobile.aim.targetId,
          touchAim: input.touchAim,
          controls: mobile.controls.inspect(),
        }
      : null,
    audio: audio.inspect(),
    render: stage.inspect(),
    core: run
      ? {
          room: run.room,
          loop: run.loop ?? 1,
          phase: run.phase,
          tick: run.tick,
          time: run.time,
          enemies: run.enemies.length,
          enemyProjectiles: run.projectiles.filter((p) => p.enemy).length,
          projectiles: run.projectiles.length,
          visuals: run.visuals.length,
          originalBasics: run.player.originalBasics ?? 0,
          damageNumbers: run.visuals.filter(
            (v) => v.kind === "damage" || v.kind === "heal",
          ).length,
          areas: run.areas.length,
        }
      : null,
  }),
  writable: false,
});
