import "./style.css";
import { Stage } from "./render/stage";
import { Input } from "./input/keyboard";
import { AudioMixer } from "./audio/mixer";
import { Checkpoints } from "./game/persistence/checkpoint";
import { FixedClock, clone } from "./game/core/primitives";
import { newRun, startRoom, step } from "./game/core/run";
import {
  choose,
  equip,
  discard,
  reroll,
  grantTestCard,
} from "./game/systems/progression";
import type { Run, ClassId } from "./game/core/types";
import { zh } from "./i18n/zh-TW";
import * as view from "./ui/view";
const root = document.querySelector<HTMLDivElement>("#app")!;
root.innerHTML =
  '<header><a class="brand" href="#">SOLARIA <span>REMASTER</span></a><span>旅途初章 · 暮光草原</span><div class="sound"><button id="testing">測試</button><label for="volume">音量</label><input id="volume" type="range" min="0" max="1" step="0.05" aria-label="音效音量"><button id="mute">音效</button></div></header><main><div class="game-layout"><div id="viewport"><div id="stage"></div><div id="hud"></div><div id="world-hints" aria-live="polite"></div><div id="overlay"></div><div id="toast" role="status"></div></div><aside id="sidebar" aria-label="角色屬性與裝備"></aside></div><footer>WASD 移動 · 左鍵普攻 · 右鍵職技 · 空白閃避 · E 拾取／進門 · Esc 暫停</footer></main><input type="file" id="import-file" accept="application/json,.json" hidden>';
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
  screen = "loading",
  selected = 0,
  lastSignature = "",
  saveBusy = false,
  saveChain = Promise.resolve(),
  menuBack = "menu",
  testBack = "game",
  testQuery = "",
  soundId = 0,
  lastTime = 0,
  lastHud = 0;
let toastTimeout: ReturnType<typeof setTimeout>;
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
      await saves.save(snapshot, entry);
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
  const sig = [
    screen,
    run?.phase,
    run?.room,
    run?.choices.join(","),
    run?.rerollUsed,
    selected,
    saveBusy,
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
  else if (screen === "controls") html = view.controls();
  else if (screen === "catalog") html = view.catalog(saves.discovered);
  else if (screen === "inventory" && run) html = view.inventory(run);
  else if (screen === "test" && run) html = view.testing(run, testQuery);
  else if (screen === "stats" && run) html = view.stats(run);
  else if (screen === "pause" && run) html = view.pauseView(run);
  else if (screen === "saveError")
    html = `<section class="panel"><h2>存檔需要處理</h2><p>上一份有效存檔仍保留。請先匯出目前資料；若另一分頁已更新，回主選單讀取最新版本。</p>${view.button("匯出備份", "export")}${view.button("重新讀取", "reloadSave")}</section>`;
  else if (screen === "error")
    html = `<section class="panel"><h2>無法載入遊戲</h2><p>此版本需要 WebGL。請使用支援 WebGL 的桌面瀏覽器；既有存檔保留。</p>${view.button("重試", "reload")}</section>`;
  else if (run) {
    if (run.phase === "ROOM_INTRO")
      html = `<section class="panel"><div class="eyebrow">暮光草原 · 第 ${run.room} / 5 房</div><h2>${run.room === 5 ? zh.bosses[run.boss as 1] : zh.templates[run.templates[run.room - 1]]}</h2><p>${run.room === 5 ? "領主已在等你。留意預警，善用掩體。" : run.modifiers.length ? run.modifiers.map((m) => zh.modifiers[m]).join("<br>") : "一片安靜的暮色，危機藏在樹影之間。"}</p><p class="fine">${zh.controls}</p>${view.button("進入戰鬥", "start", saveBusy ? "disabled" : "")}</section>`;
    if (run.phase === "UPGRADE_CHOICE") html = view.choiceView(run, selected);
    if (run.phase === "DEAD")
      html = `<section class="panel"><div class="eyebrow">旅程紀錄</div><h2>暮光收留了你</h2><p>${zh.classes[run.classId]} · Lv.${run.level}<br>抵達第 ${run.room} 房 · ${Math.floor(run.time / 60)} 分 ${Math.floor(run.time % 60)} 秒</p><p>這次的構築告一段落，下一次旅程仍有所有職業與卡片。</p>${view.button("再踏旅途", "new")}${view.button("主選單", "menu")}</section>`;
    if (run.phase === "RUN_END")
      html = `<section class="panel"><div class="eyebrow">第一里程碑完成</div><h2>草原之後，日光仍在等待</h2><p>${zh.classes[run.classId]} · Lv.${run.level}<br>${Math.floor(run.time / 60)} 分 ${Math.floor(run.time % 60)} 秒 · 擊敗${zh.bosses[run.boss as 1]}</p><p>製作者：Mori Fang</p><p class="fine">此版本在草原結束。其餘秘境於第二次任務接續。</p>${view.button("完成本局", "finish")}${view.button("匯出構築", "export")}</section>`;
  }
  const wasModal = !overlay.classList.contains("hidden");
  overlay.innerHTML = html;
  overlay.classList.toggle("hidden", !html);
  overlay.dataset.screen = screen;
  if (saveBusy) overlay.classList.add("saving");
  else overlay.classList.remove("saving");
  if (wasModal !== Boolean(html)) input?.clear();
}
async function action(value: string) {
  const [act, arg] = value.split(":");
  try {
    if (act === "new") {
      screen = saved ? "confirm" : "classes";
    } else if (act === "confirmNew") {
      await saveChain;
      await saves.clear();
      saved = null;
      run = null;
      screen = "classes";
    } else if (act === "class") {
      audio.unlock();
      run = newRun(
        arg as ClassId,
        crypto.getRandomValues(new Uint32Array(1))[0] || 1,
      );
      screen = "game";
      selected = 0;
      soundId = 0;
      persist(true);
    } else if (act === "continue") {
      run = await saves.load();
      if (run) {
        screen = "game";
        audio.unlock();
        clock.reset();
      }
    } else if (act === "start" && run && !saveBusy) {
      startRoom(run);
      persist();
    } else if (act === "choose" && run && !saveBusy) {
      if (choose(run, Number(arg))) {
        audio.play("heal");
        selected = 0;
        persist();
      }
    } else if (act === "reroll" && run && !saveBusy) {
      if (reroll(run)) {
        audio.play("heal");
        selected = 0;
        persist();
      }
    } else if (act === "grant" && screen === "test" && run && !saveBusy) {
      if (grantTestCard(run, Number(arg))) {
        selected = 0;
        persist(true);
        notify("已給予卡片 · 測試構築已保存");
      }
    } else if (act === "testBack") {
      screen = testBack;
      input.clear();
      clock.reset();
    } else if (act === "resume") {
      screen = "game";
      input.clear();
      clock.reset();
    } else if (act === "controls" || act === "catalog") {
      menuBack = screen;
      screen = act;
    } else if (act === "back") {
      screen = menuBack;
    } else if (act === "equip" && run && !saveBusy) {
      if (equip(run, arg)) persist();
    } else if (act === "discard" && run && !saveBusy) {
      if (discard(run, arg)) persist();
    } else if (act === "returnMenu" || act === "menu") {
      await saveChain;
      screen = "menu";
      run = null;
      saved = await saves.load();
    } else if (act === "finish" && run) {
      await saveChain;
      await saves.clear(run);
      saved = null;
      run = null;
      screen = "menu";
    } else if (act === "export" && run) {
      const blob = new Blob([saves.export(run)], { type: "application/json" }),
        url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "solaria-checkpoint.json";
      a.click();
      URL.revokeObjectURL(url);
    } else if (act === "import") {
      document.querySelector<HTMLInputElement>("#import-file")!.click();
    } else if (act === "reloadSave") {
      saved = await saves.load();
      run = null;
      screen = "menu";
    } else if (act === "reload") location.reload();
    refresh(true);
  } catch (error) {
    screen = "saveError";
    notify((error as Error).message);
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
    if (!file) return;
    try {
      if (saved && !confirm("匯入將覆蓋目前未完成旅程，是否繼續？")) return;
      saved = await saves.import(await file.text());
      screen = "menu";
      notify("匯入成功");
      refresh(true);
    } catch (error) {
      notify((error as Error).message);
    }
    (event.target as HTMLInputElement).value = "";
  });
document.querySelector<HTMLButtonElement>("#testing")!.onclick = () => {
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
  audio.setVolume(audio.volume ? 0 : 0.25);
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
    await saves.open();
    try {
      saved = await saves.load();
    } catch (e) {
      notify((e as Error).message);
      screen = "saveError";
      refresh(true);
      requestAnimationFrame(frame);
      return;
    }
    screen = "menu";
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
    clock.advance(
      seconds,
      screen !== "game" ||
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
        const dead = clone(run);
        saveChain = saveChain
          .then(() => saves.clear(dead))
          .then(() => {
            saved = null;
            refresh(true);
          })
          .catch((e) => notify(e.message));
      } else persist(run.phase === "ROOM_INTRO");
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
        audio.play(v.kind);
        soundId = Math.max(soundId, v.id);
      }
  }
  stage.draw(run, screen === "game" && !saveBusy);
  if (ms - lastHud > 80) {
    hud.innerHTML = run ? view.hud(run) : "";
    document.querySelector("#world-hints")!.innerHTML = run
      ? view.worldHints(run)
      : "";
    document.querySelector("#sidebar")!.innerHTML = run
      ? view.sidebar(run)
      : view.sidebarIntro();
    lastHud = ms;
  }
  refresh();
  requestAnimationFrame(frame);
}
refresh(true);
void boot();
